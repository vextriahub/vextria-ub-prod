import React from 'react';
import { Users, Trash2 } from 'lucide-react';
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
  onDeleteClient?: (clientId: number) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isSelected,
  onToggleSelect,
  onClientClick,
  onEditClient,
  onViewProcesses,
  onViewAtendimentos,
  onViewConsultivo,
  onDeleteClient
}) => {
  return (
    <Card className={`relative bg-black/20 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-white/10 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 overflow-hidden group ${
      isSelected ? "ring-2 ring-primary border-primary/50" : ""
    }`}>
      {isSelected && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-2xl rounded-full" />}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(client.id)}
            className="mt-1"
          />
          <div className="flex items-center gap-4 relative z-10 w-full pr-2">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/50 group-hover:text-white/80 border border-white/5'}`}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start w-full">
                <CardTitle 
                  className="text-lg font-bold text-white/90 cursor-pointer hover:text-primary transition-colors truncate"
                  onClick={() => onClientClick(client)}
                >
                  {client.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {onDeleteClient && (
                    <PermissionGuard permission="canEditClients">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClient(client.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </PermissionGuard>
                  )}
                  <Badge className={`text-[10px] uppercase font-bold tracking-wider ${client.status === "ativo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10"}`} variant="outline">
                    {client.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-white/40 font-medium truncate">{client.email || 'Sem e-mail'}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2 relative z-10">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
            <span className="text-white/30 text-[11px] uppercase tracking-widest font-bold">
              {client.tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
            </span>
            <span className="text-white/80 font-mono text-xs">{client.cpfCnpj || '---'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
            <span className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Telefone</span>
            <span className="text-white/80 font-mono text-xs">{client.phone || '---'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
            <span className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Origem</span>
            <span className="text-white/60">{client.origem || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
            <span className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Processos</span>
            <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {client.cases}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Cadastrado</span>
            <span className="text-white/50 text-xs">{(client as any).createdAt ? new Date((client as any).createdAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-white/5">
          <PermissionGuard permission="canViewProcesses">
            <Button 
              size="sm" 
              className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-bold transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onViewProcesses(client.id, client.name);
              }}
            >
              Jurídico
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="canViewAtendimentos">
            <Button 
              size="sm" 
              className="w-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 font-medium transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onViewAtendimentos(client.id, client.name);
              }}
            >
              Atendimentos
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="canViewConsultivo">
            <Button 
              size="sm" 
              className="w-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 font-medium transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onViewConsultivo(client.id, client.name);
              }}
            >
              Consultivo
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="canEditClients">
            <Button 
              size="sm" 
              className="w-full bg-transparent hover:bg-white/5 text-white/40 hover:text-white border border-transparent font-medium transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEditClient(client.id);
              }}
            >
              Editar Ficha
            </Button>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
};