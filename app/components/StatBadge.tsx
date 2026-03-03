/**
 * StatBadge Component
 * Displays a statistic with an icon
 */

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
}

export function StatBadge({ icon, label }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
