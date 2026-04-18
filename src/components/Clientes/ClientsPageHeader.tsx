import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface ClientsPageHeaderProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onNewClient: () => void;
  isNoneSelected: boolean;
}

export const ClientsPageHeader: React.FC<ClientsPageHeaderProps> = ({
  selectedCount,
  onDeleteSelected,
  onNewClient,
  isNoneSelected
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie seus clientes e relacionamentos.
        </p>
      </div>
      <div className="flex gap-2">
        <PermissionGuard permission="canDeleteClients">
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
        
        <PermissionGuard permission="canCreateClients">
          <Button onClick={onNewClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
};