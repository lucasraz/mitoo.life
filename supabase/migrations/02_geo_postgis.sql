-- 🌍 Mitoo.life - Geo-referencing & Global Mood Map Migration
-- Habilita PostGIS para consultas espaciais de alta performance

-- 1. Ativar Extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Adicionar Coluna de Localização na tabela posts
-- Usamos 'geography' para cálculos precisos na esfera da Terra (metros)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS location geography(POINT, 4321);

-- 3. Índice Espacial para performance no botão "Próximos a Você"
CREATE INDEX IF NOT EXISTS posts_location_idx ON public.posts USING GIST (location);

-- 4. Função RPC para o botão "Próximos a Você"
-- Retorna posts num raio de X metros de uma coordenada
CREATE OR REPLACE FUNCTION public.get_posts_near_me(
  lat float,
  lng float,
  radius_meters float
)
RETURNS TABLE (
  id uuid,
  content text,
  mood text,
  mood_color text,
  period text,
  created_at timestamptz,
  dist_meters float
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, content, mood, mood_color, period, created_at,
    ST_Distance(location, ST_SetSRID(ST_MakePoint(lng, lat), 4321)::geography) as dist_meters
  FROM public.posts
  WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat), 4321)::geography, radius_meters)
  ORDER BY dist_meters ASC;
$$;

-- 🛡️ Regra de Privacidade do Mapa:
-- Criar uma função para o mapa que apenas agrupa contagens por região (Clustering Seguro)
CREATE OR REPLACE FUNCTION public.get_mood_clusters(
  min_lat float,
  min_lng float,
  max_lat float,
  max_lng float,
  grid_size float DEFAULT 0.01 -- Aproximadamente 1km
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
