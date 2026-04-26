import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";

export type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

/**
 * Checks if a username is available in real-time with debouncing.
 */
export function useUsernameCheck(
  value: string,
  currentName: string | null,
): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const debounced = useDebounce(value, 500);

  useEffect(() => {
    const trimmed = debounced.trim();
    if (!trimmed || trimmed === (currentName ?? "")) {
      setStatus("idle");
      return;
    }
    if (trimmed.length < 2) {
      setStatus("invalid");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmed)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setStatus(error ? "idle" : data ? "taken" : "available");
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, currentName]);

  return status;
}

export function UsernameStatusBadge({ status }: { status: UsernameStatus }) {
  if (status === "idle") return null;
  const map: Record<
    UsernameStatus,
    { icon: React.ReactNode; text: string; cls: string }
  > = {
    idle: { icon: null, text: "", cls: "" },
    checking: {
      icon: <Loader2 size={12} className="animate-spin" />,
      text: "Verificando…",
      cls: "text-text-muted",
    },
    available: {
      icon: <Check size={12} />,
      text: "Disponible",
      cls: "text-status-win",
    },
    taken: {
      icon: <X size={12} />,
      text: "Ya en uso",
      cls: "text-status-negative",
    },
    invalid: {
      icon: <X size={12} />,
      text: "Solo letras, números y guión bajo",
      cls: "text-status-negative",
    },
  };
  const { icon, text, cls } = map[status];
  return (
    <span className={`flex items-center gap-1 type-caption ${cls}`}>
      {icon}
      {text}
    </span>
  );
}
