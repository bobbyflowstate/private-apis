"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { duplicateRequest } from "@/app/(authenticated)/requests/[id]/actions";

interface DuplicateButtonProps {
  requestId: string;
}

export function DuplicateButton({ requestId }: DuplicateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDuplicate() {
    if (!confirm("Duplicate this request? You'll be taken to the edit page for the copy.")) {
      return;
    }

    setIsLoading(true);
    try {
      await duplicateRequest(requestId);
      // Navigation happens via redirect in the server action
    } catch (error) {
      console.error("Failed to duplicate request:", error);
      alert("Failed to duplicate request. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isLoading}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Duplicating...
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </>
      )}
    </button>
  );
}




