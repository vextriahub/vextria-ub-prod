import React from 'react';
import { Calendar, User, FileText, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { Processo } from '@/types/processo';

interface ProcessoCardProps {
  processo: Processo;
  onEdit: (processo: Processo) => void;
  onDelete: (processo: Processo) => void;
  onClienteClick: (clienteId: string) => void;
}

export const ProcessoCard: React.FC<ProcessoCardProps> = ({
  processo,
  onEdit,
  onDelete,
  onClienteClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Suspenso':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = () => {
    if (!processo.proximoPrazo) return false;
    const prazo = new Date(processo.proximoPrazo);
    const hoje = new Date();
    return prazo < hoje;
  };

  const isUpcoming = () => {
    if (!processo.proximoPrazo) return false;
    const prazo = new Date(processo.proximoPrazo);
    const hoje = new Date();
    const diffTime = prazo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Título e Status */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight truncate">
                {processo.titulo}
              </h3>
              <Badge className={getStatusColor(processo.status)}>
                {processo.status}
              </Badge>
            </div>

            {/* Número do processo */}
            {processo.numeroProcesso && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-mono text-xs">{processo.numeroProcesso}</span>
              </div>
            )}

            {/* Cliente */}
            <div className="flex items-center gap-1 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => processo.clienteId && onClienteClick(processo.clienteId)}
                className="text-sm text-primary hover:underline truncate"
                disabled={!processo.clienteId}
              >
                {processo.cliente}
              </button>
            </div>
          </div>

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGuard permission="canEditProcesses">
                <DropdownMenuItem onClick={() => onEdit(processo)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              </PermissionGuard>

              <PermissionGuard permission="canDeleteProcesses">
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(processo)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {/* Tipo do processo */}
          {processo.tipoProcesso && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {processo.tipoProcesso}
              </span>
            </div>
          )}

          {/* Valor da causa */}
          {processo.valorCausa && processo.valorCausa > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                {formatCurrency(processo.valorCausa)}
              </span>
            </div>
          )}
        </div>

        {/* Datas */}
        <div className="space-y-2">
          {/* Data de início */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Iniciado em {formatDate(processo.dataInicio)}</span>
          </div>

          {/* Próximo prazo */}
          {processo.proximoPrazo && (
            <div className={`flex items-center gap-1 text-sm ${
              isOverdue() ? 'text-red-600' : isUpcoming() ? 'text-orange-600' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-4 w-4" />
              <span>
                Próximo prazo: {formatDate(processo.proximoPrazo)}
                {isOverdue() && ' (Vencido)'}
                {isUpcoming() && ' (Próximo)'}
              </span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {processo.descricao && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            <p className="line-clamp-2">{processo.descricao}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};