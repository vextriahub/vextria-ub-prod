import React from 'react';
import { UserCheck, Calendar, Clock, User, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Atendimento } from '@/types/atendimento';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface AtendimentoCardProps {
  atendimento: Atendimento;
  isSelected: boolean;
  onToggleSelect: (atendimentoId: string) => void;
  onEditAtendimento: (atendimentoId: string) => void;
  onNavigateToClient: (clientId: number, clientName: string) => void;
  onNavigateToProcesses: (clientId: number, clientName: string) => void;
  getStatusColor: (status: string) => string;
}

export const AtendimentoCard: React.FC<AtendimentoCardProps> = ({
  atendimento,
  isSelected,
  onToggleSelect,
  onEditAtendimento,
  onNavigateToClient,
  onNavigateToProcesses,
  getStatusColor
}) => {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      isSelected ? "ring-2 ring-primary" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(atendimento.id)}
            className="mt-1"
          />
          <div className="flex items-center gap-3 flex-1 ml-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {atendimento.cliente}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                {atendimento.tipo}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(atendimento.status)}>
            {atendimento.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{atendimento.data}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{atendimento.horario} ({atendimento.duracao})</span>
          </div>
        </div>

        {/* Observações */}
        {atendimento.observacoes && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
            <p className="line-clamp-2">{atendimento.observacoes}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <PermissionGuard permission="canEditAtendimentos">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditAtendimento(atendimento.id)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </PermissionGuard>
          
          <PermissionGuard permission="canViewClients">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToClient(atendimento.clienteId, atendimento.cliente)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Ver Cliente
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="canViewProcesses">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateToProcesses(atendimento.clienteId, atendimento.cliente)}
              className="text-xs"
            >
              Processos
            </Button>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
};