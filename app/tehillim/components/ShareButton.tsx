"use client";

type ShareButtonProps = {
  title: string;
  text: string;
};

export function ShareButton({ title, text }: ShareButtonProps) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    alert("הקישור הועתק");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white"
      aria-label="שתף"
    >
      שתף
    </button>
  );
}
