import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // registerSW() is called manually in main.tsx instead
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "The Big Table",
        short_name: "Big Table",
        description: "38 occasions · every recipe scales from 2 to 60 guests.",
        theme_color: "#0D1B2A",
        background_color: "#06101A",
        display: "standalone",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3_000_000,
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        // Explicit alongside registerType: "autoUpdate" (which forces these
        // too) so a new deploy takes control immediately instead of waiting
        // for every open tab to close.
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
