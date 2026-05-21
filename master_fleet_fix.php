<?php
include 'backend/config/database.php';

$corrections = [
    ['make' => 'Tesla', 'model' => 'Model S Plaid', 'img' => 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Porsche', 'model' => 'Taycan', 'img' => 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'BMW', 'model' => 'M8', 'img' => 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Audi', 'model' => 'RS e-tron', 'img' => 'https://images.unsplash.com/photo-1614200171074-9ecb508f12f9?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Mercedes', 'model' => 'AMG G63', 'img' => 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Ferrari', 'model' => 'F8 Tributo', 'img' => 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Lamborghini', 'model' => 'Huracan Evo', 'img' => 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Land Rover', 'model' => 'Range Rover Sport', 'img' => 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Ford', 'model' => 'Shelby GT500', 'img' => 'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Rolls-Royce', 'model' => 'Ghost', 'img' => 'https://images.unsplash.com/photo-1631214548405-59e95652936a?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Bentley', 'model' => 'Continental GT', 'img' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    ['make' => 'Aston Martin', 'model' => 'Vantage', 'img' => 'https://images.unsplash.com/photo-1603577312306-ed2721e3581c?auto=format&fit=crop&q=80&w=800']
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
echo "Fleet cleanup complete.\n";
?>
