const aerial = "builtin:acrobatics";
const magic = "builtin:illusions";
const hero = "builtin:hero";
const theatre = "builtin:theatre";

export const SHOWS = [
  {
    id: "weightless",
    title: "Weightless",
    category: "Aerial",
    duration: "75 min",
    image: hero,
    description:
      "Silks, straps and breathtaking balance. A beautiful exploration of what happens when we leave the ground.",
    tags: ["Aerial rig", "Live host", "Tour ready"],
  },
  {
    id: "paper-circus",
    title: "The Paper Circus",
    category: "Theatre",
    duration: "60 min",
    image: theatre,
    description:
      "Big characters. Little surprises. A playful world of physical theatre, object play and laughter for every generation.",
    tags: ["Family friendly", "Low rig", "Daytime"],
  },
  {
    id: "ink-smoke",
    title: "Ink & Smoke",
    category: "Illusion",
    duration: "90 min",
    image: magic,
    description:
      "Look a little closer. Grand illusions and intimate magic bring the impossible into the room.",
    tags: ["Illusion", "Lighting plot", "Brand reveals"],
  },
  {
    id: "nomad-nights",
    title: "Nomad Nights",
    category: "Touring",
    duration: "80 min",
    image: aerial,
    description:
      "A travelling celebration of circus, made for city squares, festival stages and wherever the road takes us.",
    tags: ["Outdoor", "Touring", "Festival"],
  },
] as const;

export const PROJECTS = [
  {
    title: "Weightless",
    type: "Aerial film",
    category: "Film",
    client: "MNB / Film Series",
    year: "2025",
    image: hero,
    description:
      "A new perspective on movement. Aerial performance, creative direction and cinematic storytelling come together.",
    scope: ["Creative direction", "Aerial casting", "Safety rigging"],
  },
  {
    title: "Gobi Wool",
    type: "Runway reveal",
    category: "Brand",
    client: "Gobi Cashmere",
    year: "2025",
    image: aerial,
    description:
      "A reveal that moves beyond the runway. Movement design and live performance created for a memorable brand moment.",
    scope: ["Movement design", "Brand reveal", "Show production"],
  },
  {
    title: "Ink & Smoke",
    type: "Stage production",
    category: "Stage",
    client: "UB Circus Hall",
    year: "2024",
    image: magic,
    description:
      "An immersive world of light, shadows and impossible moments, designed from the first sketch to the final curtain.",
    scope: ["Illusion design", "Lighting", "Camera work"],
  },
  {
    title: "Nomad Nights",
    type: "National tour",
    category: "Stage",
    client: "MNP / Tour Ops",
    year: "2024",
    image: aerial,
    description:
      "Bringing the show to new audiences with an adaptable production for festivals and public squares across Mongolia.",
    scope: ["Tour management", "Outdoor production", "Stage adaptation"],
  },
] as const;

export const EVENTS = [
  {
    date: "2026-03-12",
    day: "12",
    month: "MAR",
    title: "Weightless — Opening Night",
    venue: "State Opera, Ulaanbaatar",
    category: "Public",
    time: "19:30",
  },
  {
    date: "2026-04-27",
    day: "27",
    month: "APR",
    title: "The Paper Circus",
    venue: "Corporate Palace",
    category: "Family",
    time: "14:00",
  },
  {
    date: "2026-05-18",
    day: "18",
    month: "MAY",
    title: "Gobi Wool Reveal",
    venue: "Hunnu Mall Rooftop",
    category: "Private",
    time: "20:00",
  },
  {
    date: "2026-06-09",
    day: "09",
    month: "JUN",
    title: "Ink & Smoke Premiere",
    venue: "UB Circus Hall",
    category: "Public",
    time: "19:00",
  },
  {
    date: "2026-08-24",
    day: "24",
    month: "AUG",
    title: "Nomad Nights — Erdenet",
    venue: "Central Square, Erdenet",
    category: "Touring",
    time: "18:30",
  },
] as const;
