<?php
include 'dbh.php';
header('Content-Type: application/json');

// List of theme IDs to prioritize
$priorityThemes = [721, 52, 246, 1, 158]; // Replace with your actual theme IDs

// Convert the list of IDs to a comma-separated string
$priorityThemesStr = implode(',', $priorityThemes);

$stmt = $pdo->query("
    SELECT * 
    FROM themes 
    WHERE parent_id = 0 
    ORDER BY 
        FIELD(id, $priorityThemesStr) DESC,
        name ASC
");
$parentThemes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($parentThemes);
?>