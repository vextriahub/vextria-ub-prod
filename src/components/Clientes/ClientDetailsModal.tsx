import React from 'react';
import { User, Building, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClient: (clientId: number) => void;
  onViewProcesses: (clientId: number, clientName: string) => void;
  onViewAtendimentos: (clientId: number, clientName: string) => void;
  onViewConsultivo: (clientId: number, clientName: string) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  isOpen,
  onClose,
  onEditClient,
  onViewProcesses,
  onViewAtendimentos,
  onViewConsultivo
}) => {
  if (!client) return null;

  const handleEditClick = () => {
    onClose();
    onEditClient(client.id);
  };

  const handleViewProcesses = () => {
    onClose();
    onViewProcesses(client.id, client.name);
  };

  const handleViewAtendimentos = () => {
    onClose();
    onViewAtendimentos(client.id, client.name);
  };

  const handleViewConsultivo = () => {
    onClose();
    onViewConsultivo(client.id, client.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {client.tipoPessoa === "fisica" ? (
              <User className="h-5 w-5" />
            ) : (
              <Building className="h-5 w-5" />
            )}
            {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            <Badge variant={client.status === "ativo" ? "default" : "secondary"}>
              {client.status}
            </Badge>
            <Badge variant="outline">
              {client.tipoPessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Informações de Contato</h3>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.endereco}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Detalhes</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {client.tipoPessoa === "fisica" ? "CPF:" : "CNPJ:"}
                </span>
                <span>{client.cpfCnpj}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Origem:</span>
                <span>{client.origem}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processos:</span>
                <span>{client.cases}</span>
              </div>
              {client.dataAniversario && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Aniversário: {new Date(client.dataAniversario).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <PermissionGuard permission="canEditClients">
              <Button variant="outline" onClick={handleEditClick}>
                Editar Cliente
              </Button>
            </PermissionGuard>
            
            <PermissionGuard permission="canViewProcesses">
              <Button onClick={handleViewProcesses}>
                Ver Processos
              </Button>
            </PermissionGuard>
            
            <PermissionGuard permission="canViewAtendimentos">
              <Button variant="secondary" onClick={handleViewAtendimentos}>
                Ver Atendimentos
              </Button>
            </PermissionGuard>
            
            <PermissionGuard permission="canViewConsultivo">
              <Button variant="secondary" onClick={handleViewConsultivo}>
                Consultivo
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};