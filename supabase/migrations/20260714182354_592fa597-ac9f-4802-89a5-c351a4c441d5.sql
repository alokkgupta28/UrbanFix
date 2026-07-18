
-- Booking dispute fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS disputed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dispute_reason text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- Admin management policies
CREATE POLICY "bookings admin update" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "bookings admin delete" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "reviews admin delete" ON public.reviews
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "reviews admin update" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "providers admin delete" ON public.providers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view and manage user roles
CREATE POLICY "roles admin read" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "roles admin manage" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
