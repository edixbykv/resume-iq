import type { MetadataRoute } from "next";

// robots.ts already points Google here; without this file the link was a 404.
// Only public pages: sign-in, dashboard and admin stay out.
const BASE = "https://resume.kvai.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/analyze`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/builder`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
