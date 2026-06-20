import { defineConfig } from "vite";

export default defineConfig({
  // منع Vite من معالجة ملفات api/ (هي Vercel serverless functions وليست browser code)
  server: {
    watch: {
      ignored: ["**/api/**"],
    },
  },
  build: {
    rollupOptions: {
      // استثناء مجلد api/ من الـ bundle
      external: (id) => /[/\\]api[/\\]/.test(id),
    },
  },
});
