/**
 * API Route for Repository Analysis (Clean Architecture)
 * POST /api/analyze
 *
 * This route uses the Clean Architecture implementation
 * with proper separation of concerns and dependency injection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/config/Container';
import { AnalysisController } from '@/interface/http/AnalysisController';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Get controller from DI container
    const controller = new AnalysisController(
      container.get('analyzeUseCase'),
      container.get('relationshipsUseCase'),
      container.get('exportUseCase')
    );

    // Execute analysis using Clean Architecture
    const result = await controller.analyzeRepository(repoUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Failed to analyze repository: ${errorMessage}` },
      { status: 500 }
    );
  }
}
