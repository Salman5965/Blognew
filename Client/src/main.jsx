import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Performance optimizations
if ("requestIdleCallback" in window) {
  // Preload critical modules during idle time
  requestIdleCallback(() => {
    import("./pages/Home.jsx");
    import("./components/layout/Navbar.jsx");
  });
}

// Remove loading fallback before rendering React app
const loadingFallback = document.querySelector(".loading-fallback");
if (loadingFallback) {
  loadingFallback.remove();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
