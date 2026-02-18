<?php
require "../config/db.php";

$id = $_GET["id"] ?? null;

$stmt = $conn->prepare("
SELECT 
    p.id,
    p.fecha,
    p.goles_local,
    p.goles_visita,
    l.nombre AS local,
    v.nombre AS visitante
FROM partidos p
JOIN equipos l ON p.equipo_local_id = l.id
JOIN equipos v ON p.equipo_visita_id = v.id
WHERE p.equipo_local_id = ? OR p.equipo_visita_id = ?
ORDER BY p.fecha DESC
");

$stmt->execute([$id, $id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));