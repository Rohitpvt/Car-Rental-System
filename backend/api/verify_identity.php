<?php
// backend/api/verify_identity.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/jwt_helper.php';

$jwt = get_bearer_token();
$user_payload = validate_jwt($jwt);

if (!$user_payload) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit();
}

$user_id = $user_payload->id;

// Handle both JSON and FormData
$data = json_decode(file_get_contents("php://input"), true);
$method = $data['method'] ?? ($_POST['method'] ?? '');
$id_number_input = $data['id_number'] ?? ($_POST['id_number'] ?? '');

try {
    $id_number = '';
    $id_proof_path = null;

    if ($method === 'manual') {
        if (!preg_match('/^[0-9]{12}$/', $id_number_input)) {
            echo json_encode(["success" => false, "message" => "Invalid ID format. Must be 12 digits."]);
            exit();
        }
        // Mask ID: XXXX-XXXX-1234
        $id_number = "XXXX-XXXX-" . substr($id_number_input, -4);
    } elseif ($method === 'document') {
        if (!isset($_FILES['id_proof'])) {
            echo json_encode(["success" => false, "message" => "No document uploaded."]);
            exit();
        }
        
        $file = $_FILES['id_proof'];
        $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, PNG, and PDF allowed."]);
            exit();
        }
        
        if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
            echo json_encode(["success" => false, "message" => "File too large. Max 5MB allowed."]);
            exit();
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = "kyc_" . $user_id . "_" . time() . "." . $ext;
        $target_path = __DIR__ . "/../uploads/kyc/" . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $target_path)) {
            $id_proof_path = "uploads/kyc/" . $filename;
            $id_number = "DOC_UPLOADED";
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save document."]);
            exit();
        }
    } elseif ($method === 'demo') {
        // Simulated Aadhaar from DigiLocker
        $id_number = "XXXX-XXXX-" . rand(1000, 9999);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid verification method."]);
        exit();
    }

    // Update user status
    $stmt = $conn->prepare("UPDATE users SET is_verified = TRUE, id_number = ?, verification_method = ? WHERE id = ?");
    $stmt->execute([$id_number, $method, $user_id]);

    // Fetch updated user to return
    $stmt = $conn->prepare("SELECT id, name, email, role, is_verified FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true, 
        "message" => "Identity verified successfully",
        "user" => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal server error: " . $e->getMessage()]);
}
?>
