-- Add dummy users and creators
INSERT INTO profiles (id, username, display_name, email, bio, avatar_url, user_type, created_at) VALUES
-- Regular consumers
-- Fixed user_type from 'user' to 'consumer' to match check constraint
('11111111-1111-1111-1111-111111111111', 'sarah_dance', 'Sarah Martinez', 'sarah@example.com', '💃 Dance enthusiast | Choreographer | Spreading joy through movement', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'consumer', NOW() - INTERVAL '3 months'),
('22222222-2222-2222-2222-222222222222', 'tech_mike', 'Mike Chen', 'mike@example.com', '🔧 Tech reviewer | Gadget lover | Making tech simple for everyone', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'consumer', NOW() - INTERVAL '2 months'),
('33333333-3333-3333-3333-333333333333', 'cooking_emma', 'Emma Rodriguez', 'emma@example.com', '👩‍🍳 Home chef | Quick recipes | Food is love made visible', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'consumer', NOW() - INTERVAL '4 months'),

-- Creators
('44444444-4444-4444-4444-444444444444', 'fitness_alex', 'Alex Johnson', 'alex@example.com', '💪 Certified trainer | Fitness motivation | Transform your body and mind', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '6 months'),
('55555555-5555-5555-5555-555555555555', 'art_sophia', 'Sophia Kim', 'sophia@example.com', '🎨 Digital artist | Speed painting | Creating magic one pixel at a time', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '5 months'),
('66666666-6666-6666-6666-666666666666', 'music_david', 'David Thompson', 'david@example.com', '🎵 Music producer | Beat maker | Turning sounds into emotions', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '8 months'),

-- Added more creators for better variety in explore/trending sections
('77777777-7777-7777-7777-777777777777', 'comedy_jake', 'Jake Wilson', 'jake@example.com', '😂 Stand-up comedian | Making people laugh one joke at a time', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '7 months'),
('88888888-8888-8888-8888-888888888888', 'travel_lisa', 'Lisa Chang', 'lisa@example.com', '✈️ Travel blogger | Adventure seeker | Exploring the world one city at a time', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '9 months'),
('99999999-9999-9999-9999-999999999999', 'gaming_ryan', 'Ryan Parker', 'ryan@example.com', '🎮 Pro gamer | Streaming daily | Level up your gaming skills', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', 'creator', NOW() - INTERVAL '1 year');

-- Add dummy videos
-- Fixed column names from 'views' and 'likes' to 'view_count' and 'like_count' to match schema
INSERT INTO videos (id, title, description, video_url, thumbnail_url, creator_id, duration, view_count, like_count, created_at) VALUES
-- Sarah's dance videos
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Viral Dance Challenge 2024', 'Learn the hottest dance moves that are taking over social media! Perfect for beginners.', '/dance-challenge-viral-moves.png', '/dance-challenge.png', '11111111-1111-1111-1111-111111111111', 45, 125000, 8500, NOW() - INTERVAL '2 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hip Hop Basics Tutorial', 'Master the fundamentals of hip hop dance with this step-by-step tutorial.', '/sunset-timelapse.png', '/dance-challenge.png', '11111111-1111-1111-1111-111111111111', 120, 89000, 6200, NOW() - INTERVAL '1 week'),

-- Mike's tech videos
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'iPhone 15 Pro Unboxing & Review', 'First look at the new iPhone 15 Pro! Is it worth the upgrade?', '/iphone-15-pro-unboxing-tech.png', '/tech-gadgets-review.png', '22222222-2222-2222-2222-222222222222', 180, 234000, 12400, NOW() - INTERVAL '3 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Best Budget Headphones 2024', 'Top 5 headphones under $100 that sound amazing!', '/cooking-pasta.png', '/tech-gadgets-review.png', '22222222-2222-2222-2222-222222222222', 95, 156000, 9800, NOW() - INTERVAL '5 days'),

-- Emma's cooking videos
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '5-Minute Pasta Recipe', 'Quick and delicious pasta recipe for busy weeknights!', '/cooking-pasta.png', '/cooking-pasta.png', '33333333-3333-3333-3333-333333333333', 300, 78000, 5600, NOW() - INTERVAL '1 day'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Healthy Breakfast Ideas', 'Start your day right with these nutritious and tasty breakfast options.', '/street-art-graffiti.png', '/cooking-pasta.png', '33333333-3333-3333-3333-333333333333', 240, 92000, 7100, NOW() - INTERVAL '4 days'),

