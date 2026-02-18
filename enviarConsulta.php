<?php
header("Content-Type: application/json; charset=utf-8");
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$asunto = trim($data["asunto"] ?? "");
$mensaje = trim($data["mensaje"] ?? "");

if (!$email || !$asunto || !$mensaje) {
    http_response_code(400);
    echo json_encode(["error" => "Todos los campos son obligatorios"]);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO consultas (email, asunto, mensaje) VALUES (?, ?, ?)");
    $stmt->execute([$email, $asunto, $mensaje]);

    echo json_encode(["ok" => true, "mensaje" => "Consulta enviada correctamente"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar la consulta: " . $e->getMessage()]);
}
