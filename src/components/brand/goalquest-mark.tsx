export function GoalQuestMark({
  className = "",
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const dark = inverted ? "#ffffff" : "#0f172a";
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GoalQuest"
    >
      <defs>
        <linearGradient id="gq-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="gq-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={inverted ? "#1e293b" : "#ffffff"} />
          <stop offset="100%" stopColor={inverted ? "#0f172a" : "#f1f5f9"} />
        </linearGradient>
      </defs>
      {/* Rounded square plate */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="11"
        fill="url(#gq-plate)"
        stroke={inverted ? "#334155" : "#e2e8f0"}
        strokeWidth="1"
      />
      {/* Four dots — top-left is the "active" goal in brand blue */}
      <circle cx="14" cy="14" r="3.6" fill="url(#gq-accent)" />
      <circle cx="26" cy="14" r="3.6" fill={dark} />
      <circle cx="14" cy="26" r="3.6" fill={dark} />
      <circle cx="26" cy="26" r="3.6" fill={dark} />
    </svg>
  );
}
