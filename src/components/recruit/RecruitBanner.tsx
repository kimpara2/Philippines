import Link from "next/link";
import Image from "next/image";

type Props = {
  area?: string;
  count?: number;
};

export function RecruitBanner({ area }: Props) {
  const href = area
    ? `/recruit?area=${encodeURIComponent(area)}`
    : "/recruit";

  return (
    <Link href={href} className="block group hover:opacity-90 transition-opacity">
      <Image
        src="/recruit-banner.png"
        alt="求人情報はこちら"
        width={1200}
        height={160}
        className="w-full h-auto rounded-2xl"
        unoptimized
      />
    </Link>
  );
}
