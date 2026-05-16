# ✅ Testing Checklist - Fitur Baru v2.0

## 🎯 Overview

Checklist ini untuk memastikan semua fitur baru berfungsi dengan baik sebelum digunakan di production.

---

## 1️⃣ Company Settings

### Setup
- [ ] Buka `/admin?tab=settings`
- [ ] Scroll ke section "Informasi Perusahaan"
- [ ] Isi semua field:
  - [ ] Nama Perusahaan
  - [ ] Email Perusahaan
  - [ ] Nomor Telepon
  - [ ] Alamat Lengkap
- [ ] Upload logo perusahaan (PNG)
- [ ] Klik "Simpan Semua Perubahan"
- [ ] Refresh page
- [ ] Verify data tersimpan

### Expected Result
✅ Data tersimpan di database
✅ Logo muncul di preview
✅ Tidak ada error message

---

## 2️⃣ Invoice Generator

### Test Case 1: Generate Invoice dengan Data Lengkap
- [ ] Buka `/admin?tab=finance`
- [ ] Pilih booking dengan data lengkap (ada paket, addons, promo)
- [ ] Klik tombol "Invoice"
- [ ] Verify invoice terbuka di tab baru
- [ ] Check semua data muncul:
  - [ ] Logo perusahaan (pojok kanan atas)
  - [ ] Nomor invoice (INV-XXXXXXXX)
  - [ ] Tanggal invoice
  - [ ] Info perusahaan (nama, alamat, kontak)
  - [ ] Info klien (nama, whatsapp, lokasi, event)
  - [ ] Detail paket & harga
  - [ ] Addons (jika ada)
  - [ ] Kode promo (jika ada)
  - [ ] Ringkasan pembayaran (Total, Terbayar, Sisa)
  - [ ] Status badge (Lunas/DP/Menunggu)

### Test Case 2: Download PDF
- [ ] Di halaman invoice, klik "Download PDF"
- [ ] Tunggu proses generating (beberapa detik)
- [ ] Verify PDF terdownload
- [ ] Buka PDF, check:
  - [ ] Semua data muncul
  - [ ] Layout rapi
  - [ ] Tidak ada element terpotong
  - [ ] Font readable

### Test Case 3: Print Invoice
- [ ] Di halaman invoice, klik "Print"
- [ ] Verify print dialog terbuka
- [ ] Check print preview:
  - [ ] Tombol action tidak muncul
  - [ ] Layout print-friendly
  - [ ] Semua data visible
- [ ] Cancel print (atau print jika mau test)

### Test Case 4: Invoice dengan Data Minimal
- [ ] Generate invoice untuk booking tanpa addons/promo
- [ ] Verify tetap berfungsi normal
- [ ] Check tidak ada error

### Test Case 5: Mobile Responsive
- [ ] Buka invoice di mobile browser
- [ ] Verify layout responsive
- [ ] Test download PDF di mobile
- [ ] Test share PDF via WhatsApp

### Expected Result
✅ Invoice generate tanpa error
✅ PDF download berhasil
✅ Print preview correct
✅ Mobile responsive
✅ Semua data akurat

---

## 3️⃣ Payment History

### Test Case 1: Buka Payment History
- [ ] Buka `/admin?tab=finance`
- [ ] Klik icon History (ungu) pada booking
- [ ] Verify modal terbuka
- [ ] Check summary cards:
  - [ ] Total Tagihan (correct)
  - [ ] Terbayar (correct)
  - [ ] Sisa (correct)

### Test Case 2: Tambah Pembayaran Pertama
- [ ] Klik "Tambah Pembayaran Baru"
- [ ] Isi form:
  - [ ] Jumlah: 1000000 (auto format ke Rp 1.000.000)
  - [ ] Metode: Transfer Bank
  - [ ] Tanggal: Hari ini
  - [ ] Verified: Checked
- [ ] Klik "Simpan"
- [ ] Verify:
  - [ ] Pembayaran muncul di timeline
  - [ ] Summary cards updated
  - [ ] Modal tetap terbuka

### Test Case 3: Tambah Pembayaran Kedua
- [ ] Tambah pembayaran lagi (cicilan 2)
- [ ] Verify:
  - [ ] Muncul di timeline (urutan terbaru di atas)
  - [ ] Total terbayar bertambah
  - [ ] Sisa tagihan berkurang

