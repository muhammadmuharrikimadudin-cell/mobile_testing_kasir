<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $nama = $data['nama_layanan'] ?? '';
        $harga = $data['harga'] ?? 0;
        $deskripsi = $data['deskripsi'] ?? '';

        $stmt = $conn->prepare("INSERT INTO layanan (nama_layanan, harga, deskripsi) VALUES (?, ?, ?)");
        $stmt->bind_param("sis", $nama, $harga, $deskripsi);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan ditambahkan']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? 0;
        $nama = $data['nama_layanan'] ?? '';
        $harga = $data['harga'] ?? 0;
        $deskripsi = $data['deskripsi'] ?? '';

        $stmt = $conn->prepare("UPDATE layanan SET nama_layanan=?, harga=?, deskripsi=? WHERE id=?");
        $stmt->bind_param("sisi", $nama, $harga, $deskripsi, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil diperbarui']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? (isset($_GET['id']) ? $_GET['id'] : 0);

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM layanan WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil dihapus']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        $stmt->close();
        break;

    case 'GET':
    default:
        $sql = "SELECT * FROM layanan ORDER BY id ASC";
        $result = $conn->query($sql);

        $layanan = [];
        if ($result && $result->num_rows > 0) {
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
        break;
}
?>
