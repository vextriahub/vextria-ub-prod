import React from 'react';
import { Search, Filter, Calendar, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AtendimentosFiltersProps {
  searchValue: string;
  statusFilter: string;
  tipoFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTipoFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const AtendimentosFilters: React.FC<AtendimentosFiltersProps> = ({
  searchValue,
  statusFilter,
  tipoFilter,
  onSearchChange,
  onStatusFilterChange,
  onTipoFilterChange,
  onClearFilters,
  activeFiltersCount
}) => {
  return (
    <div className="space-y-4">
      {/* Primeira linha - Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, tipo, observações..."
            className="pl-10"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="whitespace-nowrap"
          >
            Limpar Filtros
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Segunda linha - Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Agendado">Agendado</SelectItem>
              <SelectItem value="Confirmado">Confirmado</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={tipoFilter} onValueChange={onTipoFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Presencial">Presencial</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Telefone">Telefone</SelectItem>
              <SelectItem value="Consultoria">Consultoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};