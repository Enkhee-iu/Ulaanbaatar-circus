import { useLanguage } from "@/components/site/Language";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Asterisk } from "lucide-react";
import type { ReactNode } from "react";
import type { Show } from "@/lib/content-schema";

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section className="container page-intro">
      <span className="eyebrow">
        <span className="status-dot" />
        {t(eyebrow)}
      </span>
      <div className="intro-grid">
        <h1>{title}</h1>
        <div>
          <p className="intro-description">{t(description)}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  link?: { to: "/shows" | "/projects" | "/events"; label: string };
}) {
  const { t } = useLanguage();
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
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

export function ShowCard({ show }: { show: Show }) {
  const { t } = useLanguage();
  return (
    <Link to="/contact" search={{ show: show.title }} className="show-card">
      <div className="show-card-image">
        <img
          src={show.image}
          alt={show.title + " — " + t("Circus performance")}
          loading="lazy"
          width={1200}
          height={800}
        />
        <span className="image-tag">{t(show.category)}</span>
        <span className="card-arrow">
          <ArrowUpRight size={23} />
        </span>
      </div>
      <div className="show-card-heading">
        <h3>{show.title}</h3>
        <span>{show.duration}</span>
      </div>
      <p>{show.description}</p>
    </Link>
  );
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
    <section className="container booking-wrap">
      <div className="booking-cta">
        <div>
          <span className="eyebrow">{t("Your stage. Our imagination.")}</span>
          <h2>
            {t("Let’s make")}
            <br />
            {t("something ")}
            <em>{t("extraordinary.")}</em>
          </h2>
          <Link to="/contact" className="button button-dark">
            {t("Tell us your idea")}
            <ArrowUpRight size={19} />
          </Link>
        </div>
        <Asterisk className="cta-asterisk" strokeWidth={1.1} aria-hidden="true" />
        <span className="cta-note">
          {t("Good things begin with a conversation ")}
          <ArrowRight size={16} />
        </span>
      </div>
    </section>
  );
}
