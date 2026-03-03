/**
 * DiagramCard Component
 * Displays a single diagram with copy and download actions
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InteractiveDiagram } from './InteractiveDiagram';
import { exportToPNG, exportToSVG } from '@/lib/export/exportImage';
import { exportSingleDiagramToPDF } from '@/lib/export/exportPDF';
import { Copy, Check, FileCode, Image, MousePointerClick, Download, FileText, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';

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
  const [selectedNode, setSelectedNode] = useState<{ id: string | null; text: string | null } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (node: { id: string | null; text: string | null }) => {
    setSelectedNode(node);
  };

  const handleExportPNG = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    try {
      await exportToPNG(diagramRef.current, title.replace(/\s+/g, '_'));
    } catch (error) {
      console.error('Error exporting PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    try {
      await exportSingleDiagramToPDF(diagramRef.current, title);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = () => {
    onDownload();
  };

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

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting}
                className="border-slate-700/50 bg-slate-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all duration-200 rounded-lg"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={handleExportSVG}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <FileCode className="w-4 h-4 mr-2 text-emerald-400" />
                Mermaid Code (.mmd)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportPNG}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 mr-2 text-amber-400" />
                PNG Image (.png)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2 text-red-400" />
                PDF Document (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Interactive Content */}
      <div ref={diagramRef} className={`${isHighlight ? 'bg-slate-950/30' : 'bg-slate-950/50'}`}>
        <div className={`rounded-xl border overflow-hidden ${
          isHighlight
            ? 'border-purple-500/20'
            : 'border-slate-800/50'
        }`}>
          <InteractiveDiagram
            chart={chart}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30">
            <div className="flex items-start gap-3">
              <MousePointerClick className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 mb-1">
                  Selected Element
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {selectedNode.text || selectedNode.id || 'Unknown'}
                </p>
                {selectedNode.id && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    ID: {selectedNode.id}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
