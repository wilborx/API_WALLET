import Anthropic from "@anthropic-ai/sdk";
import { IProviderStrategy } from "./IProviderStrategy";

export class AnthropicStrategy implements IProviderStrategy {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async validate(apiKey: string): Promise<{
    isValid: boolean;
    metadata: any;
    validationMessage?: string;
  }> {
    try {
      // Use the provided API key for this validation call
      const tempClient = new Anthropic({ apiKey });

      // A simple, low-cost call to check if the key is valid
      // This is a placeholder. Replace with an actual lightweight API call.
      // For example, listing models if available and cheap.
      // As of now, Anthropic SDK doesn't have a simple "list models" or "validate key" endpoint.
      // We'll simulate a simple message call.
      await tempClient.messages.create({
        model: "claude-3-haiku-20240307", // A low-cost, fast model
        max_tokens: 1,
        messages: [{ role: "user", content: "." }],
      });

      return {
        isValid: true,
        metadata: {
          // You can fetch and return more metadata if needed
        },
        validationMessage: "API key is valid.",
      };
    } catch (error: any) {
      return {
        isValid: false,
        metadata: {},
        validationMessage: `API key is invalid. ${error.message}`,
      };
    }
  }
}
