CREATE TABLE IF NOT EXISTS capster (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_capster VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    target_harian INT DEFAULT 0,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tambahkan kolom capster_id jika belum ada
SET @dbname = 'kasir_barbershop';
SET @tablename = 'transaksi';
SET @columnname = 'capster_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE transaksi ADD COLUMN capster_id INT DEFAULT NULL, ADD CONSTRAINT fk_capster FOREIGN KEY (capster_id) REFERENCES capster(id) ON DELETE SET NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
