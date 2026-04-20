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
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

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
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Suspenso':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Processo</TableHead>
            <TableHead>Valor da Causa</TableHead>
            <TableHead>Fase Processual</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processos.map((processo) => (
            <TableRow 
              key={processo.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewDetails(processo)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{processo.titulo}</span>
                  <span className="text-xs text-muted-foreground font-mono">{processo.numeroProcesso || 'Sem número'}</span>
                </div>
              </TableCell>
              <TableCell>
                {processo.valorCausa ? (
                  <span className="font-medium text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa)}
                  </span>
                ) : '---'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal bg-slate-100">
                  {processo.faseProcessual || 'Fase Inicial'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {processo.responsavelNome?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm">{processo.responsavelNome || 'Não atribuído'}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(processo.status)}>
                  {processo.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(processo)}>
                      Visualizar Detalhes
                    </DropdownMenuItem>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
