import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    historyApiFallback: true,
    allowedHosts: [
      "9ee3bbf4-9f12-48da-bb61-c60d93de89cd-00-1wgfbgwwopyhr.spock.replit.dev",
    ],
  },
  publicDir: "public",
});
