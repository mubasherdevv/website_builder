"use client";

import React, { createContext, useContext } from "react";
import { ThemeConfig } from "@/types/builder";
import { modernPurplePreset } from "./presets";
import { themeToCssVariables } from "./utils/css-variables";

interface ThemeContextValue {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: modernPurplePreset,
});

export interface ThemeProviderProps {
  theme?: ThemeConfig;
  children: React.ReactNode;
  className?: string;
  asWrapper?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = modernPurplePreset,
  children,
  className = "",
  asWrapper = true,
}) => {
  const cssVariables = themeToCssVariables(theme) as React.CSSProperties;

  if (asWrapper) {
    return (
      <ThemeContext.Provider value={{ theme }}>
        <div
          data-theme-id={theme.id}
          style={cssVariables}
          className={`website-theme-root ${className}`}
        >
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useWebsiteTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  return ctx.theme;
}

