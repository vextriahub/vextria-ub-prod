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
import { MoreHorizontal, Edit, Trash2, Scale, User, Building2, MapPin, ExternalLink } from 'lucide-react';
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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Concluído':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Suspenso':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/5 bg-card/30 backdrop-blur-md overflow-hidden shadow-premium">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[200px] text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-6 pl-8">Número do Processo</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-6">Autor</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-6">Réu</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-6">Tribunal / Comarca</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-6">Fase / Status</TableHead>
              <TableHead className="text-right py-6 pr-8"></TableHead>
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
                <TableCell className="py-6 pl-8">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-bold text-primary group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all">
                      {processo.numeroProcesso || 'NÃO IDENTIFICADO'}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] uppercase font-bold tracking-tighter">ID: {processo.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>

                {/* AUTOR */}
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-bold text-sm truncate">{processo.titulo}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Parte Ativa</span>
                    </div>
                  </div>
                </TableCell>

                {/* RÉU */}
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Scale className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-bold text-sm truncate">{processo.requerido || 'NÃO IDENTIFICADO'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Parte Passiva</span>
                    </div>
                  </div>
                </TableCell>

                {/* TRIBUNAL / COMARCA */}
                <TableCell className="py-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{processo.tribunal || 'TJSP'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground font-medium">{processo.comarca || 'Comarca não inf.'}</span>
                    </div>
                  </div>
                </TableCell>

                {/* FASE / STATUS */}
                <TableCell className="py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{processo.faseProcessual || 'Fase Inicial'}</span>
                    </div>
                    <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border", getStatusColor(processo.status))}>
                      {processo.status}
                    </Badge>
                  </div>
                </TableCell>

                {/* AÇÕES */}
                <TableCell className="py-6 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10 rounded-2xl w-52 p-2">
                      <DropdownMenuItem onClick={() => onViewDetails(processo)} className="rounded-xl cursor-pointer py-3 hover:bg-primary/10 transition-colors">
                        <ExternalLink className="mr-3 h-4 w-4" />
                        <span className="font-semibold">Ver Detalhes</span>
                      </DropdownMenuItem>
                      <PermissionGuard permission="canEditProcesses">
                        <DropdownMenuItem onClick={() => onEdit(processo)} className="rounded-xl cursor-pointer py-3 hover:bg-primary/10 transition-colors">
                          <Edit className="mr-3 h-4 w-4 text-blue-500" />
                          <span className="font-semibold">Editar</span>
                        </DropdownMenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission="canDeleteProcesses">
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                          onClick={() => onDelete(processo)}
                          className="rounded-xl cursor-pointer py-3 text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          <span className="font-semibold">Excluir</span>
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
    </div>
  );
};
