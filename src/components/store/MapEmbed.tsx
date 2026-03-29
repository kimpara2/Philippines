"use client";

type Props = {
  address: string;
};

export function MapEmbed({ address }: Props) {
  const encodedAddress = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

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
