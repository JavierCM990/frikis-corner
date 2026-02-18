<?php
require "../config/db.php";

$id = $_GET["id"] ?? null;
if (!$id) {
    echo json_encode(["error" => "ID no proporcionado"]);
    exit;
}

/* ===============================
   INFO GENERAL DEL EQUIPO
================================ */
$stmt = $conn->prepare("
    SELECT nombre, zona
    FROM equipos
    WHERE id = ?
");
$stmt->execute([$id]);
$info = $stmt->fetch(PDO::FETCH_ASSOC);

/* ===============================
   COMPETICIONES DEL EQUIPO
================================ */
$stmt = $conn->prepare("
    SELECT DISTINCT c.nombre
    FROM competiciones c
    JOIN partidos p ON p.competicion_id = c.id
    WHERE p.equipo_local_id = ? OR p.equipo_visita_id = ?
");
$stmt->execute([$id, $id]);
$competiciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ===============================
   ÚLTIMOS 5 PARTIDOS
================================ */
$stmt = $conn->prepare("
    SELECT 
        p.id,
        l.nombre AS local,
        v.nombre AS visita,
        p.goles_local,
        p.goles_visita,
        p.fecha
    FROM partidos p
    JOIN equipos l ON p.equipo_local_id = l.id
    JOIN equipos v ON p.equipo_visita_id = v.id
    WHERE (p.equipo_local_id = ? OR p.equipo_visita_id = ?)
      AND p.fecha < NOW()
    ORDER BY p.fecha DESC
    LIMIT 5
");
$stmt->execute([$id, $id]);
$ultimos = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ===============================
   PRÓXIMO PARTIDO
================================ */
$stmt = $conn->prepare("
    SELECT 
        p.id,
        l.nombre AS local,
        v.nombre AS visita,
        p.fecha
    FROM partidos p
    JOIN equipos l ON p.equipo_local_id = l.id
    JOIN equipos v ON p.equipo_visita_id = v.id
    WHERE (p.equipo_local_id = ? OR p.equipo_visita_id = ?)
      AND p.fecha >= NOW()
    ORDER BY p.fecha ASC
    LIMIT 1
");
$stmt->execute([$id, $id]);
$proximo = $stmt->fetch(PDO::FETCH_ASSOC);

/* ===============================
   DEVOLVER JSON
================================ */
echo json_encode([
    "info" => $info,
    "competiciones" => $competiciones,
    "ultimos" => $ultimos,
    "proximo" => $proximo
]);
