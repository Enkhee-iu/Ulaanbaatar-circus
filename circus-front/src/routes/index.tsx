import { SmartImage } from "@/components/site/Loading";
import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { BookingCTA, SectionHeading, ShowFeatureCard } from "@/components/site/Sections";
import { ShowLightbox } from "@/components/site/ShowLightbox";
import { useSiteContent } from "@/components/site/SiteContent";
import { YouTubeHero, youtubeVideoId } from "@/components/site/YouTubeHero";
import { HeroPlaybackButton } from "@/components/site/HeroPlaybackButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TextReveal } from "@/components/ui/text-reveal";
import { imageSrc, sizedImage } from "@/lib/site-images";
import spotlightImage from "@/assets/spotlight-firebird.webp";
import teamAcrobaticsImage from "@/assets/team-acrobatics.webp";
import teamContortionImage from "@/assets/team-contortion.webp";
import teamTheatreImage from "@/assets/team-theatre.webp";

export const Route = createFileRoute("/")({ component: HomePage });

const DISCIPLINES = [
  {
    name: "Aerial & acrobatics",
    text: "Silks, straps and balance, high above the stage.",
    image: null,
  },
  {
    name: "Contortion",
    text: "Flexibility, balance and strength on stage.",
    image: teamContortionImage,
  },
  {
    name: "Theatre & characters",
    text: "Physical theatre and big characters for all ages.",
    image: teamTheatreImage,
  },
];

function HomePage() {
  const { t } = useLanguage();
  const { shows: SHOWS, settings } = useSiteContent();
  const youtubeId = youtubeVideoId(settings.heroVideoUrl || "");
  // Admin-edited titles can run far longer than the default; they get a smaller poster size.
  const longTitle = settings.heroTitle.length + settings.heroAccent.length > 24;
  return (
    <PageShell>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-media">
          <SmartImage className="home-hero-poster" src={settings.heroImage} alt="" />
          {youtubeId ? (
            <YouTubeHero key={youtubeId} videoId={youtubeId} />
          ) : (
            settings.heroVideoUrl && (
              <HeroBackgroundVideo
                key={settings.heroVideoUrl}
                src={settings.heroVideoUrl}
                poster={settings.heroImage}
              />
            )
          )}
          <div className="hero-video-shade" aria-hidden="true" />
        </div>
        <div className="container home-hero-copy">
          <span className="eyebrow home-hero-rise">{settings.heroEyebrow}</span>
          <h1 id="home-hero-title" className={longTitle ? "is-long" : undefined}>
            <span className="home-hero-line">
              <TextReveal>{settings.heroTitle}</TextReveal>
            </span>{" "}
            <span className="home-hero-line home-accent">
              <TextReveal>{settings.heroAccent}</TextReveal>
            </span>
          </h1>
          <div className="home-hero-footer home-hero-rise">
            <p>{settings.heroDescription}</p>
            <div className="home-hero-actions">
              <Link to="/shows" className="button home-button-primary">
                {t("Explore our shows")}
                <ArrowUpRight size={18} />
              </Link>
              <Link to="/contact" className="button home-button-secondary">
                {t("Book a show")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-spotlight home-scroll-reveal">
        <div>
          <h2>{t("Step into the world of Ulaanbaatar Circus")}</h2>
          <p>{t("Stories, masks and movement that stay with you long after the curtain falls.")}</p>
        </div>
        <img
          src={spotlightImage}
          alt={t("Performer in a firebird mask")}
          width={800}
          height={1045}
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="container section-space home-scroll-reveal">
        <SectionHeading
          title={<TextReveal>{t("Our shows")}</TextReveal>}
          link={{ to: "/shows", label: "Discover all shows" }}
        />
        <div className="show-feature-list">
          {SHOWS.slice(0, 4).map((show) => (
            <div className="show-feature-item" key={show.id}>
              <ShowFeatureCard show={show} />
            </div>
          ))}
        </div>
      </section>

      <ShowGallery />

      <TeamSection />

      <BookingCTA />
    </PageShell>
  );
}

const GALLERY_INTERVAL_MS = 2000;
// Enough slides to overfill the widest row, or a loop has nowhere to go.
const GALLERY_MIN_SLIDES = 12;

function ShowGallery() {
  const { t } = useLanguage();
  const { shows } = useSiteContent();
  const [selected, setSelected] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Photos are keyed by address, so one used twice appears once: under the show it's the cover of,
  // otherwise under the first show whose gallery holds it.
  const titles = useMemo(() => {
    const map = new Map<string, string>();
    for (const show of shows) map.set(show.image, show.title);
    for (const show of shows)
      for (const src of show.gallery || []) if (!map.has(src)) map.set(src, show.title);
    return map;
  }, [shows]);
  const images = useMemo(() => [...titles.keys()], [titles]);
  const moves = images.length > 1;
  const copies = moves ? Math.ceil(GALLERY_MIN_SLIDES / images.length) : 1;
  const paused = hovering || keyboardFocus || dragging || selected !== null;
  useEffect(() => {
    if (!api) return;
    const down = () => setDragging(true);
    const up = () => setDragging(false);
    api.on("pointerDown", down);
    api.on("pointerUp", up);
    return () => {
      api.off("pointerDown", down);
      api.off("pointerUp", up);
    };
  }, [api]);
  useEffect(() => {
    if (!api || !moves || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) api.scrollNext();
    }, GALLERY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [api, moves, paused]);
  if (images.length === 0) return null;
  return (
    <section className="container home-gallery">
      <SectionHeading title={<TextReveal>{t("Our Gallery")}</TextReveal>} />
      <Carousel
        opts={{ align: "start", loop: moves, duration: 30 }}
        setApi={setApi}
        aria-label={t("Show photo gallery")}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && setHovering(false)}
        // Tab, not focus: closing the lightbox also returns focus here, and that shouldn't stop the row.
        onKeyUp={(event) => event.key === "Tab" && setKeyboardFocus(true)}
        onBlur={() => setKeyboardFocus(false)}
      >
        <CarouselContent className="home-gallery-track">
          {Array.from({ length: copies }, (_, copy) =>
            images.map((src, index) => (
              <CarouselItem
                className="home-gallery-slide"
                key={`${src}-${copy}`}
                aria-hidden={copy > 0 || undefined}
              >
                <button
                  type="button"
                  className="home-gallery-item"
                  tabIndex={copy > 0 ? -1 : undefined}
                  aria-label={`${t("View photo")} ${index + 1}: ${titles.get(src)}`}
                  onClick={() => setSelected(src)}
                >
                  <SmartImage src={sizedImage(src, 800)} alt="" loading="lazy" decoding="async" />
                  <span className="home-gallery-caption">{titles.get(src)}</span>
                </button>
              </CarouselItem>
            )),
          )}
        </CarouselContent>
      </Carousel>
      {/* Outside the Carousel: its key handler would otherwise also catch the lightbox's arrows. */}
      <ShowLightbox
        images={images}
        selected={selected}
        onSelect={setSelected}
        titleOf={(src) => titles.get(src) ?? ""}
      />
    </section>
  );
}

