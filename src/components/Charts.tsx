import type { Reaction, ReactionType } from "@/lib/types";

const typeMeta: Record<ReactionType, { label: string; color: string }> = {
  like: { label: "いいね", color: "#0c0a09" },
  stamp: { label: "スタンプ", color: "#78716c" },
  text: { label: "テキスト", color: "#d6d3d1" },
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

export function ReactionBarChart({ reactions }: { reactions: Reaction[] }) {
  const days = lastDays(7);
  const counts = days.map(
    (day) => reactions.filter((item) => dayKey(new Date(item.createdAt)) === dayKey(day)).length,
  );
  const max = Math.max(1, ...counts);
  const width = 640;
  const height = 220;
  const padL = 32;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const gap = 18;
  const barW = (innerW - gap * (counts.length - 1)) / counts.length;
  const ticks = [0, Math.ceil(max / 2), max];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" aria-hidden>
        {ticks.map((tick) => {
          const y = padT + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#e8e6e3" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#78716c">
                {tick}
              </text>
            </g>
          );
        })}
        {counts.map((value, index) => {
          const barH = (value / max) * innerH;
          const x = padL + index * (barW + gap);
          const y = padT + innerH - barH;
          return (
            <rect
              key={days[index].toISOString()}
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, value > 0 ? 6 : 0)}
              rx={8}
              fill="#0c0a09"
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between px-8 text-[12px] text-muted">
        {days.map((day) => (
          <span key={day.toISOString()} className="w-10 text-center">
            {day.getMonth() + 1}/{day.getDate()}
          </span>
        ))}
      </div>
    </div>
  );
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
            <stop offset="0%" stopColor="#0c0a09" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0c0a09" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={points.join(" ")} fill="none" stroke="#0c0a09" strokeWidth="2.4" strokeLinejoin="round" />
        {counts.map((value, index) => (
          <circle
            key={days[index].toISOString()}
            cx={padX + index * step}
            cy={height - padBottom - (value / max) * (height - padTop - padBottom)}
            r="3.2"
            fill="#fff"
            stroke="#0c0a09"
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
  const rawTotal = counts.reduce((sum, item) => sum + item.value, 0);
  const total = rawTotal || 1;
  const top = counts.reduce((best, item) => (item.value > best.value ? item : best), counts[0]);
  const percent = rawTotal === 0 ? 0 : Math.round((top.value / total) * 100);
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[118px] w-[118px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e8e6e3" strokeWidth="12" />
          {counts.map((item) => {
            const length = (item.value / total) * circ;
            const dash = `${length} ${circ - length}`;
            const current = offset;
            offset += length;
            return (
              <circle
                key={item.type}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={typeMeta[item.type].color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-current}
                transform="rotate(-90 50 50)"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-[22px] font-semibold leading-none text-ink">{percent}%</p>
          <p className="mt-1 text-[10px] text-muted">{typeMeta[top.type].label}</p>
        </div>
      </div>
      <ul className="space-y-2 text-[13px]">
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
