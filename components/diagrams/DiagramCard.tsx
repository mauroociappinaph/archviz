/**
 * DiagramCard Component
 * Displays a single diagram with copy and download actions
 */

'use client';

import { Button } from '@/components/ui/button';
import { MermaidDiagram } from './MermaidDiagram';
import { Copy, Check, FileCode, Image } from 'lucide-react';

interface DiagramCardProps {
  title: string;
  description: string;
  chart: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
  variant?: 'default' | 'highlight';
}

export function DiagramCard({
  title,
  description,
  chart,
  onCopy,
  onDownload,
  copied,
  variant = 'default',
}: DiagramCardProps) {
  const isHighlight = variant === 'highlight';

  return (
    <div className={`rounded-2xl overflow-hidden hover-lift transition-smooth ${
      isHighlight
        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30'
        : 'glass'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b flex items-start justify-between ${
        isHighlight ? 'border-purple-500/20' : 'border-slate-700/30'
      }`}>
        <div>
          <h3 className={`text-xl font-semibold mb-1 ${isHighlight ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className={`border-slate-700/50 bg-slate-800/50 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 transition-all duration-200 rounded-lg ${
              isHighlight ? 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400' : ''
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <FileCode className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="border-slate-700/50 bg-slate-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all duration-200 rounded-lg"
          >
            <Image className="w-4 h-4 mr-2" />
            Export SVG
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 ${isHighlight ? 'bg-slate-950/30' : 'bg-slate-950/50'}`}>
        <div className={`rounded-xl p-6 border ${
          isHighlight
            ? 'border-purple-500/20 bg-slate-900/50'
            : 'border-slate-800/50 bg-slate-900/30'
        }`}>
          <MermaidDiagram chart={chart} />
        </div>
      </div>
    </div>
  );
}
