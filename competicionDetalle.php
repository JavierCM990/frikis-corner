<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require "../config/db.php";

$id = $_GET['id'] ?? null;
if (!$id) {
    echo json_encode([]);
    exit;
}

/* ============================
   PARTIDOS (SIN DUPLICAR)
============================ */
$stmt = $conn->prepare("
    SELECT DISTINCT
        p.id,
        p.fecha,
        p.goles_local,
        p.goles_visita,
        l.id AS local_id,
        l.nombre AS local,
        v.id AS visita_id,
        v.nombre AS visita
    FROM partidos p
    JOIN equipos l ON p.equipo_local_id = l.id
    JOIN equipos v ON p.equipo_visita_id = v.id
    WHERE p.competicion_id = ?
    ORDER BY p.fecha ASC
");
$stmt->execute([$id]);
$partidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ============================
   CLASIFICACIÓN
============================ */
$clasificacion = [];

foreach ($partidos as $p) {

    $equipos = [
        ['id'=>$p['local_id'], 'nombre'=>$p['local'], 'gf'=>$p['goles_local'], 'gc'=>$p['goles_visita']],
        ['id'=>$p['visita_id'], 'nombre'=>$p['visita'], 'gf'=>$p['goles_visita'], 'gc'=>$p['goles_local']]
    ];

    foreach ($equipos as $e) {
        if (!isset($clasificacion[$e['id']])) {
            $clasificacion[$e['id']] = [
                'id' => $e['id'],
                'nombre' => $e['nombre'],
                'pj' => 0,
                'g' => 0,
                'e' => 0,
                'p' => 0,
                'pts' => 0,
                'gf' => 0,
                'ga' => 0,
                'dg' => 0
            ];
        }

        $c =& $clasificacion[$e['id']];
        $c['pj']++;
        $c['gf'] += $e['gf'];
        $c['ga'] += $e['gc'];
        $c['dg'] = $c['gf'] - $c['ga'];

        if ($e['gf'] > $e['gc']) $c['g']++;
        elseif ($e['gf'] == $e['gc']) $c['e']++;
        else $c['p']++;

        $c['pts'] = $c['g'] * 3 + $c['e'];
    }
}

/* ORDENAR CLASIFICACIÓN */
$clasificacion = array_values($clasificacion);
usort($clasificacion, function($a,$b){
    if ($b['pts'] != $a['pts']) return $b['pts'] - $a['pts'];
    if ($b['dg'] != $a['dg']) return $b['dg'] - $a['dg'];
    return $b['gf'] - $a['gf'];
});

/* ============================
   TOP 3 GOLEADORES
============================ */
$topGoleadores = $clasificacion;
usort($topGoleadores, fn($a,$b) => $b['gf'] - $a['gf']);
$topGoleadores = array_slice($topGoleadores, 0, 3);

/* ============================
   TOP 3 MÁS GOLEADOS
============================ */
$topGoleados = $clasificacion;
usort($topGoleados, fn($a,$b) => $b['ga'] - $a['ga']);
$topGoleados = array_slice($topGoleados, 0, 3);

/* ============================
   RESPUESTA FINAL
============================ */
echo json_encode([
    'clasificacion' => $clasificacion,
    'partidos' => $partidos,
    'topGoleadores' => $topGoleadores,
    'topGoleados' => $topGoleados
]);
