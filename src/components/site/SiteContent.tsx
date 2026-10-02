import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicContent } from "@/lib/content";
import { DEFAULT_CONTENT } from "@/lib/content-schema";
import type { SiteContent } from "@/lib/content-schema";
import { imageSrc } from "@/lib/site-images";
import { useLanguage } from "./Language";

const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);
export function SiteContentProvider({
  initialContent,
  children,
}: {
  initialContent: SiteContent;
  children: ReactNode;
}) {
  const { language, t } = useLanguage();
  const { data = initialContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getPublicContent(),
    initialData: initialContent,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
  const content = useMemo(
    () => ({
      ...data,
      settings: {
        ...data.settings,
        heroEyebrow:
          language === "mn" && data.settings.heroEyebrowMn
            ? data.settings.heroEyebrowMn
            : t(data.settings.heroEyebrow),
        heroTitle:
          language === "mn" && data.settings.heroTitleMn
            ? data.settings.heroTitleMn
            : t(data.settings.heroTitle),
        heroAccent:
          language === "mn" && data.settings.heroAccentMn
            ? data.settings.heroAccentMn
            : t(data.settings.heroAccent),
        heroDescription:
          language === "mn" && data.settings.heroDescriptionMn
            ? data.settings.heroDescriptionMn
            : t(data.settings.heroDescription),
        address:
          language === "mn" && data.settings.addressMn
            ? data.settings.addressMn
            : t(data.settings.address),
        heroImage: imageSrc(data.settings.heroImage),
        aboutImage: imageSrc(data.settings.aboutImage),
      },
      shows: data.shows.map((show) => ({
        ...show,
        image: imageSrc(show.image),
        title: language === "mn" && show.titleMn ? show.titleMn : t(show.title),
        description:
          language === "mn" && show.descriptionMn ? show.descriptionMn : t(show.description),
        tags: language === "mn" && show.tagsMn?.length ? show.tagsMn : show.tags.map(t),
        duration: language === "mn" ? show.duration.replace(/\bmin\b/g, "мин") : show.duration,
      })),
      projects: data.projects.map((project) => ({
        ...project,
        image: imageSrc(project.image),
        title: language === "mn" && project.titleMn ? project.titleMn : t(project.title),
        description:
          language === "mn" && project.descriptionMn
            ? project.descriptionMn
            : t(project.description),
        type: language === "mn" && project.typeMn ? project.typeMn : t(project.type),
        scope:
          language === "mn" && project.scopeMn?.length ? project.scopeMn : project.scope.map(t),
        client: t(project.client),
      })),
      events: data.events.map((event) => ({
        ...event,
        title: language === "mn" && event.titleMn ? event.titleMn : t(event.title),
        venue: language === "mn" && event.venueMn ? event.venueMn : t(event.venue),
      })),
    }),
    [data, language, t],
  );
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
export function useSiteContent() {
  return useContext(ContentContext);
}
