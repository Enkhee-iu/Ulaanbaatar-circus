import { SmartImage } from "@/components/site/Loading";
import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { SectionHeading } from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";
import { YouTubeHero, youtubeVideoId } from "@/components/site/YouTubeHero";
import { HeroPlaybackButton } from "@/components/site/HeroPlaybackButton";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { t } = useLanguage();
  const { shows: SHOWS, settings } = useSiteContent();
  const aerial = settings.aboutImage;
  const youtubeId = youtubeVideoId(settings.heroVideoUrl || "");
  return (
    <PageShell>
      <section className="hero-video-stage" aria-label={t("Welcome to UB Circus")}>
        <h1 className="sr-only">UB Circus — {t("Shows & experiences")}</h1>
        {youtubeId ? (
          <YouTubeHero key={youtubeId} videoId={youtubeId} />
        ) : (
          settings.heroVideoUrl && (
            <HeroBackgroundVideo key={settings.heroVideoUrl} src={settings.heroVideoUrl} />
          )
        )}
        <div className="hero-video-shade" aria-hidden="true" />
        <div className="hero-video-actions">
          <Link to="/shows" className="button hero-video-primary">
            {t("Explore our shows")}
            <ArrowUpRight size={19} />
          </Link>
          <Link to="/contact" className="button hero-video-secondary">
            {t("Create with us")}
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>

      <section className="container welcome-section" aria-labelledby="welcome-heading">
        <div className="welcome-copy">
          <h2 id="welcome-heading">
            {settings.heroTitle} <span>{settings.heroAccent}</span>
          </h2>
          <p>{settings.heroDescription}</p>
        </div>
        <div className="welcome-portrait">
          <SmartImage
            src={aerial}
            alt={t("Acrobats performing a dramatic act together")}
            width={800}
            height={800}
            loading="lazy"
          />
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
        <div className="home-show-bento">
          {SHOWS.slice(0, 3).map((show, index) => (
            <Link
              key={show.id}
              to="/shows/$showId"
              params={{ showId: show.id }}
              className={`home-show-bento-card${index === 0 ? " featured" : ""}`}
            >
              <SmartImage
                src={show.image}
                alt={`${show.title} — ${t("Circus performance")}`}
                loading="lazy"
                width={1200}
                height={900}
              />
              <span className="home-show-bento-shade" />
              <span className="home-show-bento-category">{t(show.category)}</span>
              <span className="home-show-bento-arrow"><ArrowUpRight size={20} /></span>
              <span className="home-show-bento-copy">
                <span className="home-show-bento-meta">{show.duration}</span>
                <strong>{show.title}</strong>
                <span className="home-show-bento-description">{show.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container experience-section">
        <div className="experience-image">
          <SmartImage
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
    </PageShell>
  );
}

function HeroBackgroundVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [ready, setReady] = useState(false);
  const requestedPlayback = useRef<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const syncPlayback = () => {
      if (
        document.hidden ||
        !visible ||
        requestedPlayback.current === false ||
        (motion.matches && requestedPlayback.current !== true)
      )
        video.pause();
      else void video.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [failed]);
  if (failed) return null;
  return (
    <>
      <video
        ref={videoRef}
        className={"hero-background-video" + (hasFrame ? " is-playing" : "")}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        disablePictureInPicture
        onCanPlay={() => setReady(true)}
        onPlaying={() => {
          setPlaying(true);
          setHasFrame(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      />
      <HeroPlaybackButton
        playing={playing}
        disabled={!ready}
        onClick={() => {
          requestedPlayback.current = !playing;
          if (playing) videoRef.current?.pause();
          else void videoRef.current?.play().catch(() => setPlaying(false));
        }}
      />
    </>
  );
}
