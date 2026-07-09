import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — UB Circus" },
      { name: "description", content: "Upcoming and past events produced by UB Circus." },
      { property: "og:title", content: "Events — UB Circus" },
      { property: "og:description", content: "Upcoming and past events produced by UB Circus." },
    ],
  }),
  component: EventsPage,
});

const EVENTS = [
  { d: "12", m: "MAR", title: "Weightless — Opening Night", venue: "State Opera, Ulaanbaatar", type: "Public" },
  { d: "27", m: "APR", title: "The Paper Circus (Family Matinee)", venue: "Corporate Palace", type: "Family" },
  { d: "18", m: "MAY", title: "Brand Reveal — Gobi Wool", venue: "Hunnu Mall Rooftop", type: "Private" },
  { d: "09", m: "JUN", title: "Ink & Smoke Premiere", venue: "UB Circus Hall", type: "Public" },
  { d: "24", m: "AUG", title: "Nomad Nights — Erdenet", venue: "Central Square", type: "Touring" },
];

function EventsPage() {
  return (
    <PageShell>
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-12 md:px-10 md:pt-24">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Calendar · 2026
          </p>
          <h1 className="mt-4 font-display text-[14vw] leading-[0.85] md:text-[8vw]">Events</h1>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <ul>
            {EVENTS.map((e, i) => (
              <li
                key={i}
                className="grid grid-cols-12 items-center gap-4 border-b border-foreground/20 py-8"
              >
                <div className="col-span-3 md:col-span-2">
                  <div className="font-display text-6xl leading-none">{e.d}</div>
                  <div className="mt-1 font-display text-xs tracking-[0.3em] text-muted-foreground">
                    {e.m}
                  </div>
                </div>
                <div className="col-span-9 md:col-span-7">
                  <div className="font-display text-2xl md:text-3xl">{e.title}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {e.venue}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <span className="border border-foreground/50 px-3 py-1 font-display text-xs uppercase tracking-[0.2em]">
                    {e.type}
                  </span>
                </div>
                <div className="col-span-6 text-right md:col-span-1">
                  <a href="#" className="font-display text-xs uppercase tracking-[0.25em] underline underline-offset-4">
                    RSVP →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
