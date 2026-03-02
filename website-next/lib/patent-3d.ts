import { site } from "@/lib/site";

export type ViewerLocale = "de" | "en";

type LocalizedText = Record<ViewerLocale, string>;

export interface Patent3DHotspot {
  id: string;
  position: string;
  normal: string;
  title: LocalizedText;
  body: LocalizedText;
  claimRef: string;
}

export interface Patent3DScene {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  modelSrc?: string;
  posterSrc: string;
  alt: LocalizedText;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  hotspots: Patent3DHotspot[];
  claimRefs: string[];
  fallbackDocHref: string;
}

export const patent3DScene: Patent3DScene = {
  id: `${site.id}-guided-device`,
  title: {
    de: `${site.name}: Patentgeraet in 3D`,
    en: `${site.name}: patent device in 3D`
  },
  description: {
    de: "Gefuehrte 3D-Inspektion mit Claim-Referenzen. Das Webmodell ist absichtlich reduziert und dient zur Erklaerung, nicht zur Fertigung.",
    en: "Guided 3D inspection with claim references. The web model is intentionally reduced for explanation, not manufacturing."
  },
  modelSrc: "/models/patent-device-v20260226-ed52.glb",
  posterSrc: "/posters/patent-device-poster-v20260226.svg",
  alt: {
    de: "Posteransicht des patentierten Geraets mit markierten Referenzzonen",
    en: "Poster view of the patented device with highlighted reference zones"
  },
  cameraOrbit: "35deg 72deg 2.6m",
  cameraTarget: "0m 0.18m 0m",
  fieldOfView: "28deg",
  hotspots: [
    {
      id: "sensor-head",
      position: "0m 0.24m 0.1m",
      normal: "0m 1m 0m",
      title: {
        de: "Sensor-Kopf",
        en: "Sensor head"
      },
      body: {
        de: "Messkopf fuer die sequenzielle Prozessaufnahme.",
        en: "Sensor head for sequential process acquisition."
      },
      claimRef: "EC-Claim-1"
    },
    {
      id: "processing-core",
      position: "0m 0.08m 0m",
      normal: "0m 1m 0m",
      title: {
        de: "Process Core",
        en: "Process core"
      },
      body: {
        de: "Steuert die Reihenfolge der biochemischen Stufen.",
        en: "Controls order and transitions of biochemical stages."
      },
      claimRef: "EC-Claim-4"
    },
    {
      id: "safety-shell",
      position: "0.12m 0.02m -0.06m",
      normal: "1m 0m 0m",
      title: {
        de: "Safety Shell",
        en: "Safety shell"
      },
      body: {
        de: "Geruchs- und Sicherheitsfokus fuer Haushaltsbetrieb.",
        en: "Odor and safety-focused shell for household usage."
      },
      claimRef: "EC-Claim-7"
    }
  ],
  claimRefs: ["EC-Claim-1", "EC-Claim-4", "EC-Claim-7"],
  fallbackDocHref: "/patent/patent-device-outline-v20260226.svg"
};
