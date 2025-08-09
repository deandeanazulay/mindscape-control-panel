type FocusFlameProps = {
  size?: number;
  className?: string;
  ariaLabel?: string;
};

export default function FocusFlame({ size = 56, className = "", ariaLabel = "Focus Flame mascot" }: FocusFlameProps) {
  return (
    <span
      className={`inline-flex items-center justify-center text-primary ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="flame-flicker"
        aria-hidden
        focusable="false"
      >
        <defs>
          <radialGradient id="flameGlow" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        {/* Outer flame */}
        <path
          d="M32 4 C28 12, 18 18, 18 30 C18 42, 26 52, 32 58 C38 52, 46 42, 46 30 C46 18, 36 12, 32 4 Z"
          fill="currentColor"
          opacity="0.95"
        />
        {/* Inner glow */}
        <path
          d="M32 12 C29 18, 22 22, 22 31 C22 40, 28 48, 32 52 C36 48, 42 40, 42 31 C42 22, 35 18, 32 12 Z"
          fill="url(#flameGlow)"
        />
      </svg>
    </span>
  );
}
