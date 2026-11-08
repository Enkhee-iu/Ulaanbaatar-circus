import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { availableFilters, BookingCTA, FilterBar, PageIntro } from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";
import { pageHead } from "@/lib/page-meta";

export const Route = createFileRoute("/events")({
  head: () => pageHead("/events"),
  component: EventsPage,
});
const CATEGORIES = ["All events", "Public", "Family", "Private", "Touring"] as const;

function EventsPage() {
  const { t, language } = useLanguage();
  const { events: EVENTS } = useSiteContent();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All events");
  const filters = availableFilters(
    CATEGORIES,
    EVENTS.map((event) => event.category),
  );
  const active = filters.includes(category) ? category : "All events";
  const events = EVENTS.filter((event) => active === "All events" || event.category === active);
  return (
    <PageShell>
      <PageIntro
        word="EVENTS"
        eyebrow={t("The season calendar")}
        title={
          <>
            {t("Good nights.")}
            <br />
            <span className="accent-text">{t("Great memories.")}</span>
          </>
        }
        description={t(
          "From opening nights to open-air stages. Explore the places and moments that make up our season.",
        )}
      >
        <div className="intro-note">
          <CalendarDays size={18} />
          {t("Performances & dates")}
        </div>
      </PageIntro>
      <section className="container catalogue-section">
        {events.length > 0 && (
          <div className="catalogue-toolbar">
            <FilterBar
              options={filters}
              selected={active}
              onChange={setCategory}
              label={t("Filter events by type")}
            />
            <span className="results-count" aria-live="polite">
              {events.length} {t(events.length === 1 ? "event" : "events")}
            </span>
          </div>
        )}
        <div className="event-list" hidden={events.length === 0}>
          {events.map((event) => (
            <article className="event-row" key={event.id}>
              <time dateTime={event.date} className="event-date">
                <span>
                  {new Date(event.date + "T00:00:00Z").toLocaleDateString(
                    language === "mn" ? "mn-MN" : "en",
                    {
                      month: "short",
                      timeZone: "UTC",
                    },
                  )}
                </span>
                <strong>{event.date.slice(8)}</strong>
                <small>{event.date.slice(0, 4)}</small>
              </time>
              <div className="event-detail">
                <span className="event-category">
                  {t(event.category)}
                  <span className="past-badge">
                    {event.date <
                    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" })
                      ? t("Past event")
                      : t("Upcoming")}
                  </span>
                </span>
                <h2>{event.title}</h2>
                <div className="event-meta">
                  <span>
                    <MapPin size={14} />
                    {event.venue}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {event.time}
                  </span>
                </div>
              </div>
              <Link
                to="/contact"
                search={{ show: event.title }}
                className="event-enquiry"
                aria-label={"Enquire about " + event.title}
              >
                {t("Enquire about this show")}
                <ArrowUpRight size={20} />
              </Link>
            </article>
          ))}
        </div>
        <div className="calendar-note">
          <CalendarDays size={22} />
          <div>
            <h3>{t("Looking for the next date?")}</h3>
            <p>{t("Get in touch for new performances, availability or a show at your venue.")}</p>
          </div>
          <Link to="/contact" className="button button-outline">
            {t("Talk to the team")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
