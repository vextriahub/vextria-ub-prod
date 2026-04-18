import React from 'react';
import { Plus, Trash2, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface AtendimentosPageHeaderProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onNewAtendimento: () => void;
  isNoneSelected: boolean;
  isFiltered: boolean;
  onClearFilter: () => void;
  clientName?: string;
}

export const AtendimentosPageHeader: React.FC<AtendimentosPageHeaderProps> = ({
  selectedCount,
  onDeleteSelected,
  onNewAtendimento,
  isNoneSelected,
  isFiltered,
  onClearFilter,
  clientName
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Filtro ativo */}
      {isFiltered && clientName && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Filtrando por cliente: <strong>{clientName}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
            className="ml-auto h-6 w-6 p-0 text-blue-600 dark:text-blue-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Header principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Atendimentos
            {isFiltered && clientName && (
              <span className="text-lg text-muted-foreground ml-2">
                - {clientName}
              </span>
            )}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie seus atendimentos e agendamentos.
          </p>
        </div>
        
        <div className="flex gap-2">
          <PermissionGuard permission="canDeleteAtendimentos">
            {!isNoneSelected && (
              <Button
                variant="destructive"
                onClick={onDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Selecionados ({selectedCount})
              </Button>
            )}
          </PermissionGuard>
          
          <Button onClick={onNewAtendimento}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Atendimento
          </Button>
        </div>
      </div>
    </div>
  );
};