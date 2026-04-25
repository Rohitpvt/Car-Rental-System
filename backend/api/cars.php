<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
include_once '../config/database.php';
include_once 'jwt_helper.php';

$token = get_bearer_token();
$payload = validate_jwt($token);

// Filter Parameters
$search = $_GET['search'] ?? null;
$fuel_type = $_GET['fuel_type'] ?? null;
$make = $_GET['make'] ?? null;
$price_min = $_GET['price_min'] ?? null;
$price_max = $_GET['price_max'] ?? null;
$year_min = $_GET['year_min'] ?? null;
$year_max = $_GET['year_max'] ?? null;
$seating = $_GET['seating'] ?? null;
$has_images = isset($_GET['has_images']) && $_GET['has_images'] === 'true';
$verified = isset($_GET['verified']) && $_GET['verified'] === 'true';
$sort_by = $_GET['sort_by'] ?? null;

// Pagination
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

$where_clauses = [];
$params = [];

if (!$payload || $payload->role !== 'agency') {
    $where_clauses[] = "c.is_available = TRUE";
}

if ($search) {
    $where_clauses[] = "(c.make LIKE :search OR c.model LIKE :search OR c.vehicle_number LIKE :search OR c.parking_location LIKE :search)";
    $params[':search'] = "%$search%";
}

if ($fuel_type) {
    $where_clauses[] = "c.fuel_type = :fuel_type";
    $params[':fuel_type'] = $fuel_type;
}

if ($make) {
    $where_clauses[] = "c.make = :make";
    $params[':make'] = $make;
}

if ($price_min !== null && $price_min !== '') {
    $where_clauses[] = "c.rent_per_day >= :price_min";
    $params[':price_min'] = (float)$price_min;
}

if ($price_max !== null && $price_max !== '') {
    $where_clauses[] = "c.rent_per_day <= :price_max";
    $params[':price_max'] = (float)$price_max;
}

if ($year_min !== null && $year_min !== '') {
    $where_clauses[] = "c.registration_year >= :year_min";
    $params[':year_min'] = (int)$year_min;
}

if ($year_max !== null && $year_max !== '') {
    $where_clauses[] = "c.registration_year <= :year_max";
    $params[':year_max'] = (int)$year_max;
}

if ($seating) {
    $where_clauses[] = "c.seating_capacity = :seating";
    $params[':seating'] = (int)$seating;
}

if ($has_images) {
    $where_clauses[] = "(c.image_paths IS NOT NULL AND c.image_paths <> '[]' AND c.image_paths <> '')";
}

if ($verified) {
    $where_clauses[] = "c.agency_id IS NOT NULL AND c.agency_id > 0";
}

$where_sql = count($where_clauses) > 0 ? " WHERE " . implode(" AND ", $where_clauses) : "";

// Count total results for pagination metadata
$count_query = "SELECT COUNT(*) as total FROM cars c $where_sql";
$count_stmt = $conn->prepare($count_query);
foreach ($params as $key => $val) {
    if (is_int($val)) {
        $count_stmt->bindValue($key, $val, PDO::PARAM_INT);
    } else {
        $count_stmt->bindValue($key, $val, PDO::PARAM_STR);
    }
}
$count_stmt->execute();
$total_count = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Main Search Query
$query = "SELECT c.id, c.make, c.model, c.fuel_type, c.registration_year, c.parking_location, c.image_paths, c.vehicle_number, c.seating_capacity, c.rent_per_day, c.is_available, c.agency_id, u.name as agency_name 
          FROM cars c 
          LEFT JOIN users u ON c.agency_id = u.id" . $where_sql;

// Sorting
if ($sort_by === 'price_asc') {
    $query .= " ORDER BY c.rent_per_day ASC";
} else if ($sort_by === 'price_desc') {
    $query .= " ORDER BY c.rent_per_day DESC";
} else if ($sort_by === 'newest') {
    $query .= " ORDER BY c.id DESC";
} else {
    $query .= " ORDER BY c.id DESC";
}

// Pagination
$query .= " LIMIT :limit OFFSET :offset";

$stmt = $conn->prepare($query);
foreach ($params as $key => $val) {
    if (is_int($val)) {
        $stmt->bindValue($key, $val, PDO::PARAM_INT);
    } else {
        $stmt->bindValue($key, $val, PDO::PARAM_STR);
    }
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$cars_arr = array();
$cars_arr["records"] = array();
$cars_arr["total_count"] = $total_count;
$cars_arr["page"] = $page;
$cars_arr["limit"] = $limit;
$cars_arr["success"] = true;
$cars_arr["_debug"] = [
    "params" => $params,
    "where" => $where_sql,
    "limit" => $limit,
    "offset" => $offset
];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $images = isset($row['image_paths']) ? json_decode($row['image_paths'], true) : [];
    
    $car_item = array(
        "id" => $row['id'],
        "make" => $row['make'] ?? '',
        "model" => $row['model'] ?? '',
        "fuel_type" => $row['fuel_type'] ?? '',
        "registration_year" => $row['registration_year'] ?? '',
        "parking_location" => $row['parking_location'] ?? '',
        "images" => is_array($images) ? $images : [],
        "vehicle_number" => $row['vehicle_number'] ?? '',
        "seating_capacity" => (int)($row['seating_capacity'] ?? 0),
        "rent_per_day" => (float)($row['rent_per_day'] ?? 0),
        "is_available" => isset($row['is_available']) ? (bool)$row['is_available'] : false,
        "agency_id" => $row['agency_id'] ?? null,
        "agency_name" => $row['agency_name'] ?? 'Unknown'
    );
    array_push($cars_arr["records"], $car_item);
}

echo json_encode($cars_arr);
?>
