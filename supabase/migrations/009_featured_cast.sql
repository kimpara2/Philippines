-- cast_members テーブルに「おすすめ」フラグを追加
ALTER TABLE public.cast_members
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
