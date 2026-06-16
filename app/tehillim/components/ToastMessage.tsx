"use client";

import { useEffect, useState } from "react";

type ToastMessageProps = {
  message: string | null;
};

export function ToastMessage({ message }: ToastMessageProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto w-full max-w-md px-4">
      <p className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
        {message}
      </p>
    </div>
  );
}
