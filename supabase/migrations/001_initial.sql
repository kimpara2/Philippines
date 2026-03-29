-- ============================================================
-- フィリピンパブどっと混む！！ - データベース初期設定SQL
-- ============================================================
-- Supabaseのダッシュボードで「SQL Editor」を開き、
-- このファイルの内容を全てコピーして実行してください。
-- ============================================================


-- ============================================================
-- 1. テーブル作成
-- ============================================================

-- ユーザープロファイル（Supabaseの認証ユーザーと紐づく）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'shop_owner', 'shop_staff', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 店舗情報
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  description TEXT,
  area TEXT,
  address TEXT,
  phone TEXT,
  open_hours TEXT,
  regular_holiday TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  min_price INTEGER,
  max_price INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 店舗写真
CREATE TABLE IF NOT EXISTS public.store_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- キャスト（在籍スタッフ）
CREATE TABLE IF NOT EXISTS public.cast_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_kana TEXT,
  age INTEGER,
  nationality TEXT,
  description TEXT,
  profile_image_url TEXT,
  height INTEGER,
  blood_type TEXT,
  hobbies TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- キャスト写真
CREATE TABLE IF NOT EXISTS public.cast_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_id UUID NOT NULL REFERENCES public.cast_members(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 口コミ
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  visit_date DATE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  owner_reply TEXT,
  owner_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- お知らせ・イベント
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  event_date DATE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- お気に入り
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- 店舗スタッフ関係
CREATE TABLE IF NOT EXISTS public.store_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. ユーザー登録時に自動でprofilesを作成するトリガー
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

-- auth.usersに新しいユーザーが追加されたときにトリガーを発火
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. Row Level Security (RLS) の有効化
-- ============================================================
-- RLS = 「誰がどのデータを見られるか・操作できるか」のルール

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. RLSポリシーの設定（既存ポリシーを削除してから再作成）
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- stores
DROP POLICY IF EXISTS "stores_select_public" ON public.stores;
DROP POLICY IF EXISTS "stores_select_owner" ON public.stores;
DROP POLICY IF EXISTS "stores_select_admin" ON public.stores;
DROP POLICY IF EXISTS "stores_update_owner" ON public.stores;
DROP POLICY IF EXISTS "stores_update_admin" ON public.stores;
DROP POLICY IF EXISTS "stores_insert" ON public.stores;
CREATE POLICY "stores_select_public" ON public.stores
  FOR SELECT USING (is_published = true AND is_approved = true);
CREATE POLICY "stores_select_owner" ON public.stores
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "stores_select_admin" ON public.stores
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "stores_update_owner" ON public.stores
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "stores_update_admin" ON public.stores
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "stores_insert" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- store_photos
DROP POLICY IF EXISTS "store_photos_select" ON public.store_photos;
DROP POLICY IF EXISTS "store_photos_manage" ON public.store_photos;
CREATE POLICY "store_photos_select" ON public.store_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE id = store_photos.store_id AND is_published = true
    )
  );
CREATE POLICY "store_photos_manage" ON public.store_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE id = store_photos.store_id AND owner_id = auth.uid()
    )
  );

-- cast_members
DROP POLICY IF EXISTS "cast_select_public" ON public.cast_members;
DROP POLICY IF EXISTS "cast_select_owner" ON public.cast_members;
DROP POLICY IF EXISTS "cast_manage_owner" ON public.cast_members;
CREATE POLICY "cast_select_public" ON public.cast_members
  FOR SELECT USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM public.stores WHERE id = cast_members.store_id AND is_published = true)
  );
CREATE POLICY "cast_select_owner" ON public.cast_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = cast_members.store_id AND owner_id = auth.uid())
  );
CREATE POLICY "cast_manage_owner" ON public.cast_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = cast_members.store_id AND owner_id = auth.uid())
  );

