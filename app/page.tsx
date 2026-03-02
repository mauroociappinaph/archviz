'use client';

/**
 * Main Page - Repository Visualizer
 * archviz - Architecture Visualizer
 * Enhanced with UI/UX Pro Max design system
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MermaidDiagram } from '@/components/diagrams/MermaidDiagram';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import { Loader2, Github, GitBranch, Layers, Boxes, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramData | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
              <Input
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 h-12 text-base focus-visible:ring-green-500/50 focus-visible:border-green-500/50 transition-all duration-300"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
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
            <Tabs defaultValue="context" className="w-full">
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
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">System Context</CardTitle>
                    <CardDescription className="text-slate-400">
                      High-level view of the system and its external dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                      <MermaidDiagram chart={diagrams.context} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="container" className="animate-fade-in">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Container Diagram</CardTitle>
                    <CardDescription className="text-slate-400">
                      Application containers and their relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                      <MermaidDiagram chart={diagrams.container} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="component" className="animate-fade-in">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Component Diagram</CardTitle>
                    <CardDescription className="text-slate-400">
                      Internal components of the main container
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                      <MermaidDiagram chart={diagrams.component} />
                    </div>
                  </CardContent>
                </Card>
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
