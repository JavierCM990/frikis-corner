<?php
require "../config/db.php";

$stmt = $conn->prepare("
    SELECT 
        p.id,
        p.fecha,
        p.competicion_id,
        p.equipo_local_id AS local_id,
        l.nombre AS local,
        p.equipo_visita_id AS visita_id,
        v.nombre AS visita,
        p.goles_local,
        p.goles_visita
    FROM partidos p
    JOIN equipos l ON p.equipo_local_id = l.id
    JOIN equipos v ON p.equipo_visita_id = v.id
    GROUP BY p.id
    ORDER BY p.fecha DESC
");

$stmt->execute();
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>