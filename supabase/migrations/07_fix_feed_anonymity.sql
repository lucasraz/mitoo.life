-- 🛡️ Mitoo.life - Security Fix: Feed Anonymity
-- CVE-1: author_id (UUID real) estava exposto mesmo em posts anônimos.
-- Correção: author_id retorna NULL para posts anônimos.
-- CVE-2: Adicionando CHECK constraints de tamanho no conteúdo de posts e comentários.

-- =====================================================
-- FIX-1: Recria a view ocultando author_id em posts anônimos
-- =====================================================

DROP VIEW IF EXISTS public.v_feed_public;

CREATE VIEW public.v_feed_public AS
SELECT
  p.id,
  p.content,
  p.mood,
  p.mood_color,
  p.period,
  p.created_at,
  -- 🛡️ CORREÇÃO DE SEGURANÇA: author_id só é exposto para posts NÃO anônimos.
  -- Posts anônimos retornam NULL para evitar correlação de identidade.
  CASE WHEN p.is_anonymous THEN NULL ELSE p.user_id END AS author_id,
  CASE
    WHEN p.is_anonymous THEN u.anon_alias
    ELSE u.user_name
  END AS author_name,
  CASE
    WHEN p.is_anonymous THEN u.anon_color
    ELSE '#CCCCCC'
  END AS author_color,
  p.is_anonymous,
  u.avatar_url AS author_avatar_url,
  u.bio AS author_bio,
  (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id) AS comment_count,
  (SELECT COUNT(*) FROM public.mitoos m WHERE m.post_id = p.id) AS mitoo_count
FROM public.posts p
LEFT JOIN public.users u ON p.user_id = u.id;

-- Garante que todos possam ler o feed
GRANT SELECT ON public.v_feed_public TO anon, authenticated;

-- =====================================================
-- FIX-2: CHECK constraints de tamanho no conteúdo (DoS prevention)
-- =====================================================

-- Posts: entre 1 e 1000 caracteres (evita conteúdo vazio e payloads gigantes)
ALTER TABLE public.posts
  ADD CONSTRAINT IF NOT EXISTS posts_content_length
  CHECK (char_length(trim(content)) BETWEEN 1 AND 1000);

-- Comentários: entre 1 e 500 caracteres
ALTER TABLE public.comments
  ADD CONSTRAINT IF NOT EXISTS comments_content_length
  CHECK (char_length(trim(content)) BETWEEN 1 AND 500);
