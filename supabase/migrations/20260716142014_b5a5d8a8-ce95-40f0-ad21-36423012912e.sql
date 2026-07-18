
-- 1) Remove phone column exposure from public providers reads
REVOKE SELECT (phone) ON public.providers FROM anon, authenticated;

-- 2) Lock down SECURITY DEFINER functions from direct API execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_booking_total(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_provider_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_booking() FROM PUBLIC, anon, authenticated;

-- get_provider_phone is intentionally callable by signed-in users (RPC gates access internally)
REVOKE EXECUTE ON FUNCTION public.get_provider_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_provider_phone(uuid) TO authenticated;
