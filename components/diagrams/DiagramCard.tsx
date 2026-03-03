/**
 * DiagramCard Component
 * Displays a single diagram with copy and download actions
 *
 * SRP Principle: Handles only diagram display logic
 * DRY Principle: Reusable across all diagram types
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MermaidDiagram } from './MermaidDiagram';
import { Copy, Check, Download } from 'lucide-react';

interface DiagramCardProps {
  title: string;
  description: string;
  chart: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

export function DiagramCard({
  title,
  description,
  chart,
  onCopy,
  onDownload,
  copied,
}: DiagramCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-white text-xl">{title}</CardTitle>
          <CardDescription className="text-slate-400">{description}</CardDescription>
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