### Test Case 4: Pelunasan
- [ ] Tambah pembayaran sampai lunas
- [ ] Verify:
  - [ ] Sisa tagihan = "LUNAS" (hijau)
  - [ ] Status di Finance Tab berubah ke "Lunas"

### Test Case 5: Delete Payment
- [ ] Hover pada item pembayaran
- [ ] Klik icon Trash (merah)
- [ ] Confirm delete
- [ ] Verify:
  - [ ] Payment hilang dari timeline
  - [ ] Total terbayar berkurang
  - [ ] Sisa tagihan bertambah
  - [ ] Status di Finance Tab updated

### Test Case 6: Payment Methods
- [ ] Test semua metode pembayaran:
  - [ ] Transfer Bank
  - [ ] Tunai
  - [ ] QRIS
  - [ ] Lainnya
- [ ] Verify semua tersimpan dengan benar

### Test Case 7: Unverified Payment
- [ ] Tambah pembayaran dengan Verified = unchecked
- [ ] Verify:
  - [ ] Icon Clock (orange) muncul
  - [ ] Tetap terhitung di total

### Test Case 8: Custom Date
- [ ] Tambah pembayaran dengan tanggal custom (kemarin)
- [ ] Verify tanggal tersimpan correct

### Expected Result
✅ Modal berfungsi normal
✅ Pembayaran tersimpan ke database
✅ Kalkulasi akurat
✅ Delete berfungsi
✅ Timeline urut correct

---

## 4️⃣ Finance Tab - Filter & Export

### Test Case 1: Filter Status
- [ ] Buka `/admin?tab=finance`
- [ ] Test setiap filter status:
  - [ ] Semua (tampilkan semua)
  - [ ] Lunas (hanya yang lunas)
  - [ ] DP (hanya yang partial)
  - [ ] Belum Bayar (hanya yang unpaid)
- [ ] Verify filtering correct

### Test Case 2: Filter Tanggal - Hari Ini
- [ ] Klik "Hari Ini"
- [ ] Verify hanya booking hari ini yang muncul
- [ ] Check summary cards updated

### Test Case 3: Filter Tanggal - 7 Hari
- [ ] Klik "7 Hari"
- [ ] Verify booking 7 hari terakhir muncul
- [ ] Check summary cards updated

### Test Case 4: Filter Tanggal - 30 Hari
- [ ] Klik "30 Hari"
- [ ] Verify booking 30 hari terakhir muncul
- [ ] Check summary cards updated

### Test Case 5: Filter Tanggal - Custom
- [ ] Klik "Custom"
- [ ] Verify 2 input tanggal muncul
- [ ] Pilih tanggal mulai: 01/05/2026
- [ ] Pilih tanggal akhir: 31/05/2026
- [ ] Verify hanya booking dalam range tersebut yang muncul
- [ ] Check summary cards updated

### Test Case 6: Kombinasi Filter
- [ ] Set filter status: "Lunas"
- [ ] Set filter tanggal: "30 Hari"
- [ ] Verify hanya booking lunas dalam 30 hari yang muncul

### Test Case 7: Search + Filter
- [ ] Ketik nama klien di search box
- [ ] Set filter status
- [ ] Set filter tanggal
- [ ] Verify semua filter bekerja bersamaan

### Test Case 8: Export CSV - All Data
- [ ] Reset semua filter (Semua, Semua periode)
- [ ] Klik "Export CSV"
- [ ] Verify file terdownload
- [ ] Buka di Excel/Google Sheets
- [ ] Check:
  - [ ] Header correct (No Invoice, Tanggal, Klien, dll)
  - [ ] Data lengkap
  - [ ] Format readable
  - [ ] Jumlah row = jumlah booking

### Test Case 9: Export CSV - Filtered Data
- [ ] Set filter: "Lunas" + "30 Hari"
- [ ] Klik "Export CSV"
- [ ] Verify file hanya berisi data yang terfilter

### Test Case 10: Export CSV - Empty Data
- [ ] Set filter yang tidak ada datanya
- [ ] Klik "Export CSV"
- [ ] Verify file tetap terdownload (hanya header)

### Expected Result
✅ Semua filter berfungsi
✅ Kombinasi filter works
✅ Export CSV berhasil
✅ Data di CSV akurat
✅ Performance cepat

