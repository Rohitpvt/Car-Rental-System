<?php
include_once 'config/database.php';

try {
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $queries = [
        "ALTER TABLE cars ADD COLUMN make VARCHAR(100) NOT NULL AFTER agency_id",
        "ALTER TABLE cars ADD COLUMN fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') NOT NULL AFTER model",
        "ALTER TABLE cars ADD COLUMN registration_year INT NOT NULL AFTER fuel_type",
        "ALTER TABLE cars ADD COLUMN parking_location TEXT NOT NULL AFTER is_available",
        "ALTER TABLE cars ADD COLUMN rc_file VARCHAR(255) NOT NULL AFTER parking_location",
        "ALTER TABLE cars ADD COLUMN insurance_file VARCHAR(255) NOT NULL AFTER rc_file",
        "ALTER TABLE cars ADD COLUMN puc_file VARCHAR(255) NOT NULL AFTER insurance_file",
        "ALTER TABLE cars ADD COLUMN image_paths TEXT NOT NULL AFTER puc_file"
    ];

    foreach ($queries as $q) {
        try {
            $conn->exec($q);
            echo "Success: $q\n";
        } catch(PDOException $e) {
            // Ignore Duplicate column errors if it runs twice
            if ($e->getCode() == '42S21') { 
                echo "Skipped (Already exists): $q\n";
            } else {
                echo "Error on $q: " . $e->getMessage() . "\n";
            }
        }
    }
    
    // Also create uploads directories
    if (!is_dir(__DIR__ . '/uploads/images')) {
        mkdir(__DIR__ . '/uploads/images', 0777, true);
    }
    if (!is_dir(__DIR__ . '/uploads/documents')) {
        mkdir(__DIR__ . '/uploads/documents', 0777, true);
    }
    
    echo "Migration Complete.\n";
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
