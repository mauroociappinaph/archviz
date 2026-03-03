/**
 * InputSection Component
 * Repository URL input with recent repos dropdown
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentReposDropdown } from './RecentReposDropdown';
import { Github, Loader2, ArrowRight, Command, CornerDownLeft } from 'lucide-react';

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
  return (
    <Card className="mb-10 bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover-lift animate-slide-up delay-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-3 text-xl">
          <Github className="w-6 h-6 text-green-400" />
          Repository URL
        </CardTitle>
        <CardDescription className="text-slate-400 text-base">
          Enter a GitHub repository URL to analyze its architecture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 h-12 text-base focus-visible:ring-green-500/50 focus-visible:border-green-500/50 transition-all duration-300 pr-10"
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
            />
            {recentRepos.length > 0 && (
              <RecentReposDropdown repos={recentRepos} onSelect={onSelectRecent} onClear={onClearRecent} />
            )}
          </div>
          <Button
            onClick={onAnalyze}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 h-12 px-8 font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        {keyboardHint && (
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <CornerDownLeft className="w-3 h-3" />
              <span>to analyze</span>
            </span>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>1/2/3</span>
              <span>for tabs</span>
            </span>
            <span className="flex items-center gap-1">
              <span>Esc</span>
              <span>to clear</span>
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
