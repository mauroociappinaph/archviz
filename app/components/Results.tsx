/**
 * Results Component
 * Sophisticated results display with elegant tabs
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagramCard } from '@/components/diagrams/DiagramCard';
import { StatBadge } from './StatBadge';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import { GitBranch, Boxes, Layers, Sparkles } from 'lucide-react';

interface ResultsProps {
  analysis: RepoAnalysis;
  diagrams: DiagramData;
  activeTab: string;
  onTabChange: (tab: string) => void;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onDownload: (content: string, filename: string) => void;
}

export function Results({
  analysis,
  diagrams,
  activeTab,
  onTabChange,
  copiedCode,
  onCopy,
  onDownload,
}: ResultsProps) {
  return (
    <section className="space-y-8 animate-slide-up delay-100">
      {/* Info Card */}
      <div className="glass rounded-2xl p-8 hover-lift transition-smooth">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-white mb-2">
              {analysis.context.name}
            </h2>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
              {analysis.context.description}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Analyzed</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <StatBadge
            icon={<GitBranch className="w-5 h-5 text-amber-400" />}
            label={analysis.context.technology}
            className="bg-amber-500/10 border-amber-500/20"
          />
          <StatBadge
            icon={<Boxes className="w-5 h-5 text-indigo-400" />}
            label={`${analysis.containers.length} Containers`}
            className="bg-indigo-500/10 border-indigo-500/20"
          />
          <StatBadge
            icon={<Layers className="w-5 h-5 text-emerald-400" />}
            label={`${analysis.components.length} Components`}
            className="bg-emerald-500/10 border-emerald-500/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass p-1.5 rounded-xl">
          {[
            { value: 'context', label: 'Context', desc: 'System overview' },
            { value: 'container', label: 'Container', desc: 'App structure' },
            { value: 'component', label: 'Component', desc: 'Internal details' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center py-3 px-4 rounded-lg text-slate-400 data-[state=active]:bg-slate-800/80 data-[state=active]:text-white transition-all duration-300 cursor-pointer group"
            >
              <span className="font-semibold text-sm">{tab.label}</span>
              <span className="text-xs opacity-60 group-data-[state=active]:opacity-100">
                {tab.desc}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="context" className="animate-fade-in mt-6">
          <DiagramCard
            title="System Context"
            description="High-level view of the system and its external dependencies"
            chart={diagrams.context}
            onCopy={() => onCopy(diagrams.context, 'context')}
            onDownload={() => onDownload(diagrams.context, `${analysis.context.name}-context.svg`)}
            copied={copiedCode === 'context'}
          />
        </TabsContent>

        <TabsContent value="container" className="animate-fade-in mt-6">
          <DiagramCard
            title="Container Diagram"
            description="Application containers and their relationships"
            chart={diagrams.container}
            onCopy={() => onCopy(diagrams.container, 'container')}
            onDownload={() => onDownload(diagrams.container, `${analysis.context.name}-container.svg`)}
            copied={copiedCode === 'container'}
          />
        </TabsContent>

        <TabsContent value="component" className="animate-fade-in mt-6">
          <div className="relative">
            {/* Special highlight badge */}
            <div className="absolute -top-3 left-6 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25">
                <Layers className="w-3.5 h-3.5" />
                <span>Detailed View</span>
              </div>
            </div>
            <DiagramCard
              title="Component Diagram"
              description="Internal architecture showing classes, interfaces, and relationships"
              chart={diagrams.component}
              onCopy={() => onCopy(diagrams.component, 'component')}
              onDownload={() => onDownload(diagrams.component, `${analysis.context.name}-component.svg`)}
              copied={copiedCode === 'component'}
              variant="highlight"
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
