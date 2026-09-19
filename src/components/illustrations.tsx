type IllustrationProps = {
  className?: string;
};

const frame = "h-11 w-11 shrink-0";

function Frame({
  className = frame,
  fill,
  children,
}: IllustrationProps & { fill: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="16" fill={fill} />
      {children}
    </svg>
  );
}

export function InboxIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#E8F0EE">
      <rect x="9" y="16" width="30" height="20" rx="5" fill="#1F6B66" />
      <path d="M11 18.5 24 27.5 37 18.5" stroke="#E8F0EE" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="17" y="11" width="14" height="10" rx="2" fill="#C4A574" />
      <rect x="20" y="14" width="8" height="1.6" rx="0.8" fill="#F6EFE4" />
      <rect x="20" y="17" width="5.5" height="1.6" rx="0.8" fill="#F6EFE4" />
      <circle cx="36" cy="14" r="5" fill="#C4A574" />
      <path d="M36 11.6v3.2" stroke="#F6EFE4" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="36" cy="16.6" r="0.8" fill="#F6EFE4" />
    </Frame>
  );
}

export function BroadcastIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#E8F0EE">
      <rect x="10" y="13" width="16" height="24" rx="5" fill="#1F6B66" />
      <rect x="12.5" y="16" width="11" height="15" rx="2" fill="#F4F7F6" />
      <circle cx="18" cy="33.5" r="1.4" fill="#C4A574" />
      <path d="M30 17c5.2 3.2 5.2 10.8 0 14" stroke="#1F6B66" strokeWidth="2.1" fill="none" strokeLinecap="round" />
      <path d="M34.5 13c7.4 5 7.4 17 0 22" stroke="#82B0A8" strokeWidth="2.1" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

export function ReactionIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#F4EEE4">
      <path
        d="M20 32.5s-9.4-5.8-9.4-12.2C10.6 16.6 13 14.6 15.7 14.6c1.7 0 3.1.9 4.3 2.3 1.2-1.4 2.6-2.3 4.3-2.3 2.7 0 5.1 2 5.1 5.7 0 6.4-9.4 12.2-9.4 12.2Z"
        fill="#C4A574"
      />
      <rect x="28" y="22" width="11" height="11" rx="3.5" fill="#1F6B66" />
      <path d="M31 27.5h5M33.5 25v5" stroke="#F4EEE4" strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

export function MembersIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#E8F0EE">
      <circle cx="18" cy="17.5" r="5.2" fill="#1F6B66" />
      <path d="M8.5 33c1.1-6 4.8-8.8 9.5-8.8S26.4 27 27.5 33Z" fill="#1F6B66" />
      <circle cx="31.5" cy="18.5" r="4.2" fill="#82B0A8" />
      <path d="M25.5 33c.7-4.4 3.4-6.5 6.8-6.5 3.5 0 6.2 2.1 7 6.5Z" fill="#82B0A8" />
    </Frame>
  );
}

export function OwnersIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#F1EEE6">
      <rect x="9" y="14" width="18" height="21" rx="3" fill="#3F4A46" />
      <rect x="12" y="17.5" width="4.2" height="4.2" rx="0.8" fill="#C4A574" />
      <rect x="17.6" y="17.5" width="4.2" height="4.2" rx="0.8" fill="#E8F0EE" />
      <rect x="12" y="23.5" width="4.2" height="4.2" rx="0.8" fill="#E8F0EE" />
      <rect x="17.6" y="23.5" width="4.2" height="4.2" rx="0.8" fill="#C4A574" />
      <rect x="14.6" y="29.5" width="6.8" height="5.5" rx="1" fill="#F1EEE6" />
      <circle cx="34" cy="22" r="5.2" fill="#1F6B66" />
      <circle cx="34" cy="22" r="2" fill="#F1EEE6" />
      <rect x="33.1" y="26.4" width="1.8" height="6.2" rx="0.9" fill="#1F6B66" />
      <rect x="33.1" y="30.2" width="3.4" height="1.6" rx="0.8" fill="#1F6B66" />
    </Frame>
  );
}

export function DraftIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#F1EEE6">
      <rect x="12" y="10" width="17" height="23" rx="3" fill="#B7A48A" />
      <rect x="15.5" y="15" width="10" height="1.8" rx="0.9" fill="#F1EEE6" />
      <rect x="15.5" y="19" width="8" height="1.8" rx="0.9" fill="#F1EEE6" />
      <rect x="15.5" y="23" width="6" height="1.8" rx="0.9" fill="#F1EEE6" />
      <path d="M27 26.5 35.5 18l3.2 3.2-8.5 8.5-3.8.8z" fill="#1F6B66" />
    </Frame>
  );
}

export function WaitingIllustration({ className = frame }: IllustrationProps) {
  return (
    <Frame className={className} fill="#F4EEE4">
      <circle cx="24" cy="24" r="12" fill="#C4A574" />
      <circle cx="24" cy="24" r="8.5" fill="#F4EEE4" />
      <path d="M24 17.5V24l4.4 2.6" stroke="#1F6B66" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}
