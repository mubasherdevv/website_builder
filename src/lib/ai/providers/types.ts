export interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  pricing?: {
    promptPer1k?: number;
    completionPer1k?: number;
  };
}

export interface ProviderConnectionTestResult {
  success: boolean;
  latencyMs: number;
  modelsFound?: number;
  error?: string;
}

export interface BaseAIProvider {
  listModels(apiKey: string, baseUrl?: string | null): Promise<DiscoveredModel[]>;
  testConnection(apiKey: string, baseUrl?: string | null, modelId?: string): Promise<ProviderConnectionTestResult>;
  completeJsonPrompt(params: {
    apiKey: string;
    modelId: string;
    systemPrompt: string;
    userPrompt: string;
    baseUrl?: string | null;
  }): Promise<{
    rawText: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }>;
}

