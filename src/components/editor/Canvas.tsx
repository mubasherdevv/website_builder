"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageDocument, ThemeConfig } from "@/types/builder";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import { ViewportMode } from "./EditorTopBar";
import { IsolatedFrame } from "./IsolatedFrame";
import { Smartphone, Tablet, Monitor, RotateCw, ArrowUp, ArrowDown } from "lucide-react";

export interface CanvasProps {
  document: PageDocument;
  theme: ThemeConfig;
  viewport: ViewportMode;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onMoveSectionUp: (id: string) => void;
  onMoveSectionDown: (id: string) => void;
  onAddSectionClick: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  document,
  theme,
  viewport,
  selectedSectionId,
  onSelectSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onAddSectionClick,
}) => {
  const mainRef = useRef<HTMLDivElement>(null);

  // Common viewport width options per device category
  const mobileWidths = [
    { label: "320px", value: 320, name: "SE" },
    { label: "360px", value: 360, name: "Android" },
    { label: "375px", value: 375, name: "iPhone" },
    { label: "390px", value: 390, name: "Pro" },
    { label: "430px", value: 430, name: "Max" },
  ];

  const tabletWidths = [
    { label: "768px", value: 768, name: "iPad" },
    { label: "820px", value: 820, name: "Air" },
  ];

  const desktopWidths = [
    { label: "1024px", value: 1024, name: "Laptop" },
    { label: "1280px", value: 1280, name: "HD" },
    { label: "1440px", value: 1440, name: "FHD" },
    { label: "100%", value: "100%", name: "Full" },
  ];

  // Specific custom width state within current device mode
  const [selectedMobileWidth, setSelectedMobileWidth] = useState<number>(375);
  const [selectedTabletWidth, setSelectedTabletWidth] = useState<number>(768);
  const [selectedDesktopWidth, setSelectedDesktopWidth] = useState<number | string>("100%");
  const [isLandscape, setIsLandscape] = useState(false);

  // Reset orientation on viewport switch
  useEffect(() => {
    setIsLandscape(false);
  }, [viewport]);

  // Determine current effective pixel width and height constraints
  let effectiveWidth: string | number = "100%";
  if (viewport === "mobile") {
    effectiveWidth = isLandscape ? 667 : selectedMobileWidth;
  } else if (viewport === "tablet") {
    effectiveWidth = isLandscape ? 1024 : selectedTabletWidth;
  } else {
    effectiveWidth = selectedDesktopWidth;
  }

  return (
    <main
      ref={mainRef}
      id="canvas-scroll-container"
      onClick={() => onSelectSection("")}
      className="flex-1 h-full min-h-0 overflow-y-auto bg-[#EDF4EF] flex flex-col items-center justify-start p-3 sm:p-6"
    >
      {/* Device Viewport Bar (Visual Indicator + Quick Width Selectors) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl mb-4 px-4 py-2 bg-surface/90 backdrop-blur-md rounded-xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none"
      >
        <div className="flex items-center gap-2">
          {viewport === "mobile" && <Smartphone className="w-4 h-4 text-brand" />}
          {viewport === "tablet" && <Tablet className="w-4 h-4 text-brand" />}
          {viewport === "desktop" && <Monitor className="w-4 h-4 text-brand" />}
          <span className="font-semibold text-text-primary">
            {viewport === "mobile" ? "Mobile" : viewport === "tablet" ? "Tablet" : "Desktop"} Preview:
          </span>
          <span className="font-mono text-brand font-bold bg-brand-soft px-2 py-0.5 rounded text-[11px]">
            {effectiveWidth === "100%" ? "100% (Responsive)" : `${effectiveWidth}px`}
          </span>
        </div>

        {/* Width preset chips for current device */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-text-muted hidden sm:inline">Presets:</span>
          {viewport === "mobile" &&
            mobileWidths.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => {
                  setSelectedMobileWidth(w.value);
                  setIsLandscape(false);
                }}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedMobileWidth === w.value && !isLandscape
                    ? "bg-brand text-white shadow-xs font-semibold"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface border border-border"
                }`}
              >
                {w.label}
              </button>
            ))}

          {viewport === "tablet" &&
            tabletWidths.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => {
                  setSelectedTabletWidth(w.value);
                  setIsLandscape(false);
                }}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedTabletWidth === w.value && !isLandscape
                    ? "bg-brand text-white shadow-xs font-semibold"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface border border-border"
                }`}
              >
                {w.label} ({w.name})
              </button>
            ))}

          {viewport === "desktop" &&
            desktopWidths.map((w) => (
              <button
                key={String(w.value)}
                type="button"
                onClick={() => setSelectedDesktopWidth(w.value)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedDesktopWidth === w.value
                    ? "bg-brand text-white shadow-xs font-semibold"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface border border-border"
                }`}
              >
                {w.label}
              </button>
            ))}

          {/* Orientation flip button for mobile & tablet */}
          {(viewport === "mobile" || viewport === "tablet") && (
            <button
              type="button"
              onClick={() => setIsLandscape((prev) => !prev)}
              title={isLandscape ? "Switch to Portrait" : "Switch to Landscape"}
              className={`p-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer border ${
                isLandscape
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary border-border"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isLandscape ? "Landscape" : "Rotate"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: effectiveWidth === "100%" ? "100%" : `${effectiveWidth}px`,
          maxWidth: "100%",
        }}
        className={`transition-all duration-200 ${
          viewport === "mobile"
            ? "bg-surface shadow-2xl my-2 rounded-[32px] p-2 sm:p-2.5 border-4 border-slate-800 ring-1 ring-slate-900/10 shrink-0"
            : viewport === "tablet"
            ? "bg-surface shadow-2xl my-2 rounded-[24px] p-2.5 sm:p-3 border-4 border-slate-700 ring-1 ring-slate-900/10 shrink-0"
            : "w-full bg-surface shadow-md rounded-xl border border-border overflow-visible"
        }`}
      >
        {/* Mobile Mock Notch / Speaker Indicator */}
        {viewport === "mobile" && (
          <div className="w-full flex justify-center items-center py-1.5 mb-1">
            <div className="w-20 h-3.5 bg-slate-900 rounded-full flex items-center justify-end px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
        )}

        {/* Tablet Mock Camera Indicator */}
        {viewport === "tablet" && (
          <div className="w-full flex justify-center items-center py-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          </div>
        )}

        {/* Canvas Screen */}
        <div
          className={`w-full bg-surface ${
            viewport === "mobile"
              ? "rounded-[22px] overflow-hidden"
              : viewport === "tablet"
              ? "rounded-[16px] overflow-hidden"
              : ""
          }`}
        >
          {viewport === "desktop" ? (
            /* On Desktop, render directly so scrolling, wheel, and interactions are 100% native */
            <PageRenderer
              document={document}
              theme={theme}
              mode="editor"
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
              onDeleteSection={onDeleteSection}
              onDuplicateSection={onDuplicateSection}
              onMoveSectionUp={onMoveSectionUp}
              onMoveSectionDown={onMoveSectionDown}
              onAddSectionClick={onAddSectionClick}
            />
          ) : (
            /* On Mobile and Tablet, render in IsolatedFrame for authentic media query emulation */
            <IsolatedFrame
              viewportWidth={effectiveWidth}
              title={`${viewport} canvas preview (${effectiveWidth})`}
            >
              <PageRenderer
                document={document}
                theme={theme}
                mode="editor"
                selectedSectionId={selectedSectionId}
                onSelectSection={onSelectSection}
                onDeleteSection={onDeleteSection}
                onDuplicateSection={onDuplicateSection}
                onMoveSectionUp={onMoveSectionUp}
                onMoveSectionDown={onMoveSectionDown}
                onAddSectionClick={onAddSectionClick}
              />
            </IsolatedFrame>
          )}
        </div>
      </div>

      {/* Floating Canvas Scroll Controls for effortless jumping */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="sticky bottom-4 self-end z-20 mt-4 flex items-center gap-1.5 px-2 py-1.5 bg-surface/95 backdrop-blur-md border border-border shadow-md rounded-full text-xs select-none"
      >
        <span className="text-[10px] font-semibold text-text-muted px-1 hidden sm:inline">Scroll:</span>
        <button
          type="button"
          onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          title="Scroll to Top"
          className="p-1.5 rounded-full hover:bg-brand-soft text-text-secondary hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() =>
            mainRef.current?.scrollTo({
              top: mainRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          title="Scroll to Bottom"
          className="p-1.5 rounded-full hover:bg-brand-soft text-text-secondary hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  );
};
