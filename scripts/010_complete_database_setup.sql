-- Complete Database Setup Script
-- This script will set up the entire database from scratch, handling existing objects gracefully

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "videos_select_all" ON videos;
DROP POLICY IF EXISTS "videos_insert_authenticated" ON videos;
DROP POLICY IF EXISTS "videos_update_own" ON videos;
DROP POLICY IF EXISTS "videos_delete_own" ON videos;
DROP POLICY IF EXISTS "video_ratings_select_all" ON video_ratings;
DROP POLICY IF EXISTS "video_ratings_insert_authenticated" ON video_ratings;
DROP POLICY IF EXISTS "video_ratings_update_own" ON video_ratings;
DROP POLICY IF EXISTS "video_ratings_delete_own" ON video_ratings;
DROP POLICY IF EXISTS "user_follows_select_all" ON user_follows;
DROP POLICY IF EXISTS "user_follows_insert_authenticated" ON user_follows;
DROP POLICY IF EXISTS "user_follows_delete_own" ON user_follows;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS video_ratings CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('creator', 'consumer')) DEFAULT 'consumer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    duration INTEGER, -- in seconds
    tags TEXT[],
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_ratings table
CREATE TABLE video_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, user_id)
);

-- Create user_follows table
CREATE TABLE user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for videos
CREATE POLICY "videos_select_all" ON videos FOR SELECT USING (true);
CREATE POLICY "videos_insert_authenticated" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "videos_update_own" ON videos FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "videos_delete_own" ON videos FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for video_ratings
CREATE POLICY "video_ratings_select_all" ON video_ratings FOR SELECT USING (true);
CREATE POLICY "video_ratings_insert_authenticated" ON video_ratings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "video_ratings_update_own" ON video_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "video_ratings_delete_own" ON video_ratings FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_follows
CREATE POLICY "user_follows_select_all" ON user_follows FOR SELECT USING (true);
CREATE POLICY "user_follows_insert_authenticated" ON user_follows FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "user_follows_delete_own" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX idx_videos_creator_id ON videos(creator_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX idx_videos_like_count ON videos(like_count DESC);
CREATE INDEX idx_video_ratings_video_id ON video_ratings(video_id);
CREATE INDEX idx_video_ratings_user_id ON video_ratings(user_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample data
-- Sample profiles
INSERT INTO profiles (id, username, full_name, bio, avatar_url, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'techguru', 'Alex Chen', 'Tech enthusiast sharing the latest in gadgets and programming', '/placeholder.svg?height=100&width=100', 'creator'),
('550e8400-e29b-41d4-a716-446655440002', 'foodie_sarah', 'Sarah Johnson', 'Culinary adventures and recipe sharing', '/placeholder.svg?height=100&width=100', 'creator'),
('550e8400-e29b-41d4-a716-446655440003', 'gamer_mike', 'Mike Rodriguez', 'Gaming content creator and streamer', '/placeholder.svg?height=100&width=100', 'creator'),
('550e8400-e29b-41d4-a716-446655440004', 'travel_emma', 'Emma Wilson', 'Exploring the world one destination at a time', '/placeholder.svg?height=100&width=100', 'creator'),
('550e8400-e29b-41d4-a716-446655440005', 'fitness_coach', 'David Kim', 'Personal trainer helping you achieve your fitness goals', '/placeholder.svg?height=100&width=100', 'creator');

-- Sample videos
INSERT INTO videos (id, title, description, video_url, thumbnail_url, creator_id, view_count, like_count, duration, tags, category) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Ultimate Gaming Setup 2024', 'Check out my complete gaming setup with RGB lighting and custom PC build', '/ultimate-gaming-setup.png', '/ultimate-gaming-setup.png', '550e8400-e29b-41d4-a716-446655440003', 15420, 892, 480, ARRAY['gaming', 'setup', 'pc', 'rgb'], 'Gaming'),
('660e8400-e29b-41d4-a716-446655440002', 'Tokyo Street Food Adventure', 'Exploring the best street food in Tokyo - from ramen to takoyaki!', '/vibrant-tokyo-cityscape.png', '/vibrant-tokyo-cityscape.png', '550e8400-e29b-41d4-a716-446655440004', 23150, 1205, 720, ARRAY['travel', 'food', 'tokyo', 'japan'], 'Travel'),
('660e8400-e29b-41d4-a716-446655440003', 'Perfect Pasta Carbonara', 'Learn to make authentic Italian carbonara with just 5 ingredients', '/cooking-pasta.png', '/cooking-pasta.png', '550e8400-e29b-41d4-a716-446655440002', 8930, 567, 360, ARRAY['cooking', 'pasta', 'italian', 'recipe'], 'Food'),
('660e8400-e29b-41d4-a716-446655440004', 'iPhone 15 Pro Max Review', 'Complete review of the new iPhone 15 Pro Max - camera, performance, and more', '/placeholder.svg?height=200&width=300', '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440001', 45230, 2103, 900, ARRAY['tech', 'iphone', 'review', 'apple'], 'Technology'),
('660e8400-e29b-41d4-a716-446655440005', '30-Minute Full Body Workout', 'High-intensity workout you can do at home with no equipment', '/placeholder.svg?height=200&width=300', '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440005', 12750, 834, 1800, ARRAY['fitness', 'workout', 'home', 'hiit'], 'Fitness'),
('660e8400-e29b-41d4-a716-446655440006', 'Music Production in Logic Pro', 'Creating beats and melodies in Logic Pro X - beginner tutorial', '/music-studio.png', '/music-studio.png', '550e8400-e29b-41d4-a716-446655440001', 6420, 312, 1200, ARRAY['music', 'production', 'logic', 'tutorial'], 'Music');

-- Sample video ratings
INSERT INTO video_ratings (video_id, user_id, rating, comment) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 5, 'Amazing setup! Love the RGB lighting'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 4, 'Great video quality and explanation'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 5, 'Made me want to visit Tokyo immediately!'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 5, 'Perfect recipe, tried it and it was delicious'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 4, 'Comprehensive review, helped me decide on my purchase');

-- Sample user follows
INSERT INTO user_follows (follower_id, following_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001');
