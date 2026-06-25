<?php
require 'koneksi.php';

echo "Setting up database...\n";

// 1. Create capster table
$sqlCapster = "CREATE TABLE IF NOT EXISTS capster (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_capster VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    target_harian INT DEFAULT 10,
    status ENUM('Aktif','Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sqlCapster) === TRUE) {
    echo "Table 'capster' created or already exists.\n";
} else {
    echo "Error creating table 'capster': " . $conn->error . "\n";
}

// 2. Ensure capster_id exists in transaksi
$sqlCheckCol = "SHOW COLUMNS FROM transaksi LIKE 'capster_id'";
$res = $conn->query($sqlCheckCol);
if ($res && $res->num_rows == 0) {
    $sqlAddCol = "ALTER TABLE transaksi ADD COLUMN capster_id INT NULL AFTER user_id";
    if ($conn->query($sqlAddCol) === TRUE) {
        echo "Column 'capster_id' added to 'transaksi'.\n";
    } else {
        echo "Error adding column: " . $conn->error . "\n";
    }
} else {
    echo "Column 'capster_id' already exists in 'transaksi'.\n";
}

$conn->close();
echo "Done.\n";
?>
