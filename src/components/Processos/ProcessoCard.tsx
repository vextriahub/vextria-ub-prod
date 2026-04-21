import React from 'react';
import { Calendar, User, FileText, Edit, Trash2, Scale, Clock, Building2, MapPin, ChevronRight } from 'lucide-react';
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
        return 'border-blue-500/50 text-blue-500 bg-blue-500/5 font-bold';
      case 'Concluído':
        return 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5 font-bold';
      case 'Suspenso':
        return 'border-orange-500/50 text-orange-500 bg-orange-500/5 font-bold';
      default:
        return 'border-muted/30 text-muted-foreground bg-transparent';
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

  return (
    <Card 
      className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-md group cursor-pointer hover:border-primary/20 transition-all duration-500 rounded-[2.5rem] shadow-premium"
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full opacity-40 group-hover:opacity-100 transition-all duration-500 ${
        processo.status === 'Em andamento' ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 
        processo.status === 'Concluído' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
        processo.status === 'Suspenso' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-muted'
      }`} />
      
      <CardHeader className="pb-3 pt-6 px-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest leading-none", getStatusColor(processo.status))}>
                {processo.status}
              </Badge>
              <span className="text-[9px] bg-white/5 text-white/60 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-white/5">
                {processo.faseProcessual || 'Fase Inicial'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold tracking-tight mb-2">
                <FileText className="h-3 w-3" />
                <span>{processo.numeroProcesso || 'NÃO IDENTIFICADO'}</span>
              </div>
              <h3 className="font-extrabold text-lg md:text-xl leading-tight group-hover:text-primary transition-colors pr-8">
                {processo.titulo}
              </h3>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="absolute top-6 right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-white/5">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/10 rounded-2xl w-48 p-2">
                <PermissionGuard permission="canEditProcesses">
                  <DropdownMenuItem onClick={() => onEdit(processo)} className="rounded-xl py-2.5">
                    <Edit className="mr-3 h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-sm">Editar</span>
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission="canDeleteProcesses">
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem 
                    onClick={() => onDelete(processo)}
                    className="rounded-xl py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    <span className="font-semibold text-sm">Excluir</span>
                  </DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8 pt-2 space-y-6">
        {/* PARTE CONTRÁRIA */}
        <div className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Scale className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Parte Contrária (Réu)</p>
              <p className="text-sm font-bold truncate text-foreground/90">{processo.requerido || 'Não identificado'}</p>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5 pl-2">
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
              <Building2 className="h-3 w-3 opacity-50" /> Tribunal
            </p>
            <p className="text-xs font-bold truncate">{processo.tribunal || 'TJSP'}</p>
          </div>
          
          <div className="space-y-1.5 border-l border-white/5 pl-6">
            <p className={cn("text-[9px] uppercase font-bold tracking-widest flex items-center gap-2", 
              isOverdue() ? 'text-red-500' : 'text-muted-foreground'
            )}>
              <Calendar className="h-3 w-3 opacity-50" /> Próximo Prazo
            </p>
            <p className={cn("text-xs font-bold", isOverdue() ? 'text-red-500' : 'text-foreground')}>
              {processo.proximoPrazo ? formatDate(processo.proximoPrazo) : '—'}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
             <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
               <User className="h-3.5 w-3.5 text-primary" />
             </div>
             <button
              onClick={(e) => {
                e.stopPropagation();
                processo.clienteId && onClienteClick(processo.clienteId);
              }}
              className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {processo.cliente || 'Sem Cliente'}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground/60 flex items-center gap-2 font-medium">
            <Clock className="h-3 w-3" />
            {formatDate(processo.dataInicio)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};