import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { migrateLegacyStorage } from "./lib/storage";

migrateLegacyStorage();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
