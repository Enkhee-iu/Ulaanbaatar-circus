import { z } from "zod";
import { EVENTS, PROJECTS, SHOWS } from "./site-data";

const text = (max: number) => z.string().trim().min(1, "Энэ талбарыг бөглөнө үү.").max(max);
export const imageSchema = z
  .string()
  .regex(
    /^(builtin:(hero|acrobatics|theatre|illusions)|\/api\/media\/[a-f0-9-]+\.(jpg|png|webp))$/,
    "Зургийн сангаас зураг сонгоно уу.",
  );
const base = {
  id: text(100).regex(/^[a-zA-Z0-9-]+$/),
  status: z.enum(["published", "draft"]),
  title: text(150),
  titleMn: z.string().trim().max(150).optional(),
};
const tags = z.array(text(60)).max(12);
export const showSchema = z.object({
  ...base,
  category: z.enum(["Aerial", "Theatre", "Illusion", "Touring"]),
  duration: text(30),
  image: imageSchema,
  description: text(1600),
  tags,
  descriptionMn: z.string().trim().max(1600).optional(),
  tagsMn: tags.optional(),
});
export const projectSchema = z.object({
  ...base,
  type: text(100),
  category: z.enum(["Film", "Brand", "Stage"]),
  client: text(150),
  year: z.string().regex(/^\d{4}$/),
  image: imageSchema,
  description: text(1600),
  scope: tags,
  descriptionMn: z.string().trim().max(1600).optional(),
  typeMn: z.string().trim().max(100).optional(),
  scopeMn: tags.optional(),
});
export const eventSchema = z.object({
  ...base,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(value + "T00:00:00Z");
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Огноо буруу байна."),
  venue: text(200),
  venueMn: z.string().trim().max(200).optional(),
  category: z.enum(["Public", "Family", "Private", "Touring"]),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
export const settingsSchema = z.object({
  brandName: text(60),
  companyName: text(100),
  heroEyebrow: text(140),
  heroTitle: text(70),
  heroAccent: text(70),
  heroDescription: text(500),
  heroImage: imageSchema,
  aboutImage: imageSchema,
  email: z.string().email().max(150),
  phone: text(40),
  address: text(300),
  statsShows: text(20),
  statsArtists: text(20),
  since: z.string().regex(/^\d{4}$/),
  heroEyebrowMn: z.string().trim().max(140).optional(),
  heroTitleMn: z.string().trim().max(70).optional(),
  heroAccentMn: z.string().trim().max(70).optional(),
  heroDescriptionMn: z.string().trim().max(500).optional(),
  addressMn: z.string().trim().max(300).optional(),
});
export const contentSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    updatedAt: z.string(),
    settings: settingsSchema,
    shows: z.array(showSchema).max(100),
    projects: z.array(projectSchema).max(100),
    events: z.array(eventSchema).max(300),
  })
  .superRefine((content, ctx) => {
    for (const key of ["shows", "projects", "events"] as const) {
      const ids = content[key].map((item) => item.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Давхардсан ID байна.", path: [key] });
    }
  });
export type Show = z.infer<typeof showSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CircusEvent = z.infer<typeof eventSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type SiteContent = z.infer<typeof contentSchema>;
export type CollectionName = "shows" | "projects" | "events";
export type ContentItem = Show | Project | CircusEvent;
export type MediaItem = { id: string; name: string; src: string; size: number; createdAt: string };
export const DEFAULT_CONTENT: SiteContent = {
  revision: 0,
  updatedAt: "",
  settings: {
    brandName: "ub.circus",
    companyName: "UB Circus",
    heroEyebrow: "Live from Ulaanbaatar. Made for the world.",
    heroTitle: "Beyond the",
    heroAccent: "ordinary.",
    heroDescription:
      "We turn moments into memories.\nExtraordinary circus, live shows and experiences that stay with you.",
    heroImage: "builtin:hero",
    aboutImage: "builtin:acrobatics",
    email: "hello@ubcircus.mn",
    phone: "+976 9900 0000",
    address: "Peace Ave 42, Sukhbaatar\nUlaanbaatar, Mongolia",
    statsShows: "420+",
    statsArtists: "38",
    since: "2014",
  },
  shows: SHOWS.map((show) => ({ ...show, tags: [...show.tags], status: "published" })),
  projects: PROJECTS.map((project, index) => ({
    ...project,
    id: "project-" + (index + 1),
    scope: [...project.scope],
    status: "published",
  })),
  events: EVENTS.map((event, index) => ({
    id: "event-" + (index + 1),
    title: event.title,
    date: event.date,
    venue: event.venue,
    category: event.category,
    time: event.time,
    status: "published",
  })),
};
