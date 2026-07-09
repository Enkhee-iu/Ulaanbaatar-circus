import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import brandAcrobatics from "@/assets/brand-acrobatics.jpg";
import brandTheatrics from "@/assets/brand-theatrics.jpg";
import brandIllusions from "@/assets/brand-illusions.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — UB Circus" },
      { name: "description", content: "Selected productions, brand collaborations and film work." },
      { property: "og:title", content: "Projects — UB Circus" },
      { property: "og:description", content: "Selected productions and collaborations." },
    ],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  { title: "Weightless — Aerial Film", client: "MNB · Film Series", year: "2025", img: hero },
  { title: "Gobi Wool — Runway Reveal", client: "Gobi Cashmere", year: "2025", img: brandTheatrics },
  { title: "Ink & Smoke — Stage Design", client: "UB Circus Hall", year: "2024", img: brandIllusions },
  { title: "Nomad Nights — Tour", client: "MNP · Tour Ops", year: "2024", img: brandAcrobatics },
];

function ProjectsPage() {
  return (
    <PageShell>
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-12 md:px-10 md:pt-24">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Portfolio · Selected work
          </p>
          <h1 className="mt-4 font-display text-[14vw] leading-[0.85] md:text-[8vw]">Projects</h1>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-8 md:grid-cols-2">
            {PROJECTS.map((p, i) => (
              <article key={i} className="group">
                <div className="aspect-[4/3] w-full overflow-hidden bg-foreground">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-foreground/20 pt-4">
                  <div>
                    <h3 className="font-display text-3xl leading-none">{p.title}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {p.client}
                    </p>
                  </div>
                  <span className="font-display text-2xl text-foreground/40">{p.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
