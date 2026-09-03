import { setDoorLabel, setHair, setHouseColor, setOutfit, setSkin } from "./looks.js";
import { setJob, startWork } from "./jobs.js";
import { createPeople, listenTo, stepPeople } from "./people.js";
import { drawKid, drawRoom, kidLook } from "./draw.js";
import { beatLabel, enterRoom, moveToAction, spawnFor, startFurniture, stepToward, tickAction } from "./world.js";
import { closetSheet, doorSheet, gameMarkup, hudKey, jobSheet, paintSheet, renderHud } from "./hud.js";
import { loadSave, spawnPlayer, writeSave } from "./save.js";

export function startGame(root) {
  let player = spawnPlayer(loadSave());
  let people = createPeople();
  let walkTarget = null;
  let last = performance.now();
  const camera = { x: player.x, y: player.y };
  let sheet = null;
  let lastHud = "";

  root.innerHTML = gameMarkup();
  const game = root.querySelector(".game-root");
  const canvas = game.querySelector("#game-canvas");
  const ctx = canvas.getContext("2d");
  const panel = game.querySelector("#panel");
  const speech = game.querySelector("#speech-layer");
  const caption = game.querySelector("#beat-caption");

  function persist() {
    writeSave(localStorage, player);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = canvas;
    canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function worldFromPointer(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    return {
      x: clientX - box.left - box.width / 2 + camera.x,
      y: clientY - box.top - box.height * 0.58 + camera.y,
    };
  }

  function openSheet(kind) {
    sheet = kind;
    panel.hidden = false;
    if (kind === "paint") panel.innerHTML = paintSheet(player.houseColor);
    if (kind === "door") panel.innerHTML = doorSheet(player.doorLabel);
    if (kind === "closet") panel.innerHTML = closetSheet(player);
    if (kind === "jobs") panel.innerHTML = jobSheet(player.job);
  }

  function closeSheet() {
    sheet = null;
    panel.hidden = true;
    panel.innerHTML = "";
  }

  function goTo(room) {
    const from = player.room;
    player = enterRoom(player, room);
    if (player.room !== from) {
      const spawn = spawnFor(from, room);
      player = { ...player, x: spawn.x, y: spawn.y, pose: "idle" };
      camera.x = spawn.x;
      camera.y = spawn.y;
      walkTarget = null;
    }
  }

  function doFurniture(id, furniture) {
    player = startFurniture(moveToAction(player, id), furniture);
    walkTarget = null;
  }

  function runAction(id) {
    if (id === "enter-house") goTo("living");
    if (id === "go-outside" || id === "leave-cafe" || id === "leave-bakery" || id === "leave-library") goTo("town");
    if (id === "to-kitchen") goTo("kitchen");
    if (id === "to-bedroom") goTo("bedroom");
    if (id === "to-living-from-kitchen" || id === "to-living-from-bedroom") goTo("living");
    if (id === "enter-cafe") goTo("cafe");
    if (id === "enter-bakery") goTo("bakery");
    if (id === "enter-library") goTo("library");
    if (id === "paint-house") openSheet("paint");
    if (id === "name-door") openSheet("door");
    if (id === "open-closet") openSheet("closet");
    if (id === "jobs") openSheet("jobs");
    if (id === "sit" || id === "cafe-sit" || id === "park-sit") doFurniture(id, "sofa");
    if (id === "eat") doFurniture(id, "table");
    if (id === "sleep") doFurniture(id, "bed");
    if (id === "look-fountain" || id === "look-mural") doFurniture(id, "look");
    if (id === "play-park") doFurniture(id, "play");
    if (id === "bakery-work" || id === "library-work" || id === "park-work") {
      player = startWork(moveToAction(player, id));
      walkTarget = null;
    }
    if (id.startsWith("listen:")) people = listenTo(people, id.slice(7));
  }

  function refreshHud() {
    const key = hudKey(player, people);
    if (key !== lastHud) {
      lastHud = key;
      renderHud(game, player, people);
    }
  }

  function project(x, y) {
    return {
      x: canvas.clientWidth / 2 - camera.x + x,
      y: canvas.clientHeight * 0.58 - camera.y + y,
    };
  }

  function refreshSpeech() {
    const bits = [];
    if (player.room === "town") {
      for (const person of people) {
        if (person.bubbleMs <= 0) continue;
        const point = project(person.x, person.y);
        if (point.x < -40 || point.y < -40 || point.x > canvas.clientWidth + 40 || point.y > canvas.clientHeight + 40) {
          continue;
        }
        bits.push(`<span class="speech-bubble" style="left:${point.x}px;top:${point.y}px">${person.line}</span>`);
      }
    }
    speech.innerHTML = bits.join("");
    const label = player.actionBeatMs > 0 ? beatLabel(player.pose) : "";
    caption.hidden = !label;
    caption.textContent = label;
  }

  game.querySelector("#hud-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    runAction(button.dataset.action);
    lastHud = "";
    refreshHud();
  });

  panel.addEventListener("click", (event) => {
    const color = event.target.closest("[data-color]");
    const skin = event.target.closest("[data-skin]");
    const hair = event.target.closest("[data-hair]");
    const piece = event.target.closest("[data-piece]");
    const job = event.target.closest("[data-job]");
    if (color) {
      player = setHouseColor(player, color.dataset.color);
      persist();
      panel.innerHTML = paintSheet(player.houseColor);
    }
    if (skin) {
      player = setSkin(player, skin.dataset.skin);
      persist();
      panel.innerHTML = closetSheet(player);
    }
    if (hair) {
      player = setHair(player, hair.dataset.hair);
      persist();
      panel.innerHTML = closetSheet(player);
    }
    if (piece) {
      player = setOutfit(player, piece.dataset.slot, piece.dataset.piece);
      persist();
      panel.innerHTML = closetSheet(player);
    }
    if (job) {
      player = setJob(player, job.dataset.job);
      persist();
      panel.innerHTML = jobSheet(player.job);
    }
    if (event.target.closest("[data-save-door]")) {
      const input = panel.querySelector("#door-input");
      player = setDoorLabel(player, input?.value ?? "");
      persist();
      closeSheet();
    }
    if (event.target.closest("[data-close]")) closeSheet();
  });

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      if (sheet || player.actionBeatMs > 0) return;
      walkTarget = worldFromPointer(event.clientX, event.clientY);
      if (["sit", "eat", "sleep", "look", "play", "work"].includes(player.pose)) {
        player = { ...player, pose: "walk" };
      }
    },
    { passive: false },
  );

  window.addEventListener("resize", resize);
  resize();
  refreshHud();

  function frame(now) {
    const dt = Math.min(40, now - last);
    last = now;
    player = tickAction(player, dt);
    people = stepPeople(people, dt);
    if (walkTarget && player.actionBeatMs <= 0 && !sheet) {
      player = stepToward(player, walkTarget, dt);
      if (player.pose === "idle") walkTarget = null;
    }
    camera.x += (player.x - camera.x) * 0.14;
    camera.y += (player.y - camera.y) * 0.14;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const time = now / 1000;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 - camera.x, height * 0.58 - camera.y);
    drawRoom(ctx, player.room, player, time);
    if (player.room === "town") {
      for (const person of people) {
        drawKid(
          ctx,
          person.x,
          person.y,
          {
            skin: person.skin,
            hair: person.hair,
            topColor: person.top,
            outfit: { hat: "none", top: "tee", shoes: "sneakers" },
            jobLook: person.job === "baker" ? "apron" : person.job === "librarian" ? "cardigan" : person.job === "park" ? "vest" : null,
          },
          time,
          person.waitMs <= 0 ? "walk" : "idle",
          1,
        );
      }
    }
    drawKid(ctx, player.x, player.y, kidLook(player), time, player.pose, player.facing);
    ctx.restore();
    refreshSpeech();
    refreshHud();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
