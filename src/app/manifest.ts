import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asti Ko Paisa",
    short_name: "Asti Ko Paisa",
    description: "Track debts, send reminders, and keep money records easy on mobile.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FBFBF7",
    theme_color: "#12AD67",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
