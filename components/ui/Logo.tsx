interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mohit Tambi logo"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="44" height="44" rx="10" fill="url(#logoGrad)" />
      {/* Distributed node network — metaphor for distributed systems */}
      <circle cx="22" cy="7.5" r="1.6" fill="white" fillOpacity="0.55" />
      <circle cx="7.5" cy="34" r="1.6" fill="white" fillOpacity="0.55" />
      <circle cx="36.5" cy="34" r="1.6" fill="white" fillOpacity="0.55" />
      <line x1="22" y1="7.5" x2="7.5" y2="34" stroke="white" strokeOpacity="0.18" strokeWidth="0.9" />
      <line x1="22" y1="7.5" x2="36.5" y2="34" stroke="white" strokeOpacity="0.18" strokeWidth="0.9" />
      <line x1="7.5" y1="34" x2="36.5" y2="34" stroke="white" strokeOpacity="0.18" strokeWidth="0.9" />
      {/* M */}
      <path
        d="M7 31V15L14 23.5L21 15V31"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* T */}
      <path
        d="M24 18.5H38M31 18.5V31"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
