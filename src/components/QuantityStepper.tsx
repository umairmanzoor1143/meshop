"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={cn(
        "flex items-center justify-between border border-brand-ink/20 rounded-md h-11 w-28 px-3",
        className
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="−"
        className="text-brand-ink/50 hover:text-brand-ink transition-colors disabled:opacity-30"
      >
        <Minus width={14} />
      </button>
      <span className="text-sm font-light tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="+"
        className="text-brand-ink/50 hover:text-brand-ink transition-colors disabled:opacity-30"
      >
        <Plus width={14} />
      </button>
    </div>
  );
}
