/**
 * EmptyState Component
 * Displayed when no repository has been analyzed
 */

import { Boxes } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700/50 hover-glow transition-all duration-300">
        <Boxes className="w-14 h-14 text-slate-600" />
      </div>
      <h3 className="text-2xl font-semibold text-slate-300 mb-3">Ready to visualize</h3>
      <p className="text-slate-500 text-lg max-w-md mx-auto">
        Enter a GitHub repository URL above to generate beautiful architecture diagrams
      </p>
    </div>
  );
}
