import React from "react";
import { ZodType, ZodTypeDef } from "zod";

export type PropertyControlType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "color"
  | "image"
  | "list";

export interface PropertyControlOption {
  label: string;
  value: string;
}

export interface PropertyControlDefinition {
  propName: string;
  label: string;
  type: PropertyControlType;
  description?: string;
  options?: PropertyControlOption[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface ComponentDefinition<TSettings extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  category: "navigation" | "hero" | "content" | "social" | "forms" | "footer";
  version: number;
  schema: ZodType<TSettings, ZodTypeDef, unknown>;
  defaults: TSettings;
  component: React.ComponentType<TSettings>;
  editor: {
    controls: PropertyControlDefinition[];
  };
}

export type AnyComponentDefinition = ComponentDefinition<Record<string, unknown>>;
