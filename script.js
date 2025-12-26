// JNT Shipment Calculator - Main JavaScript

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadHistory();
    updateStatistics();
});

// Tab switching
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-red-500', 'text-red-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');

    // Add active class to clicked button
    event.target.classList.remove('border-transparent', 'text-gray-500');
    event.target.classList.add('border-red-500', 'text-red-600');
}

// Settings Management
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('jntSettings') || '{}');
    if (settings.namaKurir) document.getElementById('namaKurir').value = settings.namaKurir;
    if (settings.targetHarian) document.getElementById('targetHarian').value = settings.targetHarian;
    if (settings.hargaBiasaCustom) document.getElementById('hargaBiasaCustom').value = settings.hargaBiasaCustom;
    if (settings.hargaPaycoolCustom) document.getElementById('hargaPaycoolCustom').value = settings.hargaPaycoolCustom;
}

function saveSettings() {
    const settings = {
        namaKurir: document.getElementById('namaKurir').value,
        targetHarian: document.getElementById('targetHarian').value,
        hargaBiasaCustom: document.getElementById('hargaBiasaCustom').value,
        hargaPaycoolCustom: document.getElementById('hargaPaycoolCustom').value
    };

    localStorage.setItem('jntSettings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan!');
    updateStatistics();
}

function getHargaPaket() {
    const settings = JSON.parse(localStorage.getItem('jntSettings') || '{}');
    return {
        biasa: settings.hargaBiasaCustom ? parseInt(settings.hargaBiasaCustom) : 1250,
        paycool: settings.hargaPaycoolCustom ? parseInt(settings.hargaPaycoolCustom) : 1450
    };
}

// Hitung Paket Function
function hitungPaket() {
    const paketBiasa = parseInt(document.getElementById('paketBiasa').value) || 0;
    const paketPaycool = parseInt(document.getElementById('paketPaycool').value) || 0;

    const harga = getHargaPaket();

    const totalBiasa = paketBiasa * harga.biasa;
    const totalPaycool = paketPaycool * harga.paycool;
    const grandTotal = totalBiasa + totalPaycool;

    const hasilDiv = document.getElementById('hasilHitung');
    const detailDiv = document.getElementById('detailHasil');

    detailDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-800">Paket Biasa:</p>
                <p>${paketBiasa} × Rp ${harga.biasa.toLocaleString()} = Rp ${totalBiasa.toLocaleString()}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <p class="font-semibold text-green-800">Paket Paycool:</p>
                <p>${paketPaycool} × Rp ${harga.paycool.toLocaleString()} = Rp ${totalPaycool.toLocaleString()}</p>
            </div>
        </div>
        <div class="mt-4 bg-red-50 p-4 rounded-lg">
            <p class="font-bold text-red-800 text-xl">Total Keseluruhan: Rp ${grandTotal.toLocaleString()}</p>
        </div>
    `;

    hasilDiv.classList.remove('hidden');

    // Save to history
    saveToHistory('Hitung Paket', {
        paketBiasa: paketBiasa,
        paketPaycool: paketPaycool,
        total: grandTotal,
        timestamp: new Date().toLocaleString('id-ID')
    });

    updateStatistics();
}

// Hitung Mondev Function
function hitungMondev() {
    const totalPaket = parseInt(document.getElementById('totalPaket').value) || 0;
    const sisaPaket = parseInt(document.getElementById('sisaPaket').value) || 0;
    const waktuPengiriman = document.getElementById('waktuPengiriman').value;

    if (totalPaket === 0) {
        alert('Total paket tidak boleh 0!');
        return;
    }

    const paketTerkirim = totalPaket - sisaPaket;
    const persentase = (paketTerkirim / totalPaket * 100).toFixed(2);

    const targetMinimal = waktuPengiriman === 'sebelum-12' ? 90 : 95;
    const status = persentase >= targetMinimal ?
        '<span class="text-green-600 font-bold">✓ TERCAPAI</span>' :
        '<span class="text-red-600 font-bold">✗ BELUM TERCAPAI</span>';

    const hasilDiv = document.getElementById('hasilMondev');
    const detailDiv = document.getElementById('detailMondev');

    detailDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-800">Total Paket:</p>
                <p class="text-2xl font-bold">${totalPaket}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <p class="font-semibold text-green-800">Paket Terkirim:</p>
                <p class="text-2xl font-bold">${paketTerkirim}</p>
            </div>
        </div>
        <div class="mt-4 bg-yellow-50 p-4 rounded-lg">
            <p class="font-semibold text-yellow-800">Persentase Keberhasilan:</p>
            <p class="text-3xl font-bold text-yellow-600">${persentase}%</p>
            <p class="text-sm">Target minimal: ${targetMinimal}%</p>
            <p class="text-lg mt-2">Status: ${status}</p>
        </div>
    `;

    hasilDiv.classList.remove('hidden');

    // Save to history
    saveToHistory('Mondev', {
        totalPaket: totalPaket,
        sisaPaket: sisaPaket,
        persentase: persentase,
        waktu: waktuPengiriman,
        timestamp: new Date().toLocaleString('id-ID')
    });

    updateStatistics();
}

