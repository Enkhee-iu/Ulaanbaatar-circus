import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
};

export function TextReveal({ children, className = "" }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`text-reveal${visible ? " is-visible" : ""} ${className}`}>
      {typeof children === "string"
        ? children.split(/(\s+)/).map((part, index) =>
            /^\s+$/.test(part) ? (
              part
            ) : (
              <span
                key={`${part}-${index}`}
                className="text-reveal-word"
                style={{ "--word-index": index } as CSSProperties}
              >
                {part}
              </span>
            ),
          )
        : <span className="text-reveal-content">{children}</span>}
    </span>
  );
}
