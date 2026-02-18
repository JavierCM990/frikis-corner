<?php
require "../config/db.php";

$usuario = $_GET["usuario"] ?? null;

$stmt = $conn->prepare("
SELECT id, nombre, zona 
FROM equipos 
WHERE creador_id = ?
");
$stmt->execute([$usuario]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
