import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 p-3 pb-24 sm:p-4 sm:pb-24 lg:p-6 lg:pb-6">
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-8 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-4 h-10 w-72 animate-pulse rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </Card>

      <Card className="h-72 animate-pulse bg-white" />
    </div>
  );
}
