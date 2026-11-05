export const BRAND_NAME = "Ulaanbaatar Circus";

type PageText = { title: string; description: string };

/** Mongolian is served first, matching the page's default language; the language switcher swaps them. */
export const PAGE_META: Record<string, { mn: PageText; en: PageText }> = {
  "/": {
    mn: {
      title: `${BRAND_NAME} — Тоглолт, эвент, бүтээлүүд`,
      description: `${BRAND_NAME} бол Улаанбаатарт ажилладаг циркийн баг. Тоглолтоо үзээрэй, эсвэл арга хэмжээндээ урьж болно.`,
    },
    en: {
      title: `${BRAND_NAME} — Live Shows, Events & Productions`,
      description: `${BRAND_NAME} is a circus team based in Ulaanbaatar. See a show, or book us for your event.`,
    },
  },
  "/shows": {
    mn: {
      title: `Тоглолтууд — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн тоглолтууд: агаарын үзүүлбэр, акробат, театр. Төрөл, хугацааг хараад захиалаарай.`,
    },
    en: {
      title: `Our shows — ${BRAND_NAME}`,
      description: `${BRAND_NAME} shows: aerial acts, acrobatics and theatre. See the details and book.`,
    },
  },
  "/events": {
    mn: {
      title: `Эвент, хуваарь — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн болох тоглолтуудын огноо, газар.`,
    },
    en: {
      title: `Events & dates — ${BRAND_NAME}`,
      description: `Dates and venues for upcoming ${BRAND_NAME} shows.`,
    },
  },
  "/projects": {
    mn: {
      title: `Онцлох төслүүд — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн кино, брэнд, тайзны төслүүд.`,
    },
    en: {
      title: `Selected work — ${BRAND_NAME}`,
      description: `Film, brand and stage projects by ${BRAND_NAME}.`,
    },
  },
  "/contact": {
    mn: {
      title: `Холбоо барих — ${BRAND_NAME}`,
      description: `Тоглолт захиалах, хуваарь асуух бол ${BRAND_NAME}-д бичээрэй.`,
    },
    en: {
      title: `Contact — ${BRAND_NAME}`,
      description: `Write to ${BRAND_NAME} to book a show or ask about dates.`,
    },
  },
};

export function pageHead(path: keyof typeof PAGE_META) {
  const { title, description } = PAGE_META[path].mn;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  };
}

export function applyPageMeta(title: string, description: string) {
  document.title = title;
  const setContent = (selector: string, content: string) =>
    document.querySelectorAll(selector).forEach((meta) => meta.setAttribute("content", content));
  setContent('meta[property="og:title"]', title);
  setContent('meta[name="description"], meta[property="og:description"]', description);
}
