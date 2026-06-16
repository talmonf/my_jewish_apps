export function AudioPlaceholder() {
  return (
    <div className="flex items-center gap-2 opacity-40" title="שמע — בקרוב">
      <button
        type="button"
        disabled
        className="rounded border border-slate-300 px-2 py-1 text-xs"
        aria-label="נגן — בקרוב"
      >
        ▶
      </button>
      <button
        type="button"
        disabled
        className="rounded border border-slate-300 px-2 py-1 text-xs"
        aria-label="עצור — בקרוב"
      >
        ■
      </button>
    </div>
  );
}
