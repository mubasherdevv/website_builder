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
      });
    }
  },
  error: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.error(title || message, {
        description: title ? message : undefined,
      });
    }
  },
  warning: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.warning(title || message, {
        description: title ? message : undefined,
      });
    }
  },
  info: (message: string, title?: string) => {
    if (typeof window !== "undefined") {
      gooeyToast.info(title || message, {
        description: title ? message : undefined,
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
      <GooeyToaster position="bottom-right" bounce={0.4} spring={true} />
    </>
  );
};
