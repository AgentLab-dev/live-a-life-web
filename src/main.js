import "./style.css";
import { clearUpdateReloadFlag, lockDocumentGestures, mountIosInstallCard, registerServiceWorker } from "./pwa.js";

const play = document.querySelector("#play");
const app = document.querySelector("#app");

if (!play || !app) {
  throw new Error("Title screen needs #app and Play");
}

lockDocumentGestures(document);
mountIosInstallCard(document);
registerServiceWorker();
setTimeout(() => clearUpdateReloadFlag(), 8000);

play.addEventListener("click", async () => {
  play.disabled = true;
  const card = document.querySelector("#ios-install-card");
  if (card) card.hidden = true;
  const { startGame } = await import("./start.js");
  startGame(app);
});
