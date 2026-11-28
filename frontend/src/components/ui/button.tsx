import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive";
};

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center px-4 text-sm font-medium transition duration-200 disabled:cursor-default disabled:opacity-50",
        variant === "default" && "bg-zinc-950 text-white hover:bg-zinc-800",
        variant === "outline" &&
          "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
        variant === "destructive" &&
          "border border-red-200 bg-white text-red-700 hover:bg-red-50",
        className,
      )}
      {...props}
    />
  );
}
