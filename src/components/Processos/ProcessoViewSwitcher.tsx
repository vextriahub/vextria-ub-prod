import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProcessoViewSwitcherProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export const ProcessoViewSwitcher: React.FC<ProcessoViewSwitcherProps> = ({
  view,
  onViewChange
}) => {
  return (
    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
      <ToggleGroup 
        type="single" 
        value={view} 
        onValueChange={(value) => value && onViewChange(value as 'grid' | 'table')}
        className="justify-start"
      >
        <ToggleGroupItem value="grid" aria-label="Vista em Grid" title="Vista em Grid">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Vista em Tabela" title="Vista em Tabela">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <span className="hidden md:inline-block text-xs text-muted-foreground px-2 font-medium">
        {view === 'grid' ? 'Vista em Cards' : 'Vista em Tabela'}
      </span>
    </div>
  );
};
