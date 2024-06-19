<?php
include 'dbh.php';

header('Content-Type: application/json');
session_start();

$themeId = isset($_GET['theme_id']) ? $_GET['theme_id'] : null;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$pageSize = 100; // You can adjust this value as needed
$offset = ($page - 1) * $pageSize;
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null; // Get user_id from session

try {
    if ($themeId) {
        $query = '
            SELECT * 
            FROM sets 
            WHERE theme_id = :theme_id ';

        // Conditionally add filter based on user_id existence
        if ($userId !== null) {
            $query .= '
                AND set_num NOT IN (
                    SELECT set_num 
                    FROM collection 
                    WHERE user_id = :user_id
                )';
        }

        $query .= '
            ORDER BY year DESC
            LIMIT :page_size OFFSET :offset';

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':theme_id', $themeId, PDO::PARAM_INT);
        
        // Bind user_id only if it exists
        if ($userId !== null) {
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        }
        
        $stmt->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $query = '
            SELECT * 
            FROM sets ';

        // Conditionally add filter based on user_id existence
        if ($userId !== null) {
            $query .= '
                WHERE set_num NOT IN (
                    SELECT set_num 
                    FROM collection 
                    WHERE user_id = :user_id
                )';
        }

        $query .= '
            ORDER BY year DESC
            LIMIT :page_size OFFSET :offset';

        $stmt = $pdo->prepare($query);
        
        // Bind user_id only if it exists
        if ($userId !== null) {
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        }
        
        $stmt->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
    }

    $sets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($sets);
} catch (PDOException $e) {
    error_log('Error executing SQL query: ' . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching sets.']);
}
?>
