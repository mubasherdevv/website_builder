import { BaseAIProvider, DiscoveredModel, ProviderConnectionTestResult } from "./types";
import { validateCustomAiBaseUrl } from "@/lib/security/ssrf-guard";

export class CustomCompatibleProvider implements BaseAIProvider {
  async listModels(apiKey: string, baseUrl?: string | null): Promise<DiscoveredModel[]> {
    if (!baseUrl) {
      throw new Error("Base URL is required for custom OpenAI-compatible providers");
    }

    const validation = validateCustomAiBaseUrl(baseUrl);
    if (!validation.valid || !validation.parsedUrl) {
      throw new Error(validation.error || "Invalid Base URL");
    }

    const cleanBaseUrl = validation.parsedUrl;
    const url = `${cleanBaseUrl}/models`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        // Many custom endpoints don't implement /models. Return empty list to trigger manual model input
        return [];
      }

      const data = await res.json();
      const list: Array<string | { id?: string; name?: string }> = data.data || data.models || [];
      return list.map((m) => {
        const id = typeof m === "string" ? m : m.id || "default";
        const name = typeof m === "string" ? m : m.name || m.id || "default";
        return {
          id,
          name,
          description: "Custom Compatible Model",
        };
      });
    } catch {
      // Graceful fallback to manual model entry
      return [];
    }
  }

  async testConnection(apiKey: string, baseUrl?: string | null, modelId?: string): Promise<ProviderConnectionTestResult> {
    const start = Date.now();
    if (!baseUrl) {
      return { success: false, latencyMs: 0, error: "Base URL is required" };
    }

    const validation = validateCustomAiBaseUrl(baseUrl);
    if (!validation.valid || !validation.parsedUrl) {
      return { success: false, latencyMs: 0, error: validation.error || "Security restriction blocked Base URL" };
    }

    try {
      // Try listing models first
      const models = await this.listModels(apiKey, baseUrl);
      if (models.length > 0) {
        return {
          success: true,
          latencyMs: Date.now() - start,
          modelsFound: models.length,
        };
      }

      // If /models failed or is empty, test with minimal chat ping
      const res = await fetch(`${validation.parsedUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId || "default",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });

      if (res.ok || res.status === 400) {
        // 400 usually means API key was accepted but model / params were slightly different
        return {
          success: true,
          latencyMs: Date.now() - start,
          modelsFound: 0,
        };
      }

      const errText = await res.text();
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: `Custom endpoint returned ${res.status}: ${errText.slice(0, 100)}`,
      };
    } catch (e) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : "Connection failed",
      };
    }
  }

  async completeJsonPrompt(params: {
    apiKey: string;
    modelId: string;
    systemPrompt: string;
    userPrompt: string;
    baseUrl?: string | null;
  }) {
    if (!params.baseUrl) {
      throw new Error("Base URL is required for custom OpenAI-compatible providers");
    }

    const validation = validateCustomAiBaseUrl(params.baseUrl);
    if (!validation.valid || !validation.parsedUrl) {
      throw new Error(validation.error || "Security restriction: Invalid Base URL");
    }

    const url = `${validation.parsedUrl}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.modelId,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(`Custom AI Endpoint Error (${res.status}): ${rawBody.slice(0, 200)}`);
    }

    let json: any;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new Error(
        `Custom AI endpoint returned HTML/invalid JSON (${res.status}). Verify your Base URL (e.g. check if /v1 is needed): ${rawBody.slice(0, 120)}`
      );
    }
    const rawText = json.choices?.[0]?.message?.content || "";
    const usage = json.usage || {};

    return {
      rawText,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
    };
  }
}

