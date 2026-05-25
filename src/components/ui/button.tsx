import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm hover:bg-emerald-700",
        secondary:
          "bg-white text-foreground shadow-sm ring-1 ring-border hover:bg-slate-50 hover:ring-primary/25",
        amber:
          "bg-accent text-white shadow-sm hover:bg-teal-800",
        ghost: "text-foreground hover:bg-white/60",
        danger: "bg-danger text-white shadow-sm hover:bg-rose-700",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-13 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        "font-bold disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
