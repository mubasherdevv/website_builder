"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export interface IsolatedFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  viewportWidth?: number | string;
}

/**
 * IsolatedFrame renders children inside an isolated iframe via createPortal.
 * This guarantees authentic CSS media query (@media min-width / max-width)
 * evaluation matching the exact mobile/tablet container width.
 * It forwards mouse wheel events so the user can scroll naturally.
 */
export const IsolatedFrame: React.FC<IsolatedFrameProps> = ({
  children,
  className = "",
  style = {},
  title = "Responsive Canvas Preview",
  viewportWidth,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(800);
  const [isClient, setIsClient] = useState(false);

  const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const syncStyles = (doc: Document) => {
    if (!doc || !doc.head) return;

    doc.querySelectorAll("[data-canvas-sync='true']").forEach((el) => el.remove());

    // 1. Meta viewport
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0";
      meta.setAttribute("data-canvas-sync", "true");
      doc.head.appendChild(meta);
    }

    // 2. Clone all parent styles, links, and fonts
    const parentStyles = document.querySelectorAll(
      "style, link[rel='stylesheet'], link[rel='preconnect'], link[rel='dns-prefetch']"
    );
    parentStyles.forEach((styleEl) => {
      const clone = styleEl.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-canvas-sync", "true");
      doc.head.appendChild(clone);
    });

    // 3. Sync CSS variables from root html element
    const rootStyle = window.getComputedStyle(document.documentElement);
    let cssVarText = ":root {";
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      if (prop.startsWith("--")) {
        cssVarText += `${prop}: ${rootStyle.getPropertyValue(prop)};`;
      }
    }
    cssVarText += "}";

    const varStyleEl = doc.createElement("style");
    varStyleEl.setAttribute("data-canvas-sync", "true");
    varStyleEl.textContent = cssVarText;
    doc.head.appendChild(varStyleEl);
  };

  useLayoutEffect(() => {
    if (!isClient || isTestEnv) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        syncStyles(doc);

        // Observer for newly added styles
        let mutationObserver: MutationObserver | null = null;
        if (typeof MutationObserver !== "undefined") {
          mutationObserver = new MutationObserver(() => {
            syncStyles(doc);
          });
          mutationObserver.observe(document.head, { childList: true, subtree: true });
        }

        // Body styling
        doc.body.style.margin = "0";
        doc.body.style.padding = "0";
        doc.body.style.overflowX = "hidden";
        doc.body.style.overflowY = "auto";
        doc.body.style.backgroundColor = "transparent";
        doc.body.className = "bg-transparent text-text-primary antialiased";

        setMountNode(doc.body);

        // Height synchronization
        const updateHeight = () => {
          if (!doc.documentElement || !doc.body) return;
          const scrollH = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          if (scrollH > 100) {
            setContentHeight(scrollH);
          }
        };

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            updateHeight();
          });
          resizeObserver.observe(doc.body);
        }

        // Forward mouse wheel events to parent container so user can scroll effortlessly
        const handleWheel = (e: WheelEvent) => {
          const scrollContainer = window.document.querySelector("main");
          if (scrollContainer) {
            scrollContainer.scrollBy({ top: e.deltaY, behavior: "auto" });
          }
        };
        doc.addEventListener("wheel", handleWheel, { passive: true });

        const intervalId = setInterval(updateHeight, 400);

        return () => {
          mutationObserver?.disconnect();
          resizeObserver?.disconnect();
          doc.removeEventListener("wheel", handleWheel);
          clearInterval(intervalId);
        };
      } catch (err) {
        console.warn("Could not attach isolated iframe preview:", err);
      }
    };

    const doc = iframe.contentDocument;
    if (doc && doc.readyState === "complete") {
      const cleanup = setupIframe();
      return cleanup;
    } else {
      iframe.addEventListener("load", setupIframe, { once: true });
    }
  }, [isClient, isTestEnv, viewportWidth]);

  // Fallback for SSR and testing environments (JSDOM)
  if (!isClient || isTestEnv || typeof window === "undefined") {
    return <div className={`w-full ${className}`} style={style}>{children}</div>;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <iframe
        ref={iframeRef}
        title={title}
        className={`w-full border-0 block transition-all duration-150 ${className}`}
        style={{
          height: `${Math.max(600, contentHeight)}px`,
          minHeight: "600px",
          ...style,
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </div>
  );
};
