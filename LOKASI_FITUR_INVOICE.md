# 📍 Lokasi Fitur Invoice & Payment History

## 🎯 Overview

Fitur Invoice dan Payment History dapat diakses dari **2 tempat berbeda** di admin dashboard untuk kemudahan akses.

---

## 1️⃣ Tab Bookings (Booking Management)

### Lokasi: `/admin?tab=bookings`

### Fitur yang Tersedia:

#### A. **Tombol Invoice di Tabel**
**Lokasi:** Kolom "Aksi" di setiap row booking

**Icon:** 🔗 ExternalLink (hijau)

**Fungsi:**
- Klik untuk membuka invoice di tab baru
- URL: `/invoice/{booking_id}`

**Cara Akses:**
```
1. Buka tab "Booking"
2. Lihat tabel booking
3. Kolom paling kanan "Aksi"
4. Klik icon ExternalLink (hijau)
5. Invoice terbuka di tab baru
```

#### B. **Tombol Invoice di Modal Edit**
**Lokasi:** Di dalam modal edit booking (bagian bawah)

**Label:** "Lihat / Cetak Invoice"

**Style:** Button biru dengan icon ExternalLink

**Fungsi:**
- Membuka invoice di tab baru
- Akses cepat saat sedang edit booking

**Cara Akses:**
```
1. Buka tab "Booking"
2. Klik tombol Edit (pensil) pada booking
3. Modal edit terbuka
4. Scroll ke bawah
5. Section "Aksi Tambahan"
6. Klik "Lihat / Cetak Invoice"
```

---

## 2️⃣ Tab Finance (Keuangan)

### Lokasi: `/admin?tab=finance`

### Fitur yang Tersedia:

#### A. **Tombol Payment History**
**Lokasi:** Kolom "Aksi" di setiap row

**Icon:** 🕐 History (ungu)

**Fungsi:**
- Membuka modal Payment History
- Catat pembayaran cicilan/DP
- Lihat timeline pembayaran

**Cara Akses:**
```
1. Buka tab "Finance" (Keuangan)
2. Lihat tabel keuangan
3. Kolom "Aksi" (paling kanan)
4. Klik icon History (ungu)
5. Modal Payment History terbuka
```

#### B. **Tombol Edit Pembayaran**
**Lokasi:** Kolom "Aksi" di setiap row

**Icon:** ✏️ Edit2 (biru)

**Fungsi:**
- Edit total biaya & jumlah terbayar
- Quick update tanpa Payment History

**Cara Akses:**
```
1. Buka tab "Finance"
2. Klik icon Edit (biru)
3. Modal edit pembayaran terbuka
4. Update total_price & paid_amount
5. Klik "Simpan"
```

#### C. **Tombol Invoice**
**Lokasi:** Kolom "Aksi" di setiap row

**Icon:** 📄 FileText (abu-abu → hitam saat hover)

**Label:** "Invoice" (muncul saat hover)

**Fungsi:**
- Membuka invoice di tab baru
- Download PDF
- Print invoice

**Cara Akses:**
```
1. Buka tab "Finance"
2. Lihat tabel keuangan
3. Kolom "Aksi" (paling kanan)
4. Klik tombol "Invoice" (abu-abu)
5. Invoice terbuka di tab baru
```

---

## 📊 Perbandingan Fitur

| Fitur | Bookings Tab | Finance Tab |
|-------|--------------|-------------|
| **View Invoice** | ✅ Yes | ✅ Yes |
| **Edit Booking** | ✅ Yes | ❌ No |
| **Payment History** | ❌ No | ✅ Yes |
| **Edit Payment** | ❌ No | ✅ Yes |
| **Filter Tanggal** | ❌ No | ✅ Yes |
| **Export CSV** | ❌ No | ✅ Yes |
| **Status Filter** | ✅ Yes (booking status) | ✅ Yes (payment status) |

---

## 🎯 Workflow Rekomendasi

### Scenario 1: Booking Baru Masuk
```
1. Tab Bookings → Lihat booking baru
2. Tab Bookings → Edit booking (update info)
3. Tab Finance → Catat DP (Payment History)
4. Tab Finance → Generate Invoice
5. Kirim invoice ke klien
```

### Scenario 2: Catat Cicilan
```
1. Tab Finance → Cari booking klien
2. Klik icon History (ungu)
3. Tambah pembayaran baru
4. Generate invoice updated (optional)
```

### Scenario 3: Laporan Bulanan
```
1. Tab Finance → Set filter periode (bulan ini)
2. Review semua transaksi
3. Export CSV
4. Kirim ke akuntan
```

### Scenario 4: Follow-up Piutang
```
1. Tab Finance → Filter "Belum Bayar"
2. Lihat list klien yang belum bayar
3. Generate invoice untuk masing-masing
4. Kirim reminder via WhatsApp
```

---

## 🔍 Visual Guide

