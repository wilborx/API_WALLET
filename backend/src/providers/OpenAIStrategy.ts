import OpenAI from "openai";
import { IProviderStrategy } from "./IProviderStrategy";

export class OpenAIStrategy implements IProviderStrategy {
  async validate(apiKey: string) {
    const openai = new OpenAI({ apiKey });
    try {
      // Use a very cheap and fast model to validate the key
      const models = await openai.models.list();
      const modelAccess = models.data.map((m) => m.id);

      // Generate a welcome message
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for an app called API-Wallet.",
          },
          {
            role: "user",
            content:
              "Write a short, witty, one-sentence welcome message for a user who just added their OpenAI key.",
          },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 30,
      });

      const validationMessage =
        completion.choices[0]?.message?.content?.trim() ||
        "Welcome to the future of API management!";

      return {
        isValid: true,
        metadata: { model_access: modelAccess },
        validationMessage,
      };
    } catch (error) {
      return {
        isValid: false,
        metadata: { error: (error as Error).message },
        validationMessage: "Invalid API Key.",
      };
    }
  }
}
