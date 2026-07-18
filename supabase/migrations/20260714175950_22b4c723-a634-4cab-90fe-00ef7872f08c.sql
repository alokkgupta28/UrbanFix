ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_environment text;

-- Service role needs to update bookings from the webhook handler
DROP POLICY IF EXISTS "bookings service role manage" ON public.bookings;
CREATE POLICY "bookings service role manage" ON public.bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);