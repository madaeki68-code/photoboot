# 📚 Panduan Fitur Baru - Admin Dashboard

## 🎯 Ringkasan Fitur

Sistem admin Anda sekarang dilengkapi dengan **5 fitur baru** untuk mengelola keuangan dan pembayaran dengan lebih profesional:

1. ✅ **Invoice Generator** - Generate & download invoice PDF
2. ✅ **Filter Tanggal** - Filter laporan berdasarkan periode
3. ✅ **Export CSV** - Export laporan keuangan ke Excel
4. ✅ **Payment History** - Catat pembayaran cicilan/DP
5. ✅ **Dashboard Charts** - Visualisasi data dengan grafik

---

## 📊 1. Dashboard Overview - Charts Baru

### Lokasi: `/admin?tab=overview`

**Fitur Baru:**

#### **Grafik Trend Pendapatan (6 Bulan)**
- Menampilkan perbandingan Total Omzet vs Pendapatan
- Bar biru = Total tagihan dari semua booking
- Bar hijau = Uang yang sudah masuk
- Indikator pertumbuhan (%) bulan ini vs bulan lalu
- Hover pada bar untuk lihat nilai detail

#### **Pie Chart Status Booking**
- Distribusi status: Terkonfirmasi, Pending, Dibatalkan
- Persentase dan jumlah per kategori
- Warna: Hijau (confirmed), Orange (pending), Merah (cancelled)

**Manfaat:**
- Lihat trend bisnis dalam 6 bulan terakhir
- Identifikasi bulan dengan performa terbaik
- Monitor status booking secara visual

---

## 💰 2. Finance Tab - Filter & Export

### Lokasi: `/admin?tab=finance`

### **A. Filter Berdasarkan Periode**

**Cara Pakai:**
1. Klik tab "Finance" (Keuangan)
2. Lihat bagian "Periode" dengan icon kalender
3. Pilih salah satu:
   - **Semua** - Tampilkan semua data
   - **Hari Ini** - Booking yang dibuat hari ini
   - **7 Hari** - 7 hari terakhir
   - **30 Hari** - 30 hari terakhir (1 bulan)
   - **Custom** - Pilih tanggal sendiri

**Filter Custom:**
- Klik tombol "Custom"
- Muncul 2 input tanggal: "Dari" dan "Sampai"
- Pilih tanggal mulai dan tanggal akhir
- Data otomatis terfilter

**Contoh Use Case:**
- Lihat pendapatan bulan Januari: Custom → 01/01/2026 s/d 31/01/2026
- Lihat booking minggu ini: 7 Hari
- Lihat booking hari ini: Hari Ini

---

### **B. Export Laporan ke CSV**

**Cara Pakai:**
1. Set filter periode yang diinginkan (opsional)
2. Klik tombol **"Export CSV"** (hijau, icon spreadsheet)
3. File CSV otomatis terdownload
4. Buka file dengan Excel atau Google Sheets

**Isi File CSV:**
- No Invoice (INV-XXXXXXXX)
- Tanggal Booking
- Nama Klien
- WhatsApp
- Paket yang Dipilih
- Total Biaya
- Sudah Dibayar
- Sisa Tagihan
- Status Pembayaran

**Nama File:** `Laporan-Keuangan-2026-05-15.csv`

**Manfaat:**
- Backup data keuangan
- Analisis di Excel (pivot table, chart, dll)
- Laporan untuk akuntan/pajak
- Share dengan tim

---

## 💳 3. Payment History - Catat Cicilan

### Lokasi: Finance Tab → Icon History (ungu)

**Fitur:**
Catat pembayaran bertahap (DP, cicilan 1, cicilan 2, pelunasan)

### **Cara Menggunakan:**

#### **Membuka Payment History:**
1. Buka tab Finance
2. Cari booking yang ingin dicatat pembayarannya
3. Klik icon **History** (ungu) di kolom Aksi
4. Modal Payment History terbuka

#### **Menambah Pembayaran Baru:**
1. Klik tombol **"Tambah Pembayaran Baru"** (biru)
2. Isi form:
   - **Jumlah:** Ketik angka, format Rupiah otomatis (contoh: 500000 → Rp 500.000)
   - **Metode:** Pilih Transfer Bank / Tunai / QRIS / Lainnya
   - **Tanggal:** Pilih tanggal pembayaran diterima
   - **Verified:** Centang jika sudah diverifikasi
