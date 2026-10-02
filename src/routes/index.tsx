import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Asterisk, Play, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { BookingCTA, SectionHeading, ShowCard } from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";

import heroVideo from "@/assets/hero.mp4.asset.json";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { t } = useLanguage();
  const { shows: SHOWS, projects: PROJECTS, settings } = useSiteContent();
  const hero = settings.heroImage;
  const aerial = settings.aboutImage;
  const [filmError, setFilmError] = useState(false);
  return (
    <PageShell>
      <section className="container hero-wrap" aria-label={t("Welcome to UB Circus")}>
        <div className="hero">
          <img
            className="hero-image"
            src={hero}
            alt={t("An aerial artist on red silks under warm theatrical spotlights")}
            width={1536}
            height={1024}
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="hero-eyebrow">
              <span className="status-dot" /> {settings.heroEyebrow}
            </span>
            <h1>
              {settings.heroTitle}
              <br />
              <span>{settings.heroAccent}</span>
              <Asterisk className="hero-star" size={66} strokeWidth={1.5} />
            </h1>
            <p style={{ whiteSpace: "pre-line" }}>{settings.heroDescription}</p>
            <div className="hero-actions">
              <Link to="/shows" className="button button-lime">
                {t("Explore our shows")}
                <ArrowUpRight size={19} />
              </Link>
              <Link to="/contact" className="button button-glass">
                {t("Create with us")}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#discover" className="hero-discover">
              <span className="icon-circle">
                <ArrowDown size={18} />
              </span>{" "}
              {t("A little wonder awaits")}
            </a>
            <Dialog.Root
              onOpenChange={(open) => {
                if (open) setFilmError(false);
              }}
            >
              <Dialog.Trigger asChild>
                <button className="film-trigger" type="button">
                  <span className="play-circle">
                    <Play size={17} fill="currentColor" />
                  </span>
                  <span>
                    {t("Step into our world")}
                    <small>{t("Watch the film")}</small>
                  </span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="film-overlay" />
                <Dialog.Content className="film-dialog">
                  <div className="film-dialog-heading">
                    <Dialog.Title>{t("A glimpse of the extraordinary.")}</Dialog.Title>
                    <Dialog.Close className="icon-button" aria-label={t("Close film")}>
                      <X size={24} />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">
                    {t("Watch a UB Circus aerial performance film.")}
                  </Dialog.Description>
                  {filmError ? (
                    <div className="film-unavailable">
                      <img src={hero} alt={t("UB Circus aerial silk performance")} />
                      <p>{t("The film is currently unavailable.")}</p>
                      <Dialog.Close asChild>
                        <Link to="/shows" className="text-link">
                          {t("Explore the shows")}
                          <ArrowUpRight size={18} />
                        </Link>
                      </Dialog.Close>
                    </div>
                  ) : (
                    <video
                      src={heroVideo.url}
                      poster={hero}
                      controls
                      autoPlay
                      playsInline
                      onError={() => setFilmError(true)}
                    />
                  )}
                  <span className="film-caption">
                    {t("UB Circus · A new perspective on live performance")}
                  </span>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          <span className="hero-image-label">{t("THE ART OF FEELING SOMETHING.")}</span>
        </div>
      </section>

      <section
        id="discover"
        className="container stats-strip"
        aria-label={t("UB Circus in numbers")}
      >
        <div className="stats-intro">
          <Asterisk size={30} />
          <span>
            {t("Small beginnings.")}
            <br />
            {t("Extraordinary possibilities.")}
          </span>
        </div>
        <div>
          <strong>{settings.statsShows}</strong>
          <span>{t("Shows & experiences")}</span>
        </div>
        <div>
          <strong>{settings.statsArtists}</strong>
          <span>{t("Extraordinary artists")}</span>
        </div>
        <div>
          <strong>{settings.since}</strong>
          <span>{t("Where our story began")}</span>
        </div>
      </section>

      <section className="container section-space">
        <SectionHeading
          eyebrow={t("The spotlight is yours")}
          title={
            <>
              {t("Not just a show.")}
              <br />
              <span className="muted-heading">{t("A whole new feeling.")}</span>
            </>
          }
          link={{ to: "/shows", label: "Discover all shows" }}
        />
        <div className="show-grid">
          {SHOWS.slice(0, 3).map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </section>

      <section className="container experience-section">
        <div className="experience-image">
          <img
            src={aerial}
            alt={t("Acrobats performing a dramatic act together")}
            width={1200}
            height={1500}
            loading="lazy"
          />
          <span className="experience-label">
            <span className="status-dot" />
            {t(" Every moment, made by people.")}
          </span>
          <div className="image-caption">
            <span>{t("Artistry in motion.")}</span>
            <Asterisk size={46} strokeWidth={1.3} />
          </div>
        </div>
        <div className="experience-copy">
          <span className="eyebrow">{t("The people behind the impossible")}</span>
          <h2>
            {t("Human talent.")}
            <br />
            <span className="muted-heading">
              {t("Otherworldly")}
              <br />
              {t("energy.")}
            </span>
          </h2>
          <p>
            {t(
              "We’re a collective of artists, dreamers and makers in Ulaanbaatar. Bringing together fearless movement, playful storytelling and a little bit of magic.",
            )}
          </p>
          <p>
            {t(
              "From an intimate brand moment to a stage full of possibility, we build the experience around you.",
            )}
          </p>
          <div className="service-links">
            {["Aerial & acrobatics", "Theatre & characters", "Illusion & magic"].map(
              (service, i) => (
                <Link to="/shows" key={service}>
                  <span>0{i + 1}</span>
                  {t(service)}
                  <ArrowUpRight size={19} />
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="container section-space work-section">
        <SectionHeading
          eyebrow={t("Made to be remembered")}
          title={
            <>
              {t("Big ideas.")}
              <br />
              <span className="muted-heading">{t("Brought to life.")}</span>
            </>
          }
          description={t(
            "A few of the worlds we’ve helped create. From first thought to final applause.",
          )}
          link={{ to: "/projects", label: "Explore our work" }}
        />
        <div className="home-work-grid">
          {PROJECTS.slice(0, 2).map((project) => (
            <Link to="/projects" className="home-work-card" key={project.title}>
              <div className="work-image">
                <img
                  src={project.image}
                  alt={project.title + " production"}
                  loading="lazy"
                  width={1200}
                  height={800}
                />
                <span className="image-tag">{project.type}</span>
                <span className="card-arrow">
                  <ArrowUpRight size={23} />
                </span>
              </div>
              <div className="work-card-heading">
                <h3>{project.title}</h3>
                <span>
                  {project.client} · {project.year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
