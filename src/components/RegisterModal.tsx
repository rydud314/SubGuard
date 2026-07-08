"use client";

import { ShieldLogo } from "@/components/icons/ShieldLogo";

interface RegisterModalProps {
  onClose: () => void;
  onRegister: () => void;
}

export function RegisterModal({ onClose, onRegister }: RegisterModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy-400 transition-all hover:scale-105 hover:bg-navy-50 hover:text-navy-700"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <ShieldLogo className="h-14 w-14" />
        </div>

        <h2 className="mt-4 text-lg font-black tracking-tight text-navy-900">
          아직 등록된 구독 서비스가 없어요
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-400">
          첫 구독 서비스를 등록하고 결제일을 달력에서
          <br />
          한눈에 관리해보세요.
        </p>

        <button type="button" onClick={onRegister} className="btn-primary mt-7 w-full">
          등록하기
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
