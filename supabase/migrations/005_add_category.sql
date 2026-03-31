-- 店舗にカテゴリカラムを追加
-- カテゴリ: フィリピンパブ / スナック / ガールズバー / バー / キャバクラ
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'フィリピンパブ';
