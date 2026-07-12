// Small hand-drawn icon set -- kept as plain inline SVG rather than an icon
// library dependency, consistent with this project's general preference for
// minimal dependencies. Add more here as needed rather than reaching for a
// package for a handful of glyphs.
type IconProps = { className?: string };

export function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 3.2c1.6-.9 3.4-.9 6 .3 2.6-1.2 4.4-1.2 6-.3v9.6c-1.6-.9-3.4-.9-6 .3-2.6-1.2-4.4-1.2-6-.3V3.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 3.5v9.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 8H3M3 8l4.5-4.5M3 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
