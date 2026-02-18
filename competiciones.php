<?php

require "../config/db.php";

$stmt = $conn->query("SELECT id, nombre FROM competiciones");
// Devolver los resultados como JSON
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>