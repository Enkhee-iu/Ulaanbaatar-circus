import { useEffect, useRef, type CSSProperties } from "react";

import firebird from "@/assets/spotlight-firebird.webp";
import altara from "@/assets/hero-altara.webp";
import tower from "@/assets/team-acrobatics.webp";
import smoke from "@/assets/team-contortion.webp";
import stage from "@/assets/team-theatre.webp";
import { imageSrc, sizedImage } from "@/lib/site-images";

// Each letter of a page's English name is cut out of a different photo, like a festival poster.
// Only bright, busy photos: a dark one leaves its letter lost in the band. Three come from the media
// library uploads; should one ever be deleted, its letter falls back to the colour it showed.
// [photo, which part of it shows through the letter, colour underneath]
type Fill = [string, string, string];
const FIRE: Fill = [firebird, "50% 30%", "#f2a0a0"];
const PURPLE: Fill = [altara, "50% 20%", "#5b3fd6"];
const TOWER: Fill = [tower, "50% 35%", "#4a3ad0"];
const BLUE: Fill = [smoke, "50% 50%", "#3f5fd8"];
const PINK: Fill = [stage, "50% 60%", "#b0418f"];
const NEON: Fill = [
  imageSrc("/api/media/38cd60d0-c2ef-4e23-87af-7f3d3d8cbb88.jpg"),
  "50% 30%",
  "#d8322e",
];
const ORANGE: Fill = [
  sizedImage(
    "https://res.cloudinary.com/ds0owm3mq/image/upload/v1793631276/ubcircus/25361f29-7683-4c68-8574-3947b137692c.jpg",
    1400,
  ),
  "50% 40%",
  "#e8823a",
];
const MASK: Fill = [
  imageSrc("/api/media/695c710e-24a0-46cc-a3c0-17c7377d3147.jpg"),
  "60% 40%",
  "#3d7fb0",
];

// Neighbouring letters never share a colour, and warm and cool mostly take turns.
const FILLS: Record<string, Fill[]> = {
  SHOWS: [ORANGE, PURPLE, FIRE, MASK, NEON],
  EVENTS: [NEON, BLUE, FIRE, PURPLE, ORANGE, MASK],
  PROJECTS: [TOWER, NEON, BLUE, ORANGE, PURPLE, FIRE, MASK, PINK],
  CONTACT: [FIRE, BLUE, ORANGE, PURPLE, NEON, MASK, PINK],
};
const FALLBACK = [ORANGE, PURPLE, FIRE, MASK, NEON, BLUE, PINK, TOWER];

export function LetterWord({ word }: { word: string }) {
  const band = useRef<HTMLDivElement>(null);
  const fills = FILLS[word] ?? FALLBACK;

  // Letters differ in width, so the word is measured once at 100px and scaled to fill the band. The
  // stylesheet's estimate holds the space until then, and again whenever the band or the font changes.
  useEffect(() => {
    const box = band.current;
    const text = box?.firstElementChild as HTMLElement | null;
    if (!box || !text) return;
    let width = -1;
    let frame = 0;
    const fit = () => {
      const style = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      text.style.fontSize = "100px";
      const natural = text.getBoundingClientRect().width;
      text.style.fontSize = "";
      if (natural > 0 && room > 0)
        box.style.setProperty("--word-size", `${(room / natural) * 100}px`);
    };
    // Resizing the word changes the band's height, which would report straight back to the observer
    // ("ResizeObserver loop completed with undelivered notifications"). So only a new width refits,
    // and the refit waits for the next frame, outside the observer's callback.
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    fit();
    observer.observe(box);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [word]);

  return (
    <div
      ref={band}
      className="letter-word"
      style={{ "--letters": word.length } as CSSProperties}
      aria-hidden="true"
    >
      <div className="letter-word-text">
        {[...word].map((letter, index) => {
          const [src, position, colour] = fills[index % fills.length];
          return (
            <span
              key={index}
              style={
                {
                  backgroundImage: `url(${src}), linear-gradient(${colour}, ${colour})`,
                  backgroundPosition: position,
                  "--letter-index": index,
                } as CSSProperties
              }
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
}
