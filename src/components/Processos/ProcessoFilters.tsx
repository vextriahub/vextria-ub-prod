import React from 'react';
import { Search, Filter, Calendar, User, FileText, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessoFilters as IProcessoFilters, statusProcesso, areasJuridicas } from '@/types/processo';

interface ProcessoFiltersProps {
  filters: IProcessoFilters;
  onFiltersChange: (filters: IProcessoFilters) => void;
  clientes: string[];
  numerosProcesso: string[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const ProcessoFilters: React.FC<ProcessoFiltersProps> = ({
  filters,
  onFiltersChange,
  clientes,
  numerosProcesso,
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
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Primeira linha - Busca geral */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, cliente ou número do processo..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Limpar filtros */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                Limpar ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Segunda linha - Filtros específicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro de Cliente */}
            <Select value={filters.cliente} onValueChange={(value) => handleFilterChange('cliente', value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <SelectValue placeholder="Cliente" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente} value={cliente}>
                    {cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Número do Processo */}
            <Select value={filters.numeroProcesso} onValueChange={(value) => handleFilterChange('numeroProcesso', value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <SelectValue placeholder="Processo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os processos</SelectItem>
                {numerosProcesso.map((numero) => (
                  <SelectItem key={numero} value={numero}>
                    {numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Área */}
            <Select value={filters.area} onValueChange={(value) => handleFilterChange('area', value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  <SelectValue placeholder="Área" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {areasJuridicas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Status */}
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusProcesso.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Movimentação */}
            <Select value={filters.movimentacao} onValueChange={(value) => handleFilterChange('movimentacao', value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="Movimentação" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="15dias">Últimos 15 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};