/**
 * Export PDF Utilities
 * Export diagrams to PDF format
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  backgroundColor?: string;
}

const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  orientation: 'landscape',
  format: 'a4',
  backgroundColor: '#0a0e1a',
};

/**
 * Export multiple diagrams to a single PDF
 */
export async function exportToPDF(
  diagrams: Array<{
    element: HTMLElement;
    title: string;
  }>,
  options: PDFExportOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_OPTIONS, ...options };

  // Create PDF with orientation
  const pdf = new jsPDF({
    orientation: config.orientation,
    unit: 'mm',
    format: config.format,
  });

  let yPosition = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  if (config.title) {
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text(config.title, margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;
  }

  // Export each diagram
  for (let i = 0; i < diagrams.length; i++) {
    const { element, title } = diagrams[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 50 && i > 0) {
      pdf.addPage();
      yPosition = margin;
    }

    // Diagram title
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text(title, margin, yPosition);
    yPosition += 10;

    // Capture diagram
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: config.backgroundColor,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page
      if (yPosition + imgHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 20;
    } catch (error) {
      console.error(`Error capturing diagram "${title}":`, error);
      pdf.setTextColor(255, 100, 100);
      pdf.text(`Error: Could not capture ${title}`, margin, yPosition);
      yPosition += 10;
    }
  }

  // Save PDF
  const filename = config.title
    ? `${config.title.replace(/\s+/g, '_')}_architecture.pdf`
    : 'architecture_diagrams.pdf';

  pdf.save(filename);
}

/**
 * Export a single diagram to PDF
 */
export async function exportSingleDiagramToPDF(
  element: HTMLElement,
  title: string,
  options: PDFExportOptions = {}
): Promise<void> {
  await exportToPDF([{ element, title }], { ...options, title });
}
