<?php
require "../config/db.php";

$competicion = $_GET["competicion"] ?? null;

$stmt = $conn->prepare("
SELECT 
    e.id,
    e.nombre,
    SUM(
        CASE
            WHEN (e.id = p.equipo_local_id AND p.goles_local > p.goles_visita) OR
                 (e.id = p.equipo_visita_id AND p.goles_visita > p.goles_local)
            THEN 3
            WHEN p.goles_local = p.goles_visita THEN 1
            ELSE 0
        END
    ) AS puntos,
    COUNT(p.id) AS partidos
FROM equipos e
JOIN partidos p 
    ON e.id IN (p.equipo_local_id, p.equipo_visita_id)
WHERE p.competicion_id = ?
GROUP BY e.id
ORDER BY puntos DESC
");

$stmt->execute([$competicion]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
