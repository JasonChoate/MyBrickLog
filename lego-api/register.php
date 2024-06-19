<?php
include 'dbh.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$response = ['success' => false];

if (!empty($username) && !empty($email) && !empty($password)) {
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        if ($stmt->execute([$username, $email, $hashedPassword])) {
            $response['success'] = true;
        }
    } catch (PDOException $e) {
        $response['error'] = 'Error: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>
