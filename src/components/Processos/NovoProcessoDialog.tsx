import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanFeatures';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { NovoProcessoForm, tiposProcesso, statusProcesso } from '@/types/processo';

interface NovoProcessoDialogProps {
  onAddProcesso: (processo: any) => void;
  trigger?: React.ReactNode;
}

export const NovoProcessoDialog: React.FC<NovoProcessoDialogProps> = ({
  onAddProcesso,
  trigger
}) => {
  const { toast } = useToast();
  const { limits } = usePlanLimits();
  const isLimitReached = limits.processes.isReached;
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NovoProcessoForm>({
    titulo: '',
    cliente: '',
    status: 'Em andamento',
    proximoPrazo: '',
    descricao: '',
    valorCausa: 0,
    numeroProcesso: '',
    tipoProcesso: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const novoProcesso = {
        ...formData,
        id: Date.now().toString(), // ID temporário
        dataInicio: new Date().toISOString().split('T')[0],
        valorCausa: formData.valorCausa || 0
      };

      onAddProcesso(novoProcesso);
      
      // Resetar formulário
      setFormData({
        titulo: '',
        cliente: '',
        status: 'Em andamento',
        proximoPrazo: '',
        descricao: '',
        valorCausa: 0,
        numeroProcesso: '',
        tipoProcesso: ''
      });
      
      setOpen(false);
      
      toast({
        title: "Processo criado",
        description: "O novo processo foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      toast({
        title: "Erro ao criar",
        description: "Ocorreu um erro ao criar o processo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof NovoProcessoForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Novo Processo
    </Button>
  );

  return (
    <PermissionGuard permission="canCreateProcesses">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Processo</DialogTitle>
            <DialogDescription>
              Crie um novo processo jurídico preenchendo as informações abaixo.
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
                    <SelectValue />
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

            {/* Próximo Prazo e Valor da Causa em linha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proximoPrazo">Próximo Prazo</Label>
                <Input
                  id="proximoPrazo"
                  type="date"
                  value={formData.proximoPrazo || ''}
                  onChange={(e) => handleChange('proximoPrazo', e.target.value)}
                />
              </div>

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

            {isLimitReached && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800 text-sm mb-4">
                <p className="font-semibold flex items-center gap-2">
                  ⚠️ Limite de processos atingido
                </p>
                <p>Seu plano atual permite até {limits.processes.max} processos. Faça um upgrade para continuar cadastrando.</p>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isLimitReached}>
                {isLoading ? "Criando..." : isLimitReached ? "Limite Atingido" : "Criar Processo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
};