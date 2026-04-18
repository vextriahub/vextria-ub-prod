
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ClientsAdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const ClientsAdvancedFilters = ({ onFiltersChange, onClearFilters }: ClientsAdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    tipoPessoa: "",
    origem: "",
    status: "",
    dataInicioFrom: undefined as Date | undefined,
    dataInicioTo: undefined as Date | undefined,
    hasProcessos: "",
    hasAtendimentos: ""
  });

  const origensCliente = [
    "Indicação",
    "Site",
    "Redes Sociais",
    "Marketing Digital",
    "Parcerias",
    "Evento",
    "Outros"
  ];

  const statusCliente = [
    "ativo",
    "inativo",
    "prospecto",
    "ex-cliente"
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      tipoPessoa: "",
      origem: "",
      status: "",
      dataInicioFrom: undefined,
      dataInicioTo: undefined,
      hasProcessos: "",
      hasAtendimentos: ""
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== "" && value !== undefined
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avançados</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <Select
                value={filters.tipoPessoa}
                onValueChange={(value) => handleFilterChange("tipoPessoa", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={filters.origem}
                onValueChange={(value) => handleFilterChange("origem", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as origens</SelectItem>
                  {origensCliente.map((origem) => (
                    <SelectItem key={origem} value={origem}>
                      {origem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {statusCliente.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Cadastro</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.dataInicioFrom && "text-muted-foreground"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dataInicioFrom ? (
                        format(filters.dataInicioFrom, "dd/MM/yy")
                      ) : (
                        "De"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dataInicioFrom}
                      onSelect={(date) => handleFilterChange("dataInicioFrom", date)}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.dataInicioTo && "text-muted-foreground"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dataInicioTo ? (
                        format(filters.dataInicioTo, "dd/MM/yy")
                      ) : (
                        "Até"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dataInicioTo}
                      onSelect={(date) => handleFilterChange("dataInicioTo", date)}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tem Processos</Label>
              <Select
                value={filters.hasProcessos}
                onValueChange={(value) => handleFilterChange("hasProcessos", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Indiferente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Indiferente</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tem Atendimentos</Label>
              <Select
                value={filters.hasAtendimentos}
                onValueChange={(value) => handleFilterChange("hasAtendimentos", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Indiferente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Indiferente</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
