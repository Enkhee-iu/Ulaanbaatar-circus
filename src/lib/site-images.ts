import hero from "@/assets/circus-hero.webp";
import acrobatics from "@/assets/circus-acrobatics.webp";
import theatre from "@/assets/circus-theatre.webp";
import illusions from "@/assets/circus-illusions.webp";

export const BUILTIN_IMAGES = [
  { id: "builtin:hero", name: "Aerial / Улаан silk", src: hero },
  { id: "builtin:acrobatics", name: "Акробат / Тайз", src: acrobatics },
  { id: "builtin:theatre", name: "Театр / Paper Circus", src: theatre },
  { id: "builtin:illusions", name: "Илбэ / Ink & Smoke", src: illusions },
];
export function imageSrc(value: string) {
  return BUILTIN_IMAGES.find((image) => image.id === value)?.src ?? value;
}
