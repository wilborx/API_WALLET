"use client";

import { KeyRound } from "lucide-react";
import { AddKeyModal } from "./add-key-modal";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-border h-full">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <KeyRound className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No API Keys Yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        It looks like you haven't added any API keys. Get started by adding your first one.
      </p>
      <AddKeyModal />
    </div>
  );
}
