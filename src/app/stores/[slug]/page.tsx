// 店舗詳細ページ

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CastCard } from "@/components/cast/CastCard";
import { ReviewCard } from "@/components/review/ReviewCard";
import { StarRating } from "@/components/ui/StarRating";
import { PhotoSlideshow } from "@/components/store/PhotoSlideshow";
import { MapEmbed } from "@/components/store/MapEmbed";
import type { Metadata } from "next";
import type { ReviewWithProfile } from "@/types/database";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("name, description, area, cover_image_url")
    .eq("slug", slug)
    .single();

  if (!store) return { title: "店舗が見つかりません" };

  const areaText = store.area ? `${store.area}の` : "";
  const title = `${store.name}｜${areaText}フィリピンパブ`;
  const description = store.description
    ? store.description.slice(0, 120)
    : `${areaText}フィリピンパブ「${store.name}」の詳細情報。営業時間・料金・アクセス・キャスト情報をご確認ください。`;

  return {
    title,
    description,
    keywords: [store.name, `${store.area}フィリピンパブ`, "フィリピンパブ", "スナック", store.area ?? ""].filter(Boolean),
    openGraph: {
      title: `${title} | フィリピンパブどっと混む！！`,
      description,
      images: store.cover_image_url ? [{ url: store.cover_image_url, alt: store.name }] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/stores/${slug}`,
    },
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // 店舗情報を取得
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) notFound();

  // キャストを取得（在籍中のみ、最大6件）
  const { data: casts } = await supabase
    .from("cast_members")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("sort_order")
    .limit(6);

  // 口コミを取得（承認済みのみ、最新5件）
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name, avatar_url)")
    .eq("store_id", store.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // 店舗写真を取得
  const { data: photos } = await supabase
    .from("store_photos")
    .select("*")
    .eq("store_id", store.id)
    .order("sort_order");

  // 最新ニュースを取得
  const { data: newsPosts } = await supabase
    .from("news_posts")
    .select("id, title, body, event_date, created_at")
    .eq("store_id", store.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // 平均評価を計算
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  // 価格帯テキスト
  const priceText =
    store.min_price && store.max_price
      ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
      : store.min_price
      ? `¥${store.min_price.toLocaleString()}〜`
      : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: store.name,
    description: store.description ?? undefined,
    url: `${siteUrl}/stores/${slug}`,
    telephone: store.phone ?? undefined,
    image: store.cover_image_url ?? undefined,
    priceRange: store.min_price && store.max_price
      ? `¥${store.min_price.toLocaleString()}〜¥${store.max_price.toLocaleString()}`
      : undefined,
    address: store.address ? {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.area ?? undefined,
      addressCountry: "JP",
    } : undefined,
    openingHours: store.open_hours ?? undefined,
    aggregateRating: avgRating !== null ? {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews?.length ?? 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* パンくずリスト */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">トップ</Link>
        <span className="mx-2">›</span>
        <Link href="/stores" className="hover:text-primary">店舗一覧</Link>
        <span className="mx-2">›</span>
        <span className="text-white">{store.name}</span>
      </nav>

      {/* カバー画像 */}
      <div className="relative h-80 md:h-[28rem] rounded-2xl overflow-hidden bg-dark-card mb-8">
        {store.cover_image_url ? (
          <Image
            src={store.cover_image_url}
            alt={store.name}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 896px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">🍹</span>
          </div>
        )}
        {store.area && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white text-sm px-3 py-1 rounded-full font-bold">
              {store.area}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-8">
          {/* 店舗名・評価 */}
          <div>
            <h1 className="text-3xl font-black text-white mb-2">{store.name}</h1>
            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-accent font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">（{reviews?.length}件の口コミ）</span>
              </div>
            )}
            {store.description && (
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {store.description}
              </p>
            )}
          </div>

          {/* 写真スライドショー */}
          {photos && photos.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-accent mb-4">📷 写真</h2>
              <PhotoSlideshow photos={photos} storeName={store.name} />
            </div>
          )}

          {/* キャスト */}
          {casts && casts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-accent">👩 在籍キャスト</h2>
                <Link href={`/stores/${slug}/cast`} className="text-primary text-sm hover:underline">
                  すべて見る →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {casts.map((cast) => (
                  <CastCard key={cast.id} cast={cast} storeSlug={slug} />
                ))}
              </div>
            </div>
          )}

          {/* 最新ニュース・ブログ */}
          {newsPosts && newsPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-accent">📢 お知らせ・ブログ</h2>
                <Link href={`/stores/${slug}/news`} className="text-primary text-sm hover:underline">
                  すべて見る →
                </Link>
              </div>
              <div className="space-y-3">
                {newsPosts.map((post) => (
                  <Link key={post.id} href={`/stores/${slug}/news/${post.id}`}>
                    <div className="bg-dark border border-dark-border hover:border-primary rounded-xl p-4 transition-all group">
                      {post.event_date && (
                        <div className="text-accent text-xs font-bold mb-1">
                          📅 {new Date(post.event_date).toLocaleDateString("ja-JP")}
                        </div>
                      )}
                      <div className="text-white font-bold text-sm group-hover:text-primary transition-colors mb-1">
                        {post.title}
                      </div>
                      <div className="text-gray-400 text-xs line-clamp-2">{post.body}</div>
                      <div className="text-gray-600 text-xs mt-2">
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 採用情報 */}
          {store.recruit_enabled && (
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/40 rounded-2xl overflow-hidden">
              <div className="bg-primary/20 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">💼</span>
                <div>
                  <div className="text-accent font-black text-lg">採用情報</div>
                  {store.recruit_title && (
                    <div className="text-white font-bold text-sm">{store.recruit_title}</div>
                  )}
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                {store.recruit_salary && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">💰 給与・報酬</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_salary}</div>
                  </div>
                )}
                {store.recruit_hours && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">🕐 勤務時間・シフト</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_hours}</div>
                  </div>
                )}
                {store.recruit_benefits && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">🎁 待遇・福利厚生</div>
                    <div className="text-white text-sm whitespace-pre-wrap">{store.recruit_benefits}</div>
                  </div>
                )}
                {store.recruit_pr && (
                  <div className="bg-dark/40 rounded-xl p-4">
                    <div className="text-accent text-xs font-bold mb-1">✨ お店からのメッセージ</div>
                    <div className="text-gray-200 text-sm whitespace-pre-wrap">{store.recruit_pr}</div>
                  </div>
                )}
                <Link
                  href={`/stores/${slug}/apply`}
                  className="block w-full text-center bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl text-lg transition-colors mt-2"
                >
                  📩 採用に応募する
                </Link>
              </div>
            </div>
          )}

          {/* 口コミ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-accent">💬 口コミ</h2>
              <Link href={`/stores/${slug}/reviews`} className="text-primary text-sm hover:underline">
                口コミを書く →
              </Link>
            </div>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {(reviews as ReviewWithProfile[]).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
                <p className="text-gray-400">まだ口コミがありません</p>
                <Link href={`/stores/${slug}/reviews`} className="text-primary text-sm mt-2 inline-block hover:underline">
                  最初の口コミを書く
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー（店舗基本情報） */}
        <div className="space-y-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 sticky top-20">
            <h2 className="text-accent font-bold mb-4">店舗情報</h2>
            <div className="space-y-3">
              {store.address && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">住所</div>
                  <div className="text-white text-sm">📍 {store.address}</div>
                  <MapEmbed address={store.address} />
                </div>
              )}
              {store.nearest_station && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">最寄り駅</div>
                  <div className="text-white text-sm">🚉 {store.nearest_station}</div>
                </div>
              )}
              {store.phone && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">電話番号</div>
                  <a href={`tel:${store.phone}`} className="text-primary text-sm hover:underline">
                    📞 {store.phone}
                  </a>
                </div>
              )}
              {store.open_hours && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">営業時間</div>
                  <div className="text-white text-sm">🕐 {store.open_hours}</div>
                </div>
              )}
              {store.regular_holiday && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">定休日</div>
                  <div className="text-white text-sm">📅 {store.regular_holiday}</div>
                </div>
              )}
              {priceText && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">料金目安</div>
                  <div className="text-accent font-bold text-sm">💰 {priceText}</div>
                </div>
              )}
              {store.price_system && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">料金システム</div>
                  <div className="text-white text-sm whitespace-pre-wrap">🧾 {store.price_system}</div>
                </div>
              )}
              {store.first_visit_budget && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">初回予算感</div>
                  <div className="text-accent font-bold text-sm whitespace-pre-wrap">👛 {store.first_visit_budget}</div>
                </div>
              )}
            </div>

            {/* SNSリンク */}
            {(store.twitter_url || store.instagram_url || store.tiktok_url || store.website_url) && (
              <div className="mt-5 pt-5 border-t border-dark-border space-y-2">
                {store.website_url && (
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors">
                    🌐 公式サイト
                  </a>
                )}
                {store.twitter_url && (
                  <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors">
                    🐦 Twitter / X
                  </a>
                )}
                {store.instagram_url && (
                  <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors">
                    📸 Instagram
                  </a>
                )}
                {store.tiktok_url && (
                  <a href={store.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors">
                    🎵 TikTok
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
