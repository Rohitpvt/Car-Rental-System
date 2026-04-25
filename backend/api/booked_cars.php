<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
include_once '../config/database.php';
include_once 'jwt_helper.php';

$token = get_bearer_token();
$payload = validate_jwt($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized access. Please login.", "success" => false]);
    exit;
}

$query = "SELECT b.id as booking_id, b.start_date, b.days, 
                 c.model, c.vehicle_number, c.rent_per_day, c.agency_id,
                 u.name as customer_name, u.email as customer_email
          FROM bookings b
          JOIN cars c ON b.car_id = c.id
          JOIN users u ON b.customer_id = u.id";

if ($payload->role === 'customer') {
    $query .= " WHERE b.customer_id = :user_id";
} elseif ($payload->role === 'agency') {
    $query .= " WHERE c.agency_id = :user_id";
}

$stmt = $conn->prepare($query);
$stmt->bindParam(':user_id', $payload->id);
$stmt->execute();

$bookings_arr = array();
$bookings_arr["records"] = array();
$bookings_arr["success"] = true;

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($bookings_arr["records"], $row);
}

echo json_encode($bookings_arr);
?>
