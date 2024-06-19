<?php
include 'dbh.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$response = ['success' => false];

if (!empty($username) && !empty($password)) {
    try {
        $stmt = $pdo->prepare("SELECT user_id, password_hash FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Start session and set user ID
            session_start();
            $_SESSION['user_id'] = $user['user_id'];
            $response['success'] = true;
            $response['user_id'] = $user['user_id'];  // Include user_id in the response
            $response['username'] = $username; // Include username in the response
        } else {
            $response['error'] = 'Invalid username or password';
        }
    } catch (PDOException $e) {
        $response['error'] = 'Error: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>
