import React from "react";

export const CohereLogo = ({ className }: { className?: string }) => (
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
      d="M128 85.333a42.667 42.667 0 00-42.667 42.667h21.334a21.333 21.333 0 1121.333-21.334v-21.333zm0 64a21.333 21.333 0 110-42.666 21.333 21.333 0 010 42.666z"
      fill="currentColor"
    />
  </svg>
);
