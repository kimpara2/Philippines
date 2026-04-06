-- stores テーブルに採用情報フィールドを追加
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS recruit_enabled   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recruit_title     TEXT,
  ADD COLUMN IF NOT EXISTS recruit_salary    TEXT,
  ADD COLUMN IF NOT EXISTS recruit_hours     TEXT,
  ADD COLUMN IF NOT EXISTS recruit_benefits  TEXT,
  ADD COLUMN IF NOT EXISTS recruit_pr        TEXT;

-- 応募テーブル
CREATE TABLE IF NOT EXISTS public.applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age         TEXT,
  phone       TEXT NOT NULL,
  email       TEXT,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 有効化
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 誰でも応募を投稿できる
CREATE POLICY "Anyone can apply"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- 店舗オーナーは自分の店の応募を閲覧できる
CREATE POLICY "Store owner can view own applications"
  ON public.applications FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- 店舗オーナーは既読フラグを更新できる
CREATE POLICY "Store owner can update own applications"
  ON public.applications FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- サイト管理者はすべて閲覧・操作できる
CREATE POLICY "Admin full access to applications"
  ON public.applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
