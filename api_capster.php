<?php
header('Content-Type: application/json');
require 'koneksi.php';

$action = $_GET['action'] ?? '';

if ($action == 'list') {
    $status = strtolower($_GET['status'] ?? '');

    $sql = "SELECT * FROM capster";

    if ($status === 'aktif') {
        $sql .= " WHERE status='Aktif'";
    } elseif ($status === 'nonaktif') {
        $sql .= " WHERE status='Nonaktif'";
    } elseif ($status !== '') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Status tidak valid'
        ]);
        exit;
    }

    $sql .= " ORDER BY id DESC";
    $result = $conn->query($sql);
$data = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode([
    'status' => 'success',
    'data' => $data
]);
exit;
} elseif ($action == 'add') {

    $data = json_decode(file_get_contents("php://input"), true);

    $nama = $data['nama_capster'] ?? '';
    $no_hp = $data['no_hp'] ?? '';
    $alamat = $data['alamat'] ?? '';
    $target = $data['target_harian'] ?? 0;
    $status = $data['status'] ?? 'Aktif';

    if (empty($nama)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nama capster wajib diisi'
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO capster (nama_capster, no_hp, alamat, target_harian, status)
         VALUES (?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Prepare gagal: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("sssis", $nama, $no_hp, $alamat, $target, $status);

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Capster berhasil ditambahkan'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Execute gagal: ' . $stmt->error
        ]);
    }

    exit;
} elseif ($action == 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!empty($data['id']) && !empty($data['nama_capster'])) {
        $id = $data['id'];
        $nama = $data['nama_capster'];
        $no_hp = $data['no_hp'] ?? '';
        $alamat = $data['alamat'] ?? '';
        $target = $data['target_harian'] ?? 0;
        $status = $data['status'] ?? 'Aktif';
        
        $stmt = $conn->prepare("UPDATE capster SET nama_capster=?, no_hp=?, alamat=?, target_harian=?, status=? WHERE id=?");
        $stmt->bind_param("sssisi", $nama, $no_hp, $alamat, $target, $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Data capster berhasil diperbarui']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Gagal mengupdate capster']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nama capster wajib diisi']);
    }

} elseif ($action == 'delete') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!empty($data['id'])) {
        $id = $data['id'];
        $stmt = $conn->prepare("DELETE FROM capster WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Capster berhasil dihapus']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus capster (mungkin ada transaksi terkait)']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
    }

} elseif ($action == 'toggle_status') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!empty($data['id'])) {
        $id = $data['id'];
        $res = $conn->query("SELECT status FROM capster WHERE id=$id");
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $new_status = ($row['status'] === 'Aktif') ? 'Nonaktif' : 'Aktif';
            $stmt = $conn->prepare("UPDATE capster SET status=? WHERE id=?");
            $stmt->bind_param("si", $new_status, $id);
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Status berhasil diubah menjadi ' . $new_status]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Gagal mengubah status']);
            }
        }
    } else {
         echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
    }
} 
// === ENDPOINT UNTUK LAPORAN CAPSTER ===
elseif ($action == 'report') {
    $filter = $_GET['filter'] ?? 'hari_ini';
    $start_date = $_GET['start_date'] ?? '';
    $end_date = $_GET['end_date'] ?? '';
    
    $where_clause = "";
    
    if ($filter === 'hari_ini') {
        $where_clause = "DATE(t.tanggal) = CURDATE()";
    } elseif ($filter === 'minggu_ini') {
        $where_clause = "YEARWEEK(t.tanggal, 1) = YEARWEEK(CURDATE(), 1)";
    } elseif ($filter === 'bulan_ini') {
        $where_clause = "YEAR(t.tanggal) = YEAR(CURDATE()) AND MONTH(t.tanggal) = MONTH(CURDATE())";
    } elseif ($filter === 'custom' && $start_date && $end_date) {
        $where_clause = "DATE(t.tanggal) BETWEEN '$start_date' AND '$end_date'";
    } else {
        $where_clause = "1=1"; // all
    }
    
    $sql = "
        SELECT 
            c.id, 
            c.nama_capster,
            (SELECT COUNT(id) FROM transaksi WHERE capster_id = c.id AND DATE(tanggal) = CURDATE()) as pelanggan_hari_ini,
            (SELECT COUNT(id) FROM transaksi WHERE capster_id = c.id AND YEAR(tanggal) = YEAR(CURDATE()) AND MONTH(tanggal) = MONTH(CURDATE())) as pelanggan_bulan_ini,
            COUNT(t.id) as total_pelanggan,
            COALESCE(SUM(t.total_harga), 0) as total_pendapatan
        FROM capster c
        LEFT JOIN transaksi t ON c.id = t.capster_id AND $where_clause
        GROUP BY c.id
        ORDER BY total_pelanggan DESC
    ";
    
    $result = $conn->query($sql);
    $data = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
}
else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}
?>
