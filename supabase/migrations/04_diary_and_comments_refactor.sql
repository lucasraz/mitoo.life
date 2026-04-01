-- 🚀 Mitoo.life - Diary Module & Comments Refactor
-- Adiciona suporte ao Diário e permite comentários tanto em Posts quanto em Entradas de Diário

-- 1. DIARIES TABLE
CREATE TABLE IF NOT EXISTS public.diaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  mood_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_diary_per_user UNIQUE(user_id)
);

-- 2. DIARY ENTRIES
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_id UUID NOT NULL REFERENCES public.diaries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  mood_color TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('manha', 'tarde', 'noite')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DIARY REACTIONS
CREATE TABLE IF NOT EXISTS public.diary_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'mitoo', -- mitoo | emoji contextual
  is_anonymous BOOLEAN DEFAULT TRUE,
  UNIQUE(entry_id, user_id)
);

-- 4. DIARY FOLLOWERS
CREATE TABLE IF NOT EXISTS public.diary_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_id UUID REFERENCES public.diaries(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT TRUE,
  UNIQUE(diary_id, follower_id)
);

-- 5. REFACTOR COMMENTS TABLE (Add support for Diary Entries)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='diary_entry_id') THEN
        ALTER TABLE public.comments ADD COLUMN diary_entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE;
        
        -- Agora post_id é opcional se diary_entry_id estiver preenchido
        ALTER TABLE public.comments ALTER COLUMN post_id DROP NOT NULL;
        
        -- Constraint para garantir que o comentário pertence a um ou outro
        ALTER TABLE public.comments ADD CONSTRAINT comment_target_check 
            CHECK ((post_id IS NOT NULL AND diary_entry_id IS NULL) OR (post_id IS NULL AND diary_entry_id IS NOT NULL));
    END IF;
END $$;

-- 🛡️ RLS POLICIES FOR DIARY MODULE

ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_followers ENABLE ROW LEVEL SECURITY;

-- DIARIES
DROP POLICY IF EXISTS "Diaries are viewable by everyone" ON public.diaries;
DROP POLICY IF EXISTS "Users can create their own diary" ON public.diaries;
DROP POLICY IF EXISTS "Users can update/delete their own diary" ON public.diaries;
CREATE POLICY "Diaries are viewable by everyone" ON public.diaries FOR SELECT USING (true);
CREATE POLICY "Users can create their own diary" ON public.diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update/delete their own diary" ON public.diaries FOR ALL USING (auth.uid() = user_id);

-- DIARY ENTRIES
DROP POLICY IF EXISTS "Entries are viewable by everyone" ON public.diary_entries;
DROP POLICY IF EXISTS "Owners can create entries" ON public.diary_entries;
CREATE POLICY "Entries are viewable by everyone" ON public.diary_entries FOR SELECT USING (true);
CREATE POLICY "Owners can create entries" ON public.diary_entries FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diaries 
    WHERE id = diary_id AND user_id = auth.uid()
  )
);

-- DIARY REACTIONS
DROP POLICY IF EXISTS "Diary reactions are public" ON public.diary_reactions;
DROP POLICY IF EXISTS "Users can react to entries" ON public.diary_reactions;
CREATE POLICY "Diary reactions are public" ON public.diary_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react to entries" ON public.diary_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DIARY FOLLOWERS
DROP POLICY IF EXISTS "Diary followers are public" ON public.diary_followers;
DROP POLICY IF EXISTS "Users can follow diaries" ON public.diary_followers;
CREATE POLICY "Diary followers are public" ON public.diary_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow diaries" ON public.diary_followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.diary_followers FOR DELETE USING (auth.uid() = follower_id);
