/**
 * Main Page - Repository Visualizer
 * archviz - Architecture Visualizer
 * Refactored with SRP, DRY, and Clean Architecture principles
 */

'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagramCard } from '@/components/diagrams/DiagramCard';
import { useRecentRepos } from '@/hooks/useRecentRepos';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { analyzeRepository } from '@/lib/services/analysisService';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import {
  Loader2, Github, GitBranch, Layers, Boxes, Sparkles, ArrowRight,
  History, Command, CornerDownLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Home() {
  // State
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramData | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('context');
  const [keyboardHint, setKeyboardHint] = useState(true);

  // Custom hooks
  const { recentRepos, saveRecentRepo, clearRecentRepos } = useRecentRepos();

  // Handlers
  const handleClear = useCallback(() => {
    setAnalysis(null);
    setDiagrams(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError('');
    handleClear();

    const result = await analyzeRepository(repoUrl);

    if (result.success && result.data) {
      setAnalysis(result.data.analysis);
      setDiagrams(result.data.diagrams);
      saveRecentRepo(repoUrl, result.data.analysis.context.name);
      setKeyboardHint(false);
    } else {
      setError(result.error || 'Failed to analyze repository');
    }

    setLoading(false);
  }, [repoUrl, handleClear, saveRecentRepo]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAnalyze: handleAnalyze,
    onTabChange: setActiveTab,
    onClear: handleClear,
    canAnalyze: !loading && !!repoUrl.trim(),
    hasAnalysis: !!analysis,
    hasInput: !!repoUrl,
  });

  // Clipboard operations
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Download SVG
  const downloadSVG = useCallback((svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <Header />

        {/* Input Section */}
        <InputSection
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          loading={loading}
          onAnalyze={handleAnalyze}
          error={error}
          recentRepos={recentRepos}
          onSelectRecent={setRepoUrl}
          onClearRecent={clearRecentRepos}
          keyboardHint={keyboardHint}
        />

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {analysis && diagrams && (
          <Results
            analysis={analysis}
            diagrams={diagrams}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            copiedCode={copiedCode}
            onCopy={copyToClipboard}
            onDownload={downloadSVG}
          />
        )}

        {/* Empty State */}
        {!analysis && !loading && <EmptyState />}
      </div>
    </main>
  );
}

// Sub-components
function Header() {
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

function InputSection({
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
              <RecentReposDropdown
                repos={recentRepos}
                onSelect={onSelectRecent}
                onClear={onClearRecent}
              />
            )}
          </div>
          <AnalyzeButton loading={loading} onClick={onAnalyze} />
        </div>

        {keyboardHint && <KeyboardHints />}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentReposDropdownProps {
  repos: { url: string; name: string; timestamp: number }[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

function RecentReposDropdown({ repos, onSelect, onClear }: RecentReposDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <History className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-700">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
          <span className="text-xs text-slate-400">Recent Repositories</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Clear
          </Button>
        </div>
        {repos.map((repo, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelect(repo.url)}
            className="cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 focus:bg-slate-800"
          >
            <div className="flex flex-col">
              <span className="truncate">{repo.name}</span>
              <span className="text-xs text-slate-500 truncate">{repo.url}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AnalyzeButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
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
  );
}

function KeyboardHints() {
  return (
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
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <div className="h-8 w-64 bg-slate-800 rounded animate-shimmer" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-shimmer mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="py-12">
          <div className="h-64 w-full bg-slate-800 rounded animate-shimmer" />
        </CardContent>
      </Card>
    </div>
  );
}

interface ResultsProps {
  analysis: RepoAnalysis;
  diagrams: DiagramData;
  activeTab: string;
  onTabChange: (tab: string) => void;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onDownload: (content: string, filename: string) => void;
}

function Results({
  analysis,
  diagrams,
  activeTab,
  onTabChange,
  copiedCode,
  onCopy,
  onDownload,
}: ResultsProps) {
  return (
    <div className="space-y-8 animate-slide-up">
      <AnalysisInfo analysis={analysis} />

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-700/50 p-1">
          {['context', 'container', 'component'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 cursor-pointer capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="context" className="animate-fade-in">
          <DiagramCard
            title="System Context"
            description="High-level view of the system and its external dependencies"
            chart={diagrams.context}
            onCopy={() => onCopy(diagrams.context, 'context')}
            onDownload={() => onDownload(diagrams.context, `${analysis.context.name}-context.svg`)}
            copied={copiedCode === 'context'}
          />
        </TabsContent>

        <TabsContent value="container" className="animate-fade-in">
          <DiagramCard
            title="Container Diagram"
            description="Application containers and their relationships"
            chart={diagrams.container}
            onCopy={() => onCopy(diagrams.container, 'container')}
            onDownload={() => onDownload(diagrams.container, `${analysis.context.name}-container.svg`)}
            copied={copiedCode === 'container'}
          />
        </TabsContent>

        <TabsContent value="component" className="animate-fade-in">
          <DiagramCard
            title="Component Diagram"
            description="Internal components of the main container"
            chart={diagrams.component}
            onCopy={() => onCopy(diagrams.component, 'component')}
            onDownload={() => onDownload(diagrams.component, `${analysis.context.name}-component.svg`)}
            copied={copiedCode === 'component'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalysisInfo({ analysis }: { analysis: RepoAnalysis }) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover-lift">
      <CardHeader>
        <CardTitle className="text-white text-2xl">{analysis.context.name}</CardTitle>
        <CardDescription className="text-slate-400 text-base">
          {analysis.context.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6">
          <StatBadge icon={<GitBranch className="w-5 h-5 text-green-400" />} label={analysis.context.technology} />
          <StatBadge icon={<Boxes className="w-5 h-5 text-emerald-400" />} label={`${analysis.containers.length} Containers`} />
          <StatBadge icon={<Layers className="w-5 h-5 text-teal-400" />} label={`${analysis.components.length} Components`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function EmptyState() {
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
