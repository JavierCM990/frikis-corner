<?php
require "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$usuario = $data["usuario"];
$competicion = $data["competicion"];

$stmt = $pdo->prepare("
    SELECT id FROM competiciones
    WHERE id = ? AND creador_usuario_id = ?
");
$stmt->execute([$competicion, $usuario]);

if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(["error" => "No tienes permisos"]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE partidos
    SET goles_local = ?, goles_visita = ?
    WHERE id = ?
");

$stmt->execute([
    $data["goles_local"],
    $data["goles_visita"],
    $data["partido"]
]);

echo json_encode(["ok" => true]);

?>