import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  accent: "btn-accent",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger: "btn bg-red-600 text-white hover:bg-red-700",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className, ...rest }, ref
) {
  return <button ref={ref} className={cn(variants[variant], className)} {...rest} />;
});