-- Alex's fitness videos
('gggggggg-gggg-gggg-gggg-gggggggggggg', '10-Minute Morning Workout', 'Energize your day with this quick full-body workout routine!', '/sunset-timelapse.png', '/funny-pets-compilation.png', '44444444-4444-4444-4444-444444444444', 600, 187000, 14200, NOW() - INTERVAL '6 days'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Home Gym Setup Guide', 'Build the perfect home gym on any budget with these essential tips.', '/dance-challenge-viral-moves.png', '/funny-pets-compilation.png', '44444444-4444-4444-4444-444444444444', 420, 143000, 10800, NOW() - INTERVAL '1 week'),

-- Sophia's art videos
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Digital Portrait Speed Paint', 'Watch me create a realistic portrait from sketch to finish in 60 seconds!', '/street-art-graffiti.png', '/street-art-graffiti.png', '55555555-5555-5555-5555-555555555555', 60, 98000, 7800, NOW() - INTERVAL '2 days'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Beginner Digital Art Tips', 'Essential tips for anyone starting their digital art journey.', '/iphone-15-pro-unboxing-tech.png', '/street-art-graffiti.png', '55555555-5555-5555-5555-555555555555', 480, 67000, 5200, NOW() - INTERVAL '1 week'),

-- David's music videos
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Beat Making Tutorial', 'Learn how to create professional beats using free software!', '/funny-pets-compilation.png', '/tech-gadgets-review.png', '66666666-6666-6666-6666-666666666666', 360, 112000, 8900, NOW() - INTERVAL '3 days'),
('llllllll-llll-llll-llll-llllllllllll', 'Lo-Fi Hip Hop Production', 'Step-by-step guide to creating chill lo-fi beats for studying.', '/dance-challenge.png', '/tech-gadgets-review.png', '66666666-6666-6666-6666-666666666666', 540, 89000, 6700, NOW() - INTERVAL '5 days'),

-- Added more videos for trending and explore sections
-- Jake's comedy videos
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Stand-Up Comedy Special', 'My latest stand-up routine about everyday life struggles!', '/sunset-timelapse.png', '/funny-pets-compilation.png', '77777777-7777-7777-7777-777777777777', 1200, 345000, 23400, NOW() - INTERVAL '1 day'),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'Funny Pet Compilation', 'The funniest pet moments that will make you laugh out loud!', '/funny-pets-compilation.png', '/funny-pets-compilation.png', '77777777-7777-7777-7777-777777777777', 480, 567000, 45600, NOW() - INTERVAL '3 hours'),

-- Lisa's travel videos
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'Tokyo Street Food Tour', 'Exploring the best street food in Tokyo! Must-try dishes and hidden gems.', '/cooking-pasta.png', '/street-art-graffiti.png', '88888888-8888-8888-8888-888888888888', 720, 234000, 18900, NOW() - INTERVAL '2 days'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Bali Sunset Timelapse', 'Breathtaking sunset views from the cliffs of Bali in 4K!', '/sunset-timelapse.png', '/sunset-timelapse.png', '88888888-8888-8888-8888-888888888888', 180, 189000, 15600, NOW() - INTERVAL '4 days'),

-- Ryan's gaming videos
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Epic Gaming Montage 2024', 'The most insane gaming moments and clutch plays of the year!', '/dance-challenge-viral-moves.png', '/tech-gadgets-review.png', '99999999-9999-9999-9999-999999999999', 420, 456000, 34500, NOW() - INTERVAL '1 day'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'Gaming Setup Tour', 'Check out my ultimate gaming setup worth $10,000!', '/iphone-15-pro-unboxing-tech.png', '/tech-gadgets-review.png', '99999999-9999-9999-9999-999999999999', 600, 298000, 21700, NOW() - INTERVAL '6 days');

-- Added video tags for better categorization and trending/explore functionality
INSERT INTO video_tags (video_id, tag) VALUES
-- Dance videos
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dance'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'viral'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tutorial'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dance'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hiphop'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tutorial'),

-- Tech videos
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'tech'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'review'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'iphone'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'tech'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'review'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'budget'),

-- Cooking videos
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cooking'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'recipe'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'quick'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cooking'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'healthy'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'breakfast'),

-- Fitness videos
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'fitness'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'workout'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'morning'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'fitness'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'gym'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'guide'),

-- Art videos
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'art'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'digital'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'speedpaint'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'art'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'tutorial'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'beginner'),

-- Music videos
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'music'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'beats'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'tutorial'),
('llllllll-llll-llll-llll-llllllllllll', 'music'),
('llllllll-llll-llll-llll-llllllllllll', 'lofi'),
('llllllll-llll-llll-llll-llllllllllll', 'production'),

-- Comedy videos
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'comedy'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'standup'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'funny'),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'comedy'),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'pets'),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'compilation'),

-- Travel videos
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'travel'),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'food'),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'tokyo'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'travel'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'timelapse'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'bali'),

-- Gaming videos
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'gaming'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'montage'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'epic'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'gaming'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'setup'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'tour');

