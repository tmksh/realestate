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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${toneClass[tone]}`}
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
      "bg-aqua-500 text-white shadow-sm shadow-aqua-500/20 hover:bg-aqua-600 disabled:bg-aqua-300",
    secondary:
      "bg-white text-ink border border-slate-200 hover:border-aqua-300 hover:bg-aqua-50",
    ghost: "bg-transparent text-muted hover:bg-white hover:text-ink",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    line: "bg-line text-white hover:brightness-95",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-28 resize-y`} {...props} />;
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
    <div className={`rounded-2xl border border-white/80 bg-white shadow-[0_10px_40px_rgba(16,35,45,0.05)] ${className}`}>
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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600">
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
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
