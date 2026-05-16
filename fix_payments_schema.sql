-- Fix payments table to work with bookings directly
-- Run this SQL in Supabase SQL Editor

-- Option 1: Add booking_id column to payments table (recommended)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id uuid;

-- Add foreign key to bookings
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

-- Make invoice_id nullable (since we're using booking_id instead)
ALTER TABLE public.payments ALTER COLUMN invoice_id DROP NOT NULL;

-- Update RLS policy to allow authenticated users to insert with booking_id
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;

CREATE POLICY "Authenticated users can manage payments" 
ON public.payments 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND table_schema = 'public';
