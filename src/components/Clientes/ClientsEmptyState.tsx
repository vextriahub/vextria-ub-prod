import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface ClientsEmptyStateProps {
  onNewClient: () => void;
  onLoadSampleData: () => void;
}

export const ClientsEmptyState: React.FC<ClientsEmptyStateProps> = ({
  onNewClient,
  onLoadSampleData
}) => {
  return (
    <Card className="border-dashed border-2 p-8">
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
        <Users className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground">
            Você ainda não possui clientes cadastrados. Comece adicionando seu primeiro cliente ou carregue dados de exemplo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <PermissionGuard permission="canCreateClients">
            <Button onClick={onNewClient}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </PermissionGuard>
          <Button variant="outline" onClick={onLoadSampleData}>
            Carregar Dados de Exemplo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};