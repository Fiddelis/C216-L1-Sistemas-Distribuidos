import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("h-7 overflow-hidden", className)}>
      <img
        src="/inatel-logo.png"
        alt="Inatel"
        className="h-[194%] w-auto max-w-none -translate-y-[21.9%]"
      />
    </div>
  );
}
