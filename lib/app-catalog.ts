import type { AppAccessLevel } from "@/db/schema";

export type AppKey = "tehillim" | "leining" | "liturgy-tunes";

export type AppDefinition = {
  key: AppKey;
  name: string;
  description: string;
  href: string;
  defaultAccessLevel: AppAccessLevel;
};

export const APP_CATALOG: AppDefinition[] = [
  {
    key: "tehillim",
    name: "Tehillim",
    description: "Read, annotate, favorite, and track Tehillim.",
    href: "/tehillim",
    defaultAccessLevel: "viewer",
  },
  {
    key: "leining",
    name: "Leining",
    description: "Practice leining with teacher recordings and AI assistance.",
    href: "/leining",
    defaultAccessLevel: "viewer",
  },
  {
    key: "liturgy-tunes",
    name: "Liturgy Tunes",
    description:
      "Browse liturgy tunes and search the web to find a melody from words and a recording.",
    href: "/liturgy-tunes",
    defaultAccessLevel: "viewer",
  },
];

export const APP_KEYS = APP_CATALOG.map((app) => app.key);
