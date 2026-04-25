<?php
// seed_cars.php
include 'config/database.php';

$agency_name = "Premium Seed Agency";
$agency_email = "seed" . time() . "@agency.com";
$password = password_hash("password123", PASSWORD_DEFAULT);

// 1. Create or get an agency
$stmt = $conn->prepare("SELECT id FROM users WHERE role = 'agency' LIMIT 1");
$stmt->execute();
if ($stmt->rowCount() > 0) {
    $agency_id = $stmt->fetch()['id'];
    echo "Found existing agency ID: $agency_id\n";
} else {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'agency')");
    $stmt->execute([$agency_name, $agency_email, $password]);
    $agency_id = $conn->lastInsertId();
    echo "Created new agency ID: $agency_id\n";
}

$cars = [
    ['make' => 'Tesla', 'model' => 'Model S Plaid', 'fuel' => 'Electric', 'year' => 2024, 'cap' => 5, 'rent' => 8500, 'loc' => 'Downtown Hub'],
    ['make' => 'Porsche', 'model' => 'Taycan Cross Turismo', 'fuel' => 'Electric', 'year' => 2023, 'cap' => 4, 'rent' => 12000, 'loc' => 'Airport Terminal 2'],
    ['make' => 'BMW', 'model' => 'M8 Competition', 'fuel' => 'Petrol', 'year' => 2022, 'cap' => 4, 'rent' => 15000, 'loc' => 'Luxury Auto Park'],
    ['make' => 'Audi', 'model' => 'RS e-tron GT', 'fuel' => 'Electric', 'year' => 2024, 'cap' => 5, 'rent' => 9500, 'loc' => 'Downtown Hub'],
    ['make' => 'Mercedes', 'model' => 'G-Class AMG 63', 'fuel' => 'Petrol', 'year' => 2023, 'cap' => 5, 'rent' => 25000, 'loc' => 'Airport VIP Lounge'],
    ['make' => 'Lexus', 'model' => 'LC 500', 'fuel' => 'Hybrid', 'year' => 2022, 'cap' => 4, 'rent' => 7000, 'loc' => 'Business District'],
    ['make' => 'Range Rover', 'model' => 'Autobiography', 'fuel' => 'Diesel', 'year' => 2023, 'cap' => 7, 'rent' => 18000, 'loc' => 'City Center'],
    ['make' => 'Volvo', 'model' => 'XC90 Recharge', 'fuel' => 'Hybrid', 'year' => 2024, 'cap' => 7, 'rent' => 6000, 'loc' => 'Airport Terminal 1'],
    ['make' => 'Ford', 'model' => 'Mustang Mach-E', 'fuel' => 'Electric', 'year' => 2023, 'cap' => 5, 'rent' => 4500, 'loc' => 'Suburban Depot'],
    ['make' => 'Toyota', 'model' => 'Land Cruiser 300', 'fuel' => 'Diesel', 'year' => 2024, 'cap' => 7, 'rent' => 9000, 'loc' => 'Adventure Zone']
];

$upload_dir_img = __DIR__ . '/uploads/images/';
$upload_dir_doc = __DIR__ . '/uploads/documents/';

if (!is_dir($upload_dir_img)) mkdir($upload_dir_img, 0777, true);
if (!is_dir($upload_dir_doc)) mkdir($upload_dir_doc, 0777, true);

// Create a minimal 10x10 white JPEG
$jpeg_bin = hex2bin('ffd8ffe000104a46494600010101004800480000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc0001108000a000a03012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00a000fffffd');
$pdf_bin = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n188\n%%EOF\n";

// To make images looking like real cars for testing, we will generate them using PHP GD library with text overlay!
foreach ($cars as $index => $c) {
    try {
        $veh_num = "SEED-" . rand(100,999) . "-" . strtoupper(substr(md5(uniqid()),0,4));
        
        // Generate a pseudo-image indicating the car name using GD if available, else static buffer.
        $img_name = 'seed_img_' . time() . '_' . $index . '.jpg';
        $img_path = $upload_dir_img . $img_name;
        
        if (extension_loaded('gd')) {
            $img = imagecreatetruecolor(800, 600);
            $bg = imagecolorallocate($img, rand(50,200), rand(50,200), rand(50,200));
            $text_color = imagecolorallocate($img, 255, 255, 255);
            imagefill($img, 0, 0, $bg);
            
            // Draw gradient or simple text
            imagestring($img, 5, 200, 250, $c['make'] . " " . $c['model'], $text_color);
            imagestring($img, 5, 200, 300, "Rent: Rs." . $c['rent'], $text_color);
            
            imagejpeg($img, $img_path, 90);
            imagedestroy($img);
        } else {
            file_put_contents($img_path, $jpeg_bin);
        }
        
        // Generate PDFs
        $rc_name = 'seed_rc_' . uniqid() . '.pdf';
        $ins_name = 'seed_ins_' . uniqid() . '.pdf';
        $puc_name = 'seed_puc_' . uniqid() . '.pdf';
        
        file_put_contents($upload_dir_doc . $rc_name, $pdf_bin);
        file_put_contents($upload_dir_doc . $ins_name, $pdf_bin);
        file_put_contents($upload_dir_doc . $puc_name, $pdf_bin);
        
        $images_json = json_encode([$img_name]);
        
        // Execute Query
        $sql = "INSERT INTO cars (agency_id, make, model, fuel_type, vehicle_number, registration_year, seating_capacity, rent_per_day, parking_location, rc_file, insurance_file, puc_file, image_paths, is_available) 
              VALUES (:agency_id, :make, :model, :fuel_type, :vehicle_number, :registration_year, :seating_capacity, :rent_per_day, :parking_location, :rc_file, :insurance_file, :puc_file, :image_paths, 1)";
    
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':agency_id' => $agency_id,
            ':make' => $c['make'],
            ':model' => $c['model'],
            ':fuel_type' => $c['fuel'],
            ':vehicle_number' => $veh_num,
            ':registration_year' => $c['year'],
            ':seating_capacity' => $c['cap'],
            ':rent_per_day' => $c['rent'],
            ':parking_location' => $c['loc'],
            ':rc_file' => $rc_name,
            ':insurance_file' => $ins_name,
            ':puc_file' => $puc_name,
            ':image_paths' => $images_json
        ]);
        
        echo "Successfully seeded: {$c['make']} {$c['model']}\n";
    } catch(Exception $e) {
        echo "Error on {$c['make']}: " . $e->getMessage() . "\n";
    }
}
echo "All 10 seeds completed.\n";
?>
