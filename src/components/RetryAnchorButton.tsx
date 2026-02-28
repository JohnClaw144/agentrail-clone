"use client";

import { useFormStatus } from "react-dom";

interface Props {
  disabled?: boolean;
}

export function RetryAnchorButton({ disabled }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`w-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] border transition-colors cursor-pointer ${
        disabled || pending
          ? "border-border text-muted cursor-not-allowed"
          : "border-foreground text-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      {pending ? "Queuing..." : "Retry Anchor"}
    </button>
  );
}
