"use client";

import { useState } from "react";
import { ShieldLogo } from "@/components/icons/ShieldLogo";

interface AccountInfo {
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface SidebarProps {
  upcomingCount?: number;
  onSignOut?: () => void;
  account?: AccountInfo | null;
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

export function Sidebar({ upcomingCount = 0, onSignOut, account }: SidebarProps) {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        <NavIcon label="설정" onClick={() => setShowAccountInfo(true)}>
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
        onClick={() => setShowLogoutConfirm(true)}
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

      {showAccountInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-xs animate-pop-in rounded-3xl bg-white p-7 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAccountInfo(false)}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy-400 transition-all hover:scale-105 hover:bg-navy-50 hover:text-navy-700"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {account?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.avatarUrl}
                alt=""
                className="mx-auto h-16 w-16 rounded-full object-cover shadow-card"
              />
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-deep text-xl font-black text-white shadow-card">
                {(account?.name ?? account?.email ?? "S").charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="mt-4 text-base font-black tracking-tight text-navy-900">
              {account?.name || "SubGuard 사용자"}
            </h2>
            <p className="mt-1 text-xs text-navy-400">{account?.email}</p>

            <button
              type="button"
              onClick={() => setShowAccountInfo(false)}
              className="btn-secondary mt-6 w-full"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-xs animate-pop-in rounded-3xl bg-white p-7 text-center shadow-2xl">
            <h2 className="text-base font-black tracking-tight text-navy-900">로그아웃 하시겠습니까?</h2>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onSignOut?.();
                }}
                className="flex-1 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:scale-105 active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
