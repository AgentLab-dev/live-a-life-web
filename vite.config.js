import { defineConfig } from "vite";

function scriptsAfterPlay() {
  return {
    name: "scripts-after-play",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const scripts = [];
        const next = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) => {
          scripts.push(tag);
          return "";
        });
        if (!scripts.length) return html;
        const playAt = next.indexOf('id="play"');
        const bodyClose = next.lastIndexOf("</body>");
        const combined =
          bodyClose === -1
            ? `${next}\n${scripts.join("\n")}`
            : `${next.slice(0, bodyClose)}${scripts.join("\n")}\n${next.slice(bodyClose)}`;
        if (playAt === -1 || combined.lastIndexOf("<script") < playAt) {
          throw new Error("Game script must be emitted after #play so Play works on static hosts");
        }
        return combined;
      },
    },
  };
}

export default defineConfig({
  root: "src",
  base: "./",
  publicDir: "../public",
  plugins: [scriptsAfterPlay()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  test: {
    environment: "node",
    root: ".",
  },
});
