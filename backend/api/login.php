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

if (!empty($data->email) && !empty($data->password)) {
    $email = htmlspecialchars(strip_tags($data->email));
    
    $query = "SELECT id, name, email, password, role, is_verified FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $row['password'])) {
            $user_payload = [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role'],
                "is_verified" => (bool)$row['is_verified']
            ];
            
            $jwt = generate_jwt($user_payload);
            
            echo json_encode([
                "message" => "Successful login.",
                "success" => true,
                "token" => $jwt,
                "user" => $user_payload
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "message" => "Incorrect password", 
                "success" => false,
                "type" => "INVALID_PASSWORD"
            ]);
        }
    } else {
        http_response_code(404);
        echo json_encode([
            "message" => "User not found. Please register first.", 
            "success" => false,
            "type" => "USER_NOT_FOUND"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data.", "success" => false]);
}
?>
