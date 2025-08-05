import React from "react";

export const AnthropicLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <path
      d="M128 0C57.307 0 0 57.307 0 128s57.307 128 128 128 128-57.307 128-128S198.693 0 128 0zm0 234.667C68.224 234.667 21.333 187.776 21.333 128S68.224 21.333 128 21.333 234.667 68.224 234.667 128 187.776 234.667 128 234.667z"
      fill="currentColor"
    />
    <path
      d="M160 85.333h-21.333V128h21.333a21.333 21.333 0 100-42.667zm0 21.334h-21.333v-21.334h21.333a0 0 0 000 21.334zM96 170.667h21.333V128H96a21.333 21.333 0 100 42.667zm0-21.334h21.333v21.334H96a0 0 0 000-21.334z"
      fill="currentColor"
    />
  </svg>
);
