import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import {
  availableFilters,
  BookingCTA,
  FilterBar,
  PageIntro,
  PosterCard,
} from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";
import { pageHead } from "@/lib/page-meta";
import { imageSrc } from "@/lib/site-images";

export const Route = createFileRoute("/projects")({
  head: () => pageHead("/projects"),
  component: ProjectsPage,
});
const CATEGORIES = ["All work", "Film", "Brand", "Stage"] as const;

function ProjectsPage() {
  const { t } = useLanguage();
  const { projects: PROJECTS, shows } = useSiteContent();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All work");
  const filters = availableFilters(
    CATEGORIES,
    PROJECTS.map((project) => project.category),
  );
  const active = filters.includes(category) ? category : "All work";
  const projects = PROJECTS.filter(
    (project) => active === "All work" || project.category === active,
  );
  // A project still on the default photo shows its namesake show's poster. One picked in the admin panel wins.
  const posterOf = (project: (typeof PROJECTS)[number]) =>
    project.image === imageSrc("builtin:hero")
      ? (shows.find((show) => show.title === project.title)?.image ?? project.image)
      : project.image;
  return (
    <PageShell>
      <PageIntro
        eyebrow={t("Selected work")}
        title={
          <>
            {t("Ideas that")}
            <br />
            <span className="accent-text">{t("take the stage.")}</span>
          </>
        }
        description={t(
          "We bring creative direction, extraordinary performers and thoughtful production together. Here’s what that looks like.",
        )}
      />
      <section className="container catalogue-section">
        <div className="catalogue-toolbar">
          <FilterBar
            options={filters}
            selected={active}
            onChange={setCategory}
            label={t("Filter projects by discipline")}
          />
          <span className="results-count" aria-live="polite">
            {projects.length} {t(projects.length === 1 ? "project" : "projects")}
          </span>
        </div>
        <div className="show-feature-list">
          {projects.length === 0 && (
            <p className="results-count">
              {t("New work is on its way. Get in touch to discuss your project.")}
            </p>
          )}
          {projects.map((project) => (
            <div className="show-feature-item" key={project.id}>
              <PosterCard
                image={posterOf(project)}
                alt={project.title + " — " + project.type}
                heading="h2"
                title={
                  <Link
                    to="/contact"
                    search={{ show: project.title }}
                    className="show-feature-link"
                    aria-label={"Discuss a project like " + project.title}
                  >
                    {project.title}
                  </Link>
                }
                meta={`${project.type} · ${project.client} · ${project.year}`}
                description={project.description}
              />
            </div>
          ))}
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
