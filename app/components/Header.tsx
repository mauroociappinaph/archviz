/**
 * Header Component
 * App header with title and description
 */

import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <div className="text-center mb-16 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
        <Sparkles className="w-4 h-4 text-green-400" />
        <span className="text-green-400 text-sm font-medium">AI-Powered Architecture Visualization</span>
      </div>

      <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
        <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          archviz
        </span>
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
        Visualize your repository architecture automatically.
        <br />
        Generate C4 diagrams from any GitHub repository in seconds.
      </p>
    </div>
  );
}
