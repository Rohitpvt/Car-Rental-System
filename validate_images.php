<?php
include 'backend/config/database.php';
$stmt = $conn->query("SELECT id, make, model, image_paths FROM cars");
$cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
$broken = [];

foreach ($cars as $car) {
    if (empty($car['image_paths'])) continue;
    
    $paths = json_decode($car['image_paths'], true);
    if (!is_array($paths)) continue;
    
    foreach ($paths as $img) {
        if (strpos($img, 'http') === 0) {
            $headers = @get_headers($img);
            if (!$headers || strpos($headers[0], '404') !== false || strpos($headers[0], '403') !== false) {
                $broken[] = "{$car['make']} {$car['model']} (ID: {$car['id']}) - Invalid status: " . ($headers ? $headers[0] : 'No headers');
            }
        }
    }
}
if(empty($broken)){
    echo "All image links are valid!";
}else{
    echo "Broken Images Found:\n";
    print_r($broken);
}
?>
