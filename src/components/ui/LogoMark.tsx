export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" width={size} height={size}>
      <rect width="28" height="28" rx="7" fill="#2563EB" />
      <rect x="8" y="8" width="5" height="5" rx="1.25" fill="white" />
      <rect x="15" y="8" width="5" height="5" rx="1.25" fill="white" opacity="0.65" />
      <rect x="8" y="15" width="5" height="5" rx="1.25" fill="white" opacity="0.65" />
      <rect x="15" y="15" width="5" height="5" rx="1.25" fill="white" opacity="0.3" />
    </svg>
  )
}
