import type { ReactNode } from "react";

type IconProps = { className?: string };

const box = "h-9 w-9";

function Grads({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-hi`} x1="8%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="38%" stopColor="#E5E7EB" />
        <stop offset="100%" stopColor="#B8BEC6" />
      </linearGradient>
      <linearGradient id={`${id}-mid`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9AA1AB" />
        <stop offset="48%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#3A4048" />
      </linearGradient>
      <linearGradient id={`${id}-lo`} x1="10%" y1="0%" x2="100%" y2="110%">
        <stop offset="0%" stopColor="#3A4048" />
        <stop offset="100%" stopColor="#111111" />
      </linearGradient>
      <radialGradient id={`${id}-ball`} cx="30%" cy="24%" r="76%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="26%" stopColor="#D4D7DC" />
        <stop offset="64%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#16181C" />
      </radialGradient>
    </defs>
  );
}

function Frame({ id, className = box, children }: IconProps & { id: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <Grads id={id} />
      <ellipse cx="24" cy="44.2" rx="13.5" ry="2.5" fill="#111111" opacity="0.16" />
      {children}
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <Frame id="inbox" className={className}>
      <path d="M8 20.2 24 11l16 9.2-16 9.2Z" fill="url(#inbox-hi)" />
      <path d="M8 20.2v13.4L24 43V29.4Z" fill="url(#inbox-lo)" />
      <path d="M24 29.4V43l16-9.4V20.2Z" fill="url(#inbox-mid)" />
      <path d="M8 20.2 24 29.4l16-9.2" fill="none" stroke="#111111" strokeOpacity="0.2" strokeWidth="1" />
      <path d="M24 11 40 20.2" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.15" />
      <path d="M15.6 15.6 24 11.3l11.2 6.4-8.4 4.2Z" fill="url(#inbox-hi)" />
      <path d="M26.8 21.9 35.2 17.7v3.6l-8.4 4.2Z" fill="url(#inbox-mid)" />
    </Frame>
  );
}

export function BroadcastIcon({ className }: IconProps) {
  return (
    <Frame id="cast" className={className}>
      <path d="M19 16 37 8.6v6.2L23.2 20.6Z" fill="url(#cast-hi)" />
      <path d="M19 16v16.6l4.2 4.2V20.6Z" fill="url(#cast-lo)" />
      <path d="M23.2 20.6v16.2L37 32.2V14.8Z" fill="url(#cast-mid)" />
      <ellipse cx="16.4" cy="24.2" rx="7.8" ry="10" fill="url(#cast-lo)" />
      <ellipse cx="15.2" cy="23.4" rx="7" ry="9" fill="url(#cast-ball)" />
      <ellipse cx="14.6" cy="23.4" rx="3.3" ry="4.6" fill="url(#cast-lo)" />
      <ellipse cx="13.4" cy="21.4" rx="1.6" ry="1.1" fill="#FFFFFF" opacity="0.45" />
      <rect x="8.8" y="22.2" width="8.4" height="5.4" rx="1.7" fill="url(#cast-hi)" />
    </Frame>
  );
}

export function HeartIcon({ className }: IconProps) {
  const shape =
    "M24 36.4c-9-6.4-13.4-11.8-13.4-17.4C10.6 14.4 14 11 18.4 11c2.4 0 4.5 1.3 5.6 3.3C25.1 12.3 27.2 11 29.6 11c4.4 0 7.8 3.4 7.8 8 0 5.6-4.4 11-13.4 17.4Z";
  return (
    <Frame id="heart" className={className}>
      <path d={shape} fill="#111111" transform="translate(3.6 3.2)" />
      <path d={shape} fill="url(#heart-lo)" transform="translate(2.4 2.1)" />
      <path d={shape} fill="url(#heart-mid)" transform="translate(1.2 1.1)" />
      <path d={shape} fill="url(#heart-ball)" />
      <path d="M16.2 16.4c2-2.4 5.2-2.6 7.2-.2" fill="none" stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="round" />
    </Frame>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Frame id="users" className={className}>
      <ellipse cx="33.4" cy="15.8" rx="5.6" ry="5.3" fill="url(#users-lo)" />
      <path d="M25.8 37.2c1-6.2 4.2-9.4 8.2-9.4 4.2 0 7.4 3.2 8.2 9.4Z" fill="url(#users-lo)" />
      <ellipse cx="20" cy="14.2" rx="7.8" ry="7.4" fill="url(#users-ball)" />
      <ellipse cx="17.2" cy="11.8" rx="2.8" ry="1.7" fill="#FFFFFF" opacity="0.7" />
      <path d="M6.8 38.6c1.6-9.6 7.2-14.4 14.2-14.4s12.6 4.8 14.2 14.4Z" fill="url(#users-lo)" />
      <path d="M7.6 37.2c1.6-8.2 6.8-12.4 13.4-12.4s11.8 4.2 13.4 12.4Z" fill="url(#users-mid)" />
      <path d="M9 35.2c1.6-5.8 5.8-8.8 12-8.8 4.4 0 8 1.6 10.2 4.8-2.2 3.8-6.4 5.8-12 5.8-4.4 0-8-.8-10.2-1.8Z" fill="url(#users-hi)" opacity="0.42" />
    </Frame>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <Frame id="key" className={className}>
      <ellipse cx="19.2" cy="18.2" rx="9.2" ry="9.2" fill="url(#key-lo)" />
      <ellipse cx="16.8" cy="15.8" rx="8.8" ry="8.8" fill="url(#key-ball)" />
      <ellipse cx="16.8" cy="15.8" rx="3.6" ry="3.6" fill="url(#key-hi)" />
      <ellipse cx="16.8" cy="15.8" rx="1.8" ry="1.8" fill="url(#key-lo)" />
      <path d="M24 21.4 40 36.6l-4.4 4-3.6-3.4-2.8 2.6-3.6-3.5 2.8-2.5Z" fill="url(#key-lo)" />
      <path d="M22.4 19.6 38 34.4l-3.6 3.2-3.6-3.4-2.8 2.5-3-2.9 2.8-2.4Z" fill="url(#key-mid)" />
      <path d="M22.4 19.6 38 34.4l-1.8 1.2-14.4-13.6Z" fill="url(#key-hi)" opacity="0.55" />
    </Frame>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <Frame id="file" className={className}>
      <path d="M16.8 13.8h12.6l9 9v18.2H16.8Z" fill="url(#file-lo)" transform="translate(3 2.4)" />
      <path d="M13.6 10.6h12.6l9 9v18.2H13.6Z" fill="url(#file-mid)" />
      <path d="M26.2 10.6v9h9Z" fill="url(#file-hi)" />
      <path d="M26.2 10.6 35.2 19.6" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" />
      <path d="M18 24.8h11.6M18 29.8h8.4" stroke="#F9FAFB" strokeWidth="2.2" strokeLinecap="round" />
    </Frame>
  );
}
