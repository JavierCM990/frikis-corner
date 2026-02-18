<?php
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $conn->prepare("
INSERT INTO equipos (nombre, zona, creador_id)
VALUES (?, ?, ?)
");
$stmt->execute([
    $data["nombre"],
    $data["zona"],
    $data["creador_id"]
]);

echo json_encode(["success" => true]);
