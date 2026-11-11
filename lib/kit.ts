import type { CartLine } from "./cart";

export type KitQuality = "HD" | "IP";

const CAMERAS = {
  HD: {
    outdoor: "eyesera-2-4mp-hd-bullet-camera",
    indoor: "dynexa-indoor-hd-dome-camera",
  },
  IP: {
    outdoor: "eyesera-5mp-ip-bullet-camera",
    indoor: "eyesera-5mp-ip-dome-camera",
  },
};

const SMPS_4 = "dynexa-cctv-smps-4ch";
const SMPS_8 = "dynexa-8-channel-cctv-power-supply-box";
const POE_4 = "eyesera-4-plus-2-port-poe-switch";
const POE_8 = "eyesera-8-plus-2-port-poe-switch";
const DC_CABLE = "dynexa-dc-power-connection-cable";
const JUNCTION_BOX = "cctv-junction-box";

/** Covers `total` cameras with 8-channel units, plus a 4-channel unit where that is enough. */
function splitChannels(total: number, large: string, small: string): CartLine[] {
  let eights = Math.floor(total / 8);
  const rest = total % 8;
  let fours = 0;
  if (rest > 4) eights += 1;
  else if (rest > 0) fours = 1;
  return [
    ...(eights ? [{ slug: large, qty: eights }] : []),
    ...(fours ? [{ slug: small, qty: fours }] : []),
  ];
}

export function buildKit(outdoor: number, indoor: number, quality: KitQuality): CartLine[] {
  const total = outdoor + indoor;
  if (total === 0) return [];

  const lines: CartLine[] = [];
  if (outdoor) lines.push({ slug: CAMERAS[quality].outdoor, qty: outdoor });
  if (indoor) lines.push({ slug: CAMERAS[quality].indoor, qty: indoor });

  if (quality === "HD") {
    lines.push(...splitChannels(total, SMPS_8, SMPS_4));
    lines.push({ slug: DC_CABLE, qty: total });
  } else {
    lines.push(...splitChannels(total, POE_8, POE_4));
  }
  if (outdoor) lines.push({ slug: JUNCTION_BOX, qty: outdoor });
  return lines;
}
