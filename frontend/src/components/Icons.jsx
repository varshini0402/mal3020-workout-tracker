export function Dumbbell({ color = 'currentColor', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 9v6M6.5 6v12M17.5 6v12M21 9v6M6.5 12h11" />
    </svg>
  );
}

export function Waves({ color = 'currentColor', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M2 9q2.5-3 5 0t5 0t5 0t5 0M2 16q2.5-3 5 0t5 0t5 0t5 0" />
    </svg>
  );
}

export function Trash({ color = 'currentColor', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}