// Print Function
function printStruck(type) {
    const settings = JSON.parse(localStorage.getItem('jntSettings') || '{}');
    const namaKurir = settings.namaKurir || 'Kurir JNT';
    const date = new Date().toLocaleString('id-ID');

    let content = '';
    if (type === 'paket') {
        const paketBiasa = parseInt(document.getElementById('paketBiasa').value) || 0;
        const paketPaycool = parseInt(document.getElementById('paketPaycool').value) || 0;
        const harga = getHargaPaket();
        const totalBiasa = paketBiasa * harga.biasa;
        const totalPaycool = paketPaycool * harga.paycool;
        const grandTotal = totalBiasa + totalPaycool;

        content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2><i class="fas fa-shipping-fast"></i> JNT SHIPMENT</h2>
                <p>Tanggal: ${date}</p>
                <p>Kurir: ${namaKurir}</p>
            </div>
            <table style="width: 100%; margin-bottom: 20px;">
                <tr><td>Paket Biasa:</td><td>${paketBiasa} × Rp ${harga.biasa.toLocaleString()}</td></tr>
                <tr><td>Paket Paycool:</td><td>${paketPaycool} × Rp ${harga.paycool.toLocaleString()}</td></tr>
                <tr style="border-top: 2px solid black;"><td><strong>Total:</strong></td><td><strong>Rp ${grandTotal.toLocaleString()}</strong></td></tr>
            </table>
            <p style="text-align: center; font-size: 12px;">Terima kasih atas kepercayaan Anda</p>
        `;
    } else if (type === 'mondev') {
        const totalPaket = parseInt(document.getElementById('totalPaket').value) || 0;
        const sisaPaket = parseInt(document.getElementById('sisaPaket').value) || 0;
        const paketTerkirim = totalPaket - sisaPaket;
        const persentase = (paketTerkirim / totalPaket * 100).toFixed(2);

        content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2><i class="fas fa-chart-line"></i> MONDEV REPORT</h2>
                <p>Tanggal: ${date}</p>
                <p>Kurir: ${namaKurir}</p>
            </div>
            <table style="width: 100%; margin-bottom: 20px;">
                <tr><td>Total Paket:</td><td>${totalPaket}</td></tr>
                <tr><td>Paket Terkirim:</td><td>${paketTerkirim}</td></tr>
                <tr><td>Sisa Paket:</td><td>${sisaPaket}</td></tr>
                <tr style="border-top: 2px solid black;"><td><strong>Persentase:</strong></td><td><strong>${persentase}%</strong></td></tr>
            </table>
        `;
    }

    const printWindow = window.open('', '', 'height=600,width=400');
    printWindow.document.write(`
        <html>
        <head>
            <title>Struck JNT</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { border-collapse: collapse; }
                td { padding: 5px; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Export Functions
function exportToCSV() {
    const history = JSON.parse(localStorage.getItem('jntHistory') || '[]');
    if (history.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    let csv = 'Tanggal,Jenis,Detail,Total\n';
    history.forEach(item => {
        const date = new Date(item.date).toLocaleString('id-ID');
        if (item.type === 'Hitung Paket') {
            csv += `"${date}","Hitung Paket","Paket Biasa: ${item.data.paketBiasa}, Paycool: ${item.data.paketPaycool}","Rp ${item.data.total.toLocaleString()}"\n`;
        } else if (item.type === 'Mondev') {
            csv += `"${date}","Mondev","Total: ${item.data.totalPaket}, Sisa: ${item.data.sisaPaket}, ${item.data.waktu}","${item.data.persentase}%"\n`;
        }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jnt-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function exportToPDF() {
    alert('Fitur PDF akan segera tersedia! Untuk saat ini, silakan gunakan export CSV.');
}

// Save to History
function saveToHistory(type, data) {
    let history = JSON.parse(localStorage.getItem('jntHistory') || '[]');
    history.unshift({
        type: type,
        data: data,
        date: new Date().toISOString()
    });

    // Keep only last 50 entries
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('jntHistory', JSON.stringify(history));
    loadHistory();
}

// Load History
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('jntHistory') || '[]');
    const historyDiv = document.getElementById('historyList');

    if (history.length === 0) {
        historyDiv.innerHTML = '<p class="text-gray-500 text-center">Belum ada riwayat perhitungan</p>';
        return;
    }

    historyDiv.innerHTML = history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('id-ID');
        const timeStr = date.toLocaleTimeString('id-ID');

        if (item.type === 'Hitung Paket') {
            return `
                <div class="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 rounded hover:bg-gray-100 transition duration-300">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-800">Hitung Paket</p>
                            <p class="text-sm text-gray-600">
                                Biasa: ${item.data.paketBiasa}, Paycool: ${item.data.paketPaycool}
                            </p>
                            <p class="text-lg font-bold text-red-600">Total: Rp ${item.data.total.toLocaleString()}</p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <p>${dateStr}</p>
                            <p>${timeStr}</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (item.type === 'Mondev') {
            return `
                <div class="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded hover:bg-gray-100 transition duration-300">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-800">Mondev - ${item.data.waktu === 'sebelum-12' ? 'Sebelum Jam 12' : 'Setelah Jam 12'}</p>
                            <p class="text-sm text-gray-600">
                                Total: ${item.data.totalPaket}, Sisa: ${item.data.sisaPaket}
                            </p>
                            <p class="text-lg font-bold text-blue-600">${item.data.persentase}% Tercapai</p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <p>${dateStr}</p>
                            <p>${timeStr}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Clear History
function clearHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
        localStorage.removeItem('jntHistory');
        loadHistory();
        updateStatistics();
    }
}

// Update Statistics
function updateStatistics() {
    const history = JSON.parse(localStorage.getItem('jntHistory') || '[]');
    const settings = JSON.parse(localStorage.getItem('jntSettings') || '{}');
    const today = new Date().toDateString();

    const todayHistory = history.filter(item =>
        new Date(item.date).toDateString() === today
    );

    const paketCalculations = todayHistory.filter(item => item.type === 'Hitung Paket');
    const mondevCalculations = todayHistory.filter(item => item.type === 'Mondev');

    const totalPaketHariIni = paketCalculations.reduce((sum, item) =>
        sum + item.data.paketBiasa + item.data.paketPaycool, 0
    );

    const totalRevenueHariIni = paketCalculations.reduce((sum, item) =>
        sum + item.data.total, 0
    );

    const avgMondev = mondevCalculations.length > 0 ?
        (mondevCalculations.reduce((sum, item) => sum + parseFloat(item.data.persentase), 0) / mondevCalculations.length).toFixed(2) : 0;

    document.getElementById('statistics').innerHTML = `
        <div class="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-300">
            <i class="fas fa-box text-3xl text-blue-500 mb-2"></i>
            <p class="text-2xl font-bold text-blue-600">${totalPaketHariIni}</p>
            <p class="text-sm text-gray-600">Total Paket Hari Ini</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300">
            <i class="fas fa-money-bill-wave text-3xl text-green-500 mb-2"></i>
            <p class="text-2xl font-bold text-green-600">Rp ${totalRevenueHariIni.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Total Revenue Hari Ini</p>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition duration-300">
            <i class="fas fa-chart-line text-3xl text-yellow-500 mb-2"></i>
            <p class="text-2xl font-bold text-yellow-600">${avgMondev}%</p>
            <p class="text-sm text-gray-600">Rata-rata Mondev</p>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-300">
            <i class="fas fa-history text-3xl text-purple-500 mb-2"></i>
            <p class="text-2xl font-bold text-purple-600">${todayHistory.length}</p>
            <p class="text-sm text-gray-600">Total Transaksi Hari Ini</p>
        </div>
    `;

    // Update target progress
    if (settings.targetHarian) {
        const target = parseInt(settings.targetHarian);
        const progress = Math.min((totalPaketHariIni / target) * 100, 100);
        document.getElementById('targetProgress').style.display = 'block';
        document.getElementById('progressText').textContent = `${totalPaketHariIni}/${target} paket`;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }
}
