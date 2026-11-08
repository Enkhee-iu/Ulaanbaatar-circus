// Aceternity UI's FloatingDock (ui.aceternity.com/registry/floating-dock), turned upright for the middle of
// the right edge. The icon nearest the pointer swells, measured on the vertical axis in screen
// coordinates (the original used pageX, which drifts once a fixed dock's page is scrolled), and the
// label opens to the left. With two links the phone layout shows both instead of hiding them behind a
// toggle. Styles are in styles.css under .social-dock.
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";

import { useLanguage } from "./Language";

// Lucide's Instagram, Facebook and YouTube outlines (ISC licence), drawn here because lucide-react drops its
// brand icons in v1.0 and an upgrade would otherwise break the build.
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const LINKS = [
  {
    title: "Instagram",
    href: "https://www.instagram.com/ulaanbaatarcircus/",
    icon: (
      <Glyph>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </Glyph>
    ),
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/Ubcircus",
    icon: (
      <Glyph>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </Glyph>
    ),
  },
  {
    title: "YouTube",
    href: "https://www.youtube.com/@MongolianCircus",
    icon: (
      <Glyph>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </Glyph>
    ),
  },
];

export function SocialDock() {
  const { t } = useLanguage();
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.nav
      className="social-dock"
      aria-label={t("Social media")}
      onMouseMove={(event) => mouseY.set(event.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
    >
      {LINKS.map((link) => (
        <DockIcon key={link.title} mouseY={mouseY} {...link} />
      ))}
    </motion.nav>
  );
}

const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

function DockIcon({
  mouseY,
  title,
  icon,
  href,
}: {
  mouseY: MotionValue<number>;
  title: string;
  icon: ReactNode;
  href: string;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  // Without motion the icons keep one size; the colour change on hover still answers the pointer.
  const still = useReducedMotion();

  const distance = useTransform(mouseY, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return value - bounds.y - bounds.height / 2;
  });
  const size = useSpring(
    useTransform(distance, [-110, 0, 110], still ? [36, 36, 36] : [36, 52, 36]),
    SPRING,
  );
  const iconSize = useSpring(
    useTransform(distance, [-110, 0, 110], still ? [16, 16, 16] : [16, 24, 16]),
    SPRING,
  );

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} (${t("opens in a new tab")})`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="social-dock-icon"
      >
        <AnimatePresence>
          {(hovered || focused) && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              className="social-dock-label"
              aria-hidden="true"
            >
              {title}
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div style={{ width: iconSize, height: iconSize }} className="social-dock-glyph">
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
