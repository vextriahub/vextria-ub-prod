import React from 'react';
import { Client } from '@/types/client';
import { ClientCard } from './ClientCard';

interface ClientsGridProps {
  clients: Client[];
  selectedIds: number[];
  onToggleSelect: (clientId: number) => void;
  onClientClick: (client: Client) => void;
  onEditClient: (clientId: number) => void;
  onViewProcesses: (clientId: number, clientName: string) => void;
  onViewAtendimentos: (clientId: number, clientName: string) => void;
  onViewConsultivo: (clientId: number, clientName: string) => void;
}

export const ClientsGrid: React.FC<ClientsGridProps> = ({
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
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          isSelected={selectedIds.includes(client.id)}
          onToggleSelect={onToggleSelect}
          onClientClick={onClientClick}
          onEditClient={onEditClient}
          onViewProcesses={onViewProcesses}
          onViewAtendimentos={onViewAtendimentos}
          onViewConsultivo={onViewConsultivo}
        />
      ))}
    </div>
  );
};