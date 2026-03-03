/**
 * EmptyState Component
 * Elegant empty state with artistic illustration
 */

import { GitBranch, Layers, Boxes, ArrowRight } from 'lucide-react';

export function EmptyState() {
  return (
    <section className="animate-fade-in delay-300">
      <div className="glass rounded-2xl p-12 text-center">
        {/* Decorative Grid */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 border border-slate-500 rounded-full animate-pulse" />
            <div className="absolute w-48 h-48 border border-slate-500 rounded-full animate-pulse delay-200" />
            <div className="absolute w-32 h-32 border border-slate-500 rounded-full animate-pulse delay-400" />
          </div>

          {/* Icons */}
          <div className="relative flex items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30 animate-float">
              <GitBranch className="w-8 h-8 text-amber-400" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-600" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 animate-float delay-200">
              <Layers className="w-8 h-8 text-indigo-400" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-600" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 animate-float delay-400">
              <Boxes className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-2xl font-semibold text-white mb-3">
          Ready to visualize your architecture
        </h3>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
          Enter a GitHub repository URL above and we'll automatically generate
          C4 architecture diagrams showing your system's context, containers, and components.
        </p>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-amber-400 font-bold text-lg">C4</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">C4 Model</p>
            <p className="text-slate-500 text-xs mt-1">Standard diagrams</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-slate-300 text-sm font-medium">3 Levels</p>
            <p className="text-slate-500 text-xs mt-1">Context, Container, Component</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-400 font-bold text-lg">AI</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">AI-Powered</p>
            <p className="text-slate-500 text-xs mt-1">Smart analysis</p>
          </div>
        </div>
      </div>
    </section>
  );
}
