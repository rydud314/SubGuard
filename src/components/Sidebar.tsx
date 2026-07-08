"use client";

import { ShieldLogo } from "@/components/icons/ShieldLogo";

interface SidebarProps {
  upcomingCount?: number;
  onSignOut?: () => void;
}

function NavIcon({
  active,
  label,
  badge,
  children,
  onClick,
}: {
  active?: boolean;
  label: string;
  badge?: number;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
        active
          ? "bg-brand-gradient-deep text-white shadow-card"
          : "text-navy-400 hover:bg-mint-50 hover:text-mint-600"
      }`}
    >
      {children}
      {!!badge && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ upcomingCount = 0, onSignOut }: SidebarProps) {
  return (
    <aside className="hidden flex-col items-center gap-6 border-r border-white/60 bg-white/70 py-6 backdrop-blur-xl md:flex md:w-20">
      <ShieldLogo className="h-9 w-9" />
      <nav className="flex flex-1 flex-col items-center gap-3">
        <NavIcon active label="홈">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </NavIcon>
        <NavIcon label="결제 수단">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </NavIcon>
        <NavIcon label="알림" badge={upcomingCount}>
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </NavIcon>
        <NavIcon label="설정">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </NavIcon>
      </nav>
      <button
        type="button"
        onClick={onSignOut}
        title="로그아웃"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-navy-400 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </aside>
  );
}
