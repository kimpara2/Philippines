// データベースの型定義ファイル
// Supabaseのテーブル構造をTypeScriptの型として定義しています

export type UserRole = "admin" | "shop_owner" | "shop_staff" | "user";

// ユーザープロファイル
export type Profile = {
  id: string;
  display_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// 店舗情報
export type Store = {
  id: string;
  slug: string;
  name: string;
  name_kana: string | null;
  description: string | null;
  area: string | null;
  address: string | null;
  nearest_station: string | null;
  phone: string | null;
  open_hours: string | null;
  regular_holiday: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  category: string | null;
  min_price: number | null;
  max_price: number | null;
  price_system: string | null;
  first_visit_budget: string | null;
  recruit_enabled: boolean;
  recruit_title: string | null;
  recruit_salary: string | null;
  recruit_hours: string | null;
  recruit_benefits: string | null;
  recruit_pr: string | null;
  is_published: boolean;
  is_approved: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

// 店舗写真
export type StorePhoto = {
  id: string;
  store_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

// キャスト
export type CastMember = {
  id: string;
  store_id: string;
  name: string;
  name_kana: string | null;
  age: number | null;
  nationality: string | null;
  description: string | null;
  profile_image_url: string | null;
  height: number | null;
  blood_type: string | null;
  hobbies: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// キャスト写真
export type CastPhoto = {
  id: string;
  cast_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

// 口コミ
export type Review = {
  id: string;
  store_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  visit_date: string | null;
  is_approved: boolean;
  owner_reply: string | null;
  owner_replied_at: string | null;
  created_at: string;
  updated_at: string;
};

// お知らせ
export type NewsPost = {
  id: string;
  store_id: string;
  title: string;
  body: string;
  event_date: string | null;
  is_published: boolean;
  created_at: string;
};

// お気に入り
export type Favorite = {
  id: string;
  user_id: string;
  store_id: string;
  created_at: string;
};

// 店舗スタッフ
export type StoreStaff = {
  id: string;
  store_id: string;
  user_id: string;
  role: "owner" | "staff";
  created_at: string;
};

// 口コミ + 投稿者情報
export type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "display_name" | "avatar_url"> | null;
};

// 求人応募
export type Application = {
  id: string;
  store_id: string;
  name: string;
  age: string | null;
  phone: string;
  email: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

// 店舗カード用キャストプレビュー
export type CastPreview = {
  id: string;
  store_id: string;
  name: string;
  profile_image_url: string | null;
};
