-- Enable RLS on the table
ALTER TABLE recorded_trash ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own reports
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."recorded_trash"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read reports (for the map)
CREATE POLICY "Enable read access for all users"
ON "public"."recorded_trash"
FOR SELECT
USING (true);

-- STORAGE POLICIES (trash-images bucket) --

-- Allow authenticated users to upload images
-- Note: This assumes the bucket 'trash-images' exists.
-- If not, you might need to create it manually in the dashboard or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trash-images', 'trash-images', true);

CREATE POLICY "Give users access to own folder 1uvj4p_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'trash-images');

CREATE POLICY "Give users access to own folder 1uvj4p_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'trash-images');

CREATE POLICY "Give users access to own folder 1uvj4p_2" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'trash-images');

CREATE POLICY "Give users access to own folder 1uvj4p_3" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'trash-images');
