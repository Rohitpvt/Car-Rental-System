<?php
// backend/api/jwt_helper.php

// IMPORTANT: Change this secret to a random 32+ character string for production!
// Do not use the default secret in a live environment.
define('JWT_SECRET', 'super_secret_car_rental_key_12345');

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // Token expires in 24 hours

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validate_jwt($jwt) {
    if (!is_string($jwt) || empty($jwt)) return false;
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64UrlDecode($tokenParts[0]);
    $payload = base64UrlDecode($tokenParts[1]);
    $signature_provided = $tokenParts[2];
    
    // Attempt verification
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    if ($base64UrlSignature === $signature_provided) {
        $payload_obj = json_decode($payload);
        if ($payload_obj->exp < time()) {
            return false; // Token has expired
        }
        return $payload_obj;
    }
    return false;
}

function get_bearer_token() {
    $headers = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = ['Authorization' => $_SERVER['HTTP_AUTHORIZATION']];
    } elseif (isset($_SERVER['Authorization'])) {
        $headers = ['Authorization' => $_SERVER['Authorization']];
    }

    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}
?>
