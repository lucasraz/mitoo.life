-- 🚀 Atualização da View de Feed Publico (v1.2)
-- Adiciona Foto de Perfil, Contagem de Comentários e Contagem de Mitoos.
-- Nota: Deletamos e recriamos para evitar erros de alteração de estrutura no Postgres.

DROP VIEW IF EXISTS public.v_feed_public;

CREATE VIEW public.v_feed_public AS
SELECT 
  p.id,
  p.content,
  p.mood,
  p.mood_color,
  p.period,
  p.created_at,
  p.user_id as author_id,
  CASE 
    WHEN p.is_anonymous THEN u.anon_alias 
    ELSE u.user_name 
  END as author_name,
  CASE 
    WHEN p.is_anonymous THEN u.anon_color 
    ELSE '#CCCCCC' 
  END as author_color,
  p.is_anonymous,
  u.avatar_url as author_avatar_url,
  u.bio as author_bio,
  (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id) as comment_count,
  (SELECT COUNT(*) FROM public.mitoos m WHERE m.post_id = p.id) as mitoo_count
FROM public.posts p
LEFT JOIN public.users u ON p.user_id = u.id;

-- Garante que todos possam ler o feed novamente
GRANT SELECT ON public.v_feed_public TO anon, authenticated;
