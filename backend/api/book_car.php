<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
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

if (!$payload || $payload->role !== 'customer') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized access. Customers only.", "success" => false]);
    exit;
}

if (!empty($data->car_id) && !empty($data->start_date) && !empty($data->days)) {
    // customer_id is strictly derived from the decoded verified JWT payload!
    $customer_id = $payload->id;

    // Start transaction
    $conn->beginTransaction();

    try {
        // Check for overlapping bookings
        $check_query = "
            SELECT id FROM bookings 
            WHERE car_id = :car_id 
            AND :start_date <= DATE_ADD(start_date, INTERVAL days - 1 DAY) 
            AND DATE_ADD(:start_date, INTERVAL :days - 1 DAY) >= start_date
            FOR UPDATE
        ";
        $stmt_check = $conn->prepare($check_query);
        $stmt_check->execute([
            ':car_id' => $data->car_id,
            ':start_date' => $data->start_date,
            ':days' => $data->days
        ]);
        $conflict = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if ($conflict) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(["message" => "Car is already booked for the selected dates.", "success" => false]);
            exit;
        }

        // Insert booking
        $query = "INSERT INTO bookings (customer_id, car_id, start_date, days) 
                  VALUES (:customer_id, :car_id, :start_date, :days)";
        $stmt = $conn->prepare($query);

        $car_id = htmlspecialchars(strip_tags($data->car_id));
        $start_date = htmlspecialchars(strip_tags($data->start_date));
        $days = htmlspecialchars(strip_tags($data->days));

        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':car_id', $car_id);
        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':days', $days);

        $stmt->execute();

        $conn->commit();
        http_response_code(201);
        echo json_encode(["message" => "Car booked successfully.", "success" => true]);

    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(503);
        echo json_encode(["message" => "Unable to book car.", "success" => false]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data.", "success" => false]);
}
?>
