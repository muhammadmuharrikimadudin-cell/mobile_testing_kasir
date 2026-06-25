<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Content-Type: application/json');
require 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['action']) && $data['action'] == 'add') {
        $nama = $data['nama_layanan'];
        $harga = $data['harga'];
        $deskripsi = $data['deskripsi'] ?? '';

        $stmt = $conn->prepare("INSERT INTO layanan (nama_layanan, harga, deskripsi) VALUES (?, ?, ?)");
        $stmt->bind_param("sis", $nama, $harga, $deskripsi);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan ditambahkan']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        exit;
    } elseif (isset($data['action']) && $data['action'] == 'edit') {
        $id = $data['id'];
        $nama = $data['nama_layanan'];
        $harga = $data['harga'];
        $deskripsi = $data['deskripsi'] ?? '';

        $stmt = $conn->prepare("UPDATE layanan SET nama_layanan=?, harga=?, deskripsi=? WHERE id=?");
        $stmt->bind_param("sisi", $nama, $harga, $deskripsi, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil diperbarui']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        exit;
    } elseif (isset($data['action']) && $data['action'] == 'delete') {
        $id = $data['id'];

        $stmt = $conn->prepare("DELETE FROM layanan WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil dihapus']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        exit;
    }
}

// GET method: Fetch all layanan
$sql = "SELECT * FROM layanan ORDER BY id ASC";
$result = $conn->query($sql);

$layanan = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $layanan[] = $row;
    }
} else {
    // Jika data kosong, beri data default sesuai SQL agar frontend tetap jalan jika belum di-seed
    $layanan = [
        ['id' => 1, 'nama_layanan' => 'Potong Rambut', 'harga' => 25000, 'deskripsi' => 'Potong rambut standar'],
        ['id' => 2, 'nama_layanan' => 'Cukur Jenggot', 'harga' => 15000, 'deskripsi' => 'Perapihan jenggot'],
        ['id' => 3, 'nama_layanan' => 'Hair Coloring', 'harga' => 80000, 'deskripsi' => 'Pewarnaan rambut'],
        ['id' => 4, 'nama_layanan' => 'Creambath', 'harga' => 50000, 'deskripsi' => 'Perawatan rambut'],
        ['id' => 5, 'nama_layanan' => 'Hair Wash', 'harga' => 10000, 'deskripsi' => 'Cuci rambut']
    ];
}

echo json_encode(['status' => 'success', 'data' => $layanan]);
?>
