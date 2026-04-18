import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Client } from '@/types/client';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface ClientCardProps {
  client: Client;
  isSelected: boolean;
  onToggleSelect: (clientId: number) => void;
  onClientClick: (client: Client) => void;
  onEditClient: (clientId: number) => void;
  onViewProcesses: (clientId: number, clientName: string) => void;
  onViewAtendimentos: (clientId: number, clientName: string) => void;
  onViewConsultivo: (clientId: number, clientName: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isSelected,
  onToggleSelect,
  onClientClick,
  onEditClient,
  onViewProcesses,
  onViewAtendimentos,
  onViewConsultivo
}) => {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      isSelected ? "ring-2 ring-primary" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(client.id)}
            className="mt-1"
          />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle 
                className="text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => onClientClick(client)}
              >
                {client.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          </div>
          <Badge variant={client.status === "ativo" ? "default" : "secondary"}>
            {client.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {client.tipoPessoa === "fisica" ? "CPF:" : "CNPJ:"}
          </span>
          <span>{client.cpfCnpj}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Telefone:</span>
          <span>{client.phone}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Origem:</span>
          <span>{client.origem}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Processos:</span>
          <span>{client.cases}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Último contato:</span>
          <span>{client.lastContact}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 pt-2">
          <div className="flex gap-2">
            <PermissionGuard permission="canEditClients">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClient(client.id);
                }}
              >
                Editar
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="canViewProcesses">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProcesses(client.id, client.name);
                }}
              >
                Ver Processos
              </Button>
            </PermissionGuard>
          </div>
          <div className="flex gap-2">
            <PermissionGuard permission="canViewAtendimentos">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAtendimentos(client.id, client.name);
                }}
              >
                Ver Atendimentos
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="canViewConsultivo">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewConsultivo(client.id, client.name);
                }}
              >
                Consultivo
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};