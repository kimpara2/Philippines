-- 店舗ランキングテーブル
CREATE TABLE IF NOT EXISTS public.store_rankings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  area TEXT NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area, rank),
  UNIQUE(area, store_id)
);

-- RLS有効化
ALTER TABLE public.store_rankings ENABLE ROW LEVEL SECURITY;

-- 誰でも読める
CREATE POLICY "rankings_public_read" ON public.store_rankings
  FOR SELECT USING (true);

-- adminのみ書き込める
CREATE POLICY "rankings_admin_write" ON public.store_rankings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
