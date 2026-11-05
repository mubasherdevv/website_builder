import { BaseAIProvider, DiscoveredModel, ProviderConnectionTestResult } from "./types";

export class GeminiProvider implements BaseAIProvider {
  private defaultBaseUrl = "https://generativelanguage.googleapis.com/v1beta";

  async listModels(apiKey: string): Promise<DiscoveredModel[]> {
    const url = `${this.defaultBaseUrl}/models?key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini Model Discovery Failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const list: any[] = data.models || [];

    return list
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => {
        const cleanId = m.name?.replace("models/", "") || m.name;
        return {
          id: cleanId,
          name: m.displayName || cleanId,
          description: m.description || `Supported: generateContent`,
        };
      });
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
    const cleanModel = params.modelId?.replace("models/", "") || "gemini-1.5-flash";
    const url = `${this.defaultBaseUrl}/models/${cleanModel}:generateContent?key=${params.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: params.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${err}`);
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const meta = json.usageMetadata || {};

    return {
      rawText,
      promptTokens: meta.promptTokenCount || 0,
      completionTokens: meta.candidatesTokenCount || 0,
      totalTokens: meta.totalTokenCount || 0,
    };
  }
}

