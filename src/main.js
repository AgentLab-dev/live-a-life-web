import "./style.css";
import { registerServiceWorker } from "./pwa.js";

const play = document.querySelector("#play");
const app = document.querySelector("#app");

if (!play || !app) {
  throw new Error("Title screen needs #app and Play");
}

registerServiceWorker();

play.addEventListener("click", async () => {
  play.disabled = true;
  const { startGame } = await import("./start.js");
  startGame(app);
});
