import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--cf-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--inatel)]",
        className,
      )}
      {...props}
    />
  );
}
