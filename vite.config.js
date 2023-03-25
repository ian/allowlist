import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    deps: { fallbackCJS: true },
    globals: true,
    // environment: "jsdom",
  }
})
