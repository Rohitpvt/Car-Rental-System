<?php
include 'backend/config/database.php';

$corrections = [
    ['make' => 'Audi', 'model' => 'RS e-tron', 'img' => 'https://images.unsplash.com/photo-1621359953476-b1629902f6ca?w=800'],
    ['make' => 'Rolls-Royce', 'model' => 'Ghost', 'img' => 'https://images.unsplash.com/photo-1631214503951-37512a3f2b60?w=800']
];

foreach ($corrections as $c) {
    echo "Updating [{$c['make']} {$c['model']}]...\n";
    $img_json = json_encode([$c['img']]);
    $stmt = $conn->prepare("UPDATE cars SET image_paths = ? WHERE make = ? AND model LIKE ?");
    $stmt->execute([$img_json, $c['make'], '%' . $c['model'] . '%']);
    
    if ($stmt->rowCount() > 0) {
        echo "Successfully updated.\n";
    } else {
        echo "Not found or no change.\n";
    }
}
echo "Final targeted fleet cleanup complete.\n";
?>
