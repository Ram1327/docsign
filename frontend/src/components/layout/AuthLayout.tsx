import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 48px,
              #fff 48px,
              #fff 49px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              #fff 48px,
              #fff 49px
            )`,
          }}
        />

        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DocSign</span>
        </div>

        {/* Hero document illustration */}
        <div className="relative flex items-center justify-center flex-1 py-12">
          <div className="relative">
            {/* Shadow docs stacked behind */}
            <div className="absolute -bottom-2 -right-3 w-56 h-72 bg-gray-800 rounded-xl border border-gray-700 rotate-3" />
            <div className="absolute -bottom-1 -right-1.5 w-56 h-72 bg-gray-800/80 rounded-xl border border-gray-700 rotate-1" />

            {/* Main doc */}
            <div className="relative w-56 h-72 bg-gray-800 rounded-xl border border-gray-600 p-5 flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                  <svg className="w-3 h-3 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="h-2 w-24 bg-gray-600 rounded-full" />
              </div>
              {[100, 75, 90, 60, 85, 70].map((w, i) => (
                <div key={i} className="h-1.5 bg-gray-700 rounded-full" style={{ width: `${w}%` }} />
              ))}
              <div className="mt-auto pt-3 border-t border-gray-700 flex items-center justify-between">
                <div className="h-1.5 w-16 bg-gray-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-brand-500/30 border border-brand-400/40" />
                  <div className="h-4 w-14 bg-brand-500/20 border border-brand-500/30 rounded" />
                </div>
              </div>
            </div>

            {/* Floating signed badge */}
            <div className="absolute -top-3 -right-6 bg-green-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Signed
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative">
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Send, sign, and manage documents with complete audit trails.
            Enterprise-grade security for teams of any size.
          </p>
          <div className="flex items-center gap-4 mt-6">
            {["256-bit encryption", "Audit trail", "Legally binding"].map((feat) => (
              <div key={feat} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-brand-400" />
                <span className="text-gray-500 text-xs">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight">DocSign</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
              {title}
            </h1>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
