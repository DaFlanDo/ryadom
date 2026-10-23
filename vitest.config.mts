import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      // в Next этот пакет запрещает импорт из клиентского кода; в тестах он не нужен
      "server-only": path.resolve(import.meta.dirname, "tests/empty.ts"),
    },
  },
  test: {
    environment: "node",
    env: { SESSION_SECRET: "test-secret-test-secret-test-secret-00" },
  },
});
