import React from 'react';
import { cn } from '../../utils/formatters';

const SPHERES = [
  {
    // large blue sphere, top
    className: '-top-16 right-8 w-44 h-44 sm:w-56 sm:h-56',
    background: 'radial-gradient(circle at 30% 26%, #bfdbfe 0%, #3b82f6 36%, #1d4ed8 68%, #172554 100%)',
    delay: '0s',
  },
  {
    // sky-blue sphere, left
    className: 'top-1/3 -left-12 sm:-left-16 w-24 h-24 sm:w-32 sm:h-32',
    background: 'radial-gradient(circle at 30% 26%, #e0f2fe 0%, #7dd3fc 38%, #0284c7 74%, #0c4a6e 100%)',
    delay: '-3s',
  },
  {
    // cyan sphere, bottom-left
    className: '-bottom-14 -left-6 sm:left-4 w-36 h-36 sm:w-44 sm:h-44',
    background: 'radial-gradient(circle at 30% 26%, #cffafe 0%, #22d3ee 36%, #0891b2 70%, #164e63 100%)',
    delay: '-5s',
  },
  {
    // deep-blue sphere, right
    className: 'bottom-1/4 -right-12 sm:-right-16 w-28 h-28 sm:w-40 sm:h-40',
    background: 'radial-gradient(circle at 30% 26%, #bae6fd 0%, #38bdf8 34%, #2563eb 72%, #1e3a8a 100%)',
    delay: '-7s',
  },
];

/**
 * Full-screen dark glassmorphism backdrop with a frosted glass card in the middle.
 * Shared by the Login and Register pages.
 */
export function AuthShell({ children, maxWidth = 'max-w-md' }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10 font-sans"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0f2557 38%, #081433 72%, #050b1f 100%)',
      }}
    >
      {/* soft ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, rgba(34,211,238,0) 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 70%)' }}
      />

      <div className={cn('relative w-full', maxWidth)}>
        {/* floating glass spheres behind the card */}
        {SPHERES.map((sphere, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={cn('auth-float absolute rounded-full z-0', sphere.className)}
            style={{
              background: sphere.background,
              animationDelay: sphere.delay,
              boxShadow: 'inset -14px -18px 34px rgba(2,6,23,0.45), 0 30px 60px rgba(2,6,23,0.45)',
            }}
          />
        ))}

        {/* frosted glass card */}
        <div
          className="relative z-10 rounded-2xl border border-white/25 backdrop-blur-2xl text-white p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
            boxShadow: '0 24px 70px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthBrand({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-2 mb-3">
        <img src="/logo.svg" alt="" className="w-8 h-8 object-contain" />
        <span className="text-sm font-bold tracking-wide text-white/90">Milesora</span>
      </div>
      <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-white/60 mt-1.5">{subtitle}</p>}
    </div>
  );
}
