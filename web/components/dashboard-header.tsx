export function DashboardHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">{eyebrow}</p>}
        <h1 className="font-serif text-4xl tracking-[-0.035em] text-[#173b2b] sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d716b] sm:text-base">{description}</p>}
      </div>
      {action}
    </header>
  );
}
