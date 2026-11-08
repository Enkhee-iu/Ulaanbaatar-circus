import { useLanguage } from "@/components/site/Language";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import {
  availableFilters,
  BookingCTA,
  FilterBar,
  PageIntro,
  ShowFeatureCard,
} from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";
import { pageHead } from "@/lib/page-meta";

export const Route = createFileRoute("/shows")({
  head: () => pageHead("/shows"),
  component: ShowsPage,
});
const CATEGORIES = ["All shows", "Aerial", "Theatre", "Touring"] as const;

function ShowsPage() {
  const { t } = useLanguage();
  const { shows: SHOWS } = useSiteContent();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All shows");
  const filters = availableFilters(
    CATEGORIES,
    SHOWS.map((show) => show.category),
  );
  const active = filters.includes(category) ? category : "All shows";
  const shows = SHOWS.filter((show) => active === "All shows" || show.category === active);
  return (
    <PageShell>
      <PageIntro
        word="SHOWS"
        eyebrow={t("Our repertoire")}
        title={
          <>
            {t("Find your")}
            <br />
            <span className="accent-text">{t("kind of wonder.")}</span>
          </>
        }
        description={t(
          "Aerial artistry and playful theatre. Discover a show that feels right for your audience.",
        )}
      />
      <section className="container catalogue-section">
        <div className="catalogue-toolbar">
          <FilterBar
            options={filters}
            selected={active}
            onChange={setCategory}
            label={t("Filter shows by genre")}
          />
          <span className="results-count" aria-live="polite">
            {shows.length} {t(shows.length === 1 ? "show" : "shows")}
            {t(" to discover")}
          </span>
        </div>
        <div className="show-feature-list">
          {shows.length === 0 && (
            <p className="results-count">
              {t("No shows in this category yet. Get in touch for availability.")}
            </p>
          )}
          {shows.map((show) => (
            <div className="show-feature-item" key={show.id}>
              <ShowFeatureCard show={show} heading="h2" />
            </div>
          ))}
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
