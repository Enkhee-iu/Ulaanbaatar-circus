import { z } from "zod";

export const ENQUIRY_STATUSES = {
  new: "Шинэ",
  contacted: "Холбогдсон",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
} as const;
export const enquiryStatusSchema = z.enum([
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
]);
const optionalText = (max: number) => z.string().trim().max(max).default("");
export const enquiryInputSchema = z.object({
  submissionId: z.string().uuid(),
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().toLowerCase().email().max(150),
  company: optionalText(150),
  date: z.string().date().or(z.literal("")).default(""),
  city: optionalText(150),
  audience: z
    .string()
    .regex(/^$|^[1-9]\d{0,6}$/)
    .default(""),
  eventType: z.enum(["Gala", "Festival", "Brand launch", "Private event", "Film / media"]),
  budget: z.enum(["Not sure yet", "Under $5k", "$5k–$15k", "$15k–$40k", "$40k+"]),
  brief: z.string().trim().min(1).max(2000),
  show: optionalText(150),
  language: z.enum(["mn", "en"]),
});
export type Enquiry = z.infer<typeof enquiryInputSchema> & {
  id: string;
  status: z.infer<typeof enquiryStatusSchema>;
  notes: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
};
export const enquiryUpdateSchema = z.object({
  id: z.string().uuid(),
  revision: z.number().int().nonnegative(),
  status: enquiryStatusSchema,
  notes: z.string().trim().max(4000),
});
