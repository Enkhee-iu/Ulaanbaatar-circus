import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

export function Spinner({ size = 18 }: { size?: number }) {
  return <LoaderCircle size={size} className="loading-spinner" aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="page-skeleton container" role="status" aria-label="Ачаалж байна">
      <span className="sr-only">Ачаалж байна…</span>
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-grid">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandLoading() {
  const [phase, setPhase] = useState<"showing" | "fading" | "hidden">("showing");

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setPhase("fading"), 2000);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 2400);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className="brand-loader"
      data-exiting={phase === "fading"}
      role="status"
      aria-label="Улаанбаатар цирк ачаалж байна"
    >
      <span className="sr-only">Улаанбаатар цирк ачаалж байна…</span>
      <svg
        className="brand-loader-art"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="loader-metal-ring" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff" stopOpacity=".85" />
            <stop offset="15%" stopColor="#71717a" stopOpacity=".9" />
            <stop offset="45%" stopColor="#27272a" stopOpacity=".9" />
            <stop offset="75%" stopColor="#09090b" stopOpacity=".7" />
            <stop offset="90%" stopColor="#000" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="loader-left-fold" x1="30" y1="200" x2="140" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="45%" stopColor="#f43f5e" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="loader-middle-peak" x1="100" y1="120" x2="185" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="loader-tall-spire" x1="140" y1="35" x2="215" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff1e38" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="85%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="loader-blue-text" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b6cb0" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="loader-red-text" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff2e3b" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="loader-silver-text" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e4e4e7" />
            <stop offset="50%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#52525b" />
          </linearGradient>
          <filter id="loader-logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity=".85" />
          </filter>
        </defs>
        <g className="brand-loader-ring">
          <path d="M 250 30 A 220 220 0 1 1 50 320" stroke="url(#loader-metal-ring)" strokeWidth="5" strokeLinecap="round" />
          <path d="M 250 30 A 220 220 0 1 1 50 320" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g filter="url(#loader-logo-shadow)">
          <path d="M 195 45 C 196 45, 202 60, 212 120 C 217 150, 221 185, 218 216 C 195 208, 170 180, 158 152 Z" fill="url(#loader-tall-spire)" />
          <path d="M 218 216 C 205 208, 188 195, 172 170 C 192 188, 208 205, 218 216 Z" fill="#450a0a" fillOpacity=".6" />
          <path d="M 123 148 L 175 184 C 198 200, 210 215, 205 218 C 180 225, 148 222, 135 268 C 132 268, 130 240, 130 222 C 130 198, 125 170, 123 148 Z" fill="url(#loader-middle-peak)" />
          <path d="M 65 218 L 126 205 C 127 230, 130 260, 135 268 C 110 260, 82 242, 65 218 Z" fill="url(#loader-left-fold)" />
          <path d="M 126 205 L 130 222 L 123 148 Z" fill="#eab308" />
        </g>
        <text x="175" y="278" className="brand-loader-ulaanbaatar" fontSize="44" fill="url(#loader-blue-text)" stroke="#172554" strokeWidth=".5" letterSpacing=".5">Ulaanbaatar</text>
        <text x="245" y="325" className="brand-loader-circus" fontSize="48" fill="url(#loader-red-text)" stroke="#7f1d1d" strokeWidth=".5">Circus</text>
        <text x="180" y="375" className="brand-loader-tagline" fontSize="34" fill="url(#loader-silver-text)" opacity=".9" letterSpacing="1">Be different</text>
      </svg>
    </div>
  );
}

export function SmartImage(props: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  return <ImageState key={props.src} {...props} />;
}
const fallback =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="#e9ddd1"/><path d="m320 390 90-100 70 75 60-60 110 85" fill="none" stroke="#bc9b85" stroke-width="9"/><circle cx="540" cy="215" r="30" fill="#bc9b85"/></svg>',
  );
function ImageState({
  src,
  className = "",
  onLoad,
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  return (
    <img
      {...props}
      src={status === "failed" ? fallback : src}
      className={`${className} smart-image image-${status}`}
      aria-busy={status === "loading"}
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0 && status === "loading") setStatus("ready");
      }}
      onLoad={(event) => {
        if (status !== "failed") setStatus("ready");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("failed");
        onError?.(event);
      }}
    />
  );
}
