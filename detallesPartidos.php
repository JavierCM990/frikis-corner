<?php
require "../config/db.php";

$id = $_GET["id"] ?? null;
if (!$id) {
    echo json_encode(["error" => "ID no proporcionado"]);
    exit;
}

/* ===============================
   PARTIDO
================================ */
$stmt = $conn->prepare("
    SELECT 
        p.id,
        p.fecha,
        p.goles_local,
        p.goles_visita,
        p.equipo_local_id,
        p.equipo_visita_id,
        l.nombre AS local,
        v.nombre AS visitante
    FROM partidos p
    JOIN equipos l ON p.equipo_local_id = l.id
    JOIN equipos v ON p.equipo_visita_id = v.id
    WHERE p.id = ?
");
$stmt->execute([$id]);
$partido = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$partido) {
    echo json_encode(["error" => "Partido no encontrado"]);
    exit;
}

/* ===============================
   ESTADÍSTICAS
================================ */
$stmt2 = $conn->prepare("
    SELECT 
        s.equipos_id AS equipo_id,
        e.nombre,
        s.tiros,
        s.tiros_puerta,
        s.tarjetas_rojas
    FROM estadisticas_partidos s
    JOIN equipos e ON s.equipos_id = e.id
    WHERE s.partidos_id = ?
");
$stmt2->execute([$id]);
$estadisticas = $stmt2->fetchAll(PDO::FETCH_ASSOC);

/* ===============================
   SI NO HAY ESTADÍSTICAS, CREAR 0s
================================ */
if (count($estadisticas) === 0) {
    $estadisticas = [
        [
            "equipo_id" => $partido["equipo_local_id"],
            "nombre" => $partido["local"],
            "tiros" => 0,
            "tiros_puerta" => 0,
            "tarjetas_rojas" => 0
        ],
        [
            "equipo_id" => $partido["equipo_visita_id"],
            "nombre" => $partido["visitante"],
            "tiros" => 0,
            "tiros_puerta" => 0,
            "tarjetas_rojas" => 0
        ]
    ];
}

/* ===============================
   AJUSTAR ESTADÍSTICAS SEGÚN GOLES
================================ */
foreach ($estadisticas as &$e) {

    if ($e["equipo_id"] == $partido["equipo_local_id"]) {
        $goles = (int)($partido["goles_local"] ?? 0);
    } else {
        $goles = (int)($partido["goles_visita"] ?? 0);
    }

    // Si hay goles deben haber al menos esos tiros y tiros a puerta
    if ($e["tiros"] < $goles) {
        $e["tiros"] = $goles;
    }

    if ($e["tiros_puerta"] < $goles) {
        $e["tiros_puerta"] = $goles;
    }
}
unset($e);

/* ===============================
   DEVOLVER JSON
================================ */
echo json_encode([
    "partido" => $partido,
    "estadisticas" => array_values($estadisticas)
]);
