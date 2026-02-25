import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

/* ─── M Logo Mark ───
   Uses the official meetrix_m_logo.svg asset
*/
export function LogoMark({ className = '', size = 48 }: LogoProps) {
  return (
    <Image
      src="/meetrix_m_logo.svg"
      alt="Meetrix"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

/* ─── Wordmark ───
   "meetri" in charcoal gray, "x" as two intersecting chevrons (purple + cyan).
   The "x" is the brand accent — left half violet, right half cyan.
*/
export function LogoWordmark({ className = '', size = 80 }: LogoProps & { color?: string }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0,
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: size * 0.3,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}
    >
      <span style={{ color: 'inherit' }}>meetri</span>
      <MeetrixX size={size * 0.18} />
    </span>
  );
}

/* The stylized "x" — two overlapping chevrons */
function MeetrixX({ size = 14 }: { size?: number }) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 20 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'baseline', marginBottom: '-0.05em' }}
    >
      <defs>
        <linearGradient id={`${id}-xl`} x1="0" y1="0" x2="10" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="100%" stopColor="#6B42E0" />
        </linearGradient>
        <linearGradient id={`${id}-xr`} x1="10" y1="0" x2="20" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3BA0E8" />
        </linearGradient>
      </defs>
      {/* Left chevron half (purple) */}
      <path d="M0 0 L10 11.5 L0 23 L5 23 L10 17 L5 11.5 L10 6 L5 0 Z" fill={`url(#${id}-xl)`} />
      {/* Right chevron half (cyan) */}
      <path d="M20 0 L10 11.5 L20 23 L15 23 L10 17 L15 11.5 L10 6 L15 0 Z" fill={`url(#${id}-xr)`} />
    </svg>
  );
}

/* ─── Combined Logo ───
   Icon mark + wordmark together
*/
export function LogoFull({ className = '', size = 32 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <LogoWordmark size={size * 2.8} />
    </span>
  );
}

export default LogoFull;
