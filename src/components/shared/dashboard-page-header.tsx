export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">Social money tracking</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}
