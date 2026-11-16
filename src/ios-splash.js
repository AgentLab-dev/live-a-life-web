export const IPHONE_SPLASHES = [
  { w: 750, h: 1334, dw: 375, dh: 667, dpr: 2 },
  { w: 1242, h: 2208, dw: 414, dh: 736, dpr: 3 },
  { w: 1125, h: 2436, dw: 375, dh: 812, dpr: 3 },
  { w: 828, h: 1792, dw: 414, dh: 896, dpr: 2 },
  { w: 1170, h: 2532, dw: 390, dh: 844, dpr: 3 },
  { w: 1179, h: 2556, dw: 393, dh: 852, dpr: 3 },
  { w: 1284, h: 2778, dw: 428, dh: 926, dpr: 3 },
  { w: 1290, h: 2796, dw: 430, dh: 932, dpr: 3 },
  { w: 1206, h: 2622, dw: 402, dh: 874, dpr: 3 },
  { w: 1320, h: 2868, dw: 440, dh: 956, dpr: 3 },
];

export const SPLASH_ORIENTATIONS = ["portrait", "landscape"];

export function splashPixelSize(spec, orientation) {
  if (orientation === "landscape") return { width: spec.h, height: spec.w };
  return { width: spec.w, height: spec.h };
}

export function splashHref(width, height) {
  return `./splash/apple-splash-${width}x${height}.png`;
}

export function splashMedia(spec, orientation) {
  const deviceWidth = orientation === "landscape" ? spec.dh : spec.dw;
  const deviceHeight = orientation === "landscape" ? spec.dw : spec.dh;
  return `screen and (device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${spec.dpr}) and (orientation: ${orientation})`;
}

export function splashVariants() {
  const variants = [];
  for (const spec of IPHONE_SPLASHES) {
    for (const orientation of SPLASH_ORIENTATIONS) {
      const { width, height } = splashPixelSize(spec, orientation);
      variants.push({
        orientation,
        width,
        height,
        href: splashHref(width, height),
        media: splashMedia(spec, orientation),
      });
    }
  }
  return variants;
}

export function splashLinkTag(variant) {
  return `<link rel="apple-touch-startup-image" media="${variant.media}" href="${variant.href}" />`;
}

export function splashLinkTags() {
  return splashVariants()
    .map((variant) => splashLinkTag(variant))
    .join("\n    ");
}
