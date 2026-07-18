
CREATE TYPE public.app_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, phone TEXT, avatar_url TEXT, city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, tagline TEXT NOT NULL, description TEXT NOT NULL,
  base_price INTEGER NOT NULL, icon_key TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL, headline TEXT NOT NULL, bio TEXT NOT NULL, city TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL, experience_years INTEGER NOT NULL,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 4.80, rating_count INTEGER NOT NULL DEFAULT 0,
  jobs_completed INTEGER NOT NULL DEFAULT 0, verified BOOLEAN NOT NULL DEFAULT true,
  avatar_key TEXT NOT NULL, languages TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.providers TO anon, authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers public read" ON public.providers FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  address_line TEXT NOT NULL, address_city TEXT NOT NULL, address_pincode TEXT NOT NULL,
  notes TEXT, contact_phone TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'pay_after_service',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings owner read" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = customer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bookings owner insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings owner update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL, customer_city TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.service_categories (slug,name,tagline,description,base_price,icon_key,sort_order) VALUES
('electrician','Electrician','Wiring, repairs & installations','Certified electricians for switchboards, wiring, fan installation, MCB tripping, and inverter setup.',299,'electrician',1),
('plumber','Plumber','Leak repair, taps & fittings','Expert plumbers for leakages, tap replacement, drain unclogging, and bathroom fittings.',249,'plumber',2),
('deep-cleaning','Deep Cleaning','Kitchen, bathroom & full home','Trained cleaners with pro-grade equipment for kitchens, bathrooms and full-home deep cleans.',1499,'cleaning',3),
('carpenter','Carpenter','Furniture repair & assembly','Skilled carpenters for door repairs, drawer fixing, furniture assembly and modular carpentry.',399,'carpenter',4),
('painter','Painter','Interior & exterior painting','Professional painters using low-VOC paints for walls, ceilings, and touch-ups.',3999,'painter',5),
('salon-at-home','Salon at Home','Beauty, hair & spa','Certified beauticians bring salon-quality haircuts, facials, waxing and spa to your door.',799,'salon',6),
('ro-repair','RO Repair','Purifier service & filters','Genuine spares and RO service by trained technicians. Same-day slots available.',449,'ro',7),
('ac-repair','AC Repair','Service, gas & installation','AC service, gas top-up, uninstall/reinstall, and deep-clean by certified pros.',549,'ac',8),
('appliance-repair','Appliance Repair','Washing machine, TV & more','Repair for washing machines, microwaves, refrigerators, chimneys and geysers.',349,'appliance',9),
('pest-control','Pest Control','Cockroach, termite & rodent','Odourless, child-safe pest control by licensed technicians with 30-day warranty.',1199,'pest',10);

