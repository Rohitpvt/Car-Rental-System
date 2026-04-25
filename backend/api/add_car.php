<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once 'jwt_helper.php';

// Verify JWT Token
$token = get_bearer_token();
$payload = validate_jwt($token);

if (!$payload || $payload->role !== 'agency') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized access. Agencies only.", "success" => false]);
    exit;
}

$agency_id = $payload->id;

// Validate basic incoming POST fields
$required_fields = ['make', 'model', 'fuel_type', 'vehicle_number', 'registration_year', 'seating_capacity', 'rent_per_day', 'parking_location'];
$data_missing = false;
$missing = [];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        $data_missing = true;
        $missing[] = $field;
    }
}

if ($data_missing || empty($_FILES['rc_file']) || empty($_FILES['insurance_file']) || empty($_FILES['puc_file']) || empty($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data.", "success" => false, "post" => $_POST, "files" => $_FILES, "missing" => $missing]);
    exit;
}

$make = htmlspecialchars(strip_tags($_POST['make']));
$model = htmlspecialchars(strip_tags($_POST['model']));
$fuel_type = htmlspecialchars(strip_tags($_POST['fuel_type']));
$vehicle_number = htmlspecialchars(strip_tags($_POST['vehicle_number']));
$registration_year = (int) $_POST['registration_year'];
$seating_capacity = (int) $_POST['seating_capacity'];
$rent_per_day = (float) $_POST['rent_per_day'];
$parking_location = htmlspecialchars(strip_tags($_POST['parking_location']));

// Basic Validations
$current_year = (int) date("Y");
if ($current_year - $registration_year >= 7) {
    http_response_code(400);
    echo json_encode(["message" => "Vehicle cannot exceed 7 years of age.", "success" => false]);
    exit;
}
if ($rent_per_day <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Rent must be a positive number.", "success" => false]);
    exit;
}

// Check duplicate vehicle number
$check_query = "SELECT id FROM cars WHERE vehicle_number = :vn LIMIT 1";
$stmt = $conn->prepare($check_query);
$stmt->execute([':vn' => $vehicle_number]);
if ($stmt->rowCount() > 0) {
    http_response_code(400);
    echo json_encode(["message" => "Vehicle number already registered.", "success" => false]);
    exit;
}

// Setup Upload Paths
$upload_dir_img = '../uploads/images/';
$upload_dir_doc = '../uploads/documents/';

if (!is_dir($upload_dir_img)) mkdir($upload_dir_img, 0777, true);
if (!is_dir($upload_dir_doc)) mkdir($upload_dir_doc, 0777, true);

// Utility Function for File Upload
function handle_upload($fileArray, $targetDir, $allowedTypes, $maxSizeMB = 5, $prefix = 'doc_') {
    $fileName = basename($fileArray["name"]);
    $fileTmpName = $fileArray["tmp_name"];
    $fileSize = $fileArray["size"];
    $fileError = $fileArray["error"];
    
    // Check error
    if ($fileError !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => "Upload error code: $fileError"];
    }
    
    // Check Size
    if ($fileSize > ($maxSizeMB * 1024 * 1024)) {
        return ['success' => false, 'message' => "File exceeds {$maxSizeMB}MB limit."];
    }
    
    // Check Extension
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedTypes)) {
        return ['success' => false, 'message' => "Invalid file format. Allowed: " . implode(", ", $allowedTypes)];
    }
    
    $uniqueName = uniqid($prefix) . '_' . time() . '.' . $ext;
    $destination = $targetDir . $uniqueName;
    
    if (move_uploaded_file($fileTmpName, $destination)) {
        return ['success' => true, 'path' => $uniqueName]; 
    } else {
        return ['success' => false, 'message' => "Failed to save file on server."];
    }
}

// Upload Documents (PDF only)
$doc_types = ['pdf'];

$rc_upload = handle_upload($_FILES['rc_file'], $upload_dir_doc, $doc_types, 5, 'rc_');
if (!$rc_upload['success']) { echo json_encode($rc_upload); exit; }

$ins_upload = handle_upload($_FILES['insurance_file'], $upload_dir_doc, $doc_types, 5, 'ins_');
if (!$ins_upload['success']) { echo json_encode($ins_upload); exit; }

$puc_upload = handle_upload($_FILES['puc_file'], $upload_dir_doc, $doc_types, 5, 'puc_');
if (!$puc_upload['success']) { echo json_encode($puc_upload); exit; }

// Upload Multiple Images (JPG, JPEG, PNG)
$img_types = ['jpg', 'jpeg', 'png'];
$uploaded_images = [];

if (!isset($_FILES['images']) || count($_FILES['images']['name']) < 2) {
    http_response_code(400);
    echo json_encode(["message" => "Minimum 2 images required.", "success" => false]);
    exit;
}

if (isset($_FILES['images'])) {
    $total_images = count($_FILES['images']['name']);
    if ($total_images > 5) {
        http_response_code(400);
        echo json_encode(["message" => "Maximum 5 images allowed.", "success" => false]);
        exit;
    }
    for ($i = 0; $i < $total_images; $i++) {
        $img_array = [
            'name' => $_FILES['images']['name'][$i],
            'type' => $_FILES['images']['type'][$i],
            'tmp_name' => $_FILES['images']['tmp_name'][$i],
            'error' => $_FILES['images']['error'][$i],
            'size' => $_FILES['images']['size'][$i]
        ];
        
        $img_upload = handle_upload($img_array, $upload_dir_img, $img_types, 5, 'img_');
        if (!$img_upload['success']) {
            http_response_code(400);
            echo json_encode(["message" => "Image Upload Failed: " . $img_upload['message'], "success" => false]);
            exit;
        }
        $uploaded_images[] = $img_upload['path'];
    }
}

$images_json = json_encode($uploaded_images);

// Final Database Insertion
try {
    $query = "INSERT INTO cars (agency_id, make, model, fuel_type, vehicle_number, registration_year, seating_capacity, rent_per_day, parking_location, rc_file, insurance_file, puc_file, image_paths, is_available) 
              VALUES (:agency_id, :make, :model, :fuel_type, :vehicle_number, :registration_year, :seating_capacity, :rent_per_day, :parking_location, :rc_file, :insurance_file, :puc_file, :image_paths, 1)";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':agency_id', $agency_id);
    $stmt->bindParam(':make', $make);
    $stmt->bindParam(':model', $model);
    $stmt->bindParam(':fuel_type', $fuel_type);
    $stmt->bindParam(':vehicle_number', $vehicle_number);
    $stmt->bindParam(':registration_year', $registration_year);
    $stmt->bindParam(':seating_capacity', $seating_capacity);
    $stmt->bindParam(':rent_per_day', $rent_per_day);
    $stmt->bindParam(':parking_location', $parking_location);
    $stmt->bindParam(':rc_file', $rc_upload['path']);
    $stmt->bindParam(':insurance_file', $ins_upload['path']);
    $stmt->bindParam(':puc_file', $puc_upload['path']);
    $stmt->bindParam(':image_paths', $images_json);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Vehicle onboarded successfully.", "success" => true]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Database insertion failed.", "success" => false]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Critical storage error.", "success" => false, "error" => $e->getMessage()]);
}
?>
