import React from "react";

import { OpenAILogo } from "@/components/logos/openai";
import { AnthropicLogo } from "@/components/logos/anthropic";
import { GoogleLogo } from "@/components/logos/google";
import { CohereLogo } from "@/components/logos/cohere";

export interface Provider {
  id: string;
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  href?: string;
}

import { PlaceholderLogo } from "@/components/logos/placeholder";

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: OpenAILogo,
    href: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: AnthropicLogo,
    href: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    name: "Google AI",
    logo: GoogleLogo,
    href: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "cohere",
    name: "Cohere",
    logo: CohereLogo,
    href: "https://dashboard.cohere.com/api-keys",
  },
  // {
  //   id: "stripe",
  //   name: "Stripe",
  //   logo: PlaceholderLogo, // Replace with StripeLogo
  //   href: "https://dashboard.stripe.com/apikeys",
  // },
  {
    id: "other",
    name: "Other",
    logo: PlaceholderLogo,
  },
];
