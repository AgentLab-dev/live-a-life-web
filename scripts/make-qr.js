import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import QRCode from "qrcode";

export const PLAY_URL = "https://agentlab-dev.github.io/live-a-life-web/";

export const qrPngOptions = {
  errorCorrectionLevel: "M",
  margin: 4,
  width: 512,
  color: { dark: "#1a1a1a", light: "#ffffff" },
};

export function defaultQrPath() {
  return join(dirname(fileURLToPath(import.meta.url)), "../public/qr-play.png");
}

export function qrBuffer() {
  return QRCode.toBuffer(PLAY_URL, qrPngOptions);
}

export async function writePlayQr(dest = defaultQrPath()) {
  const png = await qrBuffer();
  writeFileSync(dest, png);
  return png;
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) {
  await writePlayQr();
  console.log("Wrote public/qr-play.png for", PLAY_URL);
}
