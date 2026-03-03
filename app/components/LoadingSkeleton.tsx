/**
 * LoadingSkeleton Component
 * Elegant loading state with sophisticated animations
 */

import { Loader2, Sparkles } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <section className="animate-fade-in">
      {/* Main Loading Card */}
      <div className="glass rounded-2xl p-12 text-center">
        {/* Animated Loader */}
        <div className="relative mb-10">
          {/* Outer Ring */}
          <div className="w-24 h-24 mx-auto rounded-full border-2 border-slate-700/50 flex items-center justify-center">
            {/* Middle Ring */}
            <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 flex items-center justify-center animate-pulse">
              {/* Inner Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Orbiting Dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="w-2 h-2 rounded-full bg-amber-400 absolute top-0 left-1/2 -translate-x-1/2" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute top-0 left-1/2 -translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-2xl font-semibold text-white mb-3 flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          Analyzing repository
        </h3>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          We're examining your codebase structure to generate
          accurate C4 architecture diagrams.
        </p>

        {/* Progress Steps */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {[
            { label: 'Fetching', active: true },
            { label: 'Analyzing', active: true },
            { label: 'Generating', active: false },
          ].map((step, index) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className={`flex flex-col items-center gap-2 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-3 h-3 rounded-full ${step.active ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs text-slate-400">{step.label}</span>
              </div>
              {index < 2 && (
                <div className="w-12 h-px bg-gradient-to-r from-amber-400/50 to-slate-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton Cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-4" />
            <div className="h-32 bg-slate-800/30 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}
