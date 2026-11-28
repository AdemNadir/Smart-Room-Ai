/** Brand mark: a room (outlined square) with a reserved slot (filled square). */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Smart Room">
      <rect width="32" height="32" rx="9" fill="var(--c-accent)" />
      <rect x="7" y="7" width="18" height="18" rx="5" fill="none" stroke="var(--c-on-accent)" strokeWidth="2.4" />
      <rect x="12" y="12" width="8" height="8" rx="2.5" fill="var(--c-on-accent)" />
    </svg>
  );
}
