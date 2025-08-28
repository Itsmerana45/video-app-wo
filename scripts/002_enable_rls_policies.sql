-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Videos policies
CREATE POLICY "videos_select_all" ON public.videos FOR SELECT USING (true);
CREATE POLICY "videos_insert_own" ON public.videos FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "videos_update_own" ON public.videos FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "videos_delete_own" ON public.videos FOR DELETE USING (auth.uid() = creator_id);

-- Video tags policies
CREATE POLICY "video_tags_select_all" ON public.video_tags FOR SELECT USING (true);
CREATE POLICY "video_tags_insert_creator" ON public.video_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.videos WHERE id = video_id AND creator_id = auth.uid()));
CREATE POLICY "video_tags_update_creator" ON public.video_tags FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.videos WHERE id = video_id AND creator_id = auth.uid()));
CREATE POLICY "video_tags_delete_creator" ON public.video_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.videos WHERE id = video_id AND creator_id = auth.uid()));

-- Comments policies
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_authenticated" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Video ratings policies
CREATE POLICY "video_ratings_select_all" ON public.video_ratings FOR SELECT USING (true);
CREATE POLICY "video_ratings_insert_authenticated" ON public.video_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "video_ratings_update_own" ON public.video_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "video_ratings_delete_own" ON public.video_ratings FOR DELETE USING (auth.uid() = user_id);

-- Video likes policies
CREATE POLICY "video_likes_select_all" ON public.video_likes FOR SELECT USING (true);
CREATE POLICY "video_likes_insert_authenticated" ON public.video_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "video_likes_delete_own" ON public.video_likes FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "comment_likes_select_all" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_authenticated" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_update_own" ON public.comment_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete_own" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);
