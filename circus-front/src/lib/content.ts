import type { SiteContent } from "./content-types";

const apiBase = import.meta.env.VITE_API_BASE_URL || "";
export const apiUrl = (path: string) => `${apiBase}${path}`;
export async function getPublicContent(): Promise<SiteContent> {
  // Browser requests use the Vite /api proxy; SSR must use an absolute backend URL.
  const base = apiBase || (typeof window === "undefined" ? "http://127.0.0.1:8787" : "");
  const response = await fetch(`${base}/api/content`, { credentials: "include" });
  if (!response.ok) throw new Error("Сайтын мэдээлэл ачаалж чадсангүй.");
  return (await response.json()) as SiteContent;
}