function TeamSection() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  const [active, setActive] = useState(0);
  // The first image stays editable from the admin panel's "Танилцуулгын зураг" setting. Until someone
  // picks another, the setting's default shows the team's acrobatics photo.
  const aboutImage =
    settings.aboutImage === imageSrc("builtin:acrobatics")
      ? teamAcrobaticsImage
      : settings.aboutImage;
  const images = DISCIPLINES.map((d) => (d.image ? imageSrc(d.image) : aboutImage));
  return (
    <section className="container home-team home-scroll-reveal">
      <div className="home-team-intro">
        <h2>
          <TextReveal>{t("Our team")}</TextReveal>
        </h2>
        <div>
          <p>
            {t(
              "We’re a team of performers based in Ulaanbaatar: acrobats, aerialists, contortionists and actors.",
            )}
          </p>
          <p>
            {t(
              "We play big stages and company events, and shape each show to fit the venue and the audience.",
            )}
          </p>
        </div>
      </div>
      <div className="home-team-grid">
        <div className="home-team-stage">
          {images.map((src, i) => (
            <SmartImage
              key={i}
              className={i === active ? "is-active" : undefined}
              src={src}
              alt=""
              width={1200}
              height={800}
              loading="lazy"
            />
          ))}
        </div>
        {/* Every row's text is always visible, so swapping the picture is purely an enhancement. */}
        <ul className="home-team-list">
          {DISCIPLINES.map((discipline, i) => (
            <li
              key={discipline.name}
              className={i === active ? "is-active" : undefined}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <SmartImage
                className="home-team-thumb"
                src={images[i]}
                alt={t(discipline.name)}
                width={1200}
                height={800}
                loading="lazy"
              />
              <strong>{t(discipline.name)}</strong>
              <span>{t(discipline.text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HeroBackgroundVideo({ src, poster }: { src: string; poster: string }) {
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
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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
