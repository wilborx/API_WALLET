import { GoogleGenerativeAI } from "@google/generative-ai";
import { IProviderStrategy } from "./IProviderStrategy";

export class GoogleStrategy implements IProviderStrategy {
  async validate(apiKey: string): Promise<{
    isValid: boolean;
    metadata: any;
    validationMessage?: string;
  }> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // This is a lightweight call to a free model to validate the key.
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // The countTokens method is a good, low-cost way to validate the API key
      // as it doesn't consume generation resources.
      await model.countTokens("test");

      return {
        isValid: true,
        metadata: {
          // Potentially fetch model details or other metadata here
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