WITH c AS (SELECT slug, id FROM public.service_categories)
INSERT INTO public.providers (category_id,full_name,headline,bio,city,hourly_rate,experience_years,rating_avg,rating_count,jobs_completed,avatar_key,languages) VALUES
((SELECT id FROM c WHERE slug='electrician'),'Rahul Sharma','Certified Master Electrician','12 years fixing everything from short circuits to full-home rewiring. ISI-certified tools, punctual to the minute.','Bengaluru',450,12,4.92,318,412,'p1',ARRAY['English','Hindi','Kannada']),
((SELECT id FROM c WHERE slug='electrician'),'Anita Deshmukh','Electrical Engineer, Home Automation','MSc Electrical. Specialises in smart-home wiring, MCB panels, and inverter installs.','Pune',520,9,4.88,204,271,'p2',ARRAY['English','Hindi','Marathi']),
((SELECT id FROM c WHERE slug='plumber'),'Suresh Iyer','Plumbing Specialist, 8+ years','Concealed leak detection, geyser fitting, drainage. Same-day service across South Bengaluru.','Bengaluru',380,8,4.85,289,356,'p3',ARRAY['English','Hindi','Tamil']),
((SELECT id FROM c WHERE slug='deep-cleaning'),'Meera Nair','Team Lead, Deep-Clean Crew','Leads a 3-person team using steam cleaners and pro-grade agents. 500+ homes cleaned.','Bengaluru',600,6,4.91,502,540,'p4',ARRAY['English','Hindi','Malayalam']),
((SELECT id FROM c WHERE slug='carpenter'),'Ajay Kumar','Modular & Custom Carpentry','Ex-Godrej Interio craftsman. Wardrobes, kitchens, and precision furniture repair.','Delhi NCR',420,15,4.87,367,489,'p5',ARRAY['English','Hindi']),
((SELECT id FROM c WHERE slug='painter'),'Ganesh Patil','Asian Paints Certified Painter','Low-VOC, textured, and stencil finishes. Uses drop-sheets and finishes on time, always.','Mumbai',350,11,4.83,241,318,'p6',ARRAY['English','Hindi','Marathi']),
((SELECT id FROM c WHERE slug='salon-at-home'),'Priya Menon','Senior Beauty Expert, L''Oréal Certified','8 years at premium salons. Hair colour, keratin, facials and pre-bridal packages.','Bengaluru',700,8,4.94,612,689,'p7',ARRAY['English','Hindi','Tamil']),
((SELECT id FROM c WHERE slug='ro-repair'),'Vikram Singh','RO & Water Purifier Technician','Kent, Aquaguard, Livpure factory-trained. Genuine spares only. 30-day service warranty.','Gurugram',400,7,4.86,198,247,'p8',ARRAY['English','Hindi','Punjabi']),
((SELECT id FROM c WHERE slug='ac-repair'),'Farhan Qureshi','Split & Window AC Expert','Voltas & Daikin certified. Gas top-up with pressure test, deep-clean using foam agents.','Hyderabad',500,10,4.89,412,533,'p9',ARRAY['English','Hindi','Urdu']),
((SELECT id FROM c WHERE slug='appliance-repair'),'Deepa Reddy','Multi-Brand Appliance Repair','Front-load washers, chimneys, microwaves. LG, Samsung, IFB service history.','Chennai',380,9,4.82,284,341,'p10',ARRAY['English','Hindi','Telugu','Tamil']),
((SELECT id FROM c WHERE slug='pest-control'),'Rohit Verma','Licensed Pest Control Specialist','ISO-certified. Child-safe, odourless treatments. Cockroach, termite, rodent and mosquito.','Bengaluru',450,6,4.84,176,231,'p11',ARRAY['English','Hindi']),
((SELECT id FROM c WHERE slug='plumber'),'Karthik Rao','Bathroom Fittings Specialist','Grohe & Jaquar-certified installer. Concealed plumbing, sensor taps, geyser installs.','Bengaluru',420,7,4.88,213,268,'p12',ARRAY['English','Hindi','Kannada']);

INSERT INTO public.reviews (provider_id, customer_name, customer_city, rating, comment)
SELECT p.id, r.cname, r.ccity, r.rating, r.comment FROM (VALUES
  ('Rahul Sharma','Ananya B.','Bengaluru',5,'Rahul diagnosed a tripping MCB issue three other technicians missed. On-time, tidy, and explained everything clearly.'),
  ('Meera Nair','Sanjay P.','Bengaluru',5,'Meera''s team deep-cleaned our 3BHK in 4 hours. Sofa, kitchen tiles, exhaust — spotless. Absolutely worth it.'),
  ('Priya Menon','Divya K.','Bengaluru',5,'Best at-home facial I''ve had. Priya carried premium products and the setup was more hygienic than most salons.'),
  ('Farhan Qureshi','Rakesh M.','Hyderabad',5,'AC that hadn''t cooled in weeks — Farhan fixed it in one visit. Professional, transparent pricing.'),
  ('Suresh Iyer','Neha R.','Bengaluru',4,'Fixed a hidden pipe leak same evening. Slight delay in arrival but the work was excellent.'),
  ('Ajay Kumar','Ishaan V.','Delhi NCR',5,'Assembled two wardrobes and repaired a drawer track. Precise, quiet, and left zero mess.')
) AS r(pname, cname, ccity, rating, comment)
JOIN public.providers p ON p.full_name = r.pname;
