import { BaseAIProvider, DiscoveredModel, ProviderConnectionTestResult } from "./types";

export class OpenRouterProvider implements BaseAIProvider {
  private defaultBaseUrl = "https://openrouter.ai/api/v1";

  async listModels(apiKey: string): Promise<DiscoveredModel[]> {
    const url = `${this.defaultBaseUrl}/models`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://securesite.studio",
        "X-Title": "SecureSite Studio",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter Model Discovery Failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const list: Array<{
      id: string;
      name?: string;
      description?: string;
      context_length?: number;
      pricing?: { prompt?: string | number; completion?: string | number };
    }> = data.data || [];

    return list.slice(0, 150).map((m) => ({
      id: m.id,
      name: m.name || m.id,
      description: m.description || `Context: ${m.context_length || "N/A"} tokens`,
      contextLength: m.context_length,
      pricing: {
        promptPer1k: Number(m.pricing?.prompt) * 1000 || 0,
        completionPer1k: Number(m.pricing?.completion) * 1000 || 0,
      },
    }));
  }

  async testConnection(apiKey: string): Promise<ProviderConnectionTestResult> {
    const start = Date.now();
    try {
      const models = await this.listModels(apiKey);
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
  }) {
    const url = `${this.defaultBaseUrl}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://securesite.studio",
        "X-Title": "SecureSite Studio",
      },
      body: JSON.stringify({
        model: params.modelId || "openai/gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(`OpenRouter API Error (${res.status}): ${rawBody.slice(0, 200)}`);
    }

    let json: any;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new Error(`OpenRouter returned non-JSON response (${res.status}): ${rawBody.slice(0, 120)}`);
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

