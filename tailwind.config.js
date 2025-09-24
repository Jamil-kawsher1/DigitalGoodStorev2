import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // your React files
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
});
