"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type"
> & {
  containerClassName?: string;
  inputClassName?: string;
  label?: string;
  labelClassName?: string;
};

export function PasswordInput({
  containerClassName,
  id,
  inputClassName = "w-full rounded-lg border border-slate-300 px-3 py-2",
  label,
  labelClassName = "text-sm font-medium text-slate-700",
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className={containerClassName}>
      {label ? (
        <label className={labelClassName} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={label ? "relative mt-1" : "relative"}>
        <input
          {...props}
          id={inputId}
          type={isPasswordVisible ? "text" : "password"}
          className={`${inputClassName} pr-11`}
        />
        <button
          type="button"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          aria-pressed={isPasswordVisible}
          onClick={() => setIsPasswordVisible((visible) => !visible)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
        >
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M2.25 12s3.5-6.25 9.75-6.25S21.75 12 21.75 12 18.25 18.25 12 18.25 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m3 3 18 18" />
      <path d="M10.7 5.86A10.34 10.34 0 0 1 12 5.75c6.25 0 9.75 6.25 9.75 6.25a17.72 17.72 0 0 1-3.37 3.92" />
      <path d="M14.12 14.12a2.75 2.75 0 0 1-3.89-3.89" />
      <path d="M6.66 6.66A17.99 17.99 0 0 0 2.25 12S5.75 18.25 12 18.25a10.44 10.44 0 0 0 4.01-.79" />
    </svg>
  );
}
