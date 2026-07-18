
-- 1. Server-side price computation: hourly_rate + 15% base_price + 18% GST
CREATE OR REPLACE FUNCTION public.compute_booking_total(_provider_id uuid, _category_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND((p.hourly_rate + (c.base_price * 0.15)) * 1.18)::int
  FROM public.providers p, public.service_categories c
  WHERE p.id = _provider_id AND c.id = _category_id;
$$;
REVOKE EXECUTE ON FUNCTION public.compute_booking_total(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_booking_total(uuid, uuid) TO authenticated, service_role;

-- 2. Booking validation trigger
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_service boolean;
  is_provider boolean;
BEGIN
  is_service := (auth.role() = 'service_role');
  IF is_service THEN
    RETURN NEW;
  END IF;

  is_admin := public.has_role(auth.uid(), 'admin');

  IF TG_OP = 'INSERT' THEN
    -- Always recompute total server-side. Ignore client-supplied value.
    NEW.total_amount := public.compute_booking_total(NEW.provider_id, NEW.category_id);
    IF NEW.total_amount IS NULL OR NEW.total_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid provider or category';
    END IF;
    -- Force initial status/payment state.
    IF NEW.payment_method = 'pay_after' THEN
      NEW.status := 'confirmed';
      NEW.stripe_payment_status := 'unpaid';
    ELSE
      NEW.status := 'pending';
      NEW.stripe_payment_status := 'unpaid';
    END IF;
    NEW.stripe_session_id := NULL;
    NEW.stripe_environment := NULL;
    NEW.disputed := false;
    NEW.dispute_reason := NULL;
    RETURN NEW;
  END IF;

  -- UPDATE below
  IF NOT is_admin THEN
    -- Lock immutable / privileged fields
    NEW.total_amount := OLD.total_amount;
    NEW.customer_id := OLD.customer_id;
    NEW.provider_id := OLD.provider_id;
    NEW.category_id := OLD.category_id;
    NEW.scheduled_at := OLD.scheduled_at;
    NEW.payment_method := OLD.payment_method;
    NEW.stripe_payment_status := OLD.stripe_payment_status;
    NEW.stripe_session_id := OLD.stripe_session_id;
    NEW.stripe_environment := OLD.stripe_environment;
    NEW.admin_notes := OLD.admin_notes;
  END IF;

  -- Status transition rules
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT is_admin THEN
    IF auth.uid() = OLD.customer_id THEN
      IF NEW.status <> 'cancelled' THEN
        RAISE EXCEPTION 'Customers can only cancel bookings';
      END IF;
      IF OLD.scheduled_at <= now() THEN
        RAISE EXCEPTION 'Cannot cancel after the scheduled time';
      END IF;
      IF OLD.status NOT IN ('pending', 'confirmed') THEN
        RAISE EXCEPTION 'Booking cannot be cancelled from status %', OLD.status;
      END IF;
    ELSE
      is_provider := EXISTS (
        SELECT 1 FROM public.providers p
        WHERE p.id = OLD.provider_id AND p.user_id = auth.uid()
      );
      IF NOT is_provider THEN
        RAISE EXCEPTION 'Not authorized to change booking status';
      END IF;
      IF NOT (
        (OLD.status = 'confirmed'   AND NEW.status = 'in_progress') OR
        (OLD.status = 'in_progress' AND NEW.status = 'completed')
      ) THEN
        RAISE EXCEPTION 'Invalid status transition: % -> %', OLD.status, NEW.status;
      END IF;
      IF NEW.status = 'completed' AND OLD.scheduled_at > now() THEN
        RAISE EXCEPTION 'Cannot mark completed before the scheduled time';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- 3. Hide provider phone numbers from public reads
REVOKE SELECT (phone) ON public.providers FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_provider_phone(_provider_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.phone
  FROM public.providers p
  WHERE p.id = _provider_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.provider_id = _provider_id
          AND b.customer_id = auth.uid()
          AND b.status IN ('confirmed','in_progress','completed')
      )
    );
$$;
REVOKE EXECUTE ON FUNCTION public.get_provider_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_provider_phone(uuid) TO authenticated;
