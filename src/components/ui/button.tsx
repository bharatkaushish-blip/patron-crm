import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#735a3a] to-[#664e30] text-[#fff6f0] hover:from-[#664e30] hover:to-[#513b1e] active:from-[#513b1e] active:to-[#513b1e]",
  secondary:
    "bg-transparent text-[#735a3a] border border-[#b2b2b1]/20 hover:bg-[#735a3a]/5 active:bg-[#735a3a]/10",
  ghost:
    "bg-transparent text-[#5f5f5f] hover:bg-[#f0eded] active:bg-[#e4e2e1]",
  danger:
    "bg-[#9e422c] text-white hover:bg-[#5c1202] active:bg-[#5c1202]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#735a3a]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-body",
          variants[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
