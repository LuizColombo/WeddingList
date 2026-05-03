"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(
              "h-11 w-full rounded-xl border border-border bg-card pl-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-accent focus:ring-2 focus:ring-accent/20",
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-foreground/50 transition-colors hover:text-foreground"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
