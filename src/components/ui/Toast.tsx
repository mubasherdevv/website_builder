"use client";

import React from "react";
import { gooeyToast, GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export type ToastType = "success" | "error" | "warning" | "info";

export const toast = {
  success: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.success(title || message, {
        description: title ? message : undefined,
        duration: 2000,
        timing: { displayDuration: 2000 },
      });
    }
  },
  error: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.error(title || message, {
        description: title ? message : undefined,
        duration: 2000,
        timing: { displayDuration: 2000 },
      });
    }
  },
  warning: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.warning(title || message, {
        description: title ? message : undefined,
        duration: 2000,
        timing: { displayDuration: 2000 },
      });
    }
  },
  info: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.info(title || message, {
        description: title ? message : undefined,
        duration: 2000,
        timing: { displayDuration: 2000 },
      });
    }
  },
};

export const useToast = () => {
  return toast;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <GooeyToaster
        position="top-right"
        theme="dark"
        duration={2000}
        bounce={0.4}
        spring={true}
      />
    </>
  );
};
