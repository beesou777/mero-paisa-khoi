import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-8 text-center">
      <Inbox className="mx-auto h-10 w-10 text-accent" />
      <h3 className="mt-3 font-heading text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}
