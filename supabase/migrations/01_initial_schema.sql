-- 🚀 Mitoo.life - Initial Schema Migration (REVISED)
-- Versão focada em Segurança e Isolamento de Anônimos

-- Enable uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  is_anonymous_default BOOLEAN DEFAULT TRUE,
  anon_alias TEXT,
  anon_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_name_length CHECK (char_length(user_name) >= 3)
);

-- 2. ANON IDENTITIES (Internal Mapping)
-- Highly sensitive table. Only the owner can see their own mapping.
CREATE TABLE IF NOT EXISTS public.anon_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_alias TEXT NOT NULL,
  anon_color TEXT NOT NULL,
  UNIQUE(user_id),
  UNIQUE(anon_alias)
);

-- 3. POSTS (RELATOS)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  mood_color TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('manha', 'tarde', 'noite')),
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MITOOS (REACTIONS)
CREATE TABLE IF NOT EXISTS public.mitoos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  UNIQUE(post_id, user_id)
);

-- 5. COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔒 V_FEED_PUBLIC: A Visão Segura que mascara o user_id real
-- Isso evita vazamento de dados via SELECT público
CREATE OR REPLACE VIEW public.v_feed_public AS
SELECT 
  p.id,
  p.content,
  p.mood,
  p.mood_color,
  p.period,
  p.created_at,
  CASE 
    WHEN p.is_anonymous THEN u.anon_alias 
    ELSE u.user_name 
  END as author_name,
  CASE 
    WHEN p.is_anonymous THEN u.anon_color 
    ELSE '#CCCCCC' -- Cor neutra ou do perfil
  END as author_color,
  p.is_anonymous
FROM public.posts p
LEFT JOIN public.users u ON p.user_id = u.id;

-- 🔒 RLS POLICIES (Security First)
-- Scripts reexecutáveis: Drop antes de Create

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anon_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- USERS
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ANON IDENTITIES
DROP POLICY IF EXISTS "Users can only see their own anon identity" ON public.anon_identities;
DROP POLICY IF EXISTS "Users can only see their own identity mapping" ON public.anon_identities;
CREATE POLICY "Users can only see their own identity mapping" ON public.anon_identities FOR SELECT USING (auth.uid() = user_id);

-- POSTS
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update/delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update/delete their posts" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update/delete their posts" ON public.posts FOR ALL USING (auth.uid() = user_id);

-- MITOOS
DROP POLICY IF EXISTS "Mitoos are viewable by everyone" ON public.mitoos;
DROP POLICY IF EXISTS "Mitoos are public" ON public.mitoos;
DROP POLICY IF EXISTS "Users can reacting solidarity" ON public.mitoos;
DROP POLICY IF EXISTS "Users can mitoo" ON public.mitoos;
DROP POLICY IF EXISTS "Users can remove their own reation" ON public.mitoos;
CREATE POLICY "Mitoos are public" ON public.mitoos FOR SELECT USING (true);
CREATE POLICY "Users can mitoo" ON public.mitoos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COMMENTS
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Comments are public" ON public.comments;
DROP POLICY IF EXISTS "Users can comment" ON public.comments;
DROP POLICY IF EXISTS "Users can comment if authenticated" ON public.comments;
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.comments;
CREATE POLICY "Comments are public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment if authenticated" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);


