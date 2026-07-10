import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import hero from "@/assets/hero.jpg";
import brandAcrobatics from "@/assets/brand-acrobatics.jpg";
import brandIllusions from "@/assets/brand-illusions.jpg";

export const Route = createFileRoute("/shows")({
  head: () => ({
    meta: [
      { title: "Shows - UB Circus" },
      { name: "description", content: "Signature live shows and touring productions from UB Circus." },
      { property: "og:title", content: "Shows - UB Circus" },
      { property: "og:description", content: "Signature live shows and touring productions." },
    ],
  }),
  component: ShowsPage,
});

const SHOWS = [
  {
    code: "S01",
    title: "Weightless",
    tag: "Aerial / 75 min",
    venue: "State Opera & Ballet, UB",
    date: "Fri 12 Mar",
    copy: "A vertical show of silk, straps and breath-held balance for gala stages and theatrical venues.",
    image: hero,
    notes: ["Aerial rig", "Live host", "Tour ready"],
  },
  {
    code: "S02",
    title: "The Paper Circus",
    tag: "Family / 60 min",
    venue: "Corporate Palace",
    date: "Sat 27 Apr",
    copy: "A warm physical-theatre matinee with clowns, object play and audience-facing comedy.",
    image: brandAcrobatics,
    notes: ["Family", "Low rig", "Daytime"],
  },
  {
    code: "S03",
    title: "Ink & Smoke",
    tag: "Illusion / 90 min",
    venue: "UB Circus Hall",
    date: "Sun 09 Jun",
    copy: "Grand illusion, close-up camera work and stagecraft built around reveal moments.",
    image: brandIllusions,
    notes: ["Illusion", "Lighting plot", "Reveal"],
  },
  {
    code: "S04",
    title: "Nomad Nights",
    tag: "Touring / 80 min",
    venue: "Erdenet / Darkhan",
    date: "Aug - Sep",
    copy: "A touring production that adapts to public squares, festivals and regional theatres.",
    image: brandAcrobatics,
    notes: ["Outdoor", "Touring", "Festival"],
  },
] as const;

function ShowsPage() {
  const featured = SHOWS[0];

  return (
    <PageShell>
      <section className="paper-grid border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-16 pt-16 md:grid-cols-12 md:px-10 md:pb-24 md:pt-24">
          <div className="md:col-span-7">
            <div className="border-y border-foreground/15 py-3 font-display text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Programme / Season 2026
            </div>
            <h1 className="mt-7 font-display text-7xl leading-[0.82] sm:text-8xl md:text-9xl">
              Shows that
              <br />
              move rooms.
            </h1>
            <p className="mt-8 max-w-2xl border-l-2 border-foreground pl-5 text-lg leading-relaxed text-foreground/80">
              Signature productions from our three companies. Each show tours
              nationally and can be adapted for private galas, festivals and
              brand stages.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="border border-foreground bg-background/80">
              <div className="aspect-[4/3] overflow-hidden bg-foreground">
                <img src={featured.image} alt={featured.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Featured production
                </p>
                <h2 className="mt-3 font-display text-5xl leading-none">{featured.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground/70">{featured.copy}</p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex bg-foreground px-5 py-3 font-display text-sm uppercase tracking-[0.2em] text-background"
                >
                  Request this show
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-px bg-foreground/15 md:grid-cols-2">
            {SHOWS.map((show) => (
              <article key={show.code} className="group bg-background">
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[4/3] overflow-hidden bg-foreground md:aspect-auto">
                    <img
                      src={show.image}
                      alt={show.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-4 top-4 bg-background px-3 py-2 font-display text-xs uppercase tracking-[0.24em]">
                      {show.code}
                    </div>
                  </div>
                  <div className="flex min-h-[320px] flex-col justify-between p-6 md:p-8">
                    <div>
                      <p className="font-display text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {show.tag}
                      </p>
                      <h3 className="mt-3 font-display text-5xl leading-none">{show.title}</h3>
                      <p className="mt-5 text-sm leading-relaxed text-foreground/70">{show.copy}</p>
                    </div>
                    <div>
                      <div className="mt-8 flex flex-wrap gap-2">
                        {show.notes.map((note) => (
                          <span key={note} className="border border-foreground/30 px-3 py-1 font-display text-xs uppercase tracking-[0.18em]">
                            {note}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex items-end justify-between border-t border-foreground/15 pt-4">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {show.venue}
                        </span>
                        <span className="font-display text-2xl">{show.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
