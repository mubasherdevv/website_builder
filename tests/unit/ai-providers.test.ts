import { describe, it, expect } from "vitest";
import { encryptCredential, decryptCredential, maskApiKey } from "@/lib/security/encryption";
import { validateCustomAiBaseUrl, isPrivateOrLocalAddress } from "@/lib/security/ssrf-guard";
import { getProviderInstance } from "@/lib/ai/providers";

describe("Phase 29: AI Provider Management & Security", () => {
  describe("1. AES-256-GCM Credential Encryption & Decryption", () => {
    it("successfully encrypts and decrypts API credentials without loss", () => {
      const apiKey = "sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz";
      const encrypted = encryptCredential(apiKey);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toEqual(apiKey);
      expect(encrypted.length).toBeGreaterThan(32);

      const decrypted = decryptCredential(encrypted);
      expect(decrypted).toEqual(apiKey);
    });

    it("rejects tampered or corrupted encrypted payloads", () => {
      const apiKey = "sk-proj-test1234567890abcdef";
      const encrypted = encryptCredential(apiKey);

      // Corrupt the base64 payload
      const tampered = encrypted.slice(0, -4) + "AAAA";
      expect(() => decryptCredential(tampered)).toThrow();
    });

    it("masks API keys safely without leaking inner secret", () => {
      expect(maskApiKey("sk-proj-1234567890abcdef")).toEqual("sk-proj••••••••cdef");
      expect(maskApiKey("AIzaSyB1234567890abcdef")).toEqual("AIzaSy••••••••cdef");
      expect(maskApiKey("short")).toEqual("••••••••");
    });
  });

  describe("2. SSRF Protection on Custom OpenAI-Compatible Base URLs", () => {
    it("blocks localhost, loopbacks, and local domain suffixes", () => {
      expect(isPrivateOrLocalAddress("localhost")).toBe(true);
      expect(isPrivateOrLocalAddress("127.0.0.1")).toBe(true);
      expect(isPrivateOrLocalAddress("::1")).toBe(true);
      expect(isPrivateOrLocalAddress("0.0.0.0")).toBe(true);
      expect(isPrivateOrLocalAddress("app.localhost")).toBe(true);
      expect(isPrivateOrLocalAddress("service.internal")).toBe(true);
    });

    it("blocks cloud metadata service IP (169.254.169.254)", () => {
      expect(isPrivateOrLocalAddress("169.254.169.254")).toBe(true);
      expect(isPrivateOrLocalAddress("169.254.1.1")).toBe(true);
    });

    it("blocks private IPv4 CIDRs (10.x, 172.16-31.x, 192.168.x)", () => {
      expect(isPrivateOrLocalAddress("10.0.0.1")).toBe(true);
      expect(isPrivateOrLocalAddress("172.16.0.5")).toBe(true);
      expect(isPrivateOrLocalAddress("172.31.255.255")).toBe(true);
      expect(isPrivateOrLocalAddress("192.168.1.1")).toBe(true);
      expect(isPrivateOrLocalAddress("192.168.0.100")).toBe(true);
    });

    it("validates legitimate public AI endpoints", () => {
      const res1 = validateCustomAiBaseUrl("https://api.together.xyz/v1");
      expect(res1.valid).toBe(true);
      expect(res1.parsedUrl).toBe("https://api.together.xyz/v1");

      const res2 = validateCustomAiBaseUrl("https://api.groq.com/openai/v1/");
      expect(res2.valid).toBe(true);
      expect(res2.parsedUrl).toBe("https://api.groq.com/openai/v1");
    });

    it("rejects malicious or private custom URLs", () => {
      const res = validateCustomAiBaseUrl("http://169.254.169.254/latest/meta-data");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Security restriction");
    });
  });

  describe("3. Provider Instance Factory", () => {
    it("returns correct provider instance by type", () => {
      expect(getProviderInstance("openai")).toBeDefined();
      expect(getProviderInstance("openrouter")).toBeDefined();
      expect(getProviderInstance("gemini")).toBeDefined();
      expect(getProviderInstance("custom")).toBeDefined();
      expect(() => getProviderInstance("unknown")).toThrow();
    });
  });
});

