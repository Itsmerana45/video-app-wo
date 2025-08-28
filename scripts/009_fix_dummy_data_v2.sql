-- Fix dummy data with correct constraints and add more comprehensive data

-- Clear existing data to avoid conflicts
DELETE FROM public.comments;
DELETE FROM public.video_ratings;
DELETE FROM public.video_tags;
DELETE FROM public.tags;
DELETE FROM public.videos;
DELETE FROM public.user_follows;
DELETE FROM public.profiles WHERE id != auth.uid();

-- Insert sample creators with correct user_type values
INSERT INTO public.profiles (id, username, display_name, bio, user_type, avatar_url, follower_count, following_count) VALUES
('11111111-1111-1111-1111-111111111111', 'naturelover', 'Nature Explorer', 'Capturing the beauty of our world 🌍', 'creator', '/placeholder.svg', 15420, 234),
('22222222-2222-2222-2222-222222222222', 'foodie_chef', 'Chef Maria', 'Quick recipes for busy people 👨‍🍳', 'creator', '/placeholder.svg', 8930, 156),
('33333333-3333-3333-3333-333333333333', 'urban_explorer', 'City Walker', 'Finding art in unexpected places 🎨', 'creator', '/placeholder.svg', 5670, 89),
('44444444-4444-4444-4444-444444444444', 'tech_guru', 'Tech Insights', 'Latest in technology and innovation 💻', 'creator', '/placeholder.svg', 12340, 67),
('55555555-5555-5555-5555-555555555555', 'fitness_pro', 'Fit Life', 'Your daily dose of fitness motivation 💪', 'creator', '/placeholder.svg', 9870, 123),
('66666666-6666-6666-6666-666666666666', 'music_maker', 'Beat Creator', 'Making music that moves you 🎵', 'creator', '/placeholder.svg', 7650, 234),
('77777777-7777-7777-7777-777777777777', 'travel_bug', 'World Wanderer', 'Exploring one destination at a time ✈️', 'creator', '/placeholder.svg', 18920, 345),
('88888888-8888-8888-8888-888888888888', 'art_studio', 'Creative Mind', 'Digital art and design tutorials 🎨', 'creator', '/placeholder.svg', 6540, 178);

-- Insert sample consumers
INSERT INTO public.profiles (id, username, display_name, bio, user_type, follower_count, following_count) VALUES
('99999999-9999-9999-9999-999999999999', 'viewer_one', 'John Doe', 'Love watching creative content!', 'consumer', 45, 234),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'content_fan', 'Sarah Smith', 'Always looking for inspiration', 'consumer', 23, 156);

-- Insert tags
INSERT INTO public.tags (name, color) VALUES
('nature', '#22c55e'),
('cooking', '#f59e0b'),
('art', '#8b5cf6'),
('technology', '#3b82f6'),
('fitness', '#ef4444'),
('music', '#ec4899'),
('travel', '#06b6d4'),
('tutorial', '#84cc16'),
('trending', '#f97316'),
('viral', '#dc2626');

-- Insert sample videos with correct column names
INSERT INTO public.videos (id, title, description, creator_id, video_url, thumbnail_url, duration, view_count, like_count, created_at) VALUES
('vid-1', 'Amazing sunset timelapse from my rooftop', 'Captured this beautiful sunset over the city skyline', '11111111-1111-1111-1111-111111111111', '/placeholder.mp4', '/sunset-timelapse.png', 45, 12500, 1200, NOW() - INTERVAL '2 days'),
('vid-2', 'Quick pasta recipe that changed my life', 'Simple 15-minute pasta that tastes amazing', '22222222-2222-2222-2222-222222222222', '/placeholder.mp4', '/cooking-pasta.png', 83, 8300, 892, NOW() - INTERVAL '1 day'),
('vid-3', 'Street art discovery in downtown', 'Found this incredible mural during my morning walk', '33333333-3333-3333-3333-333333333333', '/placeholder.mp4', '/street-art-graffiti.png', 38, 5700, 634, NOW() - INTERVAL '3 hours'),
('vid-4', 'Latest iPhone features you missed', 'Hidden features that will change how you use your phone', '44444444-4444-4444-4444-444444444444', '/placeholder.mp4', '/placeholder.svg', 125, 15600, 1890, NOW() - INTERVAL '5 hours'),
('vid-5', '5-minute morning workout routine', 'Start your day with energy and strength', '55555555-5555-5555-5555-555555555555', '/placeholder.mp4', '/placeholder.svg', 300, 9870, 1234, NOW() - INTERVAL '1 day'),
('vid-6', 'Creating beats with everyday objects', 'Making music from sounds around the house', '66666666-6666-6666-6666-666666666666', '/placeholder.mp4', '/placeholder.svg', 156, 7650, 987, NOW() - INTERVAL '6 hours'),
('vid-7', 'Hidden gems in Tokyo you must visit', 'Secret spots locals love but tourists miss', '77777777-7777-7777-7777-777777777777', '/placeholder.mp4', '/placeholder.svg', 245, 18920, 2340, NOW() - INTERVAL '12 hours'),
('vid-8', 'Digital art process: From sketch to finish', 'Watch me create a character design from start to end', '88888888-8888-8888-8888-888888888888', '/placeholder.mp4', '/placeholder.svg', 420, 6540, 876, NOW() - INTERVAL '8 hours'),
('vid-9', 'Mountain hiking adventure', 'Epic sunrise hike in the Rocky Mountains', '11111111-1111-1111-1111-111111111111', '/placeholder.mp4', '/placeholder.svg', 180, 11200, 1456, NOW() - INTERVAL '3 days'),
('vid-10', 'Dessert in 3 ingredients', 'The easiest chocolate mousse recipe ever', '22222222-2222-2222-2222-222222222222', '/placeholder.mp4', '/placeholder.svg', 67, 9200, 1123, NOW() - INTERVAL '2 days');

-- Insert video tags
INSERT INTO public.video_tags (video_id, tag_id) VALUES
('vid-1', (SELECT id FROM tags WHERE name = 'nature')),
('vid-1', (SELECT id FROM tags WHERE name = 'trending')),
('vid-2', (SELECT id FROM tags WHERE name = 'cooking')),
('vid-2', (SELECT id FROM tags WHERE name = 'tutorial')),
('vid-3', (SELECT id FROM tags WHERE name = 'art')),
('vid-3', (SELECT id FROM tags WHERE name = 'viral')),
('vid-4', (SELECT id FROM tags WHERE name = 'technology')),
('vid-4', (SELECT id FROM tags WHERE name = 'tutorial')),
('vid-5', (SELECT id FROM tags WHERE name = 'fitness')),
('vid-5', (SELECT id FROM tags WHERE name = 'trending')),
('vid-6', (SELECT id FROM tags WHERE name = 'music')),
('vid-6', (SELECT id FROM tags WHERE name = 'tutorial')),
('vid-7', (SELECT id FROM tags WHERE name = 'travel')),
('vid-7', (SELECT id FROM tags WHERE name = 'viral')),
('vid-8', (SELECT id FROM tags WHERE name = 'art')),
('vid-8', (SELECT id FROM tags WHERE name = 'tutorial')),
('vid-9', (SELECT id FROM tags WHERE name = 'nature')),
('vid-9', (SELECT id FROM tags WHERE name = 'travel')),
('vid-10', (SELECT id FROM tags WHERE name = 'cooking')),
('vid-10', (SELECT id FROM tags WHERE name = 'viral'));

-- Insert sample comments
INSERT INTO public.comments (video_id, user_id, content, created_at) VALUES
('vid-1', '99999999-9999-9999-9999-999999999999', 'Absolutely stunning! The colors are incredible 😍', NOW() - INTERVAL '1 day'),
('vid-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'This makes me want to start photography!', NOW() - INTERVAL '12 hours'),
('vid-2', '99999999-9999-9999-9999-999999999999', 'Made this tonight and it was amazing! Thanks for sharing', NOW() - INTERVAL '6 hours'),
('vid-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Street art like this is why I love the city', NOW() - INTERVAL '2 hours'),
('vid-4', '99999999-9999-9999-9999-999999999999', 'Had no idea about these features! Mind blown 🤯', NOW() - INTERVAL '4 hours'),
('vid-5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Perfect for my morning routine. Short and effective!', NOW() - INTERVAL '18 hours');

-- Insert sample ratings
INSERT INTO public.video_ratings (video_id, user_id, rating, created_at) VALUES
('vid-1', '99999999-9999-9999-9999-999999999999', 5, NOW() - INTERVAL '1 day'),
('vid-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, NOW() - INTERVAL '12 hours'),
('vid-2', '99999999-9999-9999-9999-999999999999', 4, NOW() - INTERVAL '6 hours'),
('vid-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, NOW() - INTERVAL '2 hours'),
('vid-4', '99999999-9999-9999-9999-999999999999', 4, NOW() - INTERVAL '4 hours'),
('vid-5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, NOW() - INTERVAL '18 hours');

-- Insert sample follow relationships (only if user_follows table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_follows') THEN
        INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
        ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days'),
        ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days'),
        ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 days'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '6 hours');
    END IF;
END $$;
