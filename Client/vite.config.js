
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
  react({
    jsxImportSource: "react", // for @vitejs/plugin-react-swc
  }),
],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast",
          ],
          query: ["@tanstack/react-query"],
          utils: ["axios", "date-fns", "clsx"],
          // Component chunks
          blog: [
            "./src/components/blog/BlogCard.jsx",
            "./src/components/blog/BlogList.jsx",
          ],
          shared: [
            "./src/components/shared/LazyImage.jsx",
            "./src/components/shared/VirtualScrollList.jsx",
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging in production
    sourcemap: process.env.NODE_ENV !== "production",
    // Minify options
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
      },
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets < 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "axios",
      "date-fns",
      "clsx",
      "lucide-react",
    ],
    exclude: ["@radix-ui/react-slot"],
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  // Performance optimizations
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
