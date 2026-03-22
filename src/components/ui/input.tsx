import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#323233] font-body">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full border-b border-[#b2b2b1]/30 bg-[#f0eded] px-3 py-2.5 text-sm text-[#323233] placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none transition-colors duration-300 disabled:bg-[#f6f3f2] disabled:text-[#9e9c9c] font-body",
            error && "border-[#9e422c] focus:border-[#9e422c]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-[#9e422c] font-body">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
