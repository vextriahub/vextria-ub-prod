import React from 'react';
import { Calendar, FileText, Edit, Trash2, Clock, Building2, MapPin, ChevronRight, MoreHorizontal } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
      case 'ativo':
        return 'border-blue-500/50 text-blue-400 bg-blue-500/5 font-bold';
      case 'Concluído':
      case 'encerrado':
        return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5 font-bold';
      case 'Suspenso':
        return 'border-orange-500/50 text-orange-400 bg-orange-500/5 font-bold';
      default:
        return 'border-muted/30 text-muted-foreground bg-transparent';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'Em andamento': return 'Em andamento';
      case 'encerrado': return 'Encerrado';
      case 'Concluído': return 'Concluído';
      case 'Suspenso': return 'Suspenso';
      default: return status || 'N/A';
    }
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

  const getBarColor = () => {
    switch (processo.status) {
      case 'Em andamento':
      case 'ativo':
        return 'bg-primary';
      case 'Concluído':
      case 'encerrado':
        return 'bg-emerald-500';
      case 'Suspenso':
        return 'bg-orange-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card 
      className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-md group cursor-pointer hover:border-primary/20 transition-all duration-500 rounded-[2rem]"
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-1 h-full opacity-40 group-hover:opacity-100 transition-all duration-500 ${getBarColor()}`} />
      
      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-8">
            {/* Status Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", getStatusColor(processo.status))}>
                {getStatusLabel(processo.status)}
              </Badge>
              {processo.tipoProcesso && (
                <span className="text-[9px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-white/5">
                  {processo.tipoProcesso}
                </span>
              )}
            </div>

            {/* Número do processo */}
            {processo.numeroProcesso && (
              <div className="flex items-center gap-1.5 text-primary/60 font-mono text-[10px] font-semibold mb-2">
                <FileText className="h-3 w-3" />
                <span>{processo.numeroProcesso}</span>
              </div>
            )}

            {/* Título */}
            <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
              {processo.titulo}
            </h3>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/5">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-white/10 rounded-xl w-44 p-1">
                <PermissionGuard permission="canEditProcesses">
                  <DropdownMenuItem onClick={() => onEdit(processo)} className="rounded-lg py-2">
                    <Edit className="mr-2 h-4 w-4 text-blue-400" />
                    <span className="font-medium text-sm">Editar</span>
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission="canDeleteProcesses">
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem 
                    onClick={() => onDelete(processo)}
                    className="rounded-lg py-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="font-medium text-sm">Excluir</span>
                  </DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-5 pt-0 space-y-4">
        {/* Tribunal e Comarca */}
        {(processo.tribunal || processo.comarca) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
            {processo.tribunal && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                <span className="font-medium">{processo.tribunal}</span>
              </div>
            )}
            {processo.comarca && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>{processo.comarca}</span>
              </div>
            )}
          </div>
        )}

        {/* Valor da causa */}
        {processo.valorCausa && processo.valorCausa > 0 && (
          <div className="bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 flex items-center justify-between">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Valor da Causa</span>
            <span className="text-sm font-bold text-emerald-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa)}
            </span>
          </div>
        )}

        {/* Footer: prazo e data */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <Clock className="h-3 w-3" />
            <span>{formatDate(processo.dataInicio) || '—'}</span>
          </div>
          
          {processo.proximoPrazo && (
            <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold",
              isOverdue() ? 'text-red-400' : 'text-orange-400'
            )}>
              <Calendar className="h-3 w-3" />
              <span>Prazo: {formatDate(processo.proximoPrazo)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};