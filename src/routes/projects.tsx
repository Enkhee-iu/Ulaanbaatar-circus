import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { BookingCTA, FilterBar, PageIntro } from "@/components/site/Sections";
import { useSiteContent } from "@/components/site/SiteContent";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Selected work — UB Circus" },
      {
        name: "description",
        content:
          "Live experiences, brand collaborations and film productions brought to life by UB Circus.",
      },
    ],
  }),
  component: ProjectsPage,
});
const CATEGORIES = ["All work", "Film", "Brand", "Stage"] as const;

function ProjectsPage() {
  const { t } = useLanguage();
  const { projects: PROJECTS } = useSiteContent();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All work");
  const projects = PROJECTS.filter(
    (project) => category === "All work" || project.category === category,
  );
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
            options={CATEGORIES}
            selected={category}
            onChange={setCategory}
            label={t("Filter projects by discipline")}
          />
          <span className="results-count" aria-live="polite">
            {projects.length} {t(projects.length === 1 ? "project" : "projects")}
          </span>
        </div>
        <div className="project-grid">
          {projects.length === 0 && (
            <p className="results-count">
              {t("New work is on its way. Get in touch to discuss your project.")}
            </p>
          )}
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <Link
                to="/contact"
                search={{ show: project.title }}
                className="project-image-link"
                aria-label={"Discuss a project like " + project.title}
              >
                <div className="work-image">
                  <img
                    src={project.image}
                    alt={project.title + " — " + project.type}
                    loading="lazy"
                    width={1200}
                    height={800}
                  />
                  <span className="image-tag">{project.type}</span>
                  <span className="card-arrow">
                    <ArrowUpRight size={23} />
                  </span>
                </div>
              </Link>
              <div className="project-meta">
                <span>{project.client}</span>
                <span>{project.year}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="project-tags">
                {project.scope.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <BookingCTA />
    </PageShell>
  );
}
