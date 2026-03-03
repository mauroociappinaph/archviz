/**
 * API Route for Repository Analysis
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/analyzer';
import { generateDiagrams } from '@/lib/diagrams';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Validate GitHub URL
    if (!repoUrl.includes('github.com')) {
      return NextResponse.json(
        { error: 'Only GitHub repositories are supported' },
        { status: 400 }
      );
    }

    // Analyze the repository
    const analysis = await analyzeRepository(repoUrl);

    // Generate diagrams
    const diagrams = generateDiagrams(analysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        diagrams,
      },
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
