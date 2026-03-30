"use client";

type Props = {
  address: string;
};

export function MapEmbed({ address }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  if (!apiKey) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline"
      >
        🗺️ Googleマップで開く
      </a>
    );
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&language=ja`;

  return (
    <div className="mt-3">
      <iframe
        src={embedUrl}
        width="100%"
        height="200"
        className="rounded-lg border border-dark-border"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-primary hover:underline"
      >
        🗺️ 大きな地図で開く
      </a>
    </div>
  );
}
