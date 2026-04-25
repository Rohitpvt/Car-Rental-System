<?php
/**
 * EXAMPLE DATABASE CONFIGURATION
 * Rename this file to database.php and update the credentials below.
 */

class Database {
    private $host = "localhost";
    private $db_name = "car_rental_db";
    private $username = "your_db_user";
    private $password = "your_db_password";
    public $conn;

    public function getConnection() {
        // Load production overrides if they exist
        if (file_exists(__DIR__ . '/config_prod.php')) {
            $config = include(__DIR__ . '/config_prod.php');
            if (is_array($config)) {
                $this->host = $config['host'] ?? $this->host;
                $this->db_name = $config['db_name'] ?? $this->db_name;
                $this->username = $config['username'] ?? $this->username;
                $this->password = $config['password'] ?? $this->password;
            }
        }

        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
