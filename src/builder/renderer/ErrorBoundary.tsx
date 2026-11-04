"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  componentId?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SectionErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 my-4 rounded-card border-2 border-dashed border-status-danger/40 bg-status-danger-soft/30 text-center">
          <div className="flex items-center justify-center gap-2 text-status-danger mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-semibold text-sm">
              {this.props.fallbackTitle || "Component Rendering Error"}
            </h4>
          </div>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            {this.props.componentId ? (
              <span>Failed to render component <code className="bg-surface px-1 py-0.5 rounded border">{this.props.componentId}</code>: </span>
            ) : null}
            {this.state.errorMessage || "An unexpected error occurred while rendering this section."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

