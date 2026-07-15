import Image from "next/image";

interface LogoConfig {
  src: string;
  fit?: "contain" | "cover";
  pos?: string;
  widthRatio?: number;
}

const STATIC_LOGOS: Record<string, LogoConfig> = {
  "nidhi-prayas": { src: "/images/programs/nidhi-prayas.jpg", fit: "contain", pos: "left center", widthRatio: 3 },
  "nidhi-eir":    { src: "/images/programs/nidhi-eir.png",    fit: "contain", pos: "left center", widthRatio: 3 },
  "sisf":         { src: "/images/programs/sisf.png",         fit: "contain", pos: "center",      widthRatio: 1.1 },
  "bionest":      { src: "/images/programs/bionest.png",      fit: "contain", pos: "left center", widthRatio: 6 },
};

interface Props {
  slug: string;
  logoUrl?: string;
  size?: number;
}

export function ProgramLogo({ slug, logoUrl, size = 48 }: Props) {
  const src = logoUrl || STATIC_LOGOS[slug]?.src;
  if (!src) return null;

  const cfg = STATIC_LOGOS[slug];
  const widthRatio = cfg?.widthRatio ?? 2.8;
  const w = Math.round(size * widthRatio);

  return (
    <div style={{ width: w, height: size, position: "relative", flexShrink: 0 }}>
      <Image
        src={src}
        alt=""
        fill
        sizes={`${w}px`}
        unoptimized={!!logoUrl}
        style={{
          objectFit: cfg?.fit ?? "contain",
          objectPosition: logoUrl ? "center" : (cfg?.pos ?? "left center"),
        }}
        aria-hidden="true"
      />
    </div>
  );
}
