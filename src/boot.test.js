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

  it("keeps the home-screen tip ready after Play", () => {
    const hud = readFileSync(new URL("./hud.js", import.meta.url), "utf8");
    const start = readFileSync(new URL("./start.js", import.meta.url), "utf8");
    expect(hud).toContain('id="install-tip"');
    expect(hud).toContain("Add to Home Screen for the app icon");
    expect(hud).toContain('id="install-tip-ok"');
    expect(start).toContain("mountInstallTip");
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
    expect(world).toContain("push-cart");
    expect(world).toContain("share-book");
    expect(world).toContain("take-card");
    expect(world).toContain("share-card");
    expect(world).toContain("take-snack");
    expect(world).toContain("share-snack");
    expect(world).toContain("take-flower");
    expect(world).toContain("share-flower");
    expect(world).toContain("take-leaf");
    expect(world).toContain("share-leaf");
    expect(world).toContain("take-balloon");
    expect(world).toContain("share-balloon");
    expect(world).toContain("take-pinwheel");
    expect(world).toContain("share-pinwheel");
    expect(world).toContain("take-bubble");
    expect(world).toContain("share-bubble");
    expect(world).toContain("take-bracelet");
    expect(world).toContain("share-bracelet");
    expect(world).toContain("take-sticker");
    expect(world).toContain("share-sticker");
    expect(world).toContain("take-plane");
    expect(world).toContain("share-plane");
    expect(world).toContain("take-shell");
    expect(world).toContain("share-shell");
    expect(world).toContain("take-crayon");
    expect(world).toContain("share-crayon");
    expect(world).toContain("take-ribbon");
    expect(world).toContain("share-ribbon");
    expect(world).toContain("take-acorn");
    expect(world).toContain("share-acorn");
    expect(world).toContain("enter-usa");
    expect(start).toContain("takeBook");
    expect(start).toContain("takeCard");
    expect(start).toContain("shareCard");
    expect(start).toContain("takeSnack");
    expect(start).toContain("shareSnack");
    expect(start).toContain("takeFlower");
    expect(start).toContain("shareFlower");
    expect(start).toContain("takeLeaf");
    expect(start).toContain("shareLeaf");
    expect(start).toContain("takeBalloon");
    expect(start).toContain("shareBalloon");
    expect(start).toContain("takePinwheel");
    expect(start).toContain("sharePinwheel");
    expect(start).toContain("takeBubble");
    expect(start).toContain("shareBubble");
    expect(start).toContain("takeBracelet");
    expect(start).toContain("shareBracelet");
    expect(start).toContain("takeSticker");
    expect(start).toContain("shareSticker");
    expect(start).toContain("takePlane");
    expect(start).toContain("sharePlane");
    expect(start).toContain("takeShell");
    expect(start).toContain("shareShell");
    expect(start).toContain("takeCrayon");
    expect(start).toContain("shareCrayon");
    expect(start).toContain("takeRibbon");
    expect(start).toContain("shareRibbon");
    expect(start).toContain("takeAcorn");
    expect(start).toContain("shareAcorn");
    expect(start).toContain("pushBookCart");
    expect(start).toContain("enterUsaMap");
    expect(start).toContain("startHop");
    expect(start).toContain("drawPlayerMarker");
  });

  it("keeps the USA capitals hop and a distinct letter I jumper", () => {
    const usa = readFileSync(new URL("./usa.js", import.meta.url), "utf8");
    const draw = readFileSync(new URL("./draw.js", import.meta.url), "utf8");
    const start = readFileSync(new URL("./start.js", import.meta.url), "utf8");
    expect(usa).toContain("Austin");
    expect(usa).toContain("capitalLabel");
    expect(usa).toContain("JUMPER_COLOR");
    expect(draw).toContain('fillText("I"');
    expect(draw).toContain("drawUsaMap");
    expect(draw).toContain("drawStateMap");
    expect(draw).not.toMatch(/WebGLRenderer|three\.module/i);
    expect(start).toContain("hopFromPoint");
    expect(start).toContain("tickHop");
  });
});
