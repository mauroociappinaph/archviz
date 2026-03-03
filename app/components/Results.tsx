/**
 * Results Component
 * Displays analysis results with tabs for different diagram types
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagramCard } from '@/components/diagrams/DiagramCard';
import { StatBadge } from './StatBadge';
import { RepoAnalysis, DiagramData } from '@/lib/types';
import { GitBranch, Boxes, Layers } from 'lucide-react';

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
    <div className="space-y-8 animate-slide-up">
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
