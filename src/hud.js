import { HAIRS, HOUSE_COLORS, OUTFIT_SLOTS, SKINS, escapeAttr, pieceLabel } from "./looks.js";
import { JOBS } from "./jobs.js";
import { nearbyPerson } from "./people.js";
import { placeName, visibleActions } from "./world.js";

export function gameMarkup() {
  return `
    <div class="game-root">
      <canvas id="game-canvas" aria-label="Town"></canvas>
      <div id="speech-layer" class="speech-layer"></div>
      <p id="beat-caption" class="beat-caption" hidden></p>
      <div class="hud-top">
        <p id="place-name">Sunny Plaza</p>
      </div>
      <div id="dpad" class="dpad" aria-label="Walk">
        <button type="button" class="dpad-btn dpad-up" data-dir="up" aria-label="Walk up" tabindex="-1">▲</button>
        <button type="button" class="dpad-btn dpad-left" data-dir="left" aria-label="Walk left" tabindex="-1">◀</button>
        <button type="button" class="dpad-btn dpad-right" data-dir="right" aria-label="Walk right" tabindex="-1">▶</button>
        <button type="button" class="dpad-btn dpad-down" data-dir="down" aria-label="Walk down" tabindex="-1">▼</button>
      </div>
      <div id="hud-actions" class="hud-actions"></div>
      <div id="panel" class="panel" hidden></div>
    </div>
  `;
}

export function renderHud(root, player, people = []) {
  const place = root.querySelector("#place-name");
  const actions = root.querySelector("#hud-actions");
  if (place) place.textContent = placeName(player.room);
  const buttons = visibleActions(player).map((action) => ({ id: action.id, label: action.label }));
  const idle = player.pose !== "walk" && player.actionBeatMs <= 0;
  if (player.room === "town" && idle) {
    const person = nearbyPerson(people, player.x, player.y);
    if (person) buttons.push({ id: `listen:${person.id}`, label: `Listen to ${person.name}` });
  }
  actions.innerHTML = buttons
    .map((action) => `<button type="button" class="hud-btn" data-action="${action.id}">${action.label}</button>`)
    .join("");
}

export function paintSheet(selected) {
  return `
    <div class="sheet">
      <h2>Paint the house</h2>
      <p>The whole house changes. Pick a color.</p>
      <div class="swatch-row">${HOUSE_COLORS.map(
        (color) => `
      <button type="button" class="swatch ${color.id === selected ? "selected" : ""}" data-color="${color.id}" style="background:${color.fill}" aria-label="${color.name}">
        <span>${color.name}</span>
      </button>
    `,
      ).join("")}</div>
      <button type="button" class="hud-btn" data-close>Done</button>
    </div>
  `;
}

export function doorSheet(label) {
  return `
    <div class="sheet">
      <h2>Door name</h2>
      <label for="door-input">Name on the door</label>
      <input id="door-input" maxlength="16" value="${escapeAttr(label)}" autocomplete="off" />
      <p class="fine">Up to 16 letters. Saved on this device.</p>
      <div class="sheet-row">
        <button type="button" class="hud-btn" data-close>Cancel</button>
        <button type="button" class="hud-btn primary" data-save-door>Save</button>
      </div>
    </div>
  `;
}

export function closetSheet(player) {
  const skins = SKINS.map(
    (item) =>
      `<button type="button" class="tone ${player.skin === item.id ? "selected" : ""}" data-skin="${item.id}" style="background:${item.fill}" aria-label="${item.name}"></button>`,
  ).join("");
  const hairs = HAIRS.map(
    (item) =>
      `<button type="button" class="tone ${player.hair === item.id ? "selected" : ""}" data-hair="${item.id}" style="background:${item.fill}" aria-label="${item.name}"></button>`,
  ).join("");
  const slot = (name, pieces) => `
    <div class="slot">
      <p>${name}</p>
      <div class="chip-row">
        ${pieces
          .map(
            (piece) =>
              `<button type="button" class="chip ${player.outfit[name] === piece ? "selected" : ""}" data-slot="${name}" data-piece="${piece}">${pieceLabel(piece)}</button>`,
          )
          .join("")}
      </div>
    </div>
  `;
  return `
    <div class="sheet closet-sheet">
      <h2>Closet</h2>
      <p>Looks only. Everything here is free.</p>
      <div class="slot">
        <p>Skin</p>
        <div class="chip-row">${skins}</div>
      </div>
      <div class="slot">
        <p>Hair</p>
        <div class="chip-row">${hairs}</div>
      </div>
      ${slot("hat", OUTFIT_SLOTS.hat)}
      ${slot("top", OUTFIT_SLOTS.top)}
      ${slot("shoes", OUTFIT_SLOTS.shoes)}
      <button type="button" class="hud-btn primary" data-close>All set</button>
    </div>
  `;
}

export function jobSheet(job) {
  return `
    <div class="sheet">
      <h2>Pretend job</h2>
      <p>Looks only. No money. Go to the place and help for a moment.</p>
      <div class="chip-row">${JOBS.map(
        (item) => `<button type="button" class="chip ${item.id === job ? "selected" : ""}" data-job="${item.id}">${item.name}</button>`,
      ).join("")}</div>
      <button type="button" class="hud-btn" data-close>Done</button>
    </div>
  `;
}

export function hudKey(player, people) {
  const actionIds = visibleActions(player)
    .map((action) => action.id)
    .join(",");
  const listen = player.room === "town" ? nearbyPerson(people, player.x, player.y)?.id ?? "" : "";
  return `${player.room}:${player.pose}:${player.actionBeatMs > 0}:${player.job}:${actionIds}:${listen}`;
}
