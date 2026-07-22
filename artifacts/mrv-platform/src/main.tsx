import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { installMockApi, isMockApiEnabled } from "./lib/mock-api";

if (isMockApiEnabled()) {
  installMockApi();
}

// Default light theme; ThemeProvider may switch to dark
document.documentElement.classList.remove("dark");
document.documentElement.classList.add("light");

createRoot(document.getElementById("root")!).render(<App />);
