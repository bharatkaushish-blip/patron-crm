import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[#323233] font-body">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "block w-full border-b border-[#b2b2b1]/30 bg-[#f0eded] px-3 py-2.5 text-sm text-[#323233] placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none transition-colors duration-300 disabled:bg-[#f6f3f2] disabled:text-[#9e9c9c] resize-none font-body",
            error && "border-[#9e422c] focus:border-[#9e422c]",
            className
          )}
          {...props}
        />
        {error ? <p className="text-sm text-[#9e422c] font-body">{error}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
