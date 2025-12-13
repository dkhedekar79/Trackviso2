import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/index.css";

// Initialize Vercel Web Analytics
inject();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
