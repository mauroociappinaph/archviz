'use client';

/**
 * Interactive Diagram Component
 * Adds zoom, pan, and click interactions to Mermaid diagrams
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { MermaidDiagram } from './MermaidDiagram';
import { ZoomIn, ZoomOut, Move, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveDiagramProps {
  chart: string;
  className?: string;
  onNodeClick?: (node: { id: string | null; text: string | null }) => void;
}

export function InteractiveDiagram({
  chart,
  className = '',
  onNodeClick
}: InteractiveDiagramProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.3));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setSelectedNode(null);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging if clicking on the container background, not on nodes
    const target = e.target as HTMLElement;
    if (target.closest('.node') || target.closest('button')) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while panning

    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.3, Math.min(4, prev + delta)));
    }
  }, []);

  // Node click interaction
  useEffect(() => {
    if (!diagramRef.current) return;

    const handleNodeClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.node');

      if (node) {
        e.stopPropagation();
        const nodeId = node.getAttribute('id');
        const nodeText = node.textContent;

        // Remove previous selection
        document.querySelectorAll('.node.selected').forEach(n => {
          n.classList.remove('selected');
        });

        // Add selection to clicked node
        node.classList.add('selected');
        setSelectedNode(nodeId);

        onNodeClick?.({ id: nodeId, text: nodeText });
      }
    };

    // Add hover effects
    const handleNodeMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.node');
      if (node) {
        (node as HTMLElement).style.filter = 'brightness(1.3)';
        (node as HTMLElement).style.cursor = 'pointer';
      }
    };

    const handleNodeMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.node');
      if (node) {
        (node as HTMLElement).style.filter = '';
      }
    };

    const container = diagramRef.current;
    container.addEventListener('click', handleNodeClick);
    container.addEventListener('mouseover', handleNodeMouseEnter);
    container.addEventListener('mouseout', handleNodeMouseLeave);

    return () => {
      container.removeEventListener('click', handleNodeClick);
      container.removeEventListener('mouseover', handleNodeMouseEnter);
      container.removeEventListener('mouseout', handleNodeMouseLeave);
    };
  }, [chart, onNodeClick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond if container is focused or hovered
      if (!containerRef.current?.matches(':hover')) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleReset();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          setSelectedNode(null);
          document.querySelectorAll('.node.selected').forEach(n => {
            n.classList.remove('selected');
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset, isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? 'bg-slate-900' : ''} ${className}`}
      tabIndex={0}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/80 hover:border-amber-500/30 transition-all duration-200"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-slate-300" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/80 hover:border-amber-500/30 transition-all duration-200"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-slate-300" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/80 hover:border-amber-500/30 transition-all duration-200"
            title="Reset (Ctrl+0)"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/80 hover:border-amber-500/30 transition-all duration-200"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-slate-300" />
          ) : (
            <Maximize className="w-4 h-4 text-slate-300" />
          )}
        </Button>
      </div>

      {/* Drag indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm text-xs text-slate-400 z-10">
        <Move className="w-3 h-3" />
        <span>Drag to pan • Scroll + Ctrl to zoom</span>
      </div>

      {/* Diagram Container */}
      <div
        ref={diagramRef}
        className={`overflow-hidden cursor-grab active:cursor-grabbing ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{
          height: isFullscreen ? '100vh' : '500px',
          minHeight: '400px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <MermaidDiagram chart={chart} />
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-slate-800/90 backdrop-blur-sm text-sm text-slate-300 border border-slate-700/50">
        {Math.round(scale * 100)}%
      </div>

      {/* Node Selection Indicator */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-400">
          Selected: {selectedNode}
        </div>
      )}
    </div>
  );
}
