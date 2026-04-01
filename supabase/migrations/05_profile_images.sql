-- Adiciona coluna de avatar_url na tabela de usuários
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Criação do Bucket de Avatares (Caso não exista)
-- Nota: A criação de buckets via SQL depende da versão do Supabase. 
-- Geralmente é feito via dashboard ou CLI, mas aqui garantimos o RLS.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para o Bucket de Avatares
-- Qualquer um pode ver avatares públicos
CREATE POLICY "Avatares públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Apenas o dono pode fazer upload/update no seu próprio diretório
CREATE POLICY "Upload de avatar próprio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Update de avatar próprio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Delete de avatar próprio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
