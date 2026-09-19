import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // mesmo alias do tsconfig — sem ele os testes não conseguem importar as rotas,
  // que usam "@/lib/...". Fechado na O5·S1.
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    // Não validar env no import durante os testes — cada teste controla as entradas.
    env: { SKIP_ENV_VALIDATION: "1" },
    include: ["src/**/*.test.ts"],
  },
});
