import { IProviderStrategy } from "./IProviderStrategy";
import { OpenAIStrategy } from "./OpenAIStrategy";
import { AnthropicStrategy } from "./AnthropicStrategy";
import { GoogleStrategy } from "./GoogleStrategy";
import { CohereStrategy } from "./CohereStrategy";

const strategies: { [key: string]: IProviderStrategy } = {
  openai: new OpenAIStrategy(),
  anthropic: new AnthropicStrategy(),
  google: new GoogleStrategy(),
  cohere: new CohereStrategy(),
  // Future providers can be added here
  // stripe: new StripeStrategy(),
};

export function getProviderStrategy(
  provider: string
): IProviderStrategy | null {
  const strategy = strategies[provider.toLowerCase()];
  return strategy || null;
}
