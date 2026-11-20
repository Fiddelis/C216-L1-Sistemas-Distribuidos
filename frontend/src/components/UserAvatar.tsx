import { cn } from "@/lib/utils";

export function UserAvatar({ className }: { className?: string }) {
  return (
    <img
      src="/user-avatar.svg"
      alt=""
      className={cn("h-9 w-9 shrink-0 rounded-full", className)}
    />
  );
}