3. Klik **"Simpan"**
4. Pembayaran tercatat di timeline

#### **Melihat Riwayat:**
- Semua pembayaran ditampilkan dalam timeline
- Urutkan dari terbaru ke terlama
- Tampilkan: Jumlah, Tanggal, Metode, Status Verifikasi

#### **Menghapus Pembayaran:**
1. Hover pada item pembayaran
2. Klik icon **Trash** (merah) yang muncul
3. Konfirmasi hapus
4. Total terbayar otomatis dikurangi

**Contoh Skenario:**

**Booking Rp 5.000.000 dengan cicilan:**
1. DP 30% = Rp 1.500.000 (tanggal 1 Mei)
2. Cicilan 1 = Rp 2.000.000 (tanggal 15 Mei)
3. Pelunasan = Rp 1.500.000 (tanggal 30 Mei)

**Cara Catat:**
- Buka Payment History
- Tambah pembayaran #1: Rp 1.500.000, Transfer, 01/05/2026
- Tambah pembayaran #2: Rp 2.000.000, Transfer, 15/05/2026
- Tambah pembayaran #3: Rp 1.500.000, Tunai, 30/05/2026
- Status otomatis berubah: Tagihan → DP/Cicil → Lunas

---

## 🧾 4. Invoice Generator

### Lokasi: Finance Tab → Tombol Invoice

**Fitur:**
Generate invoice profesional dalam format PDF

### **Cara Generate Invoice:**

1. **Buka Finance Tab**
2. **Cari booking** yang ingin dibuatkan invoice
3. **Klik tombol Invoice** (icon FileText, abu-abu)
4. **Invoice terbuka** di tab baru

### **Isi Invoice:**

**Header:**
- Logo perusahaan (dari Settings)
- Nomor invoice: INV-XXXXXXXX
- Tanggal invoice

**Info Perusahaan (Dari):**
- Nama perusahaan
- Alamat lengkap
- Telepon & Email

**Info Klien (Kepada):**
- Nama klien
- WhatsApp
- Lokasi event
- Kategori event
- Tanggal event

**Detail Paket:**
- Nama paket & harga
- Addons (jika ada)
- Kode promo (jika ada)

**Ringkasan Pembayaran:**
- Subtotal
- Sudah Dibayar (hijau)
- Sisa Tagihan (merah) atau "LUNAS" (hijau)

**Status Badge:**
- 🟢 Pembayaran Lunas
- 🟠 Pembayaran Sebagian (DP)
- ⏰ Menunggu Pembayaran

### **Download PDF:**
1. Klik tombol **"Download PDF"** (hitam, pojok kanan atas)
2. Tunggu beberapa detik (generating PDF)
3. File PDF otomatis terdownload
4. Nama file: `Invoice-NamaKlien-timestamp.pdf`

### **Print Invoice:**
1. Klik tombol **"Print"** (abu-abu)
2. Dialog print browser terbuka
3. Pilih printer atau "Save as PDF"
4. Print/Save

**Tips:**
- Invoice otomatis print-friendly (tanpa tombol & sidebar)
- Gunakan Chrome/Edge untuk hasil PDF terbaik
- Share PDF ke klien via WhatsApp/Email

---

## ⚙️ 5. Company Settings

### Lokasi: `/admin?tab=settings`

**Fitur Baru:**
Section "Informasi Perusahaan" di bagian paling atas Settings

### **Cara Setup:**

1. **Buka tab Settings** (Pengaturan)
2. **Scroll ke section pertama:** "Informasi Perusahaan"
3. **Isi form:**
   - **Nama Perusahaan:** Nama resmi bisnis (contoh: PT Kalo Photobooth Indonesia)
   - **Email Perusahaan:** Email untuk invoice (contoh: invoice@kalophotobooth.com)
   - **Nomor Telepon:** Nomor kontak (contoh: +62 812-3456-7890)
   - **Alamat Lengkap:** Alamat kantor/operasional lengkap
   - **Logo Perusahaan:** Upload logo (PNG transparan recommended)

