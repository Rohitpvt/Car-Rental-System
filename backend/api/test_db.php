<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

// If require_once runs without exiting, DB connection is successful
echo json_encode([
    "success" => true,
    "message" => "Database connection is successful! Host: localhost, DB: car_rental"
]);
?>
