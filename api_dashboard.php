<?php
header('Content-Type: application/json');
require 'koneksi.php';

$action = $_GET['action'] ?? '';

if ($action == 'stats') {
    $res1 = $conn->query("SELECT SUM(total_harga) as total_pemasukan FROM transaksi");
    $total_pemasukan = $res1->fetch_assoc()['total_pemasukan'] ?? 0;
    
    $res2 = $conn->query("SELECT COUNT(id) as jumlah_transaksi FROM transaksi");
    $jumlah_transaksi = $res2->fetch_assoc()['jumlah_transaksi'] ?? 0;
    
    // Total Capster Aktif
    $res3 = $conn->query("SELECT COUNT(id) as total_capster FROM capster WHERE status = 'Aktif'");
    $total_capster = $res3->fetch_assoc()['total_capster'] ?? 0;
    
    // Total Pelanggan Hari Ini
    $res4 = $conn->query("SELECT COUNT(id) as pelanggan_hari_ini FROM transaksi WHERE DATE(tanggal) = CURDATE()");
    $pelanggan_hari_ini = $res4->fetch_assoc()['pelanggan_hari_ini'] ?? 0;
    
    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_pemasukan' => (int)$total_pemasukan,
            'jumlah_transaksi' => (int)$jumlah_transaksi,
            'total_capster' => (int)$total_capster,
            'pelanggan_hari_ini' => (int)$pelanggan_hari_ini
        ]
    ]);
} elseif ($action == 'history') {
    $sql = "SELECT t.*, c.nama_capster FROM transaksi t LEFT JOIN capster c ON t.capster_id = c.id ORDER BY t.tanggal DESC LIMIT 50";
    $result = $conn->query($sql);
    $history = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
    }
    echo json_encode(['status' => 'success', 'data' => $history]);
} elseif ($action == 'performa_capster') {
    // Top 3 Capster Hari Ini
    $sql = "
        SELECT c.id, c.nama_capster, c.target_harian, COUNT(t.id) as pelanggan_hari_ini
        FROM capster c
        LEFT JOIN transaksi t ON c.id = t.capster_id AND DATE(t.tanggal) = CURDATE()
        WHERE c.status = 'Aktif'
        GROUP BY c.id
        ORDER BY pelanggan_hari_ini DESC
    ";
    $result = $conn->query($sql);
    $data = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['target_harian'] = (int)$row['target_harian'];
            $row['pelanggan_hari_ini'] = (int)$row['pelanggan_hari_ini'];
            $row['progress'] = $row['target_harian'] > 0 ? min(100, round(($row['pelanggan_hari_ini'] / $row['target_harian']) * 100)) : 0;
            $data[] = $row;
        }
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}
?>
