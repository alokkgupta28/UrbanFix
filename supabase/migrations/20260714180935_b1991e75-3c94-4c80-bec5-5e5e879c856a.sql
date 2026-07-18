
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "reviews owner insert" ON public.reviews;
CREATE POLICY "reviews owner insert" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reviews.booking_id
        AND b.customer_id = auth.uid()
        AND b.provider_id = reviews.provider_id
        AND b.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "reviews owner update" ON public.reviews;
CREATE POLICY "reviews owner update" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE OR REPLACE FUNCTION public.recompute_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target UUID;
BEGIN
  target := COALESCE(NEW.provider_id, OLD.provider_id);
  UPDATE public.providers p
     SET rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE provider_id = target), 0),
         rating_count = (SELECT COUNT(*) FROM public.reviews WHERE provider_id = target)
   WHERE p.id = target;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_recompute ON public.reviews;
CREATE TRIGGER trg_reviews_recompute
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recompute_provider_rating();
