import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ClientsSelectionControlsProps {
  isAllSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const ClientsSelectionControls: React.FC<ClientsSelectionControlsProps> = ({
  isAllSelected,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={() => 
            isAllSelected ? onClearSelection() : onSelectAll()
          }
        />
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            `${selectedCount} de ${totalCount} selecionado(s)`
          ) : (
            "Selecionar todos"
          )}
        </span>
      </div>
      {selectedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
        >
          Limpar seleção
        </Button>
      )}
    </div>
  );
};