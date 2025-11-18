"use client";

import { useEffect, useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { setRequestFavorite } from "@/app/(authenticated)/requests/actions";

interface FavoriteToggleButtonProps {
  requestId: string;
  initialIsFavorite: boolean;
  variant?: "ghost" | "solid";
}

export function FavoriteToggleButton({ requestId, initialIsFavorite, variant = "ghost" }: FavoriteToggleButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  function handleToggle() {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);

    startTransition(async () => {
      try {
        await setRequestFavorite(requestId, nextValue);
      } catch (error) {
        console.error("Failed to toggle favorite", error);
        setIsFavorite(!nextValue);
        alert("Could not update favorites. Please try again.");
      }
    });
  }

  const baseClasses =
    "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";
  const variantClasses =
    variant === "solid"
      ? "border-brand-500 bg-brand-500 text-white hover:bg-brand-400"
      : "border-slate-700 text-slate-200 hover:border-brand-400 hover:text-brand-200";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`${baseClasses} ${variantClasses}`}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
      )}
      <span>{isFavorite ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
