import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events - UB Circus" },
      { name: "description", content: "Upcoming and past events produced by UB Circus." },
      { property: "og:title", content: "Events - UB Circus" },
      { property: "og:description", content: "Upcoming and past events produced by UB Circus." },
    ],
  }),
  component: EventsPage,
});

const EVENTS = [
  {
    d: "12",
    m: "MAR",
    title: "Weightless - Opening Night",
    venue: "State Opera, Ulaanbaatar",
    type: "Public",
    time: "19:30",
    status: "Tickets open",
  },
  {
    d: "27",
    m: "APR",
    title: "The Paper Circus",
    venue: "Corporate Palace",
    type: "Family",
    time: "14:00",
    status: "Matinee",
  },
  {
    d: "18",
    m: "MAY",
    title: "Gobi Wool Reveal",
    venue: "Hunnu Mall Rooftop",
    type: "Private",
    time: "20:00",
    status: "Invite only",
  },
  {
    d: "09",
    m: "JUN",
    title: "Ink & Smoke Premiere",
    venue: "UB Circus Hall",
    type: "Public",
    time: "19:00",
    status: "Announced",
  },
  {
    d: "24",
    m: "AUG",
    title: "Nomad Nights - Erdenet",
    venue: "Central Square",
    type: "Touring",
    time: "18:30",
    status: "Tour stop",
  },
] as const;

const STATS = [
  ["05", "Season dates"],
  ["03", "Public shows"],
  ["02", "Tour cities"],
] as const;

function EventsPage() {
  return (
    <PageShell>
      <section className="paper-grid border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-16 pt-16 md:grid-cols-12 md:px-10 md:pb-24 md:pt-24">
          <div className="md:col-span-8">
            <div className="border-y border-foreground/15 py-3 font-display text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Calendar / 2026
            </div>
            <h1 className="mt-7 font-display text-7xl leading-[0.82] sm:text-8xl md:text-9xl">
              Nights worth
              <br />
              marking.
            </h1>
            <p className="mt-8 max-w-2xl border-l-2 border-foreground pl-5 text-lg leading-relaxed text-foreground/80">
              Public premieres, touring dates and private productions from the
              UB Circus season calendar.
            </p>
          </div>
          <div className="grid gap-px bg-foreground/15 md:col-span-4">
            {STATS.map(([value, label]) => (
              <div key={label} className="bg-background/80 p-5">
                <div className="font-display text-5xl leading-none">{value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-20">
          <ul className="border-t border-foreground">
            {EVENTS.map((event) => (
              <li
                key={`${event.m}-${event.d}-${event.title}`}
                className="group grid gap-5 border-b border-foreground/20 py-7 transition-colors hover:bg-foreground hover:px-5 hover:text-background md:grid-cols-12 md:items-center"
              >
                <div className="flex items-end gap-3 md:col-span-2">
                  <span className="font-display text-7xl leading-none">{event.d}</span>
                  <span className="pb-2 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground group-hover:text-background/60">
                    {event.m}
                  </span>
                </div>
                <div className="md:col-span-5">
                  <h2 className="font-display text-3xl leading-none md:text-5xl">{event.title}</h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-background/60">
                    {event.venue}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-3">
                  <span className="border border-foreground/40 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] group-hover:border-background/50">
                    {event.type}
                  </span>
                  <span className="border border-foreground/40 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] group-hover:border-background/50">
                    {event.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 md:col-span-2 md:justify-end">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground group-hover:text-background/60">
                    {event.status}
                  </span>
                  <Link
                    to="/contact"
                    className="font-display text-xs uppercase tracking-[0.25em] underline underline-offset-4"
                  >
                    RSVP
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-foreground/15 bg-foreground text-background">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-10">
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            Need a date
            <br />
            for your venue?
          </h2>
          <Link
            to="/contact"
            className="inline-flex w-fit bg-background px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-foreground"
          >
            Start booking
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
