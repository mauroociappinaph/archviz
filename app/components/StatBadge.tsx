/**
 * StatBadge Component
 * Displays a statistic with an icon and customizable styling
 */

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function StatBadge({ icon, label, className = '' }: StatBadgeProps) {
  return (
    <div className={`flex items-center gap-3 text-slate-300 px-4 py-2.5 rounded-xl border ${className || 'bg-slate-800/50 border-slate-700/30'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}