---

## 5️⃣ Dashboard Charts

### Test Case 1: Revenue Chart
- [ ] Buka `/admin?tab=overview`
- [ ] Scroll ke section charts
- [ ] Verify Revenue Chart muncul
- [ ] Check:
  - [ ] 6 bulan terakhir ditampilkan
  - [ ] Bar biru (Total Omzet) muncul
  - [ ] Bar hijau (Pendapatan) muncul
  - [ ] Growth percentage muncul
  - [ ] Warna correct (hijau jika positif, merah jika negatif)

### Test Case 2: Revenue Chart - Hover
- [ ] Hover pada bar chart
- [ ] Verify tooltip muncul dengan nilai detail
- [ ] Test hover pada semua bulan

### Test Case 3: Revenue Chart - Empty Data
- [ ] Test dengan database kosong (atau filter yang kosong)
- [ ] Verify chart tidak error
- [ ] Check empty state atau chart dengan nilai 0

### Test Case 4: Status Pie Chart
- [ ] Check pie chart muncul
- [ ] Verify 3 segment:
  - [ ] Hijau (Terkonfirmasi)
  - [ ] Orange (Pending)
  - [ ] Merah (Dibatalkan)
- [ ] Check center text (Total booking)
- [ ] Check legend dengan count & percentage

### Test Case 5: Pie Chart - Hover
- [ ] Hover pada segment pie
- [ ] Verify hover effect (opacity change)

### Test Case 6: Pie Chart - Empty Data
- [ ] Test dengan database kosong
- [ ] Verify tidak error
- [ ] Check empty state

### Test Case 7: Charts - Real-time Update
- [ ] Buka Overview tab
- [ ] Buka Finance tab di tab lain
- [ ] Tambah booking baru atau update payment
- [ ] Kembali ke Overview tab
- [ ] Refresh page
- [ ] Verify charts updated

### Expected Result
✅ Charts render dengan benar
✅ Data akurat
✅ Interactive (hover works)
✅ No errors dengan empty data
✅ Responsive design

---

## 6️⃣ Integration Tests

### Test Case 1: End-to-End Workflow
- [ ] Setup company settings
- [ ] Buat booking baru (via Bookings tab)
- [ ] Catat pembayaran DP (via Payment History)
- [ ] Generate invoice (via Finance tab)
- [ ] Download PDF invoice
- [ ] Catat cicilan kedua
- [ ] Generate invoice lagi (verify updated)
- [ ] Catat pelunasan
- [ ] Verify status "Lunas"
- [ ] Export laporan CSV
- [ ] Check dashboard charts updated

### Test Case 2: Multiple Bookings
- [ ] Buat 5 booking dengan status berbeda
- [ ] Catat pembayaran untuk masing-masing
- [ ] Generate invoice untuk semua
- [ ] Test filter untuk setiap status
- [ ] Export CSV
- [ ] Verify semua data correct

### Test Case 3: Data Consistency
- [ ] Catat pembayaran di Payment History
- [ ] Check Finance Tab (verify updated)
- [ ] Check Overview Tab (verify charts updated)
- [ ] Generate invoice (verify amounts correct)
- [ ] Export CSV (verify data match)

### Expected Result
✅ Semua fitur terintegrasi dengan baik
✅ Data konsisten di semua tab
✅ No data loss
✅ No sync issues

---

## 7️⃣ Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
  - [ ] All features work
  - [ ] PDF download works
  - [ ] Charts render correctly
- [ ] Edge (latest)
  - [ ] All features work
  - [ ] PDF download works
  - [ ] Charts render correctly
- [ ] Firefox (latest)
  - [ ] All features work
  - [ ] PDF download works
  - [ ] Charts render correctly
- [ ] Safari (latest)
  - [ ] All features work
  - [ ] PDF download works
  - [ ] Charts render correctly

### Mobile Browsers
- [ ] Chrome Mobile (Android)
  - [ ] Responsive layout
  - [ ] All features accessible
  - [ ] PDF download works
- [ ] Safari (iOS)
  - [ ] Responsive layout
  - [ ] All features accessible
  - [ ] PDF download works

### Expected Result
✅ Works on all major browsers
✅ Consistent behavior
✅ No browser-specific bugs

