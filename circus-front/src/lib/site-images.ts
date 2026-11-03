import hero from "@/assets/circus-hero.webp";
import acrobatics from "@/assets/circus-acrobatics.webp";
import theatre from "@/assets/circus-theatre.webp";
import { apiUrl } from "./content";

export const BUILTIN_IMAGES = [
  { id: "builtin:hero", name: "Aerial / Улаан silk", src: hero },
  { id: "builtin:acrobatics", name: "Акробат / Тайз", src: acrobatics },
  { id: "builtin:theatre", name: "Театр / Paper Circus", src: theatre },
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
