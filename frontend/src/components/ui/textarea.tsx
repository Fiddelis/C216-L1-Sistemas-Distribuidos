import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full border border-[var(--cf-border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--inatel)]",
        className,
      )}
      {...props}
    />
  );
}
