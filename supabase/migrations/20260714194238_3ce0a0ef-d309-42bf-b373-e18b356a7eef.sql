ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS phone text;
UPDATE public.providers SET phone = '+919000000' || LPAD((ABS(hashtext(id::text)) % 100000)::text, 5, '0') WHERE phone IS NULL;