<?php
header('Content-Type: application/json');
require 'koneksi.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($data)) {
    $total_harga = $data['total_harga'];
    $bayar = $data['bayar'];
    $kembalian = $data['kembalian'];
    $items = $data['items'];
    $capster_id = $data['capster_id'] ?? null; // Tambahkan capster_id
    $kode_transaksi = 'TRX' . strtoupper(uniqid());
    $user_id = 1; // Default admin
    
    $conn->begin_transaction();
    
    try {
        if ($capster_id) {
            $stmt = $conn->prepare("INSERT INTO transaksi (kode_transaksi, user_id, capster_id, total_harga, bayar, kembalian) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("siiiii", $kode_transaksi, $user_id, $capster_id, $total_harga, $bayar, $kembalian);
        } else {
            $stmt = $conn->prepare("INSERT INTO transaksi (kode_transaksi, user_id, total_harga, bayar, kembalian) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("siiii", $kode_transaksi, $user_id, $total_harga, $bayar, $kembalian);
        }
        $stmt->execute();
        $transaksi_id = $stmt->insert_id;
        
        $stmt_detail = $conn->prepare("INSERT INTO detail_transaksi (transaksi_id, layanan_id, qty, subtotal) VALUES (?, ?, ?, ?)");
        
        foreach($items as $item) {
            $layanan_id = $item['id'];
            $qty = $item['qty'];
            $subtotal = $item['subtotal'];
            $stmt_detail->bind_param("iiii", $transaksi_id, $layanan_id, $qty, $subtotal);
            $stmt_detail->execute();
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Transaksi sukses!', 'kode_transaksi' => $kode_transaksi]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>