### Finance Tab Layout:
```
┌─────────────────────────────────────────────────────────┐
│ Finance Tab (Keuangan)                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Summary Cards: Total Pendapatan, Piutang, Omzet]      │
│                                                          │
│ [Search Box] [Export CSV]                               │
│ [Status Filter: Semua | Lunas | DP | Belum Bayar]      │
│ [Periode Filter: Semua | Hari Ini | 7 Hari | Custom]   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Tabel Keuangan                                     │  │
│ ├────┬──────┬──────┬──────┬──────┬──────┬─────────┤  │
│ │ No │Klien │Total │Bayar │Sisa  │Status│  Aksi   │  │
│ ├────┼──────┼──────┼──────┼──────┼──────┼─────────┤  │
│ │INV │John  │5jt   │2jt   │3jt   │DP    │🕐✏️📄  │  │
│ │    │      │      │      │      │      │ ↑ ↑ ↑   │  │
│ │    │      │      │      │      │      │ │ │ └─Invoice│
│ │    │      │      │      │      │      │ │ └─Edit   │
│ │    │      │      │      │      │      │ └─History │
│ └────┴──────┴──────┴──────┴──────┴──────┴─────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Bookings Tab Layout:
```
┌─────────────────────────────────────────────────────────┐
│ Bookings Tab                                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Search Box] [Filter Status] [Tambah Booking]          │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Tabel Booking                                      │  │
│ ├──────┬──────┬──────┬──────┬──────┬─────────────┤  │
│ │Klien │Paket │Tgl   │Status│Bayar │    Aksi     │  │
│ ├──────┼──────┼──────┼──────┼──────┼─────────────┤  │
│ │John  │Gold  │15/05 │Conf  │DP    │✏️ 🗑️ 🔗   │  │
│ │      │      │      │      │      │ ↑  ↑  ↑     │  │
│ │      │      │      │      │      │ │  │  └─Invoice│
│ │      │      │      │      │      │ │  └─Delete  │
│ │      │      │      │      │      │ └─Edit      │
│ └──────┴──────┴──────┴──────┴──────┴─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Tips Penggunaan

### 1. **Gunakan Finance Tab untuk Keuangan**
✅ **DO:** Kelola semua transaksi keuangan di Finance Tab
- Catat pembayaran
- Generate invoice
- Export laporan
- Filter & analisis

❌ **DON'T:** Edit booking di Finance Tab (tidak ada fitur edit)

### 2. **Gunakan Bookings Tab untuk Data Booking**
✅ **DO:** Kelola data booking di Bookings Tab
- Edit info klien
- Update status booking
- Tambah/hapus booking
- Lihat detail lengkap

❌ **DON'T:** Catat pembayaran di Bookings Tab (tidak ada Payment History)

### 3. **Invoice Bisa Diakses dari Mana Saja**
✅ Bookings Tab → Quick access saat edit booking
✅ Finance Tab → Setelah catat pembayaran
✅ Direct URL → `/invoice/{booking_id}`

### 4. **Payment History Hanya di Finance Tab**
⚠️ Fitur Payment History **hanya tersedia** di Finance Tab
- Tidak ada di Bookings Tab
- Tidak ada di Overview Tab
- Hanya di Finance Tab (icon History ungu)

---

## 🔗 URL Structure

### Invoice URL:
```
Format: /invoice/{booking_id}
Example: /invoice/abc123-def456-ghi789

Akses:
- Dari Bookings Tab
- Dari Finance Tab
- Direct link (bisa dishare ke klien)
```

### Admin Tabs:
```
Overview:  /admin?tab=overview
Timeline:  /admin?tab=timeline
Bookings:  /admin?tab=bookings
Finance:   /admin?tab=finance
Projects:  /admin?tab=projects
Packages:  /admin?tab=packages
Messages:  /admin?tab=messages
Settings:  /admin?tab=settings
```

---

## ✅ Checklist Fitur

### Di Bookings Tab:
- [x] Tombol Invoice di tabel
- [x] Tombol Invoice di modal edit
- [x] Edit booking
- [x] Delete booking
- [x] Filter status booking
- [ ] Payment History (tidak ada)
- [ ] Export CSV (tidak ada)

### Di Finance Tab:
- [x] Tombol Invoice di tabel
- [x] Payment History (icon History)
- [x] Edit pembayaran (icon Edit)
- [x] Filter tanggal
- [x] Filter status pembayaran
- [x] Export CSV
- [x] Summary cards
- [ ] Edit booking (tidak ada)
- [ ] Delete booking (tidak ada)

---

## 🎯 Kesimpulan

**Invoice dapat diakses dari 2 tempat:**
1. ✅ **Bookings Tab** - Untuk akses cepat saat manage booking
2. ✅ **Finance Tab** - Untuk akses setelah catat pembayaran

**Payment History hanya di:**
1. ✅ **Finance Tab** - Icon History (ungu)

**Rekomendasi:**
- Gunakan **Bookings Tab** untuk manage data booking
- Gunakan **Finance Tab** untuk manage keuangan & pembayaran
- Generate invoice dari tab mana saja sesuai kebutuhan

---

**Semua fitur sudah terintegrasi dan konsisten!** ✅

---

**Last Updated:** 2026-05-15
**Version:** 2.0.1
