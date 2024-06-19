<?php
include 'dbh.php';

header('Content-Type: application/json');

$parentId = $_GET['parent_id'] ?? null;

if ($parentId !== null) {
    $stmt = $pdo->prepare('SELECT * FROM themes WHERE parent_id = :parent_id');
    $stmt->execute(['parent_id' => $parentId]);
    $subThemes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($subThemes);
} else {
    echo json_encode([]);
}
?>