---

## 8️⃣ Performance Tests

### Test Case 1: Large Dataset
- [ ] Test dengan 100+ bookings
- [ ] Check Finance Tab loading time (< 2 seconds)
- [ ] Check filter performance (instant)
- [ ] Check export CSV time (< 5 seconds)
- [ ] Check charts rendering (< 1 second)

### Test Case 2: Payment History with Many Payments
- [ ] Buat booking dengan 20+ payments
- [ ] Open Payment History
- [ ] Check loading time (< 1 second)
- [ ] Scroll timeline (smooth)
- [ ] Add new payment (instant)

### Test Case 3: Invoice Generation
- [ ] Generate invoice dengan data lengkap
- [ ] Check page load time (< 2 seconds)
- [ ] Check PDF generation time (< 5 seconds)

### Expected Result
✅ Fast loading times
✅ Smooth interactions
✅ No lag or freeze
✅ Efficient rendering

---

## 9️⃣ Error Handling

### Test Case 1: Network Error
- [ ] Disconnect internet
- [ ] Try to save payment
- [ ] Verify error message muncul
- [ ] Reconnect internet
- [ ] Retry, verify berhasil

### Test Case 2: Invalid Input
- [ ] Try to save payment dengan amount = 0
- [ ] Verify validation error
- [ ] Try to save payment dengan negative amount
- [ ] Verify validation error

### Test Case 3: Missing Company Settings
- [ ] Generate invoice tanpa setup company settings
- [ ] Verify invoice tetap generate (dengan placeholder)
- [ ] No crash

### Test Case 4: Concurrent Updates
- [ ] Buka 2 tab admin
- [ ] Update payment di tab 1
- [ ] Refresh tab 2
- [ ] Verify data sync

### Expected Result
✅ Graceful error handling
✅ User-friendly error messages
✅ No crashes
✅ Data integrity maintained

---

## 🔟 Security Tests

### Test Case 1: Authentication
- [ ] Try to access `/invoice/:id` without login
- [ ] Verify redirect to login atau access denied
- [ ] Login as admin
- [ ] Verify access granted

### Test Case 2: Authorization
- [ ] Try to access other user's invoice (if multi-user)
- [ ] Verify access denied

### Test Case 3: SQL Injection
- [ ] Try to input SQL in search box
- [ ] Verify no SQL injection
- [ ] Data safe

### Test Case 4: XSS
- [ ] Try to input `<script>alert('xss')</script>` in form
- [ ] Verify script tidak execute
- [ ] Data escaped properly

### Expected Result
✅ Secure authentication
✅ Proper authorization
✅ No injection vulnerabilities
✅ Data sanitized

---

## ✅ Final Checklist

### Before Production
- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Backup database
- [ ] Company settings configured
- [ ] Test with real data
- [ ] User training done (if needed)

### Production Deployment
- [ ] Deploy to production
- [ ] Verify all features work in production
- [ ] Monitor for errors (first 24 hours)
- [ ] Collect user feedback
- [ ] Fix any issues immediately

### Post-Deployment
- [ ] Monitor performance
- [ ] Check error logs
- [ ] User satisfaction survey
- [ ] Plan for improvements

---

## 📊 Test Results Summary

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Company Settings | 1 | | | |
| Invoice Generator | 5 | | | |
| Payment History | 8 | | | |
| Finance Tab | 10 | | | |
| Dashboard Charts | 7 | | | |
| Integration | 3 | | | |
| Browser Compat | 6 | | | |
| Performance | 3 | | | |
| Error Handling | 4 | | | |
| Security | 4 | | | |
| **TOTAL** | **51** | | | |

---

## 🐛 Bug Report Template

Jika menemukan bug, catat dengan format:

```
**Bug Title:** [Deskripsi singkat]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[Apa yang seharusnya terjadi]

**Actual Result:**
[Apa yang sebenarnya terjadi]

**Screenshots:**
[Attach screenshot jika ada]

**Browser/Device:**
[Chrome 90 / iPhone 12 / etc]

**Console Errors:**
[Copy error dari console]
```

---

**Testing Date:** _____________
**Tester Name:** _____________
**Version:** 2.0.0
**Status:** ⬜ In Progress / ✅ Completed

---

**Good luck testing! 🚀**
