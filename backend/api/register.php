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

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password) && !empty($data->role)) {
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($check_query);
    $stmt->execute([':email' => $data->email]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Email already registered.", "success" => false]);
        exit;
    }

    $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
    $stmt = $conn->prepare($query);

    $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $role = htmlspecialchars(strip_tags($data->role));

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':role', $role);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "User was successfully registered.", "success" => true]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to register user.", "success" => false]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data.", "success" => false]);
}
?>
