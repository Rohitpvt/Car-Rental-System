<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

if (isset($_GET['car_id']) && is_numeric($_GET['car_id'])) {
    $car_id = intval($_GET['car_id']);

    try {
        // Fetch bookings that are current or in the future
        $query = "SELECT start_date, days FROM bookings WHERE car_id = :car_id";
        $stmt = $conn->prepare($query);
        $stmt->execute([':car_id' => $car_id]);
        
        $bookings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $bookings[] = [
                "start_date" => $row['start_date'],
                "days" => $row['days']
            ];
        }

        http_response_code(200);
        echo json_encode(["success" => true, "bookings" => $bookings]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error fetching bookings."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid car ID."]);
}
?>
