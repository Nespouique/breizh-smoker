import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  suffix?: string;
  error?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  compact?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(({
  label,
  suffix,
  className,
  error,
  value,
  onChange,
  minValue,
  maxValue,
  step = 1,
  compact = false,
  ...props
}, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const combinedRef = ref || inputRef;

  const handleIncrement = () => {
    const currentValue = value || 0;
    const newValue = maxValue !== undefined ? Math.min(currentValue + step, maxValue) : currentValue + step;
    onChange?.(newValue);
  };

  const handleDecrement = () => {
    const currentValue = value || 0;
    const newValue = minValue !== undefined ? Math.max(currentValue - step, minValue) : currentValue - step;
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? 0 : Number(e.target.value);
    onChange?.(newValue);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive"
        )}>
          {label}{error && " *"}
        </label>
      )}
      <div className={cn(
        "relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border bg-background text-xs shadow-sm shadow-black/5 ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-offset-2",
        error ? "border-destructive focus-within:ring-destructive" : "border-input focus-within:ring-ring"
      )}>
        <input
          ref={combinedRef as React.Ref<HTMLInputElement>}
          type="number"
          value={value ?? ''}
          onChange={handleInputChange}
          min={minValue}
          max={maxValue}
          step={step}
          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-xs text-foreground tabular-nums placeholder:text-muted-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          {...props}
        />
        {suffix && (
          <span className="text-muted-foreground text-sm pr-2 shrink-0">{suffix}</span>
        )}
        <div className={cn("flex h-full flex-col shrink-0 border-l border-input", compact && "hidden sm:flex")}>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleIncrement}
            className="flex h-1/2 w-7 items-center justify-center bg-background text-muted-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleDecrement}
            className="flex h-1/2 w-7 items-center justify-center border-t border-input bg-background text-muted-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});

NumberInput.displayName = "NumberInput";
