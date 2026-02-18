<?php
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $conn->prepare("
INSERT INTO contacto (email, mensaje)
VALUES (?, ?)
");

$stmt->execute([
    $data["email"],
    $data["mensaje"]
]);

echo json_encode([
    "success" => true,
    "message" => "Mensaje enviado correctamente"
]);