4. **Scroll ke bawah**
5. **Klik "Simpan Semua Perubahan"**

**Manfaat:**
- Data ini otomatis muncul di semua invoice
- Tampilan profesional untuk klien
- Tidak perlu edit manual setiap invoice

**Catatan:**
- Logo akan muncul di pojok kanan atas invoice
- Gunakan logo dengan resolusi tinggi (min 300x300px)
- Format PNG dengan background transparan untuk hasil terbaik

---

## 🎬 Workflow Lengkap

### **Skenario: Booking Baru Masuk**

1. **Klien booking via form** → Data masuk ke tab Bookings
2. **Konfirmasi booking** → Update status ke "Confirmed"
3. **Catat DP pertama:**
   - Buka Finance Tab
   - Klik icon History pada booking
   - Tambah pembayaran: DP Rp 1.000.000
4. **Generate invoice:**
   - Klik tombol Invoice
   - Download PDF
   - Kirim ke klien via WhatsApp
5. **Catat cicilan berikutnya:**
   - Buka Payment History lagi
   - Tambah pembayaran cicilan 2, 3, dst
6. **Pelunasan:**
   - Tambah pembayaran terakhir
   - Status otomatis "Lunas"
7. **Export laporan bulanan:**
   - Set filter: Custom → 01/05 s/d 31/05
   - Klik Export CSV
   - Kirim ke akuntan

---

## 📱 Tips & Tricks

### **Shortcut Keyboard:**
- `Ctrl + P` di halaman invoice = Print langsung
- `Esc` = Tutup modal Payment History

### **Best Practices:**

1. **Catat pembayaran segera setelah diterima**
   - Jangan tunggu akhir bulan
   - Lebih akurat dan mudah tracking

2. **Verifikasi pembayaran**
   - Centang "Verified" setelah cek rekening
   - Unverified = masih pending konfirmasi

3. **Backup data rutin**
   - Export CSV setiap akhir bulan
   - Simpan di Google Drive/Dropbox

4. **Setup company info dulu**
   - Sebelum generate invoice pertama
   - Isi lengkap untuk tampilan profesional

5. **Gunakan filter tanggal**
   - Untuk laporan periodik
   - Lebih cepat dari scroll manual

### **Troubleshooting:**

**Q: PDF tidak terdownload?**
- Cek popup blocker browser
- Coba browser lain (Chrome recommended)
- Refresh page dan coba lagi

**Q: Data tidak muncul di chart?**
- Pastikan ada booking dalam 6 bulan terakhir
- Refresh page (F5)

**Q: Export CSV kosong?**
- Cek filter tanggal, mungkin terlalu sempit
- Pilih "Semua" untuk export semua data

**Q: Logo tidak muncul di invoice?**
- Pastikan sudah upload di Settings → Company Logo
- Gunakan URL image yang valid
- Coba format PNG atau JPG

---

## 🎓 Video Tutorial (Coming Soon)

- [ ] Cara menggunakan Payment History
- [ ] Cara generate & download invoice
- [ ] Cara export laporan keuangan
- [ ] Setup company settings

---

## 💡 Ide Pengembangan Selanjutnya

Fitur yang bisa ditambahkan di masa depan:

1. **Auto-reminder piutang** via WhatsApp
2. **Email invoice** langsung dari sistem
3. **Payment gateway** (Midtrans/Xendit)
4. **Multi-currency** (USD, SGD)
5. **Recurring invoice** untuk paket langganan
6. **Client portal** - klien bisa login & lihat invoice
7. **Accounting integration** (Jurnal.id, Accurate)
8. **Tax calculation** (PPN otomatis)

---

## 📞 Butuh Bantuan?

Jika ada pertanyaan atau menemukan bug:

1. **Check console browser** (F12 → Console tab)
2. **Screenshot error** yang muncul
3. **Catat langkah-langkah** yang menyebabkan error
4. **Hubungi developer** dengan info di atas

---

**Selamat menggunakan fitur baru! 🎉**

Semoga membantu mengelola bisnis photobooth Anda dengan lebih efisien dan profesional.

---

*Last updated: 15 Mei 2026*
*Version: 2.0.0*
