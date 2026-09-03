import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play boot", () => {
  it("keeps the Play button before the module script", () => {
    const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
    expect(html.indexOf('id="play"')).toBeGreaterThan(-1);
    expect(html.indexOf('id="play"')).toBeLessThan(html.lastIndexOf("<script"));
    expect(html).toContain("./main.js");
  });

  it("does not load Three.js", () => {
    const start = readFileSync(new URL("./start.js", import.meta.url), "utf8");
    const draw = readFileSync(new URL("./draw.js", import.meta.url), "utf8");
    expect(start).not.toMatch(/three/i);
    expect(draw).not.toMatch(/WebGLRenderer|three\.module/i);
    expect(start).toContain("startGame");
  });
});
