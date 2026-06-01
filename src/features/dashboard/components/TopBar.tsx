import React from 'react';
import { Plus, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  onAction?: () => void;
  actionLabel?: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title, onAction, actionLabel, onMenuClick }: TopBarProps) {
  return (
    <header className="h-20 bg-white border-b border-outline-variant px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        {onMenuClick && (
          <Button 
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-primary-navy"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-sm lg:text-lg font-bold text-primary-navy truncate uppercase tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-6 ml-auto shrink-0">
        {onAction && actionLabel && (
          <Button 
            onClick={onAction}
            className="bg-primary-navy text-white hover:bg-primary-navy/90 h-10 px-4"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </header>
  );
}
