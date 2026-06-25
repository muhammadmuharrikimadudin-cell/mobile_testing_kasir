// State
let cart = [];
let subtotal = 0;
let totalHarga = 0;
let services = [];

// Format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// Format Input Number with Dots
function formatInputRupiah(input) {
    let value = input.value.replace(/[^,\d]/g, '').toString();
    let split = value.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    input.value = rupiah;
}

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan nama user
    const user = localStorage.getItem('barberpos_user');
    if (user && document.getElementById('user-name-display')) {
        document.getElementById('user-name-display').innerText = user;
    }

    startClock();
    loadLayanan();
    loadDashboard();
    loadCapsterAktif(); // Load dropdown capster
});

// --- CLOCK ---
function startClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (!timeEl) return;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    setInterval(() => {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString('id-ID');
        dateEl.innerText = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }, 1000);
}

// --- AUTH ---
function logout() {
    localStorage.removeItem('barberpos_loggedin');
    localStorage.removeItem('barberpos_user');
    window.location.href = 'login.html';
}

// --- NAVIGATION / TABS ---
function switchTab(tabId) {
    // Update nav links
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Load data specific to tabs
    if (tabId === 'dashboard') loadDashboard();
    if (tabId === 'riwayat') loadRiwayat();
    if (tabId === 'capster') loadCapster();
    if (tabId === 'laporan') loadLaporan();
}

// --- API FETCHES ---
async function loadLayanan() {
    try {
        const res = await fetch('api_layanan.php');
        const json = await res.json();

        if (json.status === 'success') {
            services = json.data;
            renderLayanan();
        }

    } catch (e) {
        console.error('Gagal mengambil data layanan', e);
    }
}

async function loadDashboard() {
    try {
        const resStats = await fetch('api_dashboard.php?action=stats');
        const jsonStats = await resStats.json();
        if (jsonStats.status === 'success') {
            document.getElementById('dash-pemasukan').innerText = formatRupiah(jsonStats.data.total_pemasukan);
            document.getElementById('dash-transaksi').innerText = jsonStats.data.jumlah_transaksi;
            if (document.getElementById('dash-capster')) document.getElementById('dash-capster').innerText = jsonStats.data.total_capster;
            if (document.getElementById('dash-pelanggan-hari-ini')) document.getElementById('dash-pelanggan-hari-ini').innerText = jsonStats.data.pelanggan_hari_ini;
        }

        // Fetch History for Widgets
        const resHistory = await fetch('api_dashboard.php?action=history');
        const jsonHistory = await resHistory.json();
        if (jsonHistory.status === 'success') {
            renderDashboardWidgets(jsonHistory.data);
        }

        // Fetch Performa Capster
        loadPerformaCapster();
    } catch (e) {
        console.error(e);
    }
}

function renderDashboardWidgets(historyData) {
    const recentEl = document.getElementById('widget-recent');
    const topEl = document.getElementById('widget-top-services');
    if (!recentEl || !topEl) return;

    // 1. Transaksi Terakhir (Ambil 5 terbaru)
    recentEl.innerHTML = '';
    const recent5 = historyData.slice(0, 5);
    if (recent5.length === 0) {
        recentEl.innerHTML = '<li style="color:var(--text-muted);">Belum ada transaksi</li>';
    } else {
        recent5.forEach(trx => {
            recentEl.innerHTML += `
                <li style="padding:10px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:var(--text-main);">${trx.kode_transaksi}</strong>
                        <div style="font-size:12px; color:var(--text-muted);">${trx.tanggal.split(' ')[1]}</div>
                    </div>
                    <span style="color:var(--success); font-weight:600;">${formatRupiah(trx.total_harga)}</span>
                </li>
            `;
        });
    }

    // 2. Layanan Terlaris (Simulasi sederhana karena history api tidak return item detail)
    // Di aplikasi nyata, harusnya query ke detail_transaksi. 
    // Untuk ini, kita tampilkan beberapa layanan default secara random atau statis untuk demo
    topEl.innerHTML = '';
    const topServicesMock = services.slice(0, 3); // Ambil 3 layanan pertama
    if (topServicesMock.length === 0) {
        topEl.innerHTML = '<li style="color:var(--text-muted);">Belum ada layanan</li>';
    } else {
        topServicesMock.forEach((srv, index) => {
            const colors = ['#d4af37', '#94a3b8', '#cd7f32']; // Gold, Silver, Bronze
            topEl.innerHTML += `
                <li style="padding:10px 0; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:15px;">
                    <div style="width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; justify-content:center; align-items:center; color:${colors[index] || 'white'}; font-weight:bold;">
                        ${index + 1}
                    </div>
                    <div>
                        <strong style="color:var(--text-main);">${srv.nama_layanan}</strong>
                        <div style="font-size:12px; color:var(--primary);">${formatRupiah(srv.harga)}</div>
                    </div>
                </li>
            `;
        });
    }
}

