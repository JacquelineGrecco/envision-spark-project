import { defineConfig, type PluginOption, type UserConfig } from "vite";

export default defineConfig(async ({ command }): Promise<UserConfig> => {
  const plugins: PluginOption[] = [];

  const tailwindcss = (await import("@tailwindcss/vite")).default;
  plugins.push(tailwindcss());

  const tsConfigPaths = (await import("vite-tsconfig-paths")).default;
  plugins.push(tsConfigPaths({ projects: ["./tsconfig.json"] }));

  const { tanstackStart } = await import("@tanstack/react-start/plugin/vite");
  plugins.push(
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
  );

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "vercel" }));
  }

  const viteReact = (await import("@vitejs/plugin-react")).default;
  plugins.push(viteReact());

  return {
    css: { transformer: "lightningcss" },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
      watch: { awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 } },
    },
    plugins,
  };
});
