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
  onClick?: () => void;
}

export const ProcessoCard: React.FC<ProcessoCardProps> = ({
  processo,
  onEdit,
  onDelete,
  onClienteClick,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'border-blue-500/50 text-blue-500 bg-transparent font-bold';
      case 'Concluído':
        return 'border-emerald-500/50 text-emerald-500 bg-transparent font-bold';
      case 'Suspenso':
        return 'border-orange-500/50 text-orange-500 bg-transparent font-bold';
      default:
        return 'border-muted/30 text-muted-foreground bg-transparent';
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
    <Card 
      className="hover-lift overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm group cursor-pointer"
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full opacity-60 transition-opacity group-hover:opacity-100 ${
        processo.status === 'Em andamento' ? 'bg-primary' : 
        processo.status === 'Concluído' ? 'bg-emerald-500' : 
        processo.status === 'Suspenso' ? 'bg-orange-500' : 'bg-muted'
      }`} />
      
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", getStatusColor(processo.status))}>
                {processo.status}
              </Badge>
              {processo.tipoProcesso && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {processo.faseProcessual || processo.tipoProcesso || 'Cível'}
                </span>
              )}
            </div>

            <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors mb-1">
              {processo.titulo}
            </h3>

            {processo.numeroProcesso && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 w-fit px-2 py-0.5 rounded">
                <FileText className="h-3 w-3" />
                <span>{processo.numeroProcesso}</span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                <span className="sr-only">Abrir menu</span>
                <span className="text-xl leading-none">⋮</span>
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

      <CardContent className="px-6 pb-6 pt-0 space-y-4">
        <div className="flex items-center gap-3 py-3 border-y border-white/5">
          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
            <User className="h-5 w-5 text-primary/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cliente</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                processo.clienteId && onClienteClick(processo.clienteId);
              }}
              className="text-sm font-semibold truncate hover:text-primary transition-colors"
              disabled={!processo.clienteId}
            >
              {processo.cliente}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
              <Clock className="h-3 w-3" /> Início
            </p>
            <p className="text-sm font-medium">{formatDate(processo.dataInicio)}</p>
          </div>
          
          <div className="space-y-1">
            <p className={cn("text-[10px] uppercase font-bold tracking-widest flex items-center gap-1", 
              isOverdue() ? 'text-red-500' : isUpcoming() ? 'text-orange-500' : 'text-muted-foreground'
            )}>
              <Calendar className="h-3 w-3" /> Próximo Prazo
            </p>
            <p className={cn("text-sm font-medium",
              isOverdue() ? 'text-red-600' : isUpcoming() ? 'text-orange-600' : 'text-foreground'
            )}>
              {processo.proximoPrazo ? formatDate(processo.proximoPrazo) : '—'}
            </p>
          </div>
        </div>

        {processo.valorCausa && processo.valorCausa > 0 && (
          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Valor da Causa</span>
            <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(processo.valorCausa)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};