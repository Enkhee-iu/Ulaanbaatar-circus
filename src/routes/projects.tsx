import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import brandAcrobatics from "@/assets/brand-acrobatics.jpg";
import brandIllusions from "@/assets/brand-illusions.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects - UB Circus" },
      { name: "description", content: "Selected productions, brand collaborations and film work." },
      { property: "og:title", content: "Projects - UB Circus" },
      { property: "og:description", content: "Selected productions and collaborations." },
    ],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  {
    title: "Weightless",
    subtitle: "Aerial Film",
    client: "MNB / Film Series",
    year: "2025",
    img: hero,
    scope: "Direction / aerial casting / safety rigging",
  },
  {
    title: "Gobi Wool",
    subtitle: "Runway Reveal",
    client: "Gobi Cashmere",
    year: "2025",
    img: hero,
    scope: "Reveal moment / movement design / show call",
  },
  {
    title: "Ink & Smoke",
    subtitle: "Stage Design",
    client: "UB Circus Hall",
    year: "2024",
    img: brandIllusions,
    scope: "Illusion design / lighting / close-up camera",
  },
  {
    title: "Nomad Nights",
    subtitle: "Tour",
    client: "MNP / Tour Ops",
    year: "2024",
    img: brandAcrobatics,
    scope: "Touring package / public square adaptation",
  },
] as const;

function ProjectsPage() {
  const lead = PROJECTS[0];
  const rest = PROJECTS.slice(1);

  return (
    <PageShell>
      <section className="paper-grid border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-16 pt-16 md:grid-cols-12 md:px-10 md:pb-24 md:pt-24">
          <div className="md:col-span-7">
            <div className="border-y border-foreground/15 py-3 font-display text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Portfolio / Selected work
            </div>
            <h1 className="mt-7 font-display text-7xl leading-[0.82] sm:text-8xl md:text-9xl">
              Projects with
              <br />
              a pulse.
            </h1>
          </div>
          <div className="flex flex-col justify-end md:col-span-5">
            <p className="max-w-xl border-l-2 border-foreground pl-5 text-lg leading-relaxed text-foreground/80">
              Selected productions, brand collaborations and camera-facing
              circus work built from concept through stage management.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <article className="grid border border-foreground md:grid-cols-12">
            <div className="relative aspect-[4/3] overflow-hidden bg-foreground md:col-span-7 md:aspect-auto">
              <img src={lead.img} alt={lead.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex justify-between border-t border-background/60 pt-3 font-display text-xs uppercase tracking-[0.24em] text-background">
                <span>Featured case</span>
                <span>{lead.year}</span>
              </div>
            </div>
            <div className="flex flex-col justify-between p-6 md:col-span-5 md:p-10">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {lead.client}
                </p>
                <h2 className="mt-4 font-display text-6xl leading-none md:text-8xl">
                  {lead.title}
                </h2>
                <p className="mt-2 font-display text-3xl leading-none text-foreground/45">
                  {lead.subtitle}
                </p>
                <p className="mt-8 text-base leading-relaxed text-foreground/75">{lead.scope}</p>
              </div>
              <Link
                to="/contact"
                className="mt-10 inline-flex w-fit bg-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-background"
              >
                Build similar
              </Link>
            </div>
          </article>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {rest.map((project, index) => (
              <article key={project.title} className="group">
                <div className="relative aspect-[4/5] overflow-hidden border border-foreground/20 bg-foreground">
                  <img
                    src={project.img}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 bg-background px-3 py-2 font-display text-xs uppercase tracking-[0.24em]">
                    0{index + 2}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-background">
                    <p className="font-display text-xs uppercase tracking-[0.24em] text-background/70">
                      {project.client}
                    </p>
                    <h3 className="mt-2 font-display text-5xl leading-none">{project.title}</h3>
                    <p className="font-display text-2xl leading-none text-background/70">
                      {project.subtitle}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-foreground/20 pt-4">
                  <p className="text-sm leading-relaxed text-foreground/70">{project.scope}</p>
                  <span className="font-display text-2xl text-foreground/40">{project.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
