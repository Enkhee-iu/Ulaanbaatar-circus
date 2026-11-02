import { z } from "zod";
import { EVENTS, PROJECTS, SHOWS } from "../data/site-data.js";
const text = (max) => z.string().trim().min(1, "Ð­Ð½Ñ Ñ‚Ð°Ð»Ð±Ð°Ñ€Ñ‹Ð³ Ð±Ó©Ð³Ð»Ó©Ð½Ó© Ò¯Ò¯.").max(max);
export const imageSchema = z
    .string()
    .regex(/^(builtin:(hero|acrobatics|theatre|illusions)|\/api\/media\/[a-f0-9-]+\.(jpg|png|webp)|https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/[a-zA-Z0-9_.,/-]+)$/, "Select an image from the media library.");
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
    details: z.string().trim().max(6000).optional(),
    detailsMn: z.string().trim().max(6000).optional(),
    gallery: z.array(imageSchema).max(8).optional(),
    videoUrl: z
        .string()
        .max(2000)
        .url()
        .refine((value) => value.startsWith("https://"), "HTTPS Ð²Ð¸Ð´ÐµÐ¾ Ñ…Ð¾Ð»Ð±Ð¾Ð¾Ñ Ð¾Ñ€ÑƒÑƒÐ»Ð½Ð° ÑƒÑƒ.")
        .or(z.literal(""))
        .optional(),
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
    }, "ÐžÐ³Ð½Ð¾Ð¾ Ð±ÑƒÑ€ÑƒÑƒ Ð±Ð°Ð¹Ð½Ð°."),
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
    heroVideoUrl: z
        .string()
        .max(2000)
        .url()
        .refine((value) => value.startsWith("https://"), "HTTPS Ð²Ð¸Ð´ÐµÐ¾ Ñ…Ð¾Ð»Ð±Ð¾Ð¾Ñ Ð¾Ñ€ÑƒÑƒÐ»Ð½Ð° ÑƒÑƒ.")
        .or(z.literal(""))
        .optional(),
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
    for (const key of ["shows", "projects", "events"]) {
        const ids = content[key].map((item) => item.id);
        if (new Set(ids).size !== ids.length)
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ð”Ð°Ð²Ñ…Ð°Ñ€Ð´ÑÐ°Ð½ ID Ð±Ð°Ð¹Ð½Ð°.", path: [key] });
    }
});
export const DEFAULT_CONTENT = {
    revision: 0,
    updatedAt: "",
    settings: {
        brandName: "ub.circus",
        companyName: "UB Circus",
        heroEyebrow: "Live from Ulaanbaatar. Made for the world.",
        heroTitle: "This is",
        heroAccent: "Altara",
        heroDescription: "We turn moments into memories.\nExtraordinary circus, live shows and experiences that stay with you.",
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
    projects: PROJECTS.map((project, index) => ({ ...project, id: "project-" + (index + 1), scope: [...project.scope], status: "published" })),
    events: EVENTS.map((event, index) => ({ id: "event-" + (index + 1), title: event.title, date: event.date, venue: event.venue, category: event.category, time: event.time, status: "published" })),
};
