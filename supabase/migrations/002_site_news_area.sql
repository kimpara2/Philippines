-- site_newsテーブルにareaカラムを追加
-- NULL = 全国向け記事（エリアページには表示しない）
-- 値あり（例: "新宿"）= 該当エリアページにも表示

ALTER TABLE public.site_news ADD COLUMN IF NOT EXISTS area TEXT;
