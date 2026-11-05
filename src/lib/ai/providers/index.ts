import { BaseAIProvider } from "./types";
import { OpenAIProvider } from "./openai.provider";
import { OpenRouterProvider } from "./openrouter.provider";
import { GeminiProvider } from "./gemini.provider";
import { CustomCompatibleProvider } from "./custom-compatible.provider";

export * from "./types";
export * from "./openai.provider";
export * from "./openrouter.provider";
export * from "./gemini.provider";
export * from "./custom-compatible.provider";

export function getProviderInstance(type: string): BaseAIProvider {
  switch (type) {
    case "openai":
      return new OpenAIProvider();
    case "openrouter":
      return new OpenRouterProvider();
    case "gemini":
      return new GeminiProvider();
    case "custom":
      return new CustomCompatibleProvider();
    default:
      throw new Error(`Unsupported AI Provider type: ${type}`);
  }
}

