export const BRAND_NAME = "Ulaanbaatar Circus";

type PageText = { title: string; description: string };

/** Mongolian is served first, matching the page's default language; the language switcher swaps them. */
export const PAGE_META: Record<string, { mn: PageText; en: PageText }> = {
  "/": {
    mn: {
      title: `${BRAND_NAME} — Тоглолт, эвент, бүтээлүүд`,
      description: `${BRAND_NAME} бол амьд тоглолт, арга хэмжээ, кино төслүүд бүтээдэг Улаанбаатарын тайзны уран бүтээлчдийн баг.`,
    },
    en: {
      title: `${BRAND_NAME} — Live Shows, Events & Productions`,
      description: `${BRAND_NAME} is an Ulaanbaatar-based team creating live performances, brand events and cinematic projects.`,
    },
  },
  "/shows": {
    mn: {
      title: `Тоглолтууд — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн агаарын үзүүлбэр, акробат, театрын тоглолтуудтай танилцаж, арга хэмжээндээ захиалаарай.`,
    },
    en: {
      title: `Our shows — ${BRAND_NAME}`,
      description: `Discover aerial shows and physical theatre from ${BRAND_NAME}. Made for your stage.`,
    },
  },
  "/events": {
    mn: {
      title: `Эвент, хуваарь — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн тоглолтын хуваарь, олон нийтийн болон хувийн арга хэмжээнүүд.`,
    },
    en: {
      title: `Events & dates — ${BRAND_NAME}`,
      description: `Explore the ${BRAND_NAME} season calendar, public performances and private productions.`,
    },
  },
  "/projects": {
    mn: {
      title: `Онцлох төслүүд — ${BRAND_NAME}`,
      description: `${BRAND_NAME}-ийн бүтээсэн амьд тоглолт, брэндийн хамтын ажиллагаа, кино төслүүд.`,
    },
    en: {
      title: `Selected work — ${BRAND_NAME}`,
      description: `Live experiences, brand collaborations and film productions brought to life by ${BRAND_NAME}.`,
    },
  },
  "/contact": {
    mn: {
      title: `Хамтдаа бүтээе — ${BRAND_NAME}`,
      description: `Дараагийн тоглолт, брэндийн арга хэмжээ, бүтээлч төслийнхөө талаар ${BRAND_NAME}-тэй холбогдоорой.`,
    },
    en: {
      title: `Let’s create — ${BRAND_NAME}`,
      description: `Start a conversation about your next show, brand event or creative production with ${BRAND_NAME}.`,
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
