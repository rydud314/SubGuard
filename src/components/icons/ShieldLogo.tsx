export function ShieldLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 6px 14px rgba(14, 130, 123, 0.4))" }}
    >
      <defs>
        <linearGradient id="shieldGradient" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7EE6D8" />
          <stop offset="50%" stopColor="#18CFC3" />
          <stop offset="100%" stopColor="#0B615C" />
        </linearGradient>
      </defs>
      <path
        d="M24 2L42 9V21C42 33.15 34.8 42.4 24 46C13.2 42.4 6 33.15 6 21V9L24 2Z"
        fill="url(#shieldGradient)"
      />
      <path d="M24 2L6 9V21C6 33.15 13.2 42.4 24 46V2Z" fill="white" opacity="0.14" />
      <path
        d="M18 24L22.5 28.5L31 19"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandWordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tighter ${className}`}>
      <span className="text-navy-900">Sub</span>
      <span className="bg-gradient-to-r from-mint-500 to-sky-500 bg-clip-text text-transparent">
        Guard
      </span>
    </span>
  );
}
