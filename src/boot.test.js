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

  it("keeps a phone D-pad and keyboard walk after Play", () => {
    const hud = readFileSync(new URL("./hud.js", import.meta.url), "utf8");
    const start = readFileSync(new URL("./start.js", import.meta.url), "utf8");
    expect(hud).toContain('id="dpad"');
    expect(hud).toContain('data-dir="up"');
    expect(start).toContain("keydown");
    expect(start).toContain("dirFromKey");
    expect(start).toContain("walkTarget");
  });

  it("keeps crossing stickers and picnic actions after Play", () => {
    const hud = readFileSync(new URL("./hud.js", import.meta.url), "utf8");
    const start = readFileSync(new URL("./start.js", import.meta.url), "utf8");
    const world = readFileSync(new URL("./world.js", import.meta.url), "utf8");
    expect(hud).toContain('id="sticker-row"');
    expect(hud).toContain("stickerSheet");
    expect(start).toContain("openParkGate");
    expect(start).toContain("takePicnic");
    expect(start).toContain("cheerCrossing");
    expect(world).toContain("open-gate");
    expect(world).toContain("share-picnic");
  });
});
