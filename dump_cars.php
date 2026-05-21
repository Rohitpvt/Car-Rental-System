<?php
include 'backend/config/database.php';
$stmt = $conn->prepare("SELECT make, model, image_paths FROM cars");
$stmt->execute();
$cars = $stmt->fetchAll();
foreach ($cars as $car) {
    echo $car['make'] . " " . $car['model'] . " | " . $car['image_paths'] . "\n";
}
?>
