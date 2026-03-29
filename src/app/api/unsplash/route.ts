import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "japan nightlife";
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json({ error: "UNSPLASH_ACCESS_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=9&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    const data = await res.json() as {
      results: { id: string; urls: { regular: string; thumb: string }; alt_description: string | null }[]
    };

    // シャッフルして毎回違う順序で返す
    const shuffled = [...(data.results ?? [])].sort(() => Math.random() - 0.5);
    const photos = shuffled.map((p) => ({
      id: p.id,
      regular: p.urls.regular,
      thumb: p.urls.thumb,
      alt: p.alt_description ?? "",
    }));

    return NextResponse.json({ photos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
