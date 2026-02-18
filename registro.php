<?php
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$nombre = $data["nombre"] ?? "";
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";
$equipo = $data["equipo_id"] ?? null;

if (!$nombre || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $sql = "INSERT INTO usuarios (nombre, email, password, equipo_favorito_id)
            VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$nombre, $email, $hash, $equipo]);

    echo json_encode(["ok" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
