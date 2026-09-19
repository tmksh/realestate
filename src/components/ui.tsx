import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid, List, Radio } from "lucide-react";
import type { ViewMode } from "@/lib/view-mode";

type Tone = "neutral" | "warn" | "danger" | "info" | "success";

const toneClass: Record<Tone, string> = {
  neutral: "bg-canvas text-muted",
  warn: "bg-amber-50 text-amber-800",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-ink text-white",
  success: "bg-line-wash text-[#047857]",
};

export const tableHeadClass =
  "hidden h-11 items-center border-b border-hairline bg-canvas px-5 text-[12px] font-medium tracking-[0.02em] text-muted md:grid md:px-6";

export const tableRowClass =
  "block border-b border-hairline px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:items-center md:px-6";

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-white">
        <Radio className="h-3.5 w-3.5" />
      </div>
      {collapsed ? null : (
        <p className="font-display text-[15px] font-semibold tracking-[-0.04em] text-ink">AQUALINE</p>
      )}
    </div>
  );
}

export function Avatar({
  name,
  hue,
  className = "h-10 w-10 text-[12px]",
}: {
  name: string;
  hue?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{ background: hue == null ? "var(--ink)" : `hsl(${hue} 22% 38%)` }}
    >
      {name.slice(0, 1)}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] ${toneClass[tone]}`}
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
    primary: "bg-ink text-white hover:bg-ink-soft disabled:bg-[#d6d3d1] disabled:text-white",
    secondary:
      "bg-white text-ink border border-hairline hover:bg-canvas disabled:bg-canvas disabled:text-faint",
    ghost: "bg-transparent text-muted hover:bg-white hover:text-ink",
    danger: "bg-[#b42318] text-white hover:bg-[#912018] disabled:bg-canvas disabled:text-faint",
    line: "bg-line text-white hover:bg-line-edge disabled:opacity-55",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
      <span className="block text-[13px] font-medium text-muted">
        {label}
        {required ? <span className="ml-1 text-ink">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-[12px] leading-5 text-faint">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full min-h-11 rounded-[18px] border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink/30 focus:ring-4 focus:ring-[var(--ring)]";

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
    <div className={`rounded-[24px] border border-hairline bg-white shadow-[var(--shadow-card)] ${className}`}>
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
    <Card className="flex h-full min-h-[108px] min-w-0 flex-col justify-between px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[1.7rem] font-semibold leading-none tabular-nums tracking-[-0.05em] text-ink">
          {value}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center [&>svg]:h-9 [&>svg]:w-9">
          {icon}
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <p className="truncate text-[13px] font-medium leading-4 text-ink">{label}</p>
        <p className="mt-0.5 h-[14px] truncate text-[11px] leading-[14px] text-faint" title={hint}>
          {hint ?? "\u00a0"}
        </p>
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
    <div className={`rounded-[24px] border border-dashed border-hairline bg-white px-6 py-14 text-center ${className}`}>
      <p className="font-display text-lg font-semibold tracking-[-0.03em] text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-[1.65] text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
  descriptionClassName = "max-w-2xl",
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  descriptionClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker ? (
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted">{kicker}</p>
        ) : null}
        <h1 className="mt-1 font-display text-[1.75rem] font-bold leading-[1.12] tracking-[-0.04em] text-ink sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className={`mt-2 text-sm leading-[1.65] text-muted ${descriptionClassName}`}>{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,10,9,0.32)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-[24px] border border-hairline bg-white p-6 shadow-[var(--shadow-lift)]">
        <p id="confirm-title" className="font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </p>
        {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BackLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline bg-white px-3.5 text-[13px] font-medium text-ink shadow-[var(--shadow-card)] transition hover:bg-canvas"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string; count?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-canvas p-1">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition ${
              active ? "bg-white text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
            {option.count != null ? (
              <span className={active ? "text-ink" : "text-faint"}>{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  const options: Array<{ id: ViewMode; label: string; icon: typeof LayoutGrid }> = [
    { id: "card", label: "カード", icon: LayoutGrid },
    { id: "list", label: "一覧", icon: List },
  ];
  return (
    <div className="flex shrink-0 rounded-full bg-canvas p-1" role="group" aria-label="表示切替">
      {options.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition ${
              active ? "bg-white text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"
            }`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function MetaCount({ label, value }: { label: string; value: ReactNode }) {
  return (
    <p className="text-sm">
      <span className="text-muted">{label}</span>
      <span className="ml-2 font-display text-sm font-semibold tabular-nums text-ink">{value}</span>
    </p>
  );
}
