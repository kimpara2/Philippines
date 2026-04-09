/**
 * ブログ記事一括生成スクリプト
 * 実行: node scripts/bulk-generate-blog.mjs
 *
 * .env.local の ANTHROPIC_API_KEY と SUPABASE_SERVICE_ROLE_KEY が必要
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// .env.local を手動で読み込む
const envFile = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ 環境変数が不足しています。.env.local を確認してください。");
  console.error("  必要: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── 記事テーマ一覧（50本 × 5カテゴリ = 250本） ───────────────────────

const TOPICS = {
  フィリピンパブ: [
    { keyword: "フィリピンパブとは？初めての方向け完全ガイド", area: "浜松" },
    { keyword: "浜松のフィリピンパブおすすめ5選と選び方", area: "浜松" },
    { keyword: "フィリピンパブの料金相場と上手な楽しみ方", area: "浜松" },
    { keyword: "フィリピンパブで話題に困らないネタ集", area: "浜松" },
    { keyword: "フィリピンパブで失敗しないマナー完全解説", area: "浜松" },
    { keyword: "フィリピンパブの同伴ドリンクとは？仕組みを解説", area: "浜松" },
    { keyword: "浜松駅周辺のフィリピンパブエリアガイド", area: "浜松" },
    { keyword: "フィリピンパブとキャバクラの違いを徹底比較", area: null },
    { keyword: "フィリピンパブでカラオケを楽しむコツ", area: "浜松" },
    { keyword: "フィリピン人スタッフと仲良くなる会話術", area: null },
    { keyword: "フィリピンパブの営業時間と予約方法", area: "浜松" },
    { keyword: "フィリピンパブ初心者が知っておくべき10のこと", area: null },
    { keyword: "浜松のフィリピンパブ求人情報と働くメリット", area: "浜松" },
    { keyword: "フィリピンパブのシステム料とは何か？", area: null },
    { keyword: "東海エリアのフィリピンパブ事情まとめ", area: "浜松" },
    { keyword: "フィリピンパブで使えるタガログ語フレーズ集", area: null },
    { keyword: "フィリピンパブスタッフの仕事内容と給料事情", area: "浜松" },
    { keyword: "フィリピンパブとスナックはどっちが初めて向き？", area: null },
    { keyword: "浜松のフィリピンパブで楽しい週末を過ごす方法", area: "浜松" },
    { keyword: "フィリピンパブのボトルキープとは？お得な使い方", area: null },
    { keyword: "フィリピン文化とフィリピンパブの関係", area: null },
    { keyword: "浜松市内のフィリピンパブ営業エリア徹底調査", area: "浜松" },
    { keyword: "フィリピンパブでよくあるトラブルと対処法", area: null },
    { keyword: "フィリピンパブスタッフのシフトと働き方", area: "浜松" },
    { keyword: "フィリピンパブの接客スタイルとは？楽しみ方解説", area: null },
    { keyword: "浜松フィリピンパブで常連になるための方法", area: "浜松" },
    { keyword: "フィリピンパブのドリンクメニューと値段", area: "浜松" },
    { keyword: "フィリピンパブ女性スタッフの本音と魅力", area: null },
    { keyword: "浜松周辺の静岡フィリピンパブ情報まとめ", area: "静岡市" },
    { keyword: "フィリピンパブのチップ文化と正しい渡し方", area: null },
    { keyword: "初めてのフィリピンパブ：入口から退店まで完全解説", area: "浜松" },
    { keyword: "フィリピンパブで友達と楽しむ幹事向けガイド", area: "浜松" },
    { keyword: "フィリピンパブスタッフが語るお客さんの理想像", area: null },
    { keyword: "浜松夜遊びスポットマップ：フィリピンパブ編", area: "浜松" },
    { keyword: "フィリピンパブのカラオケ曲おすすめ10選", area: null },
    { keyword: "フィリピンパブとガールズバーを徹底比較", area: null },
    { keyword: "浜松のフィリピンパブで誕生日を祝う方法", area: "浜松" },
    { keyword: "フィリピンパブ初訪問の緊張を解消する5つのコツ", area: null },
    { keyword: "フィリピンパブの仕事は大変？スタッフのリアルな声", area: "浜松" },
    { keyword: "フィリピンパブでよく聞く音楽とその楽しみ方", area: null },
    { keyword: "浜松フィリピンパブ近くのおすすめ飲み歩きルート", area: "浜松" },
    { keyword: "フィリピンパブの予算1万円で楽しむ完全プラン", area: "浜松" },
    { keyword: "フィリピンパブスタッフの国籍と来日の背景", area: null },
    { keyword: "浜松のフィリピンパブランキングTop5の選び方", area: "浜松" },
    { keyword: "フィリピンパブの安全な楽しみ方と注意点", area: null },
    { keyword: "フィリピンパブをもっと楽しくする話題のネタ帳", area: null },
    { keyword: "浜松中心街のフィリピンパブ徒歩アクセスガイド", area: "浜松" },
    { keyword: "フィリピンパブで働く女性の生活と文化", area: null },
    { keyword: "フィリピンパブ：入店前に知っておきたいQ&A10選", area: null },
    { keyword: "浜松フィリピンパブ完全攻略ガイド2025年版", area: "浜松" },
  ],
  スナック: [
    { keyword: "スナックとは？初めての方向け完全ガイド", area: "浜松" },
    { keyword: "浜松のスナックおすすめ5選と選び方", area: "浜松" },
    { keyword: "スナックの料金相場とお得な楽しみ方", area: "浜松" },
    { keyword: "スナックでモテる会話術とNG行動", area: null },
    { keyword: "スナックとキャバクラ・バーの違いを解説", area: null },
    { keyword: "スナックのカラオケ文化と楽しみ方", area: "浜松" },
    { keyword: "浜松駅周辺のスナック密集エリアガイド", area: "浜松" },
    { keyword: "スナックのボトルキープ制度を賢く活用する方法", area: null },
    { keyword: "スナックのママとの上手な付き合い方", area: null },
    { keyword: "スナック初心者が一人で入るコツ", area: "浜松" },
    { keyword: "浜松のスナックで常連になる方法", area: "浜松" },
    { keyword: "スナックの営業時間と入店マナー完全解説", area: null },
    { keyword: "スナックの料金システムと会計の仕組み", area: null },
    { keyword: "浜松スナック街：有楽街・田町エリアの魅力", area: "浜松" },
    { keyword: "スナックで使えるカラオケのマナーと選曲術", area: null },
    { keyword: "スナックで人気のおつまみとドリンクメニュー", area: null },
    { keyword: "浜松スナックで仕事帰りに一人飲みする方法", area: "浜松" },
    { keyword: "スナックのチャージ料とは？かかる費用を解説", area: null },
    { keyword: "スナックが初めての人が緊張しない入り方", area: "浜松" },
    { keyword: "浜松のスナック求人：ママ・スタッフの給料事情", area: "浜松" },
    { keyword: "スナックのカラオケで盛り上がる曲ランキング", area: null },
    { keyword: "スナックとフィリピンパブどっちが初めて向き？", area: null },
    { keyword: "浜松スナック飲み歩きコースおすすめ3選", area: "浜松" },
    { keyword: "スナックの接客と雰囲気：どんなお店なの？", area: null },
    { keyword: "浜松のスナックで誕生日・記念日を祝う方法", area: "浜松" },
    { keyword: "スナックのトラブル回避術と安全な楽しみ方", area: null },
    { keyword: "スナックで働くスタッフの本音と仕事の魅力", area: "浜松" },
    { keyword: "浜松で安くて楽しいスナックを見つけるコツ", area: "浜松" },
    { keyword: "スナックの予算5,000円で楽しむ完全プラン", area: "浜松" },
    { keyword: "スナックのカラオケマシンの種類と使い方", area: null },
    { keyword: "浜松スナックのランキングTOP5の選び方", area: "浜松" },
    { keyword: "スナックを友達と楽しむ幹事向けガイド", area: "浜松" },
    { keyword: "スナックに通い続ける常連客の魅力と心理", area: null },
    { keyword: "浜松市内のスナック分布マップと特徴", area: "浜松" },
    { keyword: "スナックのお通しとは？種類と相場を解説", area: null },
    { keyword: "スナックで使える話題のネタ帳30選", area: null },
    { keyword: "浜松スナックで出会いを楽しむ方法", area: "浜松" },
    { keyword: "スナックの閉店時間と終電前のマナー", area: null },
    { keyword: "スナックで働きたい人へ：仕事内容と採用基準", area: "浜松" },
    { keyword: "浜松スナックの歴史と文化：昔と今", area: "浜松" },
    { keyword: "スナックでの一人飲みを楽しくする5つのコツ", area: null },
    { keyword: "スナックの年齢層と世代別の楽しみ方", area: null },
    { keyword: "浜松周辺スナック情報：浜北・磐田エリアも紹介", area: "浜松" },
    { keyword: "スナックでよくあるQ&A：初心者の疑問に答える", area: null },
    { keyword: "スナックのドレスコードと服装マナー", area: null },
    { keyword: "浜松スナックの口コミを活用した店選び方法", area: "浜松" },
    { keyword: "スナックに行くべき曜日と時間帯", area: null },
    { keyword: "スナックのキープボトルの期限と管理方法", area: null },
    { keyword: "浜松スナック完全攻略ガイド2025年版", area: "浜松" },
    { keyword: "スナックで楽しい夜を過ごす完全マニュアル", area: "浜松" },
  ],
  ガールズバー: [
    { keyword: "ガールズバーとは？初めての方向け完全ガイド", area: "浜松" },
    { keyword: "浜松のガールズバーおすすめ5選と選び方", area: "浜松" },
    { keyword: "ガールズバーの料金相場とシステム解説", area: null },
    { keyword: "ガールズバーとキャバクラの違いを徹底比較", area: null },
    { keyword: "ガールズバーでの正しいマナーと楽しみ方", area: "浜松" },
    { keyword: "ガールズバースタッフの仕事内容と給料事情", area: "浜松" },
    { keyword: "浜松ガールズバー：おしゃれな雰囲気のお店紹介", area: "浜松" },
    { keyword: "ガールズバーで盛り上がる会話のコツ", area: null },
    { keyword: "ガールズバーと普通のバーの違いとは？", area: null },
    { keyword: "ガールズバー初心者が一人で入る方法", area: "浜松" },
    { keyword: "浜松のガールズバーで友達と楽しむ幹事ガイド", area: "浜松" },
    { keyword: "ガールズバーの営業時間とラストオーダーの注意点", area: null },
    { keyword: "ガールズバーのドリンクメニューと値段相場", area: null },
    { keyword: "浜松ガールズバー近くの駐車場と交通アクセス", area: "浜松" },
    { keyword: "ガールズバーで働く女性の本音と魅力", area: "浜松" },
    { keyword: "ガールズバーの服装・ドレスコードガイド", area: null },
    { keyword: "浜松のガールズバーで誕生日を祝う方法", area: "浜松" },
    { keyword: "ガールズバーのチャージ料金の仕組みを解説", area: null },
    { keyword: "ガールズバースタッフとの自然な会話術", area: null },
    { keyword: "浜松ガールズバー求人：未経験でも働ける？", area: "浜松" },
    { keyword: "ガールズバーとフィリピンパブどっちがおすすめ？", area: null },
    { keyword: "ガールズバーの予算3,000円で楽しむ方法", area: "浜松" },
    { keyword: "浜松ガールズバーランキングTOP5の基準", area: "浜松" },
    { keyword: "ガールズバーに通いすぎるリスクと節度ある楽しみ方", area: null },
    { keyword: "ガールズバーで使えるおすすめカクテル5選", area: null },
    { keyword: "浜松ガールズバーの昼間と夜間の違い", area: "浜松" },
    { keyword: "ガールズバーの照明とBGMにこだわる理由", area: null },
    { keyword: "浜松ガールズバーの口コミを正しく読む方法", area: "浜松" },
    { keyword: "ガールズバースタッフのシフトと働きやすさ", area: "浜松" },
    { keyword: "ガールズバーで起こりやすいトラブルと対策", area: null },
    { keyword: "浜松でガールズバーとスナックを同日に梯子する方法", area: "浜松" },
    { keyword: "ガールズバーの入口と注文の仕方完全解説", area: null },
    { keyword: "ガールズバーに行く最適な時間帯と曜日", area: null },
    { keyword: "浜松ガールズバーのアクセスと周辺情報", area: "浜松" },
    { keyword: "ガールズバーのお通しとフードメニュー", area: null },
    { keyword: "ガールズバーで長く楽しむための節約術", area: null },
    { keyword: "浜松ガールズバー体験記：初めて行った感想", area: "浜松" },
    { keyword: "ガールズバーのSNSで事前チェックする方法", area: null },
    { keyword: "ガールズバーの雰囲気：おしゃれ系vs庶民系の違い", area: null },
    { keyword: "浜松ガールズバーで女子会を開く方法", area: "浜松" },
    { keyword: "ガールズバーのスタッフになるための条件", area: "浜松" },
    { keyword: "ガールズバーとラウンジの違いとは？", area: null },
    { keyword: "浜松ガールズバー完全攻略ガイド2025年版", area: "浜松" },
    { keyword: "ガールズバーで使えるクレジットカードの有無", area: null },
    { keyword: "ガールズバーの帰り際のマナーと会計の流れ", area: null },
    { keyword: "浜松ガールズバーで記念日を特別にする方法", area: "浜松" },
    { keyword: "ガールズバーが夜遊びに人気の理由5つ", area: null },
    { keyword: "ガールズバー初心者Q&A：よくある疑問に答える", area: null },
    { keyword: "ガールズバーの内装とこだわりポイント", area: null },
    { keyword: "浜松のナイトスポット：ガールズバーを含む飲み歩きコース", area: "浜松" },
  ],
  バー: [
    { keyword: "バーとは？初めての方向け入門ガイド", area: "浜松" },
    { keyword: "浜松のおすすめバー5選と選び方", area: "浜松" },
    { keyword: "バーの料金相場とチャージ料の仕組み", area: null },
    { keyword: "バーで使えるカクテルの注文術", area: null },
    { keyword: "バーテンダーとの正しい会話の楽しみ方", area: null },
    { keyword: "バーのドレスコードと服装マナー完全解説", area: null },
    { keyword: "浜松のバーで一人飲みを楽しむ方法", area: "浜松" },
    { keyword: "ウイスキーバーとカクテルバーの違い", area: null },
    { keyword: "バーのカウンター席とテーブル席どっちがいい？", area: null },
    { keyword: "バー初心者が緊張しない入り方と注文方法", area: "浜松" },
    { keyword: "浜松バーの営業時間と終電を逃さない楽しみ方", area: "浜松" },
    { keyword: "バーのロックとストレートの違いを解説", area: null },
    { keyword: "浜松市内の隠れ家バーおすすめスポット", area: "浜松" },
    { keyword: "バーでモテる会話ネタと話し方のコツ", area: null },
    { keyword: "バーの定番カクテル10選と頼み方", area: null },
    { keyword: "バーとスナックどっちが初心者向き？", area: null },
    { keyword: "バーのボトルキープの仕組みと相場", area: null },
    { keyword: "浜松バーで友達との特別な夜を過ごす方法", area: "浜松" },
    { keyword: "バーのBGMとライブ演奏の楽しみ方", area: null },
    { keyword: "浜松バー求人：バーテンダーになる方法", area: "浜松" },
    { keyword: "バーのお通しとは？相場と種類を解説", area: null },
    { keyword: "バーのウイスキーおすすめ銘柄と飲み方", area: null },
    { keyword: "浜松でバーめぐりを楽しむおすすめコース", area: "浜松" },
    { keyword: "バーのクラフトビール文化と楽しみ方", area: null },
    { keyword: "バーで誕生日・記念日を演出する方法", area: "浜松" },
    { keyword: "バーに行くのに最適な時間帯とタイミング", area: null },
    { keyword: "バーのカクテルを自宅で再現するレシピ", area: null },
    { keyword: "浜松バーの雰囲気別分類：落ち着き系vs賑わい系", area: "浜松" },
    { keyword: "バーで起こりやすいマナー違反と対策", area: null },
    { keyword: "バーとクラブの違いと使い分け方", area: null },
    { keyword: "浜松バーランキングTOP5の選び方", area: "浜松" },
    { keyword: "バーのモクテル（ノンアルカクテル）とは？", area: null },
    { keyword: "バーで使えるチップ文化と日本のマナー", area: null },
    { keyword: "浜松バーの口コミを活用したお店選び", area: "浜松" },
    { keyword: "バーのカウンター文化：バーテンダーとの関係", area: null },
    { keyword: "バーでデートを成功させる方法", area: "浜松" },
    { keyword: "バーの照明と内装がこだわる理由", area: null },
    { keyword: "浜松バー完全攻略ガイド2025年版", area: "浜松" },
    { keyword: "バーでよく飲まれるリキュールの種類と特徴", area: null },
    { keyword: "バーの帰り際マナーと会計の流れ", area: null },
    { keyword: "浜松の夜景が見えるバーおすすめスポット", area: "浜松" },
    { keyword: "バーで使えるワインの選び方と頼み方", area: null },
    { keyword: "バーに一人で行くメリットと楽しみ方", area: null },
    { keyword: "浜松バーで仕事帰りのリフレッシュ法", area: "浜松" },
    { keyword: "バーのスピリッツ（蒸留酒）入門ガイド", area: null },
    { keyword: "バーで長く楽しむ節約術とペース配分", area: null },
    { keyword: "浜松バーとガールズバーの使い分け方", area: "浜松" },
    { keyword: "バーのカクテルに使う材料と基本の道具", area: null },
    { keyword: "バー初心者Q&A：よくある疑問に答える", area: null },
    { keyword: "浜松のお酒が美味しいバーおすすめ完全版", area: "浜松" },
  ],
  キャバクラ: [
    { keyword: "キャバクラとは？初めての方向け完全ガイド", area: "浜松" },
    { keyword: "浜松のキャバクラおすすめ5選と選び方", area: "浜松" },
    { keyword: "キャバクラの料金相場と指名料の仕組み", area: null },
    { keyword: "キャバクラのシステム料とセット料金を解説", area: null },
    { keyword: "キャバクラとクラブの違いを徹底比較", area: null },
    { keyword: "キャバクラでのマナーとNG行動まとめ", area: null },
    { keyword: "浜松のキャバクラ求人：キャストの給料事情", area: "浜松" },
    { keyword: "キャバクラの指名制度とは？正しい使い方", area: null },
    { keyword: "キャバクラのドリンクバックとキャスト収入の仕組み", area: null },
    { keyword: "キャバクラ初心者が緊張しない入店マニュアル", area: "浜松" },
    { keyword: "浜松キャバクラで特別な夜を過ごす方法", area: "浜松" },
    { keyword: "キャバクラの営業時間と予約のとり方", area: null },
    { keyword: "キャバクラのボーイの役割とチップの渡し方", area: null },
    { keyword: "浜松キャバクラランキングTOP5の選び方", area: "浜松" },
    { keyword: "キャバクラキャストとの会話術：盛り上がるネタ集", area: null },
    { keyword: "キャバクラの同伴出勤とアフターとは？", area: null },
    { keyword: "浜松キャバクラとガールズバーの使い分け", area: "浜松" },
    { keyword: "キャバクラに行く頻度とお金の管理術", area: null },
    { keyword: "キャバクラキャストのランクと指名費用", area: null },
    { keyword: "浜松キャバクラで接客のプロに学ぶ会話術", area: "浜松" },
    { keyword: "キャバクラで太客（太い客）になるメリットとリスク", area: null },
    { keyword: "キャバクラのシャンパンタワーとは？費用と流れ", area: null },
    { keyword: "浜松キャバクラ求人で稼げる条件とは？", area: "浜松" },
    { keyword: "キャバクラとフィリピンパブの違いを比較", area: null },
    { keyword: "キャバクラでの誕生日イベントと費用の目安", area: "浜松" },
    { keyword: "キャバクラのヘルプとは？制度の仕組み解説", area: null },
    { keyword: "浜松キャバクラの口コミを正しく見る方法", area: "浜松" },
    { keyword: "キャバクラで働きたい女性へ：採用基準と面接対策", area: "浜松" },
    { keyword: "キャバクラのドレス・衣装代の相場と準備", area: null },
    { keyword: "浜松キャバクラのアクセスと送迎サービスの有無", area: "浜松" },
    { keyword: "キャバクラのラスト指名とは？制度を解説", area: null },
    { keyword: "キャバクラでモテるお客さんの特徴10選", area: null },
    { keyword: "浜松キャバクラで記念日を盛大に祝う方法", area: "浜松" },
    { keyword: "キャバクラキャストのSNSとLINE交換のルール", area: null },
    { keyword: "キャバクラのマネージャーとボーイの仕事内容", area: null },
    { keyword: "浜松キャバクラの雰囲気と客層の特徴", area: "浜松" },
    { keyword: "キャバクラ初心者Q&A：よくある疑問に答える", area: null },
    { keyword: "キャバクラでの飲み方マナーと健康管理", area: null },
    { keyword: "浜松キャバクラで予算1万円を上手に使う方法", area: "浜松" },
    { keyword: "キャバクラのフリーと指名の違いと選び方", area: null },
    { keyword: "キャバクラキャストになるメリットとデメリット", area: "浜松" },
    { keyword: "キャバクラで恥をかかない服装と身だしなみ", area: null },
    { keyword: "浜松キャバクラ完全攻略ガイド2025年版", area: "浜松" },
    { keyword: "キャバクラのドリンクメニューと値段を解説", area: null },
    { keyword: "キャバクラキャストの1日のスケジュール", area: null },
    { keyword: "浜松キャバクラ：高級店vs庶民的な店の違い", area: "浜松" },
    { keyword: "キャバクラの退店時のマナーと会計の流れ", area: null },
    { keyword: "キャバクラに行く前に知っておくべき10のこと", area: null },
    { keyword: "浜松でキャバクラとスナックを梯子する方法", area: "浜松" },
    { keyword: "キャバクラの楽しみ方完全マニュアル2025年版", area: null },
  ],
};

// ─── 記事生成関数 ──────────────────────────────────────────

async function generateArticle(keyword, area) {
  const areaContext = area
    ? `対象エリアは「${area}」（静岡県浜松市周辺）です。浜松は静岡県最大の都市で、夜遊びスポットが充実しています。`
    : "東海地方（愛知・静岡・岐阜・三重）の読者向けです。";

  const prompt = `あなたはフィリピンパブ・スナック情報サイト「東海NIGHT」のライターです。
SEO対策された高品質なブログ記事を書いてください。

## 記事テーマ
${keyword}

## エリア情報
${areaContext}

## 執筆条件
- 文字数: 1500〜2500文字
- 読者: 夜遊びに興味がある20〜50代男性
- トーン: 親しみやすく実用的
- マークダウン記法を使う（## で大見出し、### で小見出し、**テキスト** で太字）
- 段落の間は空行を入れる
- 具体的な数字（料金・時間）を含める
- 構成: リード文（2〜3文）→ ## 見出し1 → ## 見出し2 → ## 見出し3 → ## まとめ

## 出力形式（厳守）
TITLE: ここにタイトル（35〜50文字）
===BODY===
ここに本文`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const titleMatch = raw.match(/TITLE:\s*(.+)/);
  const bodyMatch = raw.match(/===BODY===\s*([\s\S]+)/);
  const title = titleMatch?.[1]?.trim() ?? keyword;
  const body = bodyMatch?.[1]?.trim() ?? raw;
  return { title, body };
}

// ─── メイン処理 ───────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const targetCategory = args[0]; // 例: node script.mjs スナック
  const startIndex = parseInt(args[1] ?? "0"); // 再開位置

  const categories = targetCategory
    ? { [targetCategory]: TOPICS[targetCategory] }
    : TOPICS;

  let total = 0;
  let success = 0;
  let failed = 0;

  for (const [category, topics] of Object.entries(categories)) {
    console.log(`\n📂 カテゴリ: ${category} (${topics.length}本)`);

    for (let i = startIndex; i < topics.length; i++) {
      const { keyword, area } = topics[i];
      total++;
      console.log(`  [${i + 1}/${topics.length}] 生成中: ${keyword}`);

      try {
        const { title, body } = await generateArticle(keyword, area);

        const { error } = await supabase.from("site_news").insert({
          title,
          body,
          category: "column",
          area: area ?? null,
          is_published: false,
        });

        if (error) {
          console.error(`    ❌ DB保存失敗: ${error.message}`);
          failed++;
        } else {
          console.log(`    ✅ 保存完了: ${title}`);
          success++;
        }

        // API制限対策：1秒待機
        await new Promise(r => setTimeout(r, 1200));

      } catch (e) {
        console.error(`    ❌ 生成失敗: ${e.message}`);
        failed++;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.log(`\n🎉 完了！ 成功: ${success}本 / 失敗: ${failed}本 / 合計: ${total}本`);
}

main().catch(console.error);
