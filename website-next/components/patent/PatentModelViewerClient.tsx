"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Patent3DScene, ViewerLocale } from "@/lib/patent-3d";
import styles from "./PatentModelViewer.module.css";

interface PatentModelViewerProps {
  scene: Patent3DScene;
  locale: ViewerLocale;
  showHotspotsDefault?: boolean;
  allowAr?: boolean;
  analyticsContext: string;
}

type ViewerEventName =
  | "patent_3d_opened"
  | "patent_3d_first_interaction"
  | "patent_3d_hotspot_opened"
  | "patent_3d_reset_view";

type ModelViewerElement = HTMLElement & {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  jumpCameraToGoal?: () => void;
};

type ModelViewerElementStatic = {
  dracoDecoderLocation?: string;
  ktx2TranscoderLocation?: string;
  meshoptDecoderLocation?: string;
};

function pushViewerEvent(event: ViewerEventName, context: string, sceneId: string, extra: Record<string, string> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    analytics_context: context,
    scene_id: sceneId,
    ...extra
  });
}

export default function PatentModelViewerClient({
  scene,
  locale,
  showHotspotsDefault = true,
  allowAr = false,
  analyticsContext
}: PatentModelViewerProps) {
  const [customElementReady, setCustomElementReady] = useState(false);
  const [modelVisible, setModelVisible] = useState(false);
  const [showHotspots, setShowHotspots] = useState(showHotspotsDefault);
  const [firstInteractionTracked, setFirstInteractionTracked] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(scene.hotspots[0]?.id ?? null);
  const modelViewerRef = useRef<ModelViewerElement | null>(null);

  const modelAvailable = Boolean(scene.modelSrc);

  useEffect(() => {
    setShowHotspots(showHotspotsDefault);
    setFirstInteractionTracked(false);
    setViewerKey(0);
    setActiveHotspotId(scene.hotspots[0]?.id ?? null);
    setModelVisible(false);
  }, [scene.id, scene.hotspots, showHotspotsDefault]);

  useEffect(() => {
    let mounted = true;

    import("@google/model-viewer")
      .then(() => {
        const modelViewerElement = customElements.get("model-viewer") as ModelViewerElementStatic | undefined;
        if (modelViewerElement) {
          modelViewerElement.dracoDecoderLocation = "/model-viewer/decoders/draco/gltf/";
          modelViewerElement.ktx2TranscoderLocation = "/model-viewer/decoders/basis/";
          modelViewerElement.meshoptDecoderLocation = "/model-viewer/decoders/meshopt/meshopt-decoder-init.js";
        }

        if (mounted) {
          setCustomElementReady(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setCustomElementReady(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeHotspot = useMemo(() => {
    if (scene.hotspots.length === 0) {
      return null;
    }

    return scene.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? scene.hotspots[0];
  }, [activeHotspotId, scene.hotspots]);

  const copy = useMemo(() => {
    if (locale === "de") {
      return {
        kicker: "3D Patent Playground",
        open: "3D-Modell anzeigen",
        pending: "3D-Modell wird vorbereitet",
        hotspotOn: "Labels ausblenden",
        hotspotOff: "Labels einblenden",
        reset: "Ansicht zuruecksetzen",
        fallback: "Technische Zeichnung oeffnen",
        claims: "Referenzierte Claims",
        hotspotDetail: "Hotspot-Details",
        hotspotDetailEmpty: "Keine Hotspots verfuegbar.",
        claimPrefix: "Claim-Referenz",
        mode: "Modus: Gezielte technische Sicht statt freies Spielen",
        statusPoster: "Posteransicht aktiv",
        statusModel: "3D-Modellansicht aktiv"
      };
    }

    return {
      kicker: "3D Patent Playground",
      open: "Show 3D model",
      pending: "3D model upload pending",
      hotspotOn: "Hide labels",
      hotspotOff: "Show labels",
      reset: "Reset view",
      fallback: "Open technical drawing",
      claims: "Referenced claims",
      hotspotDetail: "Hotspot details",
      hotspotDetailEmpty: "No hotspots available.",
      claimPrefix: "Claim reference",
      mode: "Mode: guided technical inspection, not free-play",
      statusPoster: "Poster view active",
      statusModel: "3D model view active"
    };
  }, [locale]);

  function handleModelOpen() {
    if (!modelAvailable) {
      return;
    }

    setModelVisible(true);
    pushViewerEvent("patent_3d_opened", analyticsContext, scene.id);
  }

  function trackFirstInteraction() {
    if (!modelVisible || firstInteractionTracked) {
      return;
    }

    setFirstInteractionTracked(true);
    pushViewerEvent("patent_3d_first_interaction", analyticsContext, scene.id);
  }

  function handleResetView() {
    const viewer = modelViewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.cameraOrbit = scene.cameraOrbit;
    viewer.cameraTarget = scene.cameraTarget;
    viewer.fieldOfView = scene.fieldOfView;
    viewer.jumpCameraToGoal?.();
    setViewerKey((value) => value + 1);

    pushViewerEvent("patent_3d_reset_view", analyticsContext, scene.id);
  }

  function handleHotspotClick(hotspotId: string, hotspotClaim: string) {
    setActiveHotspotId(hotspotId);
    trackFirstInteraction();
    pushViewerEvent("patent_3d_hotspot_opened", analyticsContext, scene.id, {
      hotspot_id: hotspotId,
      hotspot_claim: hotspotClaim
    });
  }

  return (
    <article className={`${styles.viewerSurface} surface card`}>
      <header className={styles.viewerHeader}>
        <p className={styles.kicker}>{copy.kicker}</p>
        <h3>{scene.title[locale]}</h3>
        <p>{scene.description[locale]}</p>
      </header>

      <div className={styles.viewerControls}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleModelOpen}
          disabled={!modelAvailable || modelVisible}
          aria-label={copy.open}
        >
          {modelAvailable ? copy.open : copy.pending}
        </button>

        <button
          type="button"
          className="btn btn-muted"
          onClick={() => setShowHotspots((value) => !value)}
          disabled={scene.hotspots.length === 0}
          aria-label={showHotspots ? copy.hotspotOn : copy.hotspotOff}
        >
          {showHotspots ? copy.hotspotOn : copy.hotspotOff}
        </button>

        <button
          type="button"
          className="btn btn-muted"
          onClick={handleResetView}
          disabled={!modelVisible}
          aria-label={copy.reset}
        >
          {copy.reset}
        </button>

        <a className="btn btn-muted" href={scene.fallbackDocHref} target="_blank" rel="noreferrer" aria-label={copy.fallback}>
          {copy.fallback}
        </a>
      </div>

      <p className={styles.modeText}>{copy.mode}</p>
      <p className={styles.srOnly} role="status" aria-live="polite">
        {modelVisible ? copy.statusModel : copy.statusPoster}
      </p>

      <div className={styles.viewerStage}>
        {modelVisible && modelAvailable && customElementReady ? (
          <model-viewer
            key={`${scene.id}-${viewerKey}`}
            ref={(value: Element | null) => {
              modelViewerRef.current = value as ModelViewerElement | null;
            }}
            className={styles.modelViewerElement}
            src={scene.modelSrc}
            poster={scene.posterSrc}
            alt={scene.alt[locale]}
            loading="lazy"
            reveal="interaction"
            interaction-prompt="auto"
            touch-action="pan-y"
            camera-controls="true"
            camera-orbit={scene.cameraOrbit}
            camera-target={scene.cameraTarget}
            field-of-view={scene.fieldOfView}
            shadow-intensity="1"
            exposure="1.06"
            environment-image="neutral"
            ar={allowAr ? "true" : undefined}
            ar-modes={allowAr ? "webxr scene-viewer quick-look" : undefined}
            onPointerDown={trackFirstInteraction}
            onKeyDown={trackFirstInteraction}
          >
            {showHotspots
              ? scene.hotspots.map((hotspot, index) => {
                  const selected = activeHotspot?.id === hotspot.id;

                  return (
                    <button
                      key={hotspot.id}
                      type="button"
                      slot={`hotspot-${hotspot.id}`}
                      data-position={hotspot.position}
                      data-normal={hotspot.normal}
                      className={styles.hotspot}
                      aria-label={`${hotspot.claimRef}: ${hotspot.title[locale]}`}
                      aria-pressed={selected}
                      onClick={() => handleHotspotClick(hotspot.id, hotspot.claimRef)}
                    >
                      <span className={styles.hotspotIndex}>{index + 1}</span>
                      <span className={styles.hotspotLabel}>{hotspot.title[locale]}</span>
                    </button>
                  );
                })
              : null}
          </model-viewer>
        ) : (
          <figure className={styles.posterFrame}>
            <Image
              src={scene.posterSrc}
              alt={scene.alt[locale]}
              width={1600}
              height={900}
              sizes="(max-width: 1120px) 100vw, 1120px"
              className={styles.posterImage}
            />
          </figure>
        )}
      </div>

      <section className={styles.hotspotDetails} aria-live="polite" aria-label={copy.hotspotDetail}>
        <h4>{copy.hotspotDetail}</h4>
        {activeHotspot ? (
          <>
            <p className={styles.hotspotTitle}>{activeHotspot.title[locale]}</p>
            <p>{activeHotspot.body[locale]}</p>
            <p className={styles.claimRef}>
              {copy.claimPrefix}: <strong>{activeHotspot.claimRef}</strong>
            </p>
          </>
        ) : (
          <p>{copy.hotspotDetailEmpty}</p>
        )}
      </section>

      <section className={styles.claimsSection} aria-label={copy.claims}>
        <h4>{copy.claims}</h4>
        <ul>
          {scene.claimRefs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
