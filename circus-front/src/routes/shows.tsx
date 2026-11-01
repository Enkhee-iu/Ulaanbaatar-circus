import { useLanguage } from "@/components/site/Language";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { BookingCTA, FilterBar, PageIntro, ShowBentoCard } from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";

export const Route = createFileRoute("/shows")({
  head: () => ({
    meta: [
      { title: "Our shows — UB Circus" },
      {
        name: "description",
        content:
          "Discover aerial shows, physical theatre and illusions from UB Circus. Made for your stage.",
      },
    ],
  }),
  component: ShowsPage,
});
const CATEGORIES = ["All shows", "Aerial", "Theatre", "Illusion", "Touring"] as const;

function ShowsPage() {
  const { t } = useLanguage();
  const { shows: SHOWS } = useSiteContent();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All shows");
  const shows = SHOWS.filter((show) => category === "All shows" || show.category === category);
  return (
    <PageShell>
      <PageIntro
        eyebrow={t("Our repertoire")}
        title={
          <>
            {t("Find your")}
            <br />
            <span className="accent-text">{t("kind of wonder.")}</span>
          </>
        }
        description={t(
          "Aerial artistry, playful theatre, impossible illusions. Discover a show that feels right for your audience.",
        )}
      />
      <section className="container catalogue-section">
        <div className="catalogue-toolbar">
          <FilterBar
            options={CATEGORIES}
            selected={category}
            onChange={setCategory}
            label={t("Filter shows by genre")}
          />
          <span className="results-count" aria-live="polite">
            {shows.length} {t(shows.length === 1 ? "show" : "shows")}
            {t(" to discover")}
          </span>
        </div>
        <div className="show-grid home-show-bento catalogue-grid">
          {shows.length === 0 && (
            <p className="results-count">
              {t("No shows in this category yet. Get in touch for availability.")}
            </p>
          )}
          {shows.map((show) => (
            <ShowBentoCard key={show.id} show={show} />
          ))}
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
