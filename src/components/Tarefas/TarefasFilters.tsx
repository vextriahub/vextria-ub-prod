import React from 'react';
import { Search, Filter, Star, CheckCircle, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TarefasFiltersProps {
  searchValue: string;
  priorityFilter: string;
  statusFilter: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const TarefasFilters: React.FC<TarefasFiltersProps> = ({
  searchValue,
  priorityFilter,
  statusFilter,
  sortBy,
  onSearchChange,
  onPriorityFilterChange,
  onStatusFilterChange,
  onSortChange,
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
            placeholder="Buscar tarefas por título, cliente ou processo..."
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

      {/* Segunda linha - Filtros e Ordenação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Prioridade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="concluida">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Ordenar por" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="dueDate">Data de Entrega</SelectItem>
              <SelectItem value="points">Pontuação</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Minha Lista
          </Button>
        </div>
      </div>
    </div>
  );
};