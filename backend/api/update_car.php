<?php
// backend/api/update_car.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once 'jwt_helper.php';

$data = json_decode(file_get_contents("php://input"));

$token = get_bearer_token();
$payload = validate_jwt($token);

if (!$payload || $payload->role !== 'agency') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized access. Agencies only.", "success" => false]);
    exit;
}

if (!empty($data->id) && !empty($data->model) && !empty($data->vehicle_number) && !empty($data->seating_capacity) && !empty($data->rent_per_day)) {
    // 1. Verify that the car being edited belongs to this agency
    $check_query = "SELECT id FROM cars WHERE id = :id AND agency_id = :agency_id LIMIT 1";
    $stmt = $conn->prepare($check_query);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':agency_id', $payload->id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["message" => "Permission denied. You cannot edit this car.", "success" => false]);
        exit;
    }

    // 2. Perform the update
    $query = "UPDATE cars SET model = :model, vehicle_number = :vehicle_number, seating_capacity = :seating_capacity, rent_per_day = :rent_per_day WHERE id = :id";
    $stmt = $conn->prepare($query);

    $id = htmlspecialchars(strip_tags($data->id));
    $model = htmlspecialchars(strip_tags($data->model));
    $vehicle_number = htmlspecialchars(strip_tags($data->vehicle_number));
    $seating_capacity = htmlspecialchars(strip_tags($data->seating_capacity));
    $rent_per_day = htmlspecialchars(strip_tags($data->rent_per_day));

    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':model', $model);
    $stmt->bindParam(':vehicle_number', $vehicle_number);
    $stmt->bindParam(':seating_capacity', $seating_capacity);
    $stmt->bindParam(':rent_per_day', $rent_per_day);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Car details updated successfully.", "success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to update car details.", "success" => false]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. All fields are required.", "success" => false]);
}
?>
