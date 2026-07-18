-- ==========================================
-- Supabase Row Level Security (RLS) Policies
-- ==========================================

-- --------------------------------------------------------
-- 1. Enable RLS on all tables
-- --------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 2. Admin Helper Function
-- --------------------------------------------------------
-- Create a helper function to easily check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- 3. Profiles Policies
-- --------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- --------------------------------------------------------
-- 4. User Roles Policies
-- --------------------------------------------------------
CREATE POLICY "Users can view their own roles." 
ON user_roles FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Only admins can modify roles." 
ON user_roles FOR ALL USING (is_admin());

-- --------------------------------------------------------
-- 5. Service Categories Policies
-- --------------------------------------------------------
CREATE POLICY "Categories are viewable by everyone." 
ON service_categories FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories." 
ON service_categories FOR ALL USING (is_admin());

-- --------------------------------------------------------
-- 6. Providers Policies
-- --------------------------------------------------------
CREATE POLICY "Providers are viewable by everyone." 
ON providers FOR SELECT USING (true);

CREATE POLICY "Users can insert their own provider profile." 
ON providers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile." 
ON providers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can delete their own profile." 
ON providers FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Note: The Provider.java entity mentions that the `phone` column is revoked from public access.
-- To enforce this at the database level, run the following commands:
-- REVOKE SELECT (phone) ON TABLE providers FROM anon, authenticated;
-- GRANT SELECT (phone) ON TABLE providers TO service_role;

-- --------------------------------------------------------
-- 7. Bookings Policies
-- --------------------------------------------------------
CREATE POLICY "Customers can view their own bookings." 
ON bookings FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view bookings assigned to them." 
ON bookings FOR SELECT USING (
  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all bookings." 
ON bookings FOR SELECT USING (is_admin());

CREATE POLICY "Customers can create bookings for themselves." 
ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own bookings." 
ON bookings FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Providers can update their assigned bookings." 
ON bookings FOR UPDATE USING (
  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update all bookings." 
ON bookings FOR UPDATE USING (is_admin());

CREATE POLICY "Customers can delete (cancel) their own bookings." 
ON bookings FOR DELETE USING (auth.uid() = customer_id);

-- --------------------------------------------------------
-- 8. Reviews Policies
-- --------------------------------------------------------
CREATE POLICY "Reviews are viewable by everyone." 
ON reviews FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their own bookings." 
ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own reviews." 
ON reviews FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own reviews." 
ON reviews FOR DELETE USING (auth.uid() = customer_id OR is_admin());

-- --------------------------------------------------------
-- 9. Storage Policies
-- --------------------------------------------------------
-- Assuming buckets are named 'avatars' and 'provider_images'. 
-- In Supabase, users upload to a folder named after their auth.uid().
-- E.g. avatars/<auth.uid()>/image.png

-- 9.1 Avatars Bucket
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar." 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar." 
ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar." 
ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 9.2 Provider Images Bucket
CREATE POLICY "Provider images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'provider_images');

CREATE POLICY "Providers can upload their own images." 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'provider_images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can update their own images." 
ON storage.objects FOR UPDATE USING (
  bucket_id = 'provider_images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can delete their own images." 
ON storage.objects FOR DELETE USING (
  bucket_id = 'provider_images' AND auth.uid()::text = (storage.foldername(name))[1]
);
