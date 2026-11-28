import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
};

export function FilterSelect({ label, value, options, onValueChange }: Props) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="flex h-full min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-6 py-2 text-left outline-none data-[state=open]:bg-zinc-50 sm:px-8">
        <span className="min-w-0">
          <span className="block text-[11px] tracking-[0.14em] text-zinc-400 uppercase">
            {label}
          </span>
          <SelectPrimitive.Value className="block truncate text-sm text-zinc-950" />
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={0}
          className="z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden border border-[var(--cf-border)] bg-white"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm outline-none data-[highlighted]:bg-zinc-50"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="h-3.5 w-3.5" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
