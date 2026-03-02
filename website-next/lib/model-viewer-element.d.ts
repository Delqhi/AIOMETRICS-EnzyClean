import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  loading?: "lazy" | "eager" | "auto";
  reveal?: "interaction" | "auto" | "manual";
  "interaction-prompt"?: "auto" | "none";
  "touch-action"?: string;
  "camera-controls"?: string | boolean;
  "camera-orbit"?: string;
  "camera-target"?: string;
  "field-of-view"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "environment-image"?: string;
  ar?: string | boolean;
  "ar-modes"?: string;
  slot?: string;
  "data-position"?: string;
  "data-normal"?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }

  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

export {};
