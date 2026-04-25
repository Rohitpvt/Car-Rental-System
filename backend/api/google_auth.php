<?php
// backend/api/google_auth.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/jwt_helper.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->email) || !isset($data->uid)) {
    echo json_encode(["success" => false, "message" => "Invalid request data"]);
    exit;
}

$email = $data->email;
$uid = $data->uid;
$name = $data->name ?? '';
$profile_image = $data->profile_image ?? '';
$role = $data->role ?? null;

try {
    // Check if user exists by email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // User exists, update firebase_uid if not set or different
        if (empty($user['firebase_uid']) || $user['firebase_uid'] !== $uid) {
            $update = $conn->prepare("UPDATE users SET firebase_uid = ?, auth_provider = 'google', profile_image = ? WHERE id = ?");
            $update->execute([$uid, $profile_image, $user['id']]);
            $user['firebase_uid'] = $uid;
            $user['auth_provider'] = 'google';
            $user['profile_image'] = $profile_image;
        }

        // Generate JWT
        unset($user['password']);
        $token = generate_jwt([
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "is_verified" => (bool)$user['is_verified']
        ]);

        $user['is_verified'] = (bool)$user['is_verified'];
        echo json_encode([
            "success" => true,
            "user" => $user,
            "token" => $token
        ]);
    } else {
        // New user - check if role is provided
        if (!$role) {
            echo json_encode([
                "success" => false,
                "type" => "ROLE_REQUIRED",
                "message" => "Please select account type"
            ]);
            exit;
        }

        // Register new user
        $insert = $conn->prepare("INSERT INTO users (name, email, firebase_uid, profile_image, auth_provider, role) VALUES (?, ?, ?, ?, 'google', ?)");
        $insert->execute([$name, $email, $uid, $profile_image, $role]);
        $new_user_id = $conn->lastInsertId();

        $user_data = [
            "id" => $new_user_id,
            "name" => $name,
            "email" => $email,
            "role" => $role,
            "auth_provider" => "google",
            "profile_image" => $profile_image,
            "is_verified" => false
        ];

        $token = generate_jwt($user_data);

        echo json_encode([
            "success" => true,
            "user" => $user_data,
            "token" => $token
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
