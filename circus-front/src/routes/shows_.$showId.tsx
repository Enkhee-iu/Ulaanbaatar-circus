import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Expand, Play } from "lucide-react";
import { getPublicContent } from "@/lib/content";
import { PageShell } from "@/components/site/PageShell";
import { useLanguage } from "@/components/site/Language";
import { useSiteContent } from "@/components/site/SiteContent";
import { SmartImage, Spinner } from "@/components/site/Loading";
import { SectionHeading, ShowCard } from "@/components/site/Sections";
import { ShowLightbox } from "@/components/site/ShowLightbox";

export const Route = createFileRoute("/shows_/$showId")({
  loader: async ({ params }) => {
    const content = await getPublicContent();
    const show = content.shows.find((item) => item.id === params.showId);
    if (!show) throw notFound();
    return show;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — UB Circus` : "UB Circus" },
      { name: "description", content: loaderData?.description || "" },
    ],
  }),
  component: ShowDetailPage,
});

function ShowDetailPage() {
  const { showId } = Route.useParams();
  const { shows } = useSiteContent();
  const { t } = useLanguage();
  const show = shows.find((item) => item.id === showId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoAttempt, setVideoAttempt] = useState(0);
  const images = useMemo(
    () => (show ? [...new Set([show.image, ...(show.gallery || [])])] : []),
    [show],
  );
  const selectedIndex = selectedImage === null ? -1 : images.indexOf(selectedImage);
  useEffect(() => {
    if (selectedImage !== null && !images.includes(selectedImage)) setSelectedImage(null);
  }, [selectedImage, images]);
  useEffect(() => {
    if (show) document.title = `${show.title} — UB Circus`;
  }, [show]);
  useEffect(() => {
    setSelectedImage(null);
    setVideoError(false);
    setVideoLoading(true);
    setVideoAttempt(0);
  }, [showId, show?.videoUrl]);
  if (!show)
    return (
      <PageShell>
        <section className="container show-missing">
          <h1>{t("This show is unavailable.")}</h1>
          <p>{t("Explore our current shows or contact us for availability.")}</p>
          <Link to="/shows" className="button button-lime">
            {t("Back to all shows")}
            <ArrowRight size={18} />
          </Link>
        </section>
      </PageShell>
    );
  const related = shows
    .filter((item) => item.id !== show.id)
    .sort((a, b) => Number(b.category === show.category) - Number(a.category === show.category))
    .slice(0, 3);
  return (
    <PageShell>
      <section className="show-detail-hero">
        <SmartImage
          src={show.image}
          alt={show.title}
          className="show-detail-cover"
          fetchPriority="high"
        />
        <div className="show-detail-shade" />
        <div className="container show-detail-hero-content">
          <Link to="/shows" className="show-back">
            <ArrowLeft size={16} />
            {t("All shows")}
          </Link>
          <span className="eyebrow">{t(show.category)} · UB CIRCUS</span>
          <h1>{show.title}</h1>
          <p>{show.description}</p>
          <div className="show-detail-actions">
            <Link to="/contact" search={{ show: show.title }} className="button button-lime">
              {t("Book this show")}
              <ArrowUpRight size={18} />
            </Link>
            <span>
              <Clock3 size={18} />
              {show.duration}
            </span>
          </div>
        </div>
      </section>
      <section className="container show-detail-layout">
        <div className="show-detail-story">
          <span className="eyebrow">{t("Inside the experience")}</span>
          <h2>{t("About the show")}</h2>
          <div className="show-detail-text">
            {(show.details || show.description).split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {show.tags.length > 0 && (
            <ul className="show-detail-tags">
              {show.tags.map((tag) => (
                <li key={tag}>
                  <Check size={16} />
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="show-booking-card">
          <span className="eyebrow">{t("Made for your stage")}</span>
          <h2>{t("Bring this world to your audience.")}</h2>
          <dl>
            <div>
              <dt>{t("Genre")}</dt>
              <dd>{t(show.category)}</dd>
            </div>
            <div>
              <dt>{t("Duration")}</dt>
              <dd>{show.duration}</dd>
            </div>
          </dl>
          <p>
            {t(
              "Tell us your date, venue and audience. We’ll discuss availability and production with you.",
            )}
          </p>
          <Link to="/contact" search={{ show: show.title }} className="button button-lime">
            {t("Book this show")}
            <ArrowUpRight size={18} />
          </Link>
        </aside>
      </section>
      <section className="container show-detail-gallery">
        <SectionHeading eyebrow={t("A closer look")} title={t("Moments from the show")} />
        <div className={"show-gallery-grid" + (images.length === 1 ? " single" : "")}>
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`${t("View photo")} ${index + 1}: ${show.title}`}
              onClick={() => setSelectedImage(src)}
            >
              <SmartImage src={src} alt={`${show.title} · ${index + 1}`} loading="lazy" />
              <span>
                <Expand size={20} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <ShowLightbox
        images={images}
        selected={selectedIndex >= 0 ? selectedImage : null}
        onSelect={setSelectedImage}
        titleOf={() => show.title}
      />
      {show.videoUrl && (
        <section className="container show-detail-video">
          <SectionHeading eyebrow={t("Artistry in motion.")} title={t("Watch the performance")} />
          <div className="show-video-player">
            {videoError ? (
              <div className="show-video-error">
                <Play size={30} />
                <p>{t("The video is currently unavailable.")}</p>
                <button
                  className="button button-outline"
                  onClick={() => {
                    setVideoAttempt((value) => value + 1);
                    setVideoError(false);
                    setVideoLoading(true);
                  }}
                >
                  {t("Try again")}
                </button>
              </div>
            ) : (
              <>
                <video
                  key={show.videoUrl + videoAttempt}
                  src={show.videoUrl}
                  poster={show.image}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={() => setVideoLoading(false)}
                  onWaiting={() => setVideoLoading(true)}
                  onCanPlay={() => setVideoLoading(false)}
                  onPlaying={() => setVideoLoading(false)}
                  onError={() => {
                    setVideoLoading(false);
                    setVideoError(true);
                  }}
                />
                {videoLoading && (
                  <span className="show-video-loading" role="status">
                    <Spinner />
                    {t("Loading video…")}
                  </span>
                )}
              </>
            )}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="container section-space">
          <SectionHeading
            eyebrow={t("Keep exploring")}
            title={t("More worlds to discover")}
            link={{ to: "/shows", label: "All shows" }}
          />
          <div className="show-grid">
            {related.map((item) => (
              <ShowCard key={item.id} show={item} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
