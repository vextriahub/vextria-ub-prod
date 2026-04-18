import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Processo, statusProcesso, tiposProcesso } from '@/types/processo';

interface ProcessoEditDialogProps {
  processo: Processo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (processoAtualizado: Processo) => void;
}

export const ProcessoEditDialog: React.FC<ProcessoEditDialogProps> = ({
  processo,
  open,
  onOpenChange,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Processo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar formData quando processo mudar
  useEffect(() => {
    if (processo) {
      setFormData({ ...processo });
    }
  }, [processo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;

    // Validação básica
    if (!formData.titulo.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cliente.trim()) {
      toast({
        title: "Erro de validação", 
        description: "O cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Processar valor da causa
      const processoAtualizado = {
        ...formData,
        valorCausa: formData.valorCausa || 0
      };

      onSave(processoAtualizado);
      onOpenChange(false);
      
      toast({
        title: "Processo atualizado",
        description: "O processo foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o processo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Processo, value: string | number) => {
    if (!formData) return;
    
    setFormData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Processo</DialogTitle>
          <DialogDescription>
            Atualize as informações do processo jurídico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Ação Trabalhista - Cliente X"
              required
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Input
              id="cliente"
              value={formData.cliente}
              onChange={(e) => handleChange('cliente', e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>

          {/* Status e Tipo em linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusProcesso.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoProcesso">Tipo do Processo</Label>
              <Select 
                value={formData.tipoProcesso || ''} 
                onValueChange={(value) => handleChange('tipoProcesso', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposProcesso.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Número do Processo */}
          <div className="space-y-2">
            <Label htmlFor="numeroProcesso">Número do Processo</Label>
            <Input
              id="numeroProcesso"
              value={formData.numeroProcesso || ''}
              onChange={(e) => handleChange('numeroProcesso', e.target.value)}
                              placeholder="Ex: 1234567-12.2025.8.26.0001"
            />
          </div>

          {/* Datas em linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleChange('dataInicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proximoPrazo">Próximo Prazo</Label>
              <Input
                id="proximoPrazo"
                type="date"
                value={formData.proximoPrazo || ''}
                onChange={(e) => handleChange('proximoPrazo', e.target.value)}
              />
            </div>
          </div>

          {/* Valor da Causa */}
          <div className="space-y-2">
            <Label htmlFor="valorCausa">Valor da Causa (R$)</Label>
            <Input
              id="valorCausa"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorCausa || ''}
              onChange={(e) => handleChange('valorCausa', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição detalhada do processo..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};