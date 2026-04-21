import React from 'react';
import { Client } from '@/types/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Scale, Activity, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClientsTableProps {
  clients: Client[];
  selectedIds: string[];
  onToggleSelect: (clientId: string) => void;
  onClientClick: (client: Client) => void;
  onEditClient: (clientId: string) => void;
  onViewProcesses: (clientId: string, clientName: string) => void;
  onViewAtendimentos: (clientId: string, clientName: string) => void;
  onViewConsultivo: (clientId: string, clientName: string) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  selectedIds,
  onToggleSelect,
  onClientClick,
  onEditClient,
  onViewProcesses,
  onViewAtendimentos,
  onViewConsultivo
}) => {
  return (
    <div className="rounded-md border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/5 hover:bg-white/5">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Métricas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const isSelected = selectedIds.includes(client.id);
            
            return (
              <TableRow 
                key={client.id} 
                className={`border-b border-white/5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-orange-500/10 hover:bg-orange-500/20' : 'hover:bg-white/5'
                }`}
                onClick={(e) => {
                  // Prevent click if clicking on actions or checkbox
                  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.checkbox-cell')) {
                    return;
                  }
                  onClientClick(client);
                }}
              >
                <TableCell className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(client.id)}
                    className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                </TableCell>
                
                <TableCell>
                  <span className="font-medium text-white block">{client.name}</span>
                  <span className="text-xs text-white/50">{client.cpfCnpj}</span>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm text-white/80 block">{client.email || 'Sem e-mail'}</span>
                  <span className="text-xs text-white/50">{client.phone || 'Sem telefone'}</span>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className={`
                    bg-transparent font-medium border
                    ${client.tipoPessoa === 'juridica' 
                      ? 'border-indigo-500/30 text-indigo-400' 
                      : 'border-orange-500/30 text-orange-400'}
                  `}>
                    {client.tipoPessoa === 'juridica' ? 'PJ' : 'PF'}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Scale className="h-3.5 w-3.5 text-white/50" />
                    <span className="text-sm text-white/80">{client.cases || 0} processos</span>
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] bg-[#1a1b1e] border-white/10">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onEditClient(client.id); }}
                        className="text-white hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Editar Dados
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onViewProcesses(client.id, client.name); }}
                        className="text-white hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Scale className="h-4 w-4 mr-2" /> Acessar Processos
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onViewAtendimentos(client.id, client.name); }}
                        className="text-white hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Activity className="h-4 w-4 mr-2" /> Acessar C.R.M
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onViewConsultivo(client.id, client.name); }}
                        className="text-white hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <FileText className="h-4 w-4 mr-2" /> Acessar Consultivo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
