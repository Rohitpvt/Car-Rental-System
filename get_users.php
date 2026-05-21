<?php
include 'backend/config/database.php';
$stmt = $conn->query("SELECT email, role, is_verified FROM users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
