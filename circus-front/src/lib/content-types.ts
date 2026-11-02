export type Show = {
  id: string; status: "published" | "draft"; title: string; titleMn?: string;
  category: "Aerial" | "Theatre" | "Touring"; duration: string;
  image: string; description: string; descriptionMn?: string; tags: string[]; tagsMn?: string[];
  details?: string; detailsMn?: string; gallery?: string[]; videoUrl?: string;
};
export type Project = {
  id: string; status: "published" | "draft"; title: string; titleMn?: string;
  type: string; typeMn?: string; category: "Film" | "Brand" | "Stage"; client: string;
  year: string; image: string; description: string; descriptionMn?: string; scope: string[]; scopeMn?: string[];
};
export type CircusEvent = {
  id: string; status: "published" | "draft"; title: string; titleMn?: string; date: string;
  venue: string; venueMn?: string; category: "Public" | "Family" | "Private" | "Touring"; time: string;
};
export type SiteSettings = {
  brandName: string; companyName: string; heroEyebrow: string; heroTitle: string; heroAccent: string;
  heroDescription: string; heroVideoUrl?: string; heroImage: string; aboutImage: string; email: string;
  phone: string; address: string; statsShows: string; statsArtists: string; since: string;
  heroEyebrowMn?: string; heroTitleMn?: string; heroAccentMn?: string; heroDescriptionMn?: string; addressMn?: string;
};
export type SiteContent = {
  revision: number; updatedAt: string; settings: SiteSettings; shows: Show[]; projects: Project[]; events: CircusEvent[];
};
export type CollectionName = "shows" | "projects" | "events";
export type ContentItem = Show | Project | CircusEvent;
export type MediaItem = { id: string; name: string; src: string; size: number; createdAt: string };
export const DEFAULT_CONTENT: SiteContent = {
  revision: 0, updatedAt: "", settings: {
    brandName: "ub.circus", companyName: "UB Circus", heroEyebrow: "Live from Ulaanbaatar. Made for the world.",
    heroTitle: "This is", heroAccent: "Altara", heroDescription: "We turn moments into memories.\nExtraordinary circus, live shows and experiences that stay with you.",
    heroImage: "builtin:hero", aboutImage: "builtin:acrobatics", email: "hello@ubcircus.mn", phone: "+976 9900 0000",
    address: "Peace Ave 42, Sukhbaatar\nUlaanbaatar, Mongolia", statsShows: "420+", statsArtists: "38", since: "2014"
  }, shows: [
    { id: "weightless", status: "published", title: "Weightless", category: "Aerial", duration: "75 min", image: "builtin:hero", description: "Silks, straps and breathtaking balance. A beautiful exploration of what happens when we leave the ground.", tags: ["Aerial rig", "Live host", "Tour ready"] },
    { id: "paper-circus", status: "published", title: "The Paper Circus", category: "Theatre", duration: "60 min", image: "builtin:theatre", description: "Big characters. Little surprises. A playful world of physical theatre, object play and laughter for every generation.", tags: ["Family friendly", "Low rig", "Daytime"] }
  ], projects: [
    { id: "project-1", status: "published", title: "Gobi Wool Reveal", type: "Brand experience", category: "Brand", client: "Gobi Wool", year: "2025", image: "builtin:acrobatics", description: "An immersive launch experience.", scope: ["Creative direction", "Live performance"] },
    { id: "project-2", status: "published", title: "Nomad Nights", type: "Live production", category: "Stage", client: "UB Circus", year: "2025", image: "builtin:theatre", description: "A touring performance inspired by Mongolia.", scope: ["Performance", "Production"] }
  ], events: [
    { id: "event-1", status: "published", title: "Weightless — Opening Night", date: "2026-03-12", venue: "State Opera, Ulaanbaatar", category: "Public", time: "19:30" },
    { id: "event-2", status: "published", title: "The Paper Circus", date: "2026-04-27", venue: "Corporate Palace", category: "Family", time: "14:00" },
    { id: "event-3", status: "published", title: "Gobi Wool Reveal", date: "2026-05-18", venue: "Hunnu Mall Rooftop", category: "Private", time: "20:00" }
  ]
};
