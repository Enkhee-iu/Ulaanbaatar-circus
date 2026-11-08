import { SmartImage } from "@/components/site/Loading";
import { useLanguage } from "@/components/site/Language";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { TextReveal } from "@/components/ui/text-reveal";
import type { Show } from "@/lib/content-types";
import { LetterWord } from "./LetterWord";

export function PageIntro({
  eyebrow,
  title,
  description,
  word,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  /** The page's English name, drawn above the intro in photo-filled letters. It stays in English. */
  word?: string;
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <>
      {word && <LetterWord word={word} />}
      <section className={word ? "container page-intro has-word" : "container page-intro"}>
        <span className="eyebrow">{t(eyebrow)}</span>
        <div className="intro-grid">
          <h1>{title}</h1>
          <div>
            <p className="intro-description">{t(description)}</p>
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  link?: { to: "/shows" | "/projects" | "/events"; label: string };
}) {
  const { t } = useLanguage();
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      <div className="section-heading-aside">
        {description && <p>{description}</p>}
        {link && (
          <Link to={link.to} className="text-link">
            {t(link.label)}
            <ArrowUpRight size={19} />
          </Link>
        )}
      </div>
    </div>
  );
}

/** A poster above a dark panel. The link inside `title` opens from anywhere on the card. */
export function PosterCard({
  image,
  alt,
  title,
  meta,
  description,
  heading: Heading = "h3",
}: {
  image: string;
  alt: string;
  title: ReactNode;
  meta: string;
  description: string;
  heading?: "h2" | "h3";
}) {
  return (
    <article className="show-feature-card">
      <div className="show-feature-image">
        <SmartImage src={image} alt={alt} loading="lazy" width={1200} height={900} />
      </div>
      <div className="show-feature-content">
        <Heading>{title}</Heading>
        <span className="show-feature-category">{meta}</span>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function ShowFeatureCard({ show, heading }: { show: Show; heading?: "h2" | "h3" }) {
  const { t } = useLanguage();
  return (
    <PosterCard
      image={show.image}
      alt={`${show.title} — ${t("Circus performance")}`}
      heading={heading}
      title={
        <Link to="/shows/$showId" params={{ showId: show.id }} className="show-feature-link">
          {show.title}
        </Link>
      }
      meta={`${t(show.category)} · ${show.duration}`}
      description={show.description}
    />
  );
}

/** The filters worth offering: one with no items would lead nowhere, and a single category has nothing to filter. */
export function availableFilters<T extends string>(filters: readonly T[], used: readonly string[]) {
  const [all, ...rest] = filters;
  const present = rest.filter((filter) => used.includes(filter));
  return present.length > 1 ? [all, ...present] : [];
}

export function FilterBar<T extends string>({
  options,
  selected,
  onChange,
  label = "Filter",
}: {
  options: readonly T[];
  selected: T;
  onChange: (option: T) => void;
  label?: string;
}) {
  const { t } = useLanguage();
  if (options.length === 0) return null;
  return (
    <div className="filter-bar" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={selected === option}
          onClick={() => onChange(option)}
          className={selected === option ? "filter-chip selected" : "filter-chip"}
        >
          {t(option)}
        </button>
      ))}
    </div>
  );
}

export function BookingCTA() {
  const { t } = useLanguage();
  return (
    <section className="booking-wrap home-scroll-reveal">
      <div className="booking-cta">
        <div>
          <h2>
            <TextReveal>{t("Planning an event?")}</TextReveal>
          </h2>
          <p className="home-cta-text">
            {t(
              "Tell us the date, the city and how many people are coming, and we’ll get back to you.",
            )}
          </p>
          <Link to="/contact" className="button home-button-primary">
            {t("Book a show")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
