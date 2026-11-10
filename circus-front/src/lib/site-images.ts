import hero from "@/assets/hero-altara.webp";
import acrobatics from "@/assets/team-acrobatics.webp";
import theatre from "@/assets/team-theatre.webp";
import { apiUrl } from "./content";

// The ids are stored in the database and in the defaults, so they stay as they are; only the photos
// behind them changed, from illustrations to the company's own stage photos. Each id needs a photo of
// its own: pages compare the resolved address to tell which default is still in use.
export const BUILTIN_IMAGES = [
  { id: "builtin:hero", name: "Altara / Тайз", src: hero },
  { id: "builtin:acrobatics", name: "Акробат / Цамхаг", src: acrobatics },
  { id: "builtin:theatre", name: "Бүх баг / Тайз", src: theatre },
];
/** The address to display an image at. Uploaded media lives on the API, which in production is another host. */
export function imageSrc(value: string) {
  if (value.startsWith("/api/")) return apiUrl(value);
  return BUILTIN_IMAGES.find((image) => image.id === value)?.src ?? value;
}
/** Cloudinary resizes on request, and uploads run to 5712 px wide. Other addresses pass through unchanged. */
export function sizedImage(src: string, width: number) {
  if (!src.startsWith("https://res.cloudinary.com/")) return src;
  return src.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
