import type { Reaction, ReactionType } from "@/lib/types";

const typeMeta: Record<ReactionType, { label: string; color: string }> = {
  like: { label: "いいね", color: "#1F6B66" },
  stamp: { label: "スタンプ", color: "#C4A574" },
  text: { label: "テキスト", color: "#3F4A46" },
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function lastDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

export function ReactionTrendChart({ reactions }: { reactions: Reaction[] }) {
  const days = lastDays(7);
  const counts = days.map(
    (day) => reactions.filter((item) => dayKey(new Date(item.createdAt)) === dayKey(day)).length,
  );
  const max = Math.max(1, ...counts);
  const width = 280;
  const height = 88;
  const padX = 8;
  const padTop = 8;
  const padBottom = 14;
  const step = (width - padX * 2) / Math.max(1, counts.length - 1);
  const points = counts.map((value, index) => {
    const x = padX + index * step;
    const y = height - padBottom - (value / max) * (height - padTop - padBottom);
    return `${x},${y}`;
  });
  const area = `${padX},${height} ${points.join(" ")} ${width - padX},${height}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" aria-hidden>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F6B66" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1F6B66" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={points.join(" ")} fill="none" stroke="#1F6B66" strokeWidth="2.4" strokeLinejoin="round" />
        {counts.map((value, index) => (
          <circle
            key={days[index].toISOString()}
            cx={padX + index * step}
            cy={height - padBottom - (value / max) * (height - padTop - padBottom)}
            r="3.2"
            fill="#fff"
            stroke="#1F6B66"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        {days.map((day) => (
          <span key={day.toISOString()}>{day.getMonth() + 1}/{day.getDate()}</span>
        ))}
      </div>
    </div>
  );
}

export function ReactionBreakdownChart({ reactions }: { reactions: Reaction[] }) {
  const counts = (["like", "stamp", "text"] as const).map((type) => ({
    type,
    value: reactions.filter((item) => item.type === type).length,
  }));
  const total = counts.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0" aria-hidden>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E4E0D8" strokeWidth="10" />
        {counts.map((item) => {
          const length = (item.value / total) * circ;
          const dash = `${length} ${circ - length}`;
          const current = offset;
          offset += length;
          return (
            <circle
              key={item.type}
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={typeMeta[item.type].color}
              strokeWidth="10"
              strokeDasharray={dash}
              strokeDashoffset={-current}
              transform="rotate(-90 40 40)"
            />
          );
        })}
      </svg>
      <ul className="space-y-1.5 text-[13px]">
        {counts.map((item) => (
          <li key={item.type} className="flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: typeMeta[item.type].color }} />
            {typeMeta[item.type].label}
            <span className="font-display font-semibold text-ink">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
