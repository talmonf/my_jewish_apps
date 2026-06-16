import Link from "next/link";

type TehillimHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
};

export function TehillimHeader({
  title,
  backHref = "/tehillim",
  backLabel = "אחורה",
}: TehillimHeaderProps) {
  return (
    <header className="tehillim-header sticky top-0 z-20 px-4 py-3 shadow-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link href={backHref} className="flex items-center gap-1 text-sm font-medium text-white">
          <span aria-hidden>←</span>
          <span>{backLabel}</span>
        </Link>
        <h1 className="text-center text-lg font-semibold">{title}</h1>
        <div className="w-16" />
      </div>
    </header>
  );
}
