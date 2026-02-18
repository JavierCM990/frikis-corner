<?php
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("
    INSERT INTO competiciones (nombre, descripcion, creador_usuario_id)
    VALUES (?, ?, ?)
");

$stmt->execute([
    $data["nombre"],
    $data["descripcion"],
    $data["creador"]
]);

echo json_encode(["ok" => true]);

?>