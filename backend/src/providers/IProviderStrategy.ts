import { Prisma } from "@prisma/client";

export interface IProviderStrategy {
  validate(apiKey: string): Promise<{
    isValid: boolean;
    metadata: any;
    validationMessage?: string;
  }>;
}
