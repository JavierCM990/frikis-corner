<?php
require "../config/db.php";

$stmt = $conn->query("
    SELECT id, nombre 
    FROM equipos 
    ORDER BY nombre
");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
