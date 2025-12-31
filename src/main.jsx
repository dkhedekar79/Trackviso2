import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App";
import "./styles/index.css";

// Initialize Vercel Web Analytics
inject();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
