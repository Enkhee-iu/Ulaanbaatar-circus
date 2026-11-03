import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPublicContent } from "@/lib/content";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // A sitemap needs full addresses; the request says which domain is serving this one.
        const baseUrl = new URL(request.url).origin;
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shows", changefreq: "weekly", priority: "0.9" },
          { path: "/events", changefreq: "weekly", priority: "0.9" },
          { path: "/projects", changefreq: "monthly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
        ];
        try {
          const { shows } = await getPublicContent();
          for (const show of shows)
            entries.push({
              path: "/shows/" + encodeURIComponent(show.id),
              changefreq: "monthly",
              priority: "0.8",
            });
        } catch {
          /* The main pages are still worth listing when content is unavailable. */
        }
        const urls = entries.map(
          (e) =>
            `  <url><loc>${baseUrl}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