async function loadRiwayat() {
    try {
        const res = await fetch('api_dashboard.php?action=history');
        const json = await res.json();
        if (json.status === 'success') {
            const tbody = document.getElementById('tbody-riwayat');
            tbody.innerHTML = '';
            json.data.forEach(trx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${trx.kode_transaksi}</td>
                    <td>${trx.tanggal}</td>
                    <td>${trx.nama_capster || '-'}</td>
                    <td style="color:#10b981">${formatRupiah(trx.total_harga)}</td>
                    <td>${formatRupiah(trx.bayar)}</td>
                    <td>${formatRupiah(trx.kembalian)}</td>
                    <td>
                        <button class="btn-sm" onclick="printStruk('${trx.kode_transaksi}', '${trx.tanggal}', '${trx.nama_capster || '-'}', ${trx.total_harga}, ${trx.bayar}, ${trx.kembalian})">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

// --- KASIR LOGIC ---
function renderLayanan(filterText = '') {
    const grid = document.getElementById('grid-layanan');
    grid.innerHTML = '';

    const filteredServices = services.filter(item =>
        item.nama_layanan.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredServices.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-layanan';
        div.onclick = () => tambahKeKeranjang(item);
        div.innerHTML = `
            <div class="kebab-menu" onclick="event.stopPropagation(); toggleDropdown(this)">
                <i class="fas fa-ellipsis-v"></i>
            </div>
            <div class="dropdown-menu">
                <button class="dropdown-item" onclick="event.stopPropagation(); openModalEditLayanan(${item.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="dropdown-item text-danger" onclick="event.stopPropagation(); hapusLayanan(${item.id})">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
            <h4>${item.nama_layanan}</h4>
            <div class="harga">${formatRupiah(item.harga)}</div>
        `;
        grid.appendChild(div);
    });

    if (filteredServices.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted);">Layanan tidak ditemukan</div>';
    }
}

function filterLayanan() {
    const text = document.getElementById('search-layanan').value;
    renderLayanan(text);
}

function tambahKeKeranjang(item) {
    // Check if already in cart
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
        existing.qty += 1;
        existing.subtotal = existing.qty * existing.harga;
    } else {
        cart.push({
            id: item.id,
            nama: item.nama_layanan,
            harga: Number(item.harga),
            qty: 1,
            subtotal: Number(item.harga)
        });
    }
    updateKeranjang();
}

function hapusItem(id) {
    cart = cart.filter(c => c.id !== id);
    updateKeranjang();
}

function updateKeranjang() {
    const list = document.getElementById('list-keranjang');
    list.innerHTML = '';

    subtotal = 0;

    if (cart.length === 0) {
        list.innerHTML = '<div class="empty-cart">Keranjang masih kosong</div>';
        document.getElementById('btn-proses').disabled = true;
    } else {
        document.getElementById('btn-proses').disabled = false;
        cart.forEach(item => {
            subtotal += item.subtotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-info">
                    <strong>${item.nama}</strong> (x${item.qty})
                    <small>${formatRupiah(item.subtotal)}</small>
                </div>
                <button class="btn-remove" onclick="hapusItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            list.appendChild(li);
        });
    }

    document.getElementById('subtotal-harga').innerText = formatRupiah(subtotal);
    hitungKembalian(); // Update kembalian every time cart updates
}

function hitungKembalian() {
    const diskonVal = Number(document.getElementById('input-diskon').value) || 0;
    const diskonAmount = subtotal * (diskonVal / 100);
    totalHarga = subtotal - diskonAmount;
    document.getElementById('total-harga').innerText = formatRupiah(totalHarga);

    const bayarRaw = document.getElementById('input-bayar').value.replace(/[^0-9]/g, '');
    const bayar = Number(bayarRaw) || 0;
    const kembalian = bayar - totalHarga;

    const kembalianEl = document.getElementById('kembalian');
    const btnProses = document.getElementById('btn-proses');

    if (kembalian < 0 || cart.length === 0) {
        kembalianEl.innerText = 'Rp 0';
        kembalianEl.style.color = 'var(--text-main)';
        if (cart.length > 0) btnProses.disabled = true;
    } else {
        kembalianEl.innerText = formatRupiah(kembalian);
        kembalianEl.style.color = 'var(--success)';
        btnProses.disabled = false;
    }
}

async function prosesTransaksi() {
    const bayarRaw = document.getElementById('input-bayar').value.replace(/[^0-9]/g, '');
    const bayar = Number(bayarRaw) || 0;
    const kembalian = bayar - totalHarga;
    const diskonVal = Number(document.getElementById('input-diskon').value) || 0;
    const diskonAmount = subtotal * (diskonVal / 100);

    if (bayar < totalHarga) {
        alert('Uang pembayaran kurang!');
        return;
    }

    const selectCapster = document.getElementById('select-capster');
    if (!selectCapster.value) {
        alert('Silakan pilih Capster terlebih dahulu!');
        selectCapster.focus();
        return;
    }

    const payload = {
        capster_id: selectCapster.value,
        total_harga: totalHarga,
        bayar: bayar,
        kembalian: kembalian,
        items: cart
    };

    try {
        const btn = document.getElementById('btn-proses');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        btn.disabled = true;

        const res = await fetch('api_transaksi.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.status === 'success') {
            showToast('Transaksi Berhasil!');

            // Ambil nama pelanggan
            const pelanggan = document.getElementById('input-pelanggan').value || 'Umum';
            const namaCapster = selectCapster.options[selectCapster.selectedIndex].text;

            // Print otomatis (opsional)
            printStrukTerbaru(json.kode_transaksi, new Date().toLocaleString(), namaCapster, pelanggan, subtotal, diskonAmount, totalHarga, bayar, kembalian, cart);

            // Reset Kasir
            cart = [];
            document.getElementById('input-diskon').value = '';
            updateKeranjang();
            document.getElementById('input-bayar').value = '';
            document.getElementById('input-pelanggan').value = '';
            hitungKembalian();

            // Refresh Dashboard background
            loadDashboard();
        } else {
            alert('Gagal: ' + json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Terjadi kesalahan jaringan');
    } finally {
        const btn = document.getElementById('btn-proses');
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Proses Pembayaran';
    }
}

// --- UTILS ---
function toggleDropdown(element) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== element.nextElementSibling) {
            menu.classList.remove('show');
        }
    });
    element.nextElementSibling.classList.toggle('show');
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('.kebab-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function printStruk(kode, tanggal, capster, total, bayar, kembali) {
    // Versi print dari history (tanpa detail item)
    document.getElementById('print-kode').innerText = kode;
    document.getElementById('print-tanggal').innerText = tanggal;
    document.getElementById('print-kasir').innerText = localStorage.getItem('barberpos_user') || 'Admin';
    if (document.getElementById('print-nama-capster')) document.getElementById('print-nama-capster').innerText = capster;
    document.getElementById('print-pelanggan-container').style.display = 'none';

    const tbody = document.getElementById('print-items-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="2" style="text-align:center; font-style:italic;">Detail transaksi disembunyikan</td>
        </tr>
    `;

    document.getElementById('print-subtotal').innerText = formatRupiah(total);
    document.getElementById('row-diskon').style.display = 'none';
    document.getElementById('print-total').innerText = formatRupiah(total);
    document.getElementById('print-bayar').innerText = formatRupiah(bayar);
    document.getElementById('print-kembali').innerText = formatRupiah(kembali);

    window.print();
}

function printStrukTerbaru(kode, tanggal, capster, pelanggan, stotal, diskon, total, bayar, kembali, items) {
    document.getElementById('print-kode').innerText = kode;
    document.getElementById('print-tanggal').innerText = tanggal;
    document.getElementById('print-kasir').innerText = localStorage.getItem('barberpos_user') || 'Admin';
    if (document.getElementById('print-nama-capster')) document.getElementById('print-nama-capster').innerText = capster;

    const pelContainer = document.getElementById('print-pelanggan-container');
    const pelEl = document.getElementById('print-pelanggan');
    if (pelanggan && pelanggan !== 'Umum') {
        pelEl.innerText = pelanggan;
        pelContainer.style.display = 'flex';
    } else {
        pelContainer.style.display = 'none';
    }

    const tbody = document.getElementById('print-items-table');
    tbody.innerHTML = '';
    items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td colspan="2" style="font-weight:bold;">${item.nama}</td>
            </tr>
            <tr>
                <td>${item.qty} x ${formatRupiah(item.harga)}</td>
                <td style="text-align:right;">${formatRupiah(item.subtotal)}</td>
            </tr>
        `;
    });

    document.getElementById('print-subtotal').innerText = formatRupiah(stotal);

    const rowDiskon = document.getElementById('row-diskon');
    if (diskon > 0) {
        rowDiskon.style.display = 'table-row';
        document.getElementById('print-diskon').innerText = '- ' + formatRupiah(diskon);
    } else {
        rowDiskon.style.display = 'none';
    }

    document.getElementById('print-total').innerText = formatRupiah(total);
    document.getElementById('print-bayar').innerText = formatRupiah(bayar);
    document.getElementById('print-kembali').innerText = formatRupiah(kembali);

    window.print();
}

