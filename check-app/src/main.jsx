import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { initDatabase } from "./database/database";

// SQLite is only a *secondary* persistence layer for cheques (the primary
// storage for everything in this app is Zustand's `persist` → localStorage,
// which always works). So the UI must never be blocked on it — if the
// native SQLite plugin fails to initialize for any reason (missing native
// setup, a cold-start timing issue, etc.), the app should still open
// normally; cheques will just fall back to localStorage-only for that run.
initDatabase().catch((error) => {
  console.warn("⚠️ SQLite failed to initialize, continuing without it:", error);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);