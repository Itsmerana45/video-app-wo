-- Database Structure Setup Script
-- This script creates tables and policies without sample data to avoid foreign key violations

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
