import { useState, type ImgHTMLAttributes } from "react";
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
