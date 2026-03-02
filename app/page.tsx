'use client';

/**
 * Main Page - Repository Visualizer
 * archviz - Architecture Visualizer
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MermaidDiagram } from '@/components/diagrams/MermaidDiagram';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import { Loader2, Github, GitBranch, Layers, Boxes } from 'lucide-react';

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              archviz
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Visualize your repository architecture automatically.
            Generate C4 diagrams from any GitHub repository in seconds.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Github className="w-5 h-5" />
              Repository URL
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter a GitHub repository URL to analyze its architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && diagrams && (
          <div className="space-y-6">
            {/* Repository Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{analysis.context.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {analysis.context.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span>{analysis.context.technology}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Boxes className="w-4 h-4 text-purple-400" />
                    <span>{analysis.containers.length} Containers</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Layers className="w-4 h-4 text-green-400" />
                    <span>{analysis.components.length} Components</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagrams */}
            <Tabs defaultValue="context" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="context" className="text-slate-300 data-[state=active]:bg-slate-700">
                  System Context
                </TabsTrigger>
                <TabsTrigger value="container" className="text-slate-300 data-[state=active]:bg-slate-700">
                  Containers
                </TabsTrigger>
                <TabsTrigger value="component" className="text-slate-300 data-[state=active]:bg-slate-700">
                  Components
                </TabsTrigger>
              </TabsList>

              <TabsContent value="context">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Context</CardTitle>
                    <CardDescription className="text-slate-400">
                      High-level view of the system and its external dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <MermaidDiagram chart={diagrams.context} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="container">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Container Diagram</CardTitle>
                    <CardDescription className="text-slate-400">
                      Application containers and their relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <MermaidDiagram chart={diagrams.container} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="component">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Component Diagram</CardTitle>
                    <CardDescription className="text-slate-400">
                      Internal components of the main container
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4">
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
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
              <Boxes className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Ready to visualize
            </h3>
            <p className="text-slate-500">
              Enter a GitHub repository URL above to get started
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
