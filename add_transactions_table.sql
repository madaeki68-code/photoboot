-- Tabel untuk mencatat pemasukan & pengeluaran manual (di luar booking)
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'qris', 'other')),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  -- Kolom opsional untuk link ke booking (mencegah duplikat sync)
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Authenticated users can manage transactions'
  ) THEN
    CREATE POLICY "Authenticated users can manage transactions"
    ON public.transactions FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);

-- Jika tabel sudah ada, tambahkan kolom booking_id
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);
