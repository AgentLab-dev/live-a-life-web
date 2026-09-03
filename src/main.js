import "./style.css";

const play = document.querySelector("#play");
const app = document.querySelector("#app");

if (!play || !app) {
  throw new Error("Title screen needs #app and Play");
}

play.addEventListener("click", async () => {
  play.disabled = true;
  const { startGame } = await import("./start.js");
  startGame(app);
});
