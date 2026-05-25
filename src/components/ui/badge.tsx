import { cn } from "@/lib/utils";

const variants = {
  pending: "bg-emerald-50 text-primary",
  partial: "bg-teal-50 text-accent",
  paid: "bg-emerald-50 text-success",
  overdue: "bg-rose-50 text-danger",
  neutral: "bg-stone-100 text-muted",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
