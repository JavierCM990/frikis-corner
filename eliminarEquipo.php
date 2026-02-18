<?php
require "../config/db.php";

$id = $_GET["id"] ?? null;

$stmt = $conn->prepare("DELETE FROM equipos WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["success" => true]);
