/**
 * Header Component
 * Elegant header with sophisticated typography and animations
 */

import { Sparkles, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center mb-16 animate-fade-in">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up delay-100">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-amber-400 text-sm font-medium tracking-wide">
          AI-Powered Architecture Visualization
        </span>
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-7xl md:text-8xl font-bold mb-6 tracking-tight animate-slide-up delay-200">
        <span className="gradient-text">archviz</span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed animate-slide-up delay-300 font-light">
        Transform your GitHub repositories into beautiful
        <br />
        <span className="text-amber-400 font-medium">C4 architecture diagrams</span> in seconds
      </p>

      {/* Decorative Elements */}
      <div className="flex items-center justify-center gap-4 mt-10 animate-slide-up delay-400">
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <Github className="w-6 h-6 text-slate-500" />
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>
    </header>
  );
}
