<?php
include 'backend/config/database.php';
$stmt = $conn->query("SELECT id, make, model, image_paths FROM cars");
$cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($cars as $car) {
    echo $car['id'] . " | " . $car['make'] . " " . $car['model'] . " | " . $car['image_paths'] . "\n";
}
?>
