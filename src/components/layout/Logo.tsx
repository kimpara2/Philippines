import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="東海NIGHT"
      width={180}
      height={60}
      className="h-12 w-auto object-contain"
      priority
      unoptimized
    />
  );
}
