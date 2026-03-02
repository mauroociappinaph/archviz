'use client';

/**
 * Main Page - Repository Visualizer
 * archviz - Architecture Visualizer
 * Enhanced with UI/UX Pro Max + 10x Features
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MermaidDiagram } from '@/components/diagrams/MermaidDiagram';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import {
  Loader2, Github, GitBranch, Layers, Boxes, Sparkles, ArrowRight,
  Copy, Check, Download, History, X, Command, CornerDownLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RECENT_REPOS_KEY = 'archviz_recent_repos';
const MAX_RECENT_REPOS = 5;

interface RecentRepo {
  url: string;
  name: string;
  timestamp: number;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramData | null>(null);
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('context');
  const [keyboardHint, setKeyboardHint] = useState(true);

  // Load recent repos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_REPOS_KEY);
    if (stored) {
      try {
        const repos = JSON.parse(stored);
        setRecentRepos(repos);
      } catch (e) {
        console.error('Failed to parse recent repos:', e);
      }
    }
  }, []);

  // Save recent repo
  const saveRecentRepo = useCallback((url: string, name: string) => {
    const newRepo: RecentRepo = { url, name, timestamp: Date.now() };
    setRecentRepos(prev => {
      const filtered = prev.filter(r => r.url !== url);
      const updated = [newRepo, ...filtered].slice(0, MAX_RECENT_REPOS);
      localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to analyze
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && repoUrl.trim()) {
          handleAnalyze();
        }
      }

      // Cmd/Ctrl + 1/2/3 for tabs
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const tabs = ['context', 'container', 'component'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
      }

      // Escape to clear
      if (e.key === 'Escape') {
        if (analysis) {
          setAnalysis(null);
          setDiagrams(null);
        } else if (repoUrl) {
          setRepoUrl('');
          setError('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [repoUrl, loading, analysis]);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    setDiagrams(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze repository');
      }

      setAnalysis(result.data.analysis);
      setDiagrams(result.data.diagrams);

      // Save to recent repos
      saveRecentRepo(repoUrl, result.data.analysis.context.name);

      // Hide keyboard hint after first use
      setKeyboardHint(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadSVG = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearRecentRepos = () => {
    setRecentRepos([]);
    localStorage.removeItem(RECENT_REPOS_KEY);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
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

        {/* Input Section */}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                {/* Recent Repos Dropdown */}
                {recentRepos.length > 0 && (
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
                          onClick={clearRecentRepos}
                          className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Clear
                        </Button>
                      </div>
                      {recentRepos.map((repo, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => setRepoUrl(repo.url)}
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
                )}
              </div>
              <Button
                onClick={handleAnalyze}
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

            {/* Keyboard Shortcuts Hint */}
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

        {/* Loading Skeleton */}
        {loading && (
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
        )}

        {/* Results Section */}
        {analysis && diagrams && (
          <div className="space-y-8 animate-slide-up">
            {/* Repository Info */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover-lift">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{analysis.context.name}</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  {analysis.context.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full">
                    <GitBranch className="w-5 h-5 text-green-400" />
                    <span className="font-medium">{analysis.context.technology}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full">
                    <Boxes className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium">{analysis.containers.length} Containers</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full">
                    <Layers className="w-5 h-5 text-teal-400" />
                    <span className="font-medium">{analysis.components.length} Components</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagrams */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-700/50 p-1">
                <TabsTrigger
                  value="context"
                  className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 cursor-pointer"
                >
                  System Context
                </TabsTrigger>
                <TabsTrigger
                  value="container"
                  className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 cursor-pointer"
                >
                  Containers
                </TabsTrigger>
                <TabsTrigger
                  value="component"
                  className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 cursor-pointer"
                >
                  Components
                </TabsTrigger>
              </TabsList>

              <TabsContent value="context" className="animate-fade-in">
                <DiagramCard
                  title="System Context"
                  description="High-level view of the system and its external dependencies"
                  chart={diagrams.context}
                  onCopy={() => copyToClipboard(diagrams.context, 'context')}
                  onDownload={() => downloadSVG(diagrams.context, `${analysis.context.name}-context.svg`)}
                  copied={copiedCode === 'context'}
                />
              </TabsContent>

              <TabsContent value="container" className="animate-fade-in">
                <DiagramCard
                  title="Container Diagram"
                  description="Application containers and their relationships"
                  chart={diagrams.container}
                  onCopy={() => copyToClipboard(diagrams.container, 'container')}
                  onDownload={() => downloadSVG(diagrams.container, `${analysis.context.name}-container.svg`)}
                  copied={copiedCode === 'container'}
                />
              </TabsContent>

              <TabsContent value="component" className="animate-fade-in">
                <DiagramCard
                  title="Component Diagram"
                  description="Internal components of the main container"
                  chart={diagrams.component}
                  onCopy={() => copyToClipboard(diagrams.component, 'component')}
                  onDownload={() => downloadSVG(diagrams.component, `${analysis.context.name}-component.svg`)}
                  copied={copiedCode === 'component'}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700/50 hover-glow transition-all duration-300">
              <Boxes className="w-14 h-14 text-slate-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-300 mb-3">
              Ready to visualize
            </h3>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              Enter a GitHub repository URL above to generate beautiful architecture diagrams
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// Diagram Card Component with Copy & Download
interface DiagramCardProps {
  title: string;
  description: string;
  chart: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

function DiagramCard({ title, description, chart, onCopy, onDownload, copied }: DiagramCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-white text-xl">{title}</CardTitle>
          <CardDescription className="text-slate-400">
            {description}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export SVG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
          <MermaidDiagram chart={chart} />
        </div>
      </CardContent>
    </Card>
  );
}
