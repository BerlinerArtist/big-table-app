import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { migrateLegacyStorage } from "./lib/storage";
import { registerSW } from "virtual:pwa-register";

migrateLegacyStorage();

// registerType: "autoUpdate" only forces skipWaiting/clientsClaim in the
// generated service worker — it does NOT by itself make the page reload
// when a new version is found. Without this call, visitors can be stuck
// on a stale cached build indefinitely, even after a fresh Netlify deploy.
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
