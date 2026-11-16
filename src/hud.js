import { carryLabel, earnedStickerCount, stickerList } from "./crossings.js";
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
        <div id="sticker-row" class="sticker-row" aria-label="Stickers"></div>
      </div>
      <button type="button" id="usa-map-btn" class="usa-map-btn" data-action="enter-usa" aria-keyshortcuts="M" aria-label="USA map">
        <svg class="usa-map-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M3.5 6.2 8.5 4.2l7 2.2 5-2v13.4l-5 2-7-2.2-5 2V6.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
          <path d="M8.5 4.2v13.2M15.5 6.4v13.2" fill="none" stroke="currentColor" stroke-width="1.8"></path>
          <circle cx="12" cy="11" r="1.6" fill="currentColor"></circle>
        </svg>
        <span class="usa-map-label">USA map</span>
        <span class="usa-map-key" aria-hidden="true">M</span>
      </button>
      <div id="dpad" class="dpad" aria-label="Walk">
        <button type="button" class="dpad-btn dpad-up" data-dir="up" aria-label="Walk up" tabindex="-1">▲</button>
        <button type="button" class="dpad-btn dpad-left" data-dir="left" aria-label="Walk left" tabindex="-1">◀</button>
        <button type="button" class="dpad-btn dpad-right" data-dir="right" aria-label="Walk right" tabindex="-1">▶</button>
        <button type="button" class="dpad-btn dpad-down" data-dir="down" aria-label="Walk down" tabindex="-1">▼</button>
      </div>
      <div id="install-tip" class="install-tip" hidden>
        <p>Add to Home Screen for the app icon</p>
        <p class="install-how">iPhone: tap Share, then Add to Home Screen. Android: tap Install app.</p>
        <button type="button" class="hud-btn" id="install-tip-ok">Got it</button>
      </div>
      <div id="hud-actions" class="hud-actions"></div>
      <div id="panel" class="panel" hidden></div>
    </div>
  `;
}

export function renderHud(root, player, people = []) {
  const place = root.querySelector("#place-name");
  const actions = root.querySelector("#hud-actions");
  const stickers = root.querySelector("#sticker-row");
  if (place) place.textContent = placeName(player.room, player);
  if (stickers) {
    const items = stickerList(player.stickers);
    const heldLabel = carryLabel(player.carry);
    const held = heldLabel ? `<span class="carry-chip">${heldLabel}</span>` : "";
    stickers.innerHTML =
      items
        .map(
          (item) =>
            `<span class="sticker-dot ${item.earned ? "earned" : ""}" title="${item.name}" aria-label="${item.name}"></span>`,
        )
        .join("") + held;
  }
  const buttons = visibleActions(player).map((action) => ({ id: action.id, label: action.label }));
  const idle = player.pose !== "walk" && player.actionBeatMs <= 0;
  if (player.room === "town" && idle) {
    const person = nearbyPerson(people, player.x, player.y);
    if (person) buttons.push({ id: `listen:${person.id}`, label: `Listen to ${person.name}` });
  }
  actions.innerHTML = buttons
    .map((action) => `<button type="button" class="hud-btn" data-action="${action.id}">${action.label}</button>`)
    .join("");
  applyUsaMapButton(root.querySelector("#usa-map-btn"), player.room);
}

export function usaMapButtonState(room) {
  if (room === "town") return { visible: true, label: "USA map", action: "enter-usa" };
  if (room === "usa" || room === "state") return { visible: true, label: "Back to town", action: "leave-usa" };
  return { visible: false, label: "USA map", action: "enter-usa" };
}

export function applyUsaMapButton(button, room) {
  const mode = usaMapButtonState(room);
  if (!button) return mode;
  button.hidden = !mode.visible;
  if (button.dataset) button.dataset.action = mode.action;
  button.setAttribute?.("aria-label", mode.label);
  const label = button.querySelector?.(".usa-map-label");
  if (label) label.textContent = mode.label;
  return mode;
}

function pointInButton(button, event) {
  if (!button?.getBoundingClientRect || event?.clientX == null || event?.clientY == null) return true;
  const box = button.getBoundingClientRect();
  return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
}

export function bindUsaMapButton(button, onActivate) {
  if (!button?.addEventListener || typeof onActivate !== "function") return false;
  let pointerId = null;
  let skipClick = false;
  const stop = (event) => {
    event?.stopPropagation?.();
  };
  button.addEventListener("pointerdown", (event) => {
    stop(event);
    event.preventDefault?.();
    skipClick = false;
    pointerId = event.pointerId ?? "mouse";
    try {
      button.setPointerCapture?.(event.pointerId);
    } catch {
      // Capture is optional; pointerup still sees the tap.
    }
  });
  button.addEventListener("pointerup", (event) => {
    stop(event);
    event.preventDefault?.();
    const id = event.pointerId ?? "mouse";
    if (pointerId !== id) return;
    pointerId = null;
    skipClick = true;
    if (!pointInButton(button, event)) return;
    onActivate();
  });
  button.addEventListener("pointercancel", (event) => {
    stop(event);
    pointerId = null;
    skipClick = true;
  });
  button.addEventListener("click", (event) => {
    stop(event);
    event.preventDefault?.();
    if (event.detail !== 0 && skipClick) {
      skipClick = false;
      return;
    }
    skipClick = false;
    onActivate();
  });
  return true;
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

export function stickerSheet(stickers) {
  const items = stickerList(stickers);
  const got = earnedStickerCount(stickers);
  return `
    <div class="sheet">
      <h2>My stickers</h2>
      <p>Soft keepsakes from town crossings. No points. No races.</p>
      <div class="sticker-list">${items
        .map(
          (item) => `
        <div class="sticker-card ${item.earned ? "earned" : ""}">
          <strong>${item.name}</strong>
          <p>${item.earned ? item.hint : "Still waiting, whenever you like."}</p>
        </div>`,
        )
        .join("")}</div>
      <p class="fine">${got} of ${items.length} stickers on this device.</p>
      <button type="button" class="hud-btn" data-close>Done</button>
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
  const marks = stickerList(player.stickers)
    .filter((item) => item.earned)
    .map((item) => item.id)
    .join("");
  return `${player.room}:${player.stateId || ""}:${player.capitalId || ""}:${player.pose}:${player.actionBeatMs > 0}:${player.hopMs > 0}:${player.job}:${player.parkGateOpen}:${player.bookCartOut}:${player.carry}:${marks}:${actionIds}:${listen}`;
}
