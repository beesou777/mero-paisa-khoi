import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
