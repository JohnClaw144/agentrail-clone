export function FootstepsIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Left shoe — sole */}
      <ellipse cx="30" cy="58" rx="14" ry="20" transform="rotate(-15 30 58)" />
      {/* Left shoe — heel */}
      <ellipse cx="22" cy="82" rx="9" ry="11" transform="rotate(-10 22 82)" />
      {/* Right shoe — sole */}
      <ellipse cx="68" cy="38" rx="14" ry="20" transform="rotate(-20 68 38)" />
      {/* Right shoe — heel */}
      <ellipse cx="58" cy="62" rx="9" ry="11" transform="rotate(-15 58 62)" />
    </svg>
  );
}
