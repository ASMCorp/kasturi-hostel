"use client";

import { useFormStatus } from "react-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Variant = "primary" | "secondary" | "text" | "danger" | "dark" | "none";
type Size = "sm" | "md" | "lg" | "none";

type SubmitButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  text: "btn-text",
  danger: "btn-danger",
  dark: "btn-dark",
  none: "",
};

const sizeClasses: Record<Size, string> = {
  sm: "sm:min-h-9 sm:px-3 sm:py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
  none: "",
};

export default function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      aria-busy={pending}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {pending && <LoadingSpinner label={pendingLabel} />}
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </button>
  );
}
