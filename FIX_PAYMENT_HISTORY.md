# 🔧 Fix Payment History Error

## ❌ Problem

Error 409 saat menambahkan pembayaran:
```
Failed to load resource: the server responded with a status of 409
Error adding payment
```

## 🔍 Root Cause

Tabel `payments` di database memiliki foreign key constraint ke tabel `invoices`, tapi kita menggunakan `booking_id` langsung. Ini menyebabkan konflik.

## ✅ Solution

Jalankan SQL script untuk memperbaiki schema database.

---

## 📝 Langkah-Langkah Fix

### Step 1: Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

### Step 2: Jalankan SQL Script

Copy dan paste SQL berikut ke SQL Editor:

```sql
-- Fix payments table to work with bookings directly

-- 1. Add booking_id column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id uuid;

-- 2. Add foreign key to bookings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_booking_id_fkey'
  ) THEN
    ALTER TABLE public.payments 
    ADD CONSTRAINT payments_booking_id_fkey 
    FOREIGN KEY (booking_id) 
    REFERENCES public.bookings(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Make invoice_id nullable (since we're using booking_id instead)
ALTER TABLE public.payments ALTER COLUMN invoice_id DROP NOT NULL;

-- 4. Update RLS policy to allow authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;

CREATE POLICY "Authenticated users can manage payments" 
ON public.payments 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### Step 3: Run Script

1. Klik tombol **Run** (atau tekan Ctrl+Enter)
2. Tunggu sampai selesai
3. Verify tidak ada error

### Step 4: Verify Changes

Jalankan query ini untuk verify:

```sql
-- Check if booking_id column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected output harus include kolom `booking_id`:
```
column_name       | data_type | is_nullable
------------------+-----------+------------
id                | uuid      | NO
invoice_id        | uuid      | YES  <-- Now nullable
amount            | numeric   | NO
payment_method    | text      | YES
payment_proof_url | text      | YES
payment_date      | timestamp | YES
verified          | boolean   | YES
booking_id        | uuid      | YES  <-- New column
```

### Step 5: Test Payment History

1. Refresh aplikasi admin (Ctrl+R)
2. Buka Finance Tab
3. Klik icon History pada booking
4. Coba tambah pembayaran baru
5. Verify berhasil tanpa error

---

## 🎯 What Changed?

### Before:
```
payments table:
- invoice_id (FK to invoices table) ❌ Conflict!
```

### After:
```
payments table:
- invoice_id (nullable, optional)
- booking_id (FK to bookings table) ✅ Works!
```

### Code Changes:
```typescript
// Before
invoice_id: bookingId  ❌

// After  
booking_id: bookingId  ✅
```

---

## ✅ Verification Checklist

- [ ] SQL script executed successfully
- [ ] No errors in Supabase SQL Editor
- [ ] `booking_id` column exists in payments table
- [ ] RLS policy updated
- [ ] Application refreshed
- [ ] Payment History modal opens
- [ ] Can add new payment without error
- [ ] Payment appears in timeline
- [ ] Total paid amount updates correctly

---

## 🐛 Troubleshooting

### Error: "column booking_id already exists"
**Solution:** Kolom sudah ada, skip step 1. Lanjut ke step berikutnya.

### Error: "permission denied"
**Solution:** 
1. Pastikan Anda login sebagai owner/admin project
2. Check RLS policies di Supabase Dashboard → Authentication → Policies

### Error: "relation payments does not exist"
**Solution:**
1. Jalankan `supabase_schema.sql` terlebih dahulu
2. Pastikan tabel payments sudah dibuat

### Still getting 409 error after fix
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Logout & login lagi
4. Check browser console untuk error detail

---

## 📊 Database Schema (After Fix)

```
bookings
├── id (PK)
├── name
├── total_price
├── paid_amount
└── ...

payments
├── id (PK)
├── booking_id (FK → bookings.id) ✅ NEW
├── invoice_id (nullable)
├── amount
├── payment_method
├── payment_date
└── verified
```

---

## 🔄 Migration Notes

### Existing Data
- Jika sudah ada data di tabel payments dengan invoice_id, data tetap aman
- Kolom invoice_id menjadi nullable, tidak akan error
- Data baru akan menggunakan booking_id

### Rollback (if needed)
Jika perlu rollback:

```sql
-- Remove booking_id column
ALTER TABLE public.payments DROP COLUMN IF EXISTS booking_id;

-- Make invoice_id NOT NULL again
ALTER TABLE public.payments ALTER COLUMN invoice_id SET NOT NULL;
```

⚠️ **Warning:** Rollback akan menghapus semua data payments yang menggunakan booking_id!

---

## 📞 Need Help?

Jika masih ada masalah:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Cari error terkait payments table

2. **Check Browser Console:**
   - F12 → Console tab
   - Screenshot error message

3. **Verify RLS Policies:**
   - Dashboard → Authentication → Policies
   - Pastikan policy "Authenticated users can manage payments" ada

4. **Test dengan Postman/curl:**
   ```bash
   # Test insert payment
   curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/payments' \
   -H "apikey: YOUR_ANON_KEY" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "booking_id": "YOUR_BOOKING_ID",
     "amount": 1000000,
     "payment_method": "transfer",
     "payment_date": "2026-05-15T00:00:00Z",
     "verified": true
   }'
   ```

---

## ✅ Success!

Setelah fix ini, Anda bisa:
- ✅ Tambah pembayaran tanpa error
- ✅ Catat cicilan/DP
- ✅ Track payment history
- ✅ Auto-update saldo booking

**Happy tracking! 💰**

---

**File:** `fix_payments_schema.sql`
**Date:** 2026-05-15
**Version:** 2.0.1
