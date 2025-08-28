-- Create a function to get profile by ID to bypass schema cache issues
CREATE OR REPLACE FUNCTION get_profile_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  display_name TEXT,
  user_type TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.display_name,
    p.user_type,
    p.avatar_url,
    p.bio,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_profile_by_id(UUID) TO authenticated;
