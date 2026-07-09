"use client";

import { useState } from "react";
import { ShieldLogo } from "@/components/icons/ShieldLogo";

interface AccountInfo {
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface SidebarProps {
  onSignOut?: () => void;
  account?: AccountInfo | null;
}

function NavIcon({
  active,
  label,
  children,
  onClick,
}: {
  active?: boolean;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
        active
          ? "bg-navy-800 text-white shadow-card"
          : "text-navy-400 hover:bg-mint-50 hover:text-mint-600"
      }`}
    >
      {children}
    </button>
  );
}

export function Sidebar({ onSignOut, account }: SidebarProps) {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <aside className="hidden flex-col items-center gap-6 border-r border-white/60 bg-white/70 py-6 backdrop-blur-xl md:flex md:w-20">
      <ShieldLogo className="h-9 w-9" />
      <nav className="flex flex-col items-center gap-3">
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

        <div className="relative flex flex-col items-center gap-1">
          <NavIcon label="설정" active={showAccountInfo} onClick={() => setShowAccountInfo((v) => !v)}>
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

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-navy-400 transition-all duration-200 hover:scale-105 hover:text-rose-500"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[9px] font-semibold leading-none">로그아웃</span>
          </button>

          {showAccountInfo && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAccountInfo(false)} />
              <div className="absolute left-full top-0 z-50 ml-3 w-72 animate-pop-in rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-navy-100">
                <button
                  type="button"
                  onClick={() => setShowAccountInfo(false)}
                  aria-label="닫기"
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-navy-400 transition-all hover:scale-105 hover:bg-navy-50 hover:text-navy-700"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
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
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-800 text-xl font-black text-white shadow-card">
                    {(account?.name ?? account?.email ?? "S").charAt(0).toUpperCase()}
                  </div>
                )}

                <h2 className="mt-4 text-base font-black tracking-tight text-navy-900">
                  {account?.name || "SubGuard 사용자"}
                </h2>
                <p className="mt-1 text-xs text-navy-400">{account?.email}</p>
              </div>
            </>
          )}
        </div>
      </nav>

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
