<?php
include_once 'backend/config/database.php';

try {
    echo "--- Bookings Table ---\n";
    $stmt = $conn->query("SELECT * FROM bookings");
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($bookings);

    echo "\n--- Cars Table (Brief) ---\n";
    $stmt = $conn->query("SELECT id, model, agency_id FROM cars LIMIT 5");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($cars);

    echo "\n--- Users Table (Brief) ---\n";
    $stmt = $conn->query("SELECT id, name, role FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);

    echo "\n--- Test Join ---\n";
    $query = "SELECT b.id as booking_id, b.start_date, b.days, 
                     c.model, c.vehicle_number, c.rent_per_day, c.agency_id,
                     u.name as customer_name, u.email as customer_email
              FROM bookings b
              JOIN cars c ON b.car_id = c.id
              JOIN users u ON b.customer_id = u.id";
    $stmt = $conn->query($query);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Join count: " . count($records) . "\n";
    print_r($records);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