-- cast_photos
DROP POLICY IF EXISTS "cast_photos_select" ON public.cast_photos;
DROP POLICY IF EXISTS "cast_photos_manage" ON public.cast_photos;
CREATE POLICY "cast_photos_select" ON public.cast_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cast_members cm
      JOIN public.stores s ON s.id = cm.store_id
      WHERE cm.id = cast_photos.cast_id AND s.is_published = true
    )
  );
CREATE POLICY "cast_photos_manage" ON public.cast_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cast_members cm
      JOIN public.stores s ON s.id = cm.store_id
      WHERE cm.id = cast_photos.cast_id AND s.owner_id = auth.uid()
    )
  );

-- reviews
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_owner" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_user" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_owner" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (is_approved = true);
CREATE POLICY "reviews_select_owner" ON public.reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = reviews.store_id AND owner_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_user" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_update_owner" ON public.reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = reviews.store_id AND owner_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- news_posts
DROP POLICY IF EXISTS "news_select" ON public.news_posts;
DROP POLICY IF EXISTS "news_manage" ON public.news_posts;
CREATE POLICY "news_select" ON public.news_posts
  FOR SELECT USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM public.stores WHERE id = news_posts.store_id AND is_published = true)
  );
CREATE POLICY "news_manage" ON public.news_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = news_posts.store_id AND owner_id = auth.uid())
  );

-- favorites
DROP POLICY IF EXISTS "favorites_select" ON public.favorites;
DROP POLICY IF EXISTS "favorites_manage" ON public.favorites;
CREATE POLICY "favorites_select" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_manage" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- store_staff
DROP POLICY IF EXISTS "store_staff_select" ON public.store_staff;
CREATE POLICY "store_staff_select" ON public.store_staff
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_staff.store_id AND owner_id = auth.uid())
  );


-- ============================================================
-- 5. Supabase Storage のバケット作成
-- ============================================================
-- ※ SQLでは作成できません。以下の手順でダッシュボードから作成してください：
--
-- Supabaseダッシュボード → Storage → New bucket で以下を作成：
-- バケット名: store-images    Public: ON（公開）
-- バケット名: cast-images     Public: ON（公開）
--
-- ============================================================


-- ============================================================
-- 6. ダミーデータ（動作確認用）
-- ============================================================

INSERT INTO public.stores (slug, name, name_kana, description, area, address, phone, open_hours, regular_holiday, min_price, max_price, is_published, is_approved) VALUES

-- 東京
('club-manila-shinjuku', 'クラブ・マニラ 新宿店', 'くらぶまにらしんじゅくてん',
 '新宿歌舞伎町の中心に位置する本格フィリピンパブ。フィリピン人キャスト20名以上在籍。毎週金曜はライブショーあり！',
 '東京', '東京都新宿区歌舞伎町1-2-3 ビル4F', '03-1234-5678', '19:00〜翌5:00', '無休', 5000, 15000, true, true),

('tropical-bar-ikebukuro', 'トロピカルバー 池袋', 'とろぴかるばーいけぶくろ',
 '池袋西口から徒歩3分。アットホームな雰囲気でフィリピン人スタッフが温かくお迎えします。初めての方も大歓迎！',
 '東京', '東京都豊島区西池袋2-5-8 第二ビル3F', '03-2345-6789', '20:00〜翌4:00', '月曜日', 4000, 10000, true, true),

('paradise-roppongi', 'パラダイス 六本木', 'ぱらだいすろっぽんぎ',
 '六本木の洗練された空間でフィリピンエンターテインメントを堪能。英語対応可。外国人のお客様も多数ご来店。',
 '東京', '東京都港区六本木3-7-1 タワービル2F', '03-3456-7890', '21:00〜翌6:00', '無休', 8000, 25000, true, true),

-- 大阪
('cebu-club-namba', 'セブクラブ なんば', 'せぶくらぶなんば',
 'なんば駅から徒歩5分。大阪随一の人気フィリピンパブ。毎晩ライブ演奏あり、キャスト30名以上の大型店舗！',
 '大阪', '大阪府大阪市中央区難波3-4-5 なんばビル5F', '06-1234-5678', '19:00〜翌4:00', '無休', 4500, 12000, true, true),

