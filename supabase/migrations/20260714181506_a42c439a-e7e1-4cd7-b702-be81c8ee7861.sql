
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "providers owner update" ON public.providers;
CREATE POLICY "providers owner update" ON public.providers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "providers self claim" ON public.providers;
CREATE POLICY "providers self claim" ON public.providers
  FOR UPDATE TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings provider read" ON public.bookings;
CREATE POLICY "bookings provider read" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.providers p WHERE p.id = bookings.provider_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "bookings provider update" ON public.bookings;
CREATE POLICY "bookings provider update" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.providers p WHERE p.id = bookings.provider_id AND p.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.providers p WHERE p.id = bookings.provider_id AND p.user_id = auth.uid())
  );
