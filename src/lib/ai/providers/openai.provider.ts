import { BaseAIProvider, DiscoveredModel, ProviderConnectionTestResult } from "./types";

export class OpenAIProvider implements BaseAIProvider {
  private defaultBaseUrl = "https://api.openai.com/v1";

  async listModels(apiKey: string, baseUrl?: string | null): Promise<DiscoveredModel[]> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI Model Discovery Failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const list: Array<{ id: string }> = data.data || [];

    // Filter relevant chat / analysis models
    return list
      .filter((m) => m.id.includes("gpt") || m.id.includes("o1") || m.id.includes("o3"))
      .map((m) => ({
        id: m.id,
        name: m.id,
        description: `OpenAI Foundation Model (${m.id})`,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async testConnection(apiKey: string, baseUrl?: string | null): Promise<ProviderConnectionTestResult> {
    const start = Date.now();
    try {
      const models = await this.listModels(apiKey, baseUrl);
      return {
        success: true,
        latencyMs: Date.now() - start,
        modelsFound: models.length,
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
    const url = `${params.baseUrl || this.defaultBaseUrl}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.modelId || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${err}`);
    }

    const json = await res.json();
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

