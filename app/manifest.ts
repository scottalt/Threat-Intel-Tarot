import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Threat Intelligence Tarot",
    short_name: "TI Tarot",
    description: "Real threat intelligence. Impossible to scroll past.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#c9a84c",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
