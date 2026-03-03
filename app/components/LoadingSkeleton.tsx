/**
 * LoadingSkeleton Component
 * Shown while analyzing repository
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <div className="h-8 w-64 bg-slate-800 rounded animate-shimmer" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-shimmer mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
            <div className="h-6 w-32 bg-slate-800 rounded animate-shimmer" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="py-12">
          <div className="h-64 w-full bg-slate-800 rounded animate-shimmer" />
        </CardContent>
      </Card>
    </div>
  );
}
