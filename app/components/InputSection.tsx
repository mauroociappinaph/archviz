/**
 * InputSection Component
 * Sophisticated input with glass morphism, enhanced animations, and URL validation
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RecentReposDropdown } from './RecentReposDropdown';
import { useUrlValidation } from '@/hooks/useUrlValidation';
import { Github, Loader2, ArrowRight, Command, CornerDownLeft, Check, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputSectionProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  loading: boolean;
  onAnalyze: () => void;
  error: string;
  recentRepos: { url: string; name: string; timestamp: number }[];
  onSelectRecent: (url: string) => void;
  onClearRecent: () => void;
  keyboardHint: boolean;
}

export function InputSection({
  repoUrl,
  setRepoUrl,
  loading,
  onAnalyze,
  error,
  recentRepos,
  onSelectRecent,
  onClearRecent,
  keyboardHint,
}: InputSectionProps) {
  // Use URL validation hook
  const validation = useUrlValidation(repoUrl);

  // Determine input border color based on validation status
  const getInputBorderClass = () => {
    switch (validation.status) {
      case 'valid':
        return 'border-emerald-500 focus-visible:ring-emerald-500/50';
      case 'invalid':
        return 'border-red-500 focus-visible:ring-red-500/50';
      case 'checking':
        return 'border-amber-500 focus-visible:ring-amber-500/50';
      default:
        return 'border-slate-700/50 focus-visible:ring-amber-500/50';
    }
  };

  // Determine validation icon
  const getValidationIcon = () => {
    switch (validation.status) {
      case 'valid':
        return <Check className="w-5 h-5 text-emerald-400" />;
      case 'invalid':
        return <X className="w-5 h-5 text-red-400" />;
      case 'checking':
        return <Loader className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return null;
    }
  };

  // Determine validation message color
  const getMessageColor = () => {
    switch (validation.status) {
      case 'valid':
        return 'text-emerald-400';
      case 'invalid':
        return 'text-red-400';
      case 'checking':
        return 'text-amber-400';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <section className="mb-12 animate-slide-up delay-200">
      <div className="glass rounded-2xl p-8 hover-lift transition-smooth">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
            <Github className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Repository URL</h2>
            <p className="text-slate-400 text-sm">Enter a GitHub repository URL to analyze its architecture</p>
          </div>
        </div>

        {/* Input Group */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className={cn(
                "flex-1 h-14 bg-slate-950/80 text-white placeholder:text-slate-600 text-base rounded-xl transition-all duration-300 pr-12",
                getInputBorderClass()
              )}
              onKeyDown={(e) => e.key === 'Enter' && validation.status === 'valid' && onAnalyze()}
            />

            {/* Validation Icon */}
            {validation.status !== 'idle' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}

            {/* Recent Repos Dropdown */}
            {recentRepos.length > 0 && (
              <RecentReposDropdown repos={recentRepos} onSelect={onSelectRecent} onClear={onClearRecent} />
            )}
          </div>

          {/* Analyze Button - Disabled if not valid */}
          <Button
            onClick={onAnalyze}
            disabled={loading || validation.status !== 'valid'}
            className="h-14 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-semibold text-base rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Validation Message */}
        {validation.message && (
          <div className="mt-3 flex items-center gap-2">
            <p className={cn("text-sm", getMessageColor())}>
              {validation.message}
            </p>
          </div>
        )}

        {/* Keyboard Hints */}
        {keyboardHint && (
          <div className="mt-4 flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                <CornerDownLeft className="w-3 h-3 inline" />
              </kbd>
              <span>to analyze</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">1/2/3</kbd>
              <span>for tabs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">Esc</kbd>
              <span>to clear</span>
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}
