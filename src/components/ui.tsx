import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type Tone = "neutral" | "warn" | "danger" | "info" | "success";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-aqua-100 text-aqua-700",
  success: "bg-emerald-50 text-emerald-700",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "line";
}) {
  const variants = {
    primary:
      "bg-aqua-500 text-white hover:bg-aqua-600 disabled:bg-aqua-400 disabled:text-white",
    secondary:
      "bg-white text-ink border border-slate-200 hover:border-aqua-300 hover:bg-aqua-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-slate-50",
    ghost: "bg-transparent text-muted hover:bg-white hover:text-ink",
    danger:
      "bg-rose-700 text-white hover:bg-rose-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200",
    line: "bg-line text-white hover:brightness-95 disabled:opacity-55 disabled:hover:brightness-100",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="ml-1 text-aqua-700">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-[13px] leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-[#94A3B8] focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-28 resize-y ${className}`} {...props} />;
}

export function Select({
  children,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[10px] border border-slate-200 bg-white shadow-none ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium leading-none text-slate-500">{label}</p>
          <p className="mt-2 font-display text-[1.75rem] font-bold tabular-nums tracking-tight text-ink">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-[13px] leading-[1.5] text-muted">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aqua-50 text-aqua-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center ${className}`}
    >
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-[1.6] text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
