import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/shows")({
  head: () => ({
    meta: [
      { title: "Shows — UB Circus" },
      { name: "description", content: "Signature live shows and touring productions from UB Circus." },
      { property: "og:title", content: "Shows — UB Circus" },
      { property: "og:description", content: "Signature live shows and touring productions." },
    ],
  }),
  component: ShowsPage,
});

const SHOWS = [
  { code: "S01", title: "Weightless", tag: "Aerial · 75 min", venue: "State Opera & Ballet, UB", date: "Fri 12 Mar" },
  { code: "S02", title: "The Paper Circus", tag: "Family · 60 min", venue: "Corporate Palace", date: "Sat 27 Apr" },
  { code: "S03", title: "Ink & Smoke", tag: "Illusion · 90 min", venue: "UB Circus Hall", date: "Sun 09 Jun" },
  { code: "S04", title: "Nomad Nights", tag: "Touring · 80 min", venue: "Erdenet · Darkhan", date: "Aug — Sep" },
];

function ShowsPage() {
  return (
    <PageShell>
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Programme · Season 2026
          </p>
          <h1 className="mt-4 font-display text-[14vw] leading-[0.85] md:text-[8vw]">Shows</h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/75">
            Signature productions from our three companies. Each show tours
            nationally and can be adapted for private galas and festivals.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <ul>
            {SHOWS.map((s) => (
              <li
                key={s.code}
                className="group grid grid-cols-12 items-baseline gap-4 border-b border-foreground/20 py-8 transition-colors hover:bg-foreground hover:text-background"
              >
                <span className="col-span-2 font-display text-sm tracking-[0.2em] text-muted-foreground group-hover:text-background/70 md:col-span-1">
                  {s.code}
                </span>
                <span className="col-span-10 font-display text-3xl md:col-span-5 md:text-5xl">
                  {s.title}
                </span>
                <span className="col-span-6 text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-background/70 md:col-span-2">
                  {s.tag}
                </span>
                <span className="col-span-6 text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-background/70 md:col-span-2">
                  {s.venue}
                </span>
                <span className="col-span-12 text-xs uppercase tracking-[0.2em] md:col-span-2 md:text-right">
                  {s.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
