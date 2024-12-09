<?php
require 'dbh.php';
require 'cors_headers.php';

// Determine environment and set appropriate session parameters
$is_dev = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false;

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => $is_dev ? null : '.mybricklog.com',  // null for localhost
    'secure' => !$is_dev,  // false for localhost, true for production
    'httponly' => true,
    'samesite' => 'Strict'
]);

session_start();

$response = ['success' => false];
$data = json_decode(file_get_contents('php://input'), true);

// Verify user is logged in and matches the user_id
if (!isset($_SESSION['user_id']) || !isset($data['user_id']) || 
    $_SESSION['user_id'] != $data['user_id']) {
    $response['error'] = 'Unauthorized';
    echo json_encode($response);
    exit;
}

if ($data) {
    try {
        // Validate input
        $display_name = trim($data['displayName'] ?? '');
        $bio = trim($data['bio'] ?? '');
        $location = trim($data['location'] ?? '');
        $favorite_theme = $data['favoriteTheme'] ?? null;
        $twitter_handle = trim($data['twitterHandle'] ?? '');
        $youtube_channel = trim($data['youtubeChannel'] ?? '');
        $show_email = isset($data['showEmail']) ? (bool)$data['showEmail'] : false;
        
        // Validation checks
        if (strlen($bio) > 1000) {
            $response['error'] = 'Bio must be less than 1000 characters';
            echo json_encode($response);
            exit;
        }
        
        if (strlen($display_name) > 100) {
            $response['error'] = 'Display name must be less than 100 characters';
            echo json_encode($response);
            exit;
        }
        
        if (strlen($location) > 100) {
            $response['error'] = 'Location must be less than 100 characters';
            echo json_encode($response);
            exit;
        }

        // Validate Twitter handle
        if (strlen($twitter_handle) > 50) {
            $response['error'] = 'Twitter handle must be less than 50 characters';
            echo json_encode($response);
            exit;
        }
        
        // Remove @ symbol if present at start of Twitter handle
        if (strlen($twitter_handle) > 0 && $twitter_handle[0] === '@') {
            $twitter_handle = substr($twitter_handle, 1);
        }

        // Validate YouTube channel
        if (strlen($youtube_channel) > 100) {
            $response['error'] = 'YouTube channel must be less than 100 characters';
            echo json_encode($response);
            exit;
        }
        
        // Verify theme exists if provided
        if ($favorite_theme) {
            $stmt = $pdo->prepare("SELECT id FROM themes WHERE id = ?");
            $stmt->execute([$favorite_theme]);
            if (!$stmt->fetch()) {
                $response['error'] = 'Invalid theme selected';
                echo json_encode($response);
                exit;
            }
        }
        
        // Update profile with new fields
        $stmt = $pdo->prepare("
            UPDATE users 
            SET display_name = ?,
                bio = ?,
                location = ?,
                favorite_theme = ?,
                twitter_handle = ?,
                youtube_channel = ?,
                show_email = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ");
        
        $stmt->execute([
            $display_name ?: null,
            $bio ?: null,
            $location ?: null,
            $favorite_theme ?: null,
            $twitter_handle ?: null,
            $youtube_channel ?: null,
            $show_email,
            $data['user_id']
        ]);
        
        $response['success'] = true;
    } catch (PDOException $e) {
        $response['error'] = 'Database error';
        error_log('Database error: ' . $e->getMessage());
    }
} else {
    $response['error'] = 'Invalid data';
}

echo json_encode($response);
?>