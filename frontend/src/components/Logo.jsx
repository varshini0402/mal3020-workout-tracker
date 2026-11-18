export default function Logo({ color = '#0b1a2b' }) {
  return (
    <svg className="logo" width="46" height="30" viewBox="0 0 46 30" fill="none"
      stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10q4-4 8 0t8 0M2 20q4-4 8 0t8 0" />
      <path d="M24 15h4M28 6v18M33 9v12M38 5v20M42 12v6" />
    </svg>
  );
}