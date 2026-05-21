<?php
include 'backend/config/database.php';

$corrections = [
    ['make' => 'Audi', 'model' => 'RS e-tron', 'img' => 'https://images.unsplash.com/photo-1620012253295-c15cb3a65247?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Ford', 'model' => 'Shelby GT500', 'img' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Rolls-Royce', 'model' => 'Ghost', 'img' => 'https://images.unsplash.com/photo-1599818815152-edab3d6dc22e?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Aston Martin', 'model' => 'Vantage', 'img' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800']
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
echo "Targeted fleet cleanup complete.\n";
?>
