import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { BookingCTA, FilterBar, PageIntro, ShowCard } from "@/components/site/Sections";
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
        <div className="show-grid catalogue-grid">
          {shows.length === 0 && (
            <p className="results-count">
              {t("No shows in this category yet. Get in touch for availability.")}
            </p>
          )}
          {shows.map((show) => (
            <div key={show.id}>
              <ShowCard show={show} />
              <div className="show-tags">
                {show.tags.map((tag) => (
                  <span key={tag}>
                    <Check size={13} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="custom-show-note">
          <span className="custom-show-icon">
            <Sparkles size={25} />
          </span>
          <div>
            <h3>{t("Your idea deserves its own show.")}</h3>
            <p>{t("Every production can be adapted for your venue, audience and vision.")}</p>
          </div>
          <Link to="/contact" className="text-link">
            {t("Build something together")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
