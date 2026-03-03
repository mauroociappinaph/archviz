/**
 * Export Image Utilities
 * Export diagrams to PNG format
 */

import html2canvas from 'html2canvas';

export interface ExportOptions {
  backgroundColor?: string;
  scale?: number;
  filename?: string;
}

const DEFAULT_OPTIONS: ExportOptions = {
  backgroundColor: '#0a0e1a',
  scale: 2,
};

/**
 * Export an HTML element to PNG
 */
export async function exportToPNG(
  element: HTMLElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: config.backgroundColor,
      scale: config.scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export PNG');
  }
}

/**
 * Export SVG content as a file
 */
export function exportToSVG(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
