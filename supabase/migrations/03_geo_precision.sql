-- 🌍 Mitoo.life - Aumento de Precisão Geo & Refinamento de Anonimato
-- Reduzindo a grade de clustering para ~500m para melhor visibilidade

CREATE OR REPLACE FUNCTION public.get_mood_clusters(
  min_lat float,
  min_lng float,
  max_lat float,
  max_lng float,
  grid_size float DEFAULT 0.005 -- Aprox 500m (Mais preciso que 2km)
)
RETURNS TABLE (
  lat_cluster float,
  lng_cluster float,
  mood text,
  total bigint
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    round(ST_Y(location::geometry) / grid_size) * grid_size as lat_cluster,
    round(ST_X(location::geometry) / grid_size) * grid_size as lng_cluster,
    mood,
    count(*) as total
  FROM public.posts
  WHERE ST_X(location::geometry) BETWEEN min_lng AND max_lng
    AND ST_Y(location::geometry) BETWEEN min_lat AND max_lat
  GROUP BY lat_cluster, lng_cluster, mood;
$$;
