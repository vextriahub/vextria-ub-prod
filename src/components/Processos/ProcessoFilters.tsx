import React from 'react';
import { Filter, Calendar, User, Scale, Hash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProcessoFilters as IProcessoFilters, statusProcesso, areasJuridicas } from '@/types/processo';

interface ProcessoFiltersProps {
  filters: IProcessoFilters;
  onFiltersChange: (filters: IProcessoFilters) => void;
  clientes: string[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const ProcessoFilters: React.FC<ProcessoFiltersProps> = ({
  filters,
  onFiltersChange,
  clientes,
  activeFiltersCount,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof IProcessoFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Filtros específicos - Compact Grid */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro de Cliente */}
        <Select value={filters.cliente} onValueChange={(value) => handleFilterChange('cliente', value)}>
          <SelectTrigger className="w-auto min-w-[160px] h-10 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20">
            <div className="flex items-center gap-2 pr-2">
              <User className="h-3.5 w-3.5 text-primary/60" />
              <SelectValue placeholder="Filtrar por Cliente" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clientes.map((cliente) => (
              <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Área */}
        <Select value={filters.area} onValueChange={(value) => handleFilterChange('area', value)}>
          <SelectTrigger className="w-auto min-w-[140px] h-10 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20">
            <div className="flex items-center gap-2 pr-2">
              <Scale className="h-3.5 w-3.5 text-primary/60" />
              <SelectValue placeholder="Área" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areasJuridicas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Status */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-auto min-w-[140px] h-10 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20">
            <div className="flex items-center gap-2 pr-2">
              <Hash className="h-3.5 w-3.5 text-primary/60" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="all">Todos os status</SelectItem>
            {statusProcesso.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Movimentação */}
        <Select value={filters.movimentacao} onValueChange={(value) => handleFilterChange('movimentacao', value)}>
          <SelectTrigger className="w-auto min-w-[180px] h-10 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20">
            <div className="flex items-center gap-2 pr-2">
              <Calendar className="h-3.5 w-3.5 text-primary/60" />
              <SelectValue placeholder="Última Movimentação" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="all">Todas as datas</SelectItem>
            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
            <SelectItem value="15dias">Últimos 15 dias</SelectItem>
            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão de Limpar */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-10 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            Limpar Filtros ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
};