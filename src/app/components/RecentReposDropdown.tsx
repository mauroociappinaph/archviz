/**
 * RecentReposDropdown Component
 * Dropdown menu for recently analyzed repositories
 */

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { History } from 'lucide-react';

interface RecentReposDropdownProps {
  repos: { url: string; name: string; timestamp: number }[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export function RecentReposDropdown({ repos, onSelect, onClear }: RecentReposDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
          <History className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-700">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
          <span className="text-xs text-slate-400">Recent Repositories</span>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
            Clear
          </Button>
        </div>
        {repos.map((repo, index) => (
          <DropdownMenuItem key={index} onClick={() => onSelect(repo.url)} className="cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 focus:bg-slate-800">
            <div className="flex flex-col">
              <span className="truncate">{repo.name}</span>
              <span className="text-xs text-slate-500 truncate">{repo.url}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