-- Add some user follows
INSERT INTO user_follows (follower_id, following_id, created_at) VALUES
-- Current user following creators (assuming current user has a different ID)
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 month'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 weeks'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 weeks'),
('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 week'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),
('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 month'),
('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '3 days'),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 weeks'),
-- Added more follows for new creators
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 week'),
('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '2 weeks'),
('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '3 days'),
('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '1 month'),
('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '2 weeks'),
('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 week');

-- Add some video likes
INSERT INTO video_likes (user_id, video_id, created_at) VALUES
-- Various users liking different videos
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'gggggggg-gggg-gggg-gggg-gggggggggggg', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '6 hours'),
('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '3 days'),
('44444444-4444-4444-4444-444444444444', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', NOW() - INTERVAL '1 day'),
('55555555-5555-5555-5555-555555555555', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', NOW() - INTERVAL '2 days'),
('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '4 hours'),
-- Added more likes for trending videos
('77777777-7777-7777-7777-777777777777', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', NOW() - INTERVAL '2 hours'),
('88888888-8888-8888-8888-888888888888', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', NOW() - INTERVAL '1 day'),
('99999999-9999-9999-9999-999999999999', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', NOW() - INTERVAL '3 hours'),
('11111111-1111-1111-1111-111111111111', 'oooooooo-oooo-oooo-oooo-oooooooooooo', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'pppppppp-pppp-pppp-pppp-pppppppppppp', NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', NOW() - INTERVAL '4 days');

-- Add some comments
INSERT INTO comments (id, video_id, user_id, content, created_at) VALUES
('comment1-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'This dance is so addictive! Learned it in 10 minutes 🔥', NOW() - INTERVAL '1 day'),
('comment2-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Sarah you are amazing! Can you do a slower tutorial?', NOW() - INTERVAL '18 hours'),
('comment3-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Great review Mike! Definitely getting this phone now', NOW() - INTERVAL '2 days'),
('comment4-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'Made this for dinner tonight - absolutely delicious! 😋', NOW() - INTERVAL '12 hours'),
('comment5-5555-5555-5555-555555555555', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '55555555-5555-5555-5555-555555555555', 'Perfect morning routine! Feeling energized already 💪', NOW() - INTERVAL '5 hours'),
('comment6-6666-6666-6666-666666666666', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '66666666-6666-6666-6666-666666666666', 'Your art style is incredible! What brushes do you use?', NOW() - INTERVAL '1 day'),
('comment7-7777-7777-7777-777777777777', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '11111111-1111-1111-1111-111111111111', 'This beat is fire! 🔥 Can I use it for my dance videos?', NOW() - INTERVAL '2 days'),
('comment8-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Just ordered the second pair you recommended. Thanks!', NOW() - INTERVAL '1 day'),
-- Added more comments for new videos
('comment9-9999-9999-9999-999999999999', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', '44444444-4444-4444-4444-444444444444', 'I can\'t stop laughing! This is pure gold 😂', NOW() - INTERVAL '2 hours'),
('comment10-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '55555555-5555-5555-5555-555555555555', 'Those clutch plays were insane! How do you do it?', NOW() - INTERVAL '6 hours'),
('comment11-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '66666666-6666-6666-6666-666666666666', 'Best comedy special I\'ve seen this year! More please!', NOW() - INTERVAL '4 hours'),
('comment12-cccc-cccc-cccc-cccccccccccc', 'oooooooo-oooo-oooo-oooo-oooooooooooo', '77777777-7777-7777-7777-777777777777', 'Now I\'m craving Japanese food! Great recommendations', NOW() - INTERVAL '1 day'),
('comment13-dddd-dddd-dddd-dddddddddddd', 'pppppppp-pppp-pppp-pppp-pppppppppppp', '88888888-8888-8888-8888-888888888888', 'Absolutely breathtaking! Bali is definitely on my bucket list now', NOW() - INTERVAL '3 days'),
('comment14-eeee-eeee-eeee-eeeeeeeeeeee', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '99999999-9999-9999-9999-999999999999', 'That setup is a dream! Goals right there 🎮', NOW() - INTERVAL '5 days');

-- Added video ratings for better recommendation system
INSERT INTO video_ratings (video_id, user_id, rating, created_at) VALUES
-- High ratings for trending videos
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', '11111111-1111-1111-1111-111111111111', 5, NOW() - INTERVAL '2 hours'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '22222222-2222-2222-2222-222222222222', 5, NOW() - INTERVAL '1 day'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '33333333-3333-3333-3333-333333333333', 5, NOW() - INTERVAL '3 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 4, NOW() - INTERVAL '1 day'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 5, NOW() - INTERVAL '2 days'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '66666666-6666-6666-6666-666666666666', 4, NOW() - INTERVAL '5 hours'),
('oooooooo-oooo-oooo-oooo-oooooooooooo', '77777777-7777-7777-7777-777777777777', 5, NOW() - INTERVAL '1 day'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '88888888-8888-8888-8888-888888888888', 4, NOW() - INTERVAL '3 days'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '99999999-9999-9999-9999-999999999999', 4, NOW() - INTERVAL '5 days'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '11111111-1111-1111-1111-111111111111', 5, NOW() - INTERVAL '1 day'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '22222222-2222-2222-2222-222222222222', 4, NOW() - INTERVAL '2 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 5, NOW() - INTERVAL '6 hours');
