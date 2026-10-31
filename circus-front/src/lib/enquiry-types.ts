export const ENQUIRY_STATUSES = {
  new: "Шинэ", contacted: "Холбогдсон", confirmed: "Баталгаажсан", completed: "Дууссан", cancelled: "Цуцлагдсан",
} as const;
export type EnquiryStatus = keyof typeof ENQUIRY_STATUSES;
export type Enquiry = {
  submissionId: string; name: string; email: string; company: string; date: string; city: string;
  audience: string; eventType: "Gala" | "Festival" | "Brand launch" | "Private event" | "Film / media";
  budget: "Not sure yet" | "Under $5k" | "$5k–$15k" | "$15k–$40k" | "$40k+";
  brief: string; show: string; language: "mn" | "en"; id: string; status: EnquiryStatus;
  notes: string; revision: number; createdAt: string; updatedAt: string;
};
