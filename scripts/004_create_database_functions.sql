-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET like_count = like_count + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement video likes
CREATE OR REPLACE FUNCTION decrement_video_likes(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get video analytics
CREATE OR REPLACE FUNCTION get_video_analytics(creator_user_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_likes BIGINT,
  total_videos BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(v.view_count), 0) as total_views,
    COALESCE(SUM(v.like_count), 0) as total_likes,
    COUNT(v.id) as total_videos,
    COALESCE(AVG(r.rating), 0) as avg_rating
  FROM videos v
  LEFT JOIN video_ratings r ON v.id = r.video_id
  WHERE v.creator_id = creator_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
