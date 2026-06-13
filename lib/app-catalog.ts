import type { AppAccessLevel } from "@/db/schema";

export type AppKey = "tehillim" | "leining";

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
];

export const APP_KEYS = APP_CATALOG.map((app) => app.key);
