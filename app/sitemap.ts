import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/slug";

const BASE_URL = "https://threat-intel-tarot.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const cardSlugs = getAllSlugs();

  const cardEntries: MetadataRoute.Sitemap = cardSlugs.map((slug) => ({
    url: `${BASE_URL}/card/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/gallery`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/daily`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/spread`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/techniques`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/defenses`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sectors`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...cardEntries,
  ];
}
