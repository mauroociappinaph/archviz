/**
 * Main Page - Repository Visualizer
 * Refactored with SRP, DRY, and Clean Architecture
 */

'use client';

import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { Results } from './components/Results';
import { EmptyState } from './components/EmptyState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useRecentRepos } from '@/hooks/useRecentRepos';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { analyzeRepository } from '@/lib/services/analysisService';
import { RepoAnalysis, DiagramData } from '@/lib/types';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramData | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('context');
  const [keyboardHint, setKeyboardHint] = useState(true);

  const { recentRepos, saveRecentRepo, clearRecentRepos } = useRecentRepos();

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

  useKeyboardShortcuts({
    onAnalyze: handleAnalyze,
    onTabChange: setActiveTab,
    onClear: handleClear,
    canAnalyze: !loading && !!repoUrl.trim(),
    hasAnalysis: !!analysis,
    hasInput: !!repoUrl,
  });

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

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
        <Header />

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

        {loading && <LoadingSkeleton />}

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

        {!analysis && !loading && <EmptyState />}
      </div>
    </main>
  );
}
