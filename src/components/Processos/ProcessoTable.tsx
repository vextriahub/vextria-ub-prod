import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Processo } from '@/types/processo';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, FileText, Building2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { cn } from '@/lib/utils';

interface ProcessoTableProps {
  processos: Processo[];
  onEdit: (processo: Processo) => void;
  onDelete: (processo: Processo) => void;
  onViewDetails: (processo: Processo) => void;
}

export const ProcessoTable: React.FC<ProcessoTableProps> = ({
  processos,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
      case 'ativo':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Concluído':
      case 'encerrado':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Suspenso':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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

  return (
    <div className="rounded-[2rem] border border-white/5 bg-card/30 backdrop-blur-md overflow-hidden shadow-premium">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-5 pl-6">Nº Processo</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-5">Título / Partes</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-5">Tribunal</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-5">Tipo</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-5">Status</TableHead>
              <TableHead className="text-right py-5 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processos.map((processo) => (
              <TableRow 
                key={processo.id} 
                className="group border-white/5 cursor-pointer transition-all duration-300 hover:bg-white/[0.02]"
                onClick={() => onViewDetails(processo)}
              >
                {/* NÚMERO DO PROCESSO */}
                <TableCell className="py-5 pl-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                    <span className="font-mono text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors">
                      {processo.numeroProcesso || '—'}
                    </span>
                  </div>
                </TableCell>

                {/* TÍTULO / PARTES */}
                <TableCell className="py-5">
                  <div className="flex flex-col gap-0.5 max-w-[300px]">
                    <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {processo.titulo}
                    </span>
                    {processo.valorCausa && processo.valorCausa > 0 && (
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa)}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* TRIBUNAL */}
                <TableCell className="py-5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-xs font-medium">{processo.tribunal || '—'}</span>
                    </div>
                    {processo.comarca && (
                      <span className="text-[10px] text-muted-foreground/60 pl-[18px]">{processo.comarca}</span>
                    )}
                  </div>
                </TableCell>

                {/* TIPO */}
                <TableCell className="py-5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {processo.tipoProcesso || '—'}
                  </span>
                </TableCell>

                {/* STATUS */}
                <TableCell className="py-5">
                  <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border", getStatusColor(processo.status))}>
                    {getStatusLabel(processo.status)}
                  </Badge>
                </TableCell>

                {/* AÇÕES */}
                <TableCell className="py-5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-white/10 rounded-xl w-48 p-1">
                      <DropdownMenuItem onClick={() => onViewDetails(processo)} className="rounded-lg cursor-pointer py-2.5">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span className="font-medium text-sm">Ver Detalhes</span>
                      </DropdownMenuItem>
                      <PermissionGuard permission="canEditProcesses">
                        <DropdownMenuItem onClick={() => onEdit(processo)} className="rounded-lg cursor-pointer py-2.5">
                          <Edit className="mr-2 h-4 w-4 text-blue-400" />
                          <span className="font-medium text-sm">Editar</span>
                        </DropdownMenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission="canDeleteProcesses">
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                          onClick={() => onDelete(processo)}
                          className="rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="font-medium text-sm">Excluir</span>
                        </DropdownMenuItem>
                      </PermissionGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer com contagem */}
      <div className="px-6 py-3 border-t border-white/5 text-center">
        <span className="text-[11px] text-muted-foreground/60 font-medium">
          Mostrando {processos.length} de {processos.length} processo(s)
        </span>
      </div>
    </div>
  );
};
