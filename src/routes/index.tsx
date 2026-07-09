import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import heroImg from "@/assets/hero.jpg";
import brandAcrobatics from "@/assets/brand-acrobatics.jpg";
import brandTheatrics from "@/assets/brand-theatrics.jpg";
import brandIllusions from "@/assets/brand-illusions.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const BRANDS = [
  {
    num: "01",
    name: "Aerial & Acrobatics",
    tag: "Bodies in flight",
    copy: "Silks, straps, hand-to-hand — our aerial ensemble opens galas, festivals, and brand launches with breath-holding choreography.",
    image: brandAcrobatics,
    tags: ["Aerial Silks", "Hand-to-Hand", "Cyr Wheel", "Trapeze"],
  },
  {
    num: "02",
    name: "Theatrics & Clown",
    tag: "The story on stage",
    copy: "Character-driven physical theatre, roaming performers, and tightly-scripted show acts for stages, streets and after-parties.",
    image: brandTheatrics,
    tags: ["Physical Theatre", "Roaming Acts", "MC & Host", "Stage Shows"],
  },
  {
    num: "03",
    name: "Illusions & Magic",
    tag: "The impossible, live",
    copy: "Close-up sleight of hand, grand illusions, and interactive magic experiences engineered for cameras and live audiences alike.",
    image: brandIllusions,
    tags: ["Close-up", "Grand Illusion", "Mentalism", "Brand Reveals"],
  },
] as const;

const MARQUEE = [
  "Ulaanbaatar",
  "Shows",
  "Events",
  "Productions",
  "Aerial",
  "Theatrics",
  "Illusions",
  "Since 2014",
];

function Index() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-16 pt-10 md:grid-cols-12 md:px-10 md:pb-24 md:pt-16">
          <div className="md:col-span-7 md:pr-6">
            <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Vol. 011 — The Ulaanbaatar Circus Journal
            </p>
            <h1 className="mt-6 font-display text-[15vw] leading-[0.85] md:text-[9vw]">
              A circus
              <br />
              for the <em className="not-italic underline decoration-[3px] underline-offset-[10px]">bold</em>.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">
              UB Circus produces live shows, brand events, and cinematic projects
              across Mongolia. Editorial in style, physical in execution — built
              for audiences that expect more than a spectacle.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 bg-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-background transition-transform hover:-translate-y-0.5"
              >
                Book a show →
              </Link>
              <Link
                to="/shows"
                className="inline-flex items-center gap-3 border border-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
              >
                See the programme
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-foreground/20 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Since</dt>
                <dd className="font-display text-3xl">2014</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Shows</dt>
                <dd className="font-display text-3xl">420+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Artists</dt>
                <dd className="font-display text-3xl">38</dd>
              </div>
            </dl>
          </div>

          <div className="relative md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-foreground">
              <img
                src={heroImg}
                alt="Aerial silks performer under a single spotlight"
                width={1920}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-background">
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em]">
                    Act 01 · Silk
                  </p>
                  <p className="font-display text-2xl leading-none">Weightless</p>
                </div>
                <span className="font-display text-xs uppercase tracking-[0.3em]">
                  Live · UB
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-foreground/20 pt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>Photograph — B. Nomin</span>
              <span>MMXXVI</span>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden border-t border-foreground/15 bg-foreground py-4 text-background">
          <div className="marquee-track whitespace-nowrap font-display text-3xl uppercase tracking-[0.15em] md:text-4xl">
            {[...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8">
                {w}
                <span className="h-1 w-1 rounded-full bg-background/60" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* OUR FEATURES / BRAND GROUPS */}
      <section id="brands" className="border-b border-foreground/15">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Our Features · 03 Brand Groups
              </p>
              <h2 className="mt-4 font-display text-6xl leading-[0.9] md:text-8xl">
                Three houses,
                <br />
                one company.
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-foreground/70">
              Every UB Circus production is built by one of our three in-house
              companies. Each has its own directors, artists and creative
              language — booked together or on their own.
            </p>
          </div>

          <div className="space-y-24">
            {BRANDS.map((b, i) => (
              <article
                key={b.num}
                className={`grid gap-8 md:grid-cols-12 md:gap-12 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="md:col-span-6">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-foreground">
                    <img
                      src={b.image}
                      alt={b.name}
                      width={1200}
                      height={1500}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center md:col-span-6">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-6xl text-foreground/25">{b.num}</span>
                    <span className="rule-line flex-1" />
                    <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {b.tag}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-5xl leading-none md:text-7xl">
                    {b.name}
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75">
                    {b.copy}
                  </p>
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {b.tags.map((t) => (
                      <li
                        key={t}
                        className="border border-foreground/40 px-3 py-1 font-display text-xs uppercase tracking-[0.2em]"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <Link
                      to="/shows"
                      className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] underline underline-offset-[8px] decoration-[2px]"
                    >
                      Explore the company →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center md:px-10">
          <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">
            Have a stage.
            <br />
            We'll fill it.
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/events"
              className="inline-flex items-center border border-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] hover:bg-foreground hover:text-background"
            >
              Upcoming events
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center bg-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-background"
            >
              Start a project →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
