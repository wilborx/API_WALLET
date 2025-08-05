import { CohereClient } from "cohere-ai";
import { IProviderStrategy } from "./IProviderStrategy";

export class CohereStrategy implements IProviderStrategy {
  async validate(apiKey: string): Promise<{
    isValid: boolean;
    metadata: any;
    validationMessage?: string;
  }> {
    try {
      const cohere = new CohereClient({
        token: apiKey,
      });

      // The checkApiKey method is the designated way to validate a key.
      const { valid } = await cohere.checkApiKey();

      if (valid) {
        return {
          isValid: true,
          metadata: {},
          validationMessage: "API key is valid.",
        };
      } else {
        return {
          isValid: false,
          metadata: {},
          validationMessage: "API key is invalid.",
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        metadata: {},
        validationMessage: `API key is invalid. ${error.message}`,
      };
    }
  }
}