('manila-night-shinsaibashi', 'マニラナイト 心斎橋', 'まにらないとしんさいばし',
 '心斎橋のメインストリートに位置するおしゃれなフィリピンバー。女の子は全員フィリピン本国出身。',
 '大阪', '大阪府大阪市中央区心斎橋筋1-8-3 心斎橋ビル4F', '06-2345-6789', '20:00〜翌5:00', '火曜日', 5000, 13000, true, true),

-- 名古屋
('club-angeles-sakae', 'クラブ・アンヘレス 栄', 'くらぶあんへれすさかえ',
 '名古屋・栄の中心部にある老舗フィリピンパブ。創業10年の実績と信頼。常連様多数、アットホームな雰囲気。',
 '名古屋', '愛知県名古屋市中区栄3-10-5 栄第一ビル3F', '052-123-4567', '19:00〜翌3:00', '日曜日', 4000, 10000, true, true),

('pinay-bar-nagoya', 'ピナイバー 名古屋', 'ぴないばーなごや',
 '名古屋錦のネオン街に位置するフィリピンパブ。料金明朗会計で初めての方も安心。お得なセット料金あり。',
 '名古屋', '愛知県名古屋市中区錦2-15-8 錦ビル2F', '052-234-5678', '20:00〜翌4:00', '月曜日', 3500, 9000, true, true),

-- 浜松
('club-tropical-hamamatsu', 'クラブ・トロピカル 浜松', 'くらぶとろぴかるはままつ',
 '浜松有楽街の人気フィリピンパブ。地元で20年以上の歴史を誇る老舗。フレンドリーなキャストが揃っています。',
 '浜松', '静岡県浜松市中央区有楽街5-8 有楽ビル3F', '053-123-4567', '19:00〜翌3:00', '月曜日', 3500, 9000, true, true),

('cebu-girl-hamamatsu', 'セブガール 浜松', 'せぶがーるはままつ',
 '浜松駅から徒歩10分。明るく元気なフィリピーナが皆さんをお待ちしています！週末はイベント多数開催。',
 '浜松', '静岡県浜松市中央区鴨江2-3-1 鴨江ビル2F', '053-234-5678', '20:00〜翌4:00', '火曜日', 3000, 8000, true, true),

-- 福岡
('manila-club-nakasu', 'マニラクラブ 中洲', 'まにらくらぶなかす',
 '博多中洲の歓楽街に位置するフィリピンパブ。九州最大級の規模を誇り、キャスト40名以上在籍！',
 '福岡', '福岡県福岡市博多区中洲3-7-12 中洲ビル4F', '092-123-4567', '20:00〜翌5:00', '無休', 5000, 14000, true, true),

-- 横浜
('yokohama-filipina-bar', 'ヨコハマ・フィリピーナバー', 'よこはまふぃりぴーなばー',
 '横浜・関内エリアのおしゃれなフィリピンバー。港町横浜の夜をフィリピンエンターテインメントで彩ります。',
 '横浜', '神奈川県横浜市中区関内2-5-10 関内ビル3F', '045-123-4567', '19:00〜翌3:00', '水曜日', 4500, 11000, true, true),

-- 札幌
('sapporo-pinay-club', 'サッポロ・ピナイクラブ', 'さっぽろぴないくらぶ',
 '札幌すすきのの人気フィリピンパブ。北海道の寒い夜を熱く盛り上げるフィリピーナたちが勢揃い！',
 '札幌', '北海道札幌市中央区南5条西3丁目 すすきのビル5F', '011-123-4567', '20:00〜翌4:00', '無休', 4000, 11000, true, true)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 完了！以下のコマンドで動作確認できます：
-- SELECT * FROM public.profiles LIMIT 10;
-- SELECT * FROM public.stores LIMIT 10;
-- ============================================================