// --- MODAL & TAMBAH/EDIT LAYANAN ---
function openModalLayanan() {
    document.getElementById('modal-layanan-title').innerText = 'Tambah Layanan Baru';
    document.getElementById('form-layanan').reset();
    document.getElementById('layanan-id').value = '';
    document.getElementById('modal-layanan').style.display = 'block';
}

function openModalEditLayanan(id) {
    const srv = services.find(s => s.id == id);
    if (srv) {
        document.getElementById('modal-layanan-title').innerText = 'Edit Layanan';
        document.getElementById('layanan-id').value = srv.id;
        document.getElementById('new-nama-layanan').value = srv.nama_layanan;
        document.getElementById('new-harga-layanan').value = srv.harga;
        document.getElementById('new-deskripsi-layanan').value = srv.deskripsi || '';
        document.getElementById('modal-layanan').style.display = 'block';
    }
}

function closeModalLayanan() {
    document.getElementById('modal-layanan').style.display = 'none';
}

async function simpanLayanan(e) {
    e.preventDefault();
    const id = document.getElementById('layanan-id').value;
    const nama = document.getElementById('new-nama-layanan').value;
    const harga = document.getElementById('new-harga-layanan').value;
    const deskripsi = document.getElementById('new-deskripsi-layanan').value;

    const payload = {
        action: id ? 'edit' : 'add',
        nama_layanan: nama,
        harga: harga,
        deskripsi: deskripsi
    };

    if (id) {
        payload.id = id;
    }

    try {
        const res = await fetch('api_layanan.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.status === 'success') {
            showToast(id ? 'Layanan berhasil diperbarui!' : 'Layanan berhasil ditambahkan!');
            closeModalLayanan();
            document.getElementById('form-layanan').reset();
            await loadLayanan(); // Reload data (akan otomatis renderLayanan)
        } else {
            alert('Gagal: ' + json.message);
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan jaringan');
    }
}

async function hapusLayanan(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;

    try {
        const res = await fetch('api_layanan.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        const json = await res.json();

        if (json.status === 'success') {
            showToast('Layanan berhasil dihapus!');
            // Hapus dari cart jika ada
            cart = cart.filter(c => c.id != id);
            updateKeranjang();

            await loadLayanan(); // Reload data
        } else {
            alert('Gagal menghapus: ' + json.message);
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan jaringan');
    }
}

// --- BATALKAN TRANSAKSI ---
function batalkanTransaksi() {
    if (cart.length === 0) return;
    if (confirm('Apakah Anda yakin ingin membatalkan transaksi dan mengosongkan keranjang?')) {
        cart = [];
        document.getElementById('input-diskon').value = '';
        document.getElementById('input-bayar').value = '';
        document.getElementById('input-pelanggan').value = '';
        updateKeranjang();
        showToast('Transaksi dibatalkan');
    }
}

// --- EXPORT CSV ---
function exportCSV() {
    const tbody = document.getElementById('tbody-riwayat');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('Tidak ada data untuk di-export!');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Kode TRX,Tanggal,Total,Bayar,Kembali\n"; // Header

    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 6) {
            const kode = cols[0].innerText;
            const tgl = cols[1].innerText;
            const capster = cols[2].innerText;
            const total = cols[3].innerText.replace(/[^0-9]/g, '');
            const bayar = cols[4].innerText.replace(/[^0-9]/g, '');
            const kembali = cols[5].innerText.replace(/[^0-9]/g, '');

            csvContent += `${kode},${tgl},${capster},${total},${bayar},${kembali}\n`;
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riwayat_transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

// === CAPSTER LOGIC ===

async function loadCapsterAktif() {
    try {
        const res = await fetch('api_capster.php?action=list&status=aktif');
        const json = await res.json();
        if (json.status === 'success') {
            const select = document.getElementById('select-capster');
            if (!select) return;
            select.innerHTML = '<option value="">-- Pilih Capster --</option>';
            json.data.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nama_capster}</option>`;
            });
            
            // Re-initialize Tom Select for dark theme consistency
            if (window.capsterSelectInstance) {
                window.capsterSelectInstance.destroy();
            }
            window.capsterSelectInstance = new TomSelect("#select-capster", {
                create: false,
                placeholder: "-- Pilih Capster --"
            });
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadPerformaCapster() {
    try {
        const res = await fetch('api_dashboard.php?action=performa_capster');
        const json = await res.json();
        if (json.status === 'success') {
            const topEl = document.getElementById('widget-top-capster');
            const perfEl = document.getElementById('widget-performa-capster');
            if (topEl) topEl.innerHTML = '';
            if (perfEl) perfEl.innerHTML = '';

            if (json.data.length === 0) {
                if (topEl) topEl.innerHTML = '<li style="color:var(--text-muted);">Belum ada data</li>';
                if (perfEl) perfEl.innerHTML = '<li style="color:var(--text-muted);">Belum ada data</li>';
                return;
            }

            // Top 3 Capster
            const top3 = json.data.slice(0, 3);
            top3.forEach((c, index) => {
                const colors = ['#d4af37', '#94a3b8', '#cd7f32'];
                if (topEl) {
                    topEl.innerHTML += `
                        <li style="padding:10px 0; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:15px;">
                            <div style="width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; justify-content:center; align-items:center; color:${colors[index] || 'white'}; font-weight:bold;">
                                ${index + 1}
                            </div>
                            <div>
                                <strong style="color:var(--text-main);">${c.nama_capster}</strong>
                                <div style="font-size:12px; color:var(--text-muted);">${c.pelanggan_hari_ini} pelanggan hari ini</div>
                            </div>
                        </li>
                    `;
                }
            });

            // Performa Capster
            json.data.forEach(c => {
                if (perfEl) {
                    perfEl.innerHTML += `
                        <li>
                            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <strong>${c.nama_capster}</strong>
                                <span style="font-size:12px; color:var(--text-muted);">${c.pelanggan_hari_ini} / ${c.target_harian} Pelanggan</span>
                            </div>
                            <div style="width:100%; background:var(--border); border-radius:10px; height:8px; overflow:hidden;">
                                <div style="width:${c.progress}%; background:var(--primary); height:100%;"></div>
                            </div>
                            <div style="text-align:right; font-size:10px; color:var(--text-muted); margin-top:2px;">${c.progress}%</div>
                        </li>
                    `;
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadCapster() {
    try {
        const res = await fetch('api_capster.php?action=list');
        const json = await res.json();
        if (json.status === 'success') {
            const tbody = document.getElementById('tbody-capster');
            if (!tbody) return;
            tbody.innerHTML = '';
            json.data.forEach(c => {
                const tr = document.createElement('tr');
                const statusColor = c.status === 'Aktif' ? 'var(--success)' : 'var(--danger)';
                tr.innerHTML = `
                    <td>${c.id}</td>
                    <td>${c.nama_capster}</td>
                    <td>${c.no_hp || '-'}</td>
                    <td>${c.target_harian}</td>
                    <td><span style="background:${statusColor}; color:white; padding:4px 8px; border-radius:4px; font-size:12px;">${c.status}</span></td>
                    <td>
                        <button class="btn-sm" style="background:var(--primary); color:#121212; border:none;" onclick='openModalEditCapster(${JSON.stringify(c)})'>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-sm" style="background:var(--warning); color:#121212; border:none;" onclick="toggleStatusCapster(${c.id})">
                            <i class="fas fa-sync"></i>
                        </button>
                        <button class="btn-sm" style="background:var(--danger); color:white; border:none;" onclick="hapusCapster(${c.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

function openModalCapster() {
    document.getElementById('modal-capster-title').innerText = 'Tambah Capster Baru';
    document.getElementById('form-capster').reset();
    document.getElementById('capster-id').value = '';
    if (document.getElementById('new-status-capster')) document.getElementById('new-status-capster').value = 'Aktif';
    document.getElementById('modal-capster').style.display = 'block';
}

function openModalEditCapster(c) {
    document.getElementById('modal-capster-title').innerText = 'Edit Capster';
    document.getElementById('capster-id').value = c.id;
    document.getElementById('new-nama-capster').value = c.nama_capster;
    document.getElementById('new-nohp-capster').value = c.no_hp;
    document.getElementById('new-alamat-capster').value = c.alamat;
    document.getElementById('new-target-capster').value = c.target_harian;
    if (document.getElementById('new-status-capster')) document.getElementById('new-status-capster').value = c.status || 'Aktif';
    document.getElementById('modal-capster').style.display = 'block';
}

function closeModalCapster() {
    document.getElementById('modal-capster').style.display = 'none';
}

async function simpanCapster(e) {
    e.preventDefault();
    const id = document.getElementById('capster-id').value;
    const nama = document.getElementById('new-nama-capster').value;
    const no_hp = document.getElementById('new-nohp-capster').value;
    const alamat = document.getElementById('new-alamat-capster').value;
    const target = document.getElementById('new-target-capster').value;
    const status = document.getElementById('new-status-capster') ? document.getElementById('new-status-capster').value : 'Aktif';

    if (!nama.trim()) {
        alert('Nama capster wajib diisi');
        return;
    }

    const payload = {
        action: id ? 'update' : 'add',
        nama_capster: nama,
        no_hp: no_hp,
        alamat: alamat,
        target_harian: parseInt(target),
        status: status
    };

    if (id) payload.id = id;

    try {
        const res = await fetch('api_capster.php?action=' + payload.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.status === 'success') {
            showToast(json.message);
            closeModalCapster();
            loadCapster();
            loadCapsterAktif();
        } else {
            alert('Gagal: ' + json.message);
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan jaringan');
    }
}

async function hapusCapster(id) {
    if (!confirm('Hapus capster ini? (Bisa gagal jika ada transaksi terkait)')) return;
    try {
        const res = await fetch('api_capster.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const json = await res.json();
        if (json.status === 'success') {
            showToast('Capster dihapus');
            loadCapster();
            loadCapsterAktif();
        } else {
            alert(json.message);
        }
    } catch (err) {
        console.error(err);
    }
}

async function toggleStatusCapster(id) {
    if (!confirm('Ubah status capster ini?')) return;
    try {
        const res = await fetch('api_capster.php?action=toggle_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const json = await res.json();
        if (json.status === 'success') {
            showToast(json.message);
            loadCapster();
            loadCapsterAktif();
        } else {
            alert(json.message);
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadLaporan() {
    const filter = document.getElementById('filter-laporan').value;
    const customDiv = document.getElementById('custom-date-laporan');

    if (filter === 'custom') {
        customDiv.style.display = 'flex';
    } else {
        customDiv.style.display = 'none';
    }

    let url = 'api_capster.php?action=report&filter=' + filter;

    if (filter === 'custom') {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (!startDate || !endDate) return; // tunggu komplit
        url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === 'success') {
            const tbody = document.getElementById('tbody-laporan');
            if (!tbody) return;
            tbody.innerHTML = '';
            json.data.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.nama_capster}</strong></td>
                    <td>${c.pelanggan_hari_ini}</td>
                    <td>${c.pelanggan_bulan_ini}</td>
                    <td>${c.total_pelanggan}</td>
                    <td style="color:#10b981">${formatRupiah(c.total_pendapatan)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error(e);
    }
}