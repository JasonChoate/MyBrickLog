<?php

$host = getenv("MBL_RDS_HOST");
$db = 'mybricklog';
$user = 'admin';
$pass = getenv("MBL_RDS_PW");
$port = 3306;

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
?>