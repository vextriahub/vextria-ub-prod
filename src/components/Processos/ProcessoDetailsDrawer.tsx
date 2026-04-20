import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Processo } from '@/types/processo';
import { Badge } from '@/components/ui/badge';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  Calendar, 
  Scale, 
  DollarSign, 
  Clock,
  History,
  Info,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessoDetailsDrawerProps {
  processo: Processo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProcessoDetailsDrawer: React.FC<ProcessoDetailsDrawerProps> = ({
  processo,
  open,
  onOpenChange
}) => {
  if (!processo) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Suspenso':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-xl p-0 flex flex-col">
        <SheetHeader className="text-left space-y-4 p-6 pb-2">
          <div className="flex items-center justify-between mt-4">
            <Badge className={getStatusColor(processo.status)}>
              {processo.status}
            </Badge>
            <Badge variant="outline" className="font-normal bg-muted/30">
              {processo.faseProcessual || 'Fase Inicial'}
            </Badge>
          </div>
          <SheetTitle className="text-2xl font-bold leading-tight">
            {processo.titulo}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 font-mono text-sm">
            <FileText className="h-4 w-4" />
            {processo.numeroProcesso || 'Não informado'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Cliente</p>
                  <p className="font-semibold">{processo.cliente}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-muted-foreground/10">
                <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Responsável</p>
                  <p className="font-semibold text-sm">{processo.responsavelNome || 'Não atribuído'}</p>
                </div>
              </div>
            </div>

            {/* Capa Jurídica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Gavel className="h-4 w-4" />
                <span>Capa Jurídica</span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 p-4 rounded-xl border bg-card/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Tribunal</p>
                  <p className="text-sm font-medium">{processo.tribunal || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Comarca</p>
                  <p className="text-sm font-medium">{processo.comarca || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Vara</p>
                  <p className="text-sm font-medium">{processo.vara || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Parte Contraria</p>
                  <p className="text-sm font-medium">{processo.requerido || '---'}</p>
                </div>
              </div>
            </div>

            {/* Valores e Área */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1 p-4 rounded-xl border bg-emerald-50/30 border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Valor da Causa</span>
                </div>
                <p className="font-bold text-emerald-700 text-xl">
                  {processo.valorCausa ? 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa) 
                    : 'R$ 0,00'}
                </p>
              </div>

              <div className="space-y-1 p-4 rounded-xl border bg-blue-50/30 border-blue-100">
                <div className="flex items-center gap-2 text-blue-700">
                  <Scale className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Área / Tipo</span>
                </div>
                <p className="font-bold text-blue-700 text-lg uppercase text-xs">{processo.tipoProcesso || 'Cível'}</p>
              </div>
            </div>

            {/* Cronograma */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Cronograma e Prazos</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/10 rounded-xl border border-dashed flex flex-col items-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Data de Início</p>
                  <p className="font-medium text-sm">{processo.dataInicio ? new Date(processo.dataInicio).toLocaleDateString() : '---'}</p>
                </div>
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col items-center">
                  <p className="text-[10px] text-amber-700 uppercase font-bold mb-2">Próximo Prazo</p>
                  <p className="font-bold text-amber-900">{processo.proximoPrazo ? new Date(processo.proximoPrazo).toLocaleDateString() : 'Nenhum'}</p>
                </div>
              </div>
            </div>

            {/* Configurações Adicionais */}
            {(processo.segredoJustica || processo.justicaGratuita) && (
              <div className="flex gap-2">
                {processo.segredoJustica && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 gap-1.5 py-1 px-3">
                    <ShieldCheck className="h-3 w-3" />
                    Segredo de Justiça
                  </Badge>
                )}
                {processo.justicaGratuita && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 gap-1.5 py-1 px-3">
                    <CheckCircle2 className="h-3 w-3" />
                    Justiça Gratuita
                  </Badge>
                )}
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="h-4 w-4 text-primary" />
                <span>Observações</span>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl border italic text-sm text-muted-foreground">
                {processo.descricao || 'Nenhuma observação cadastrada.'}
              </div>
            </div>

            <Separator />

            {/* Histórico Simples */}
            <div className="space-y-4 pb-8">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <History className="h-4 w-4 text-primary" />
                Dernières Updates
              </div>
              <div className="flex gap-4 p-4 rounded-xl border bg-muted/10">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Última movimentação registrada</p>
                  <p className="text-xs text-muted-foreground">
                    {processo.ultimaMovimentacao ? new Date(processo.ultimaMovimentacao).toLocaleDateString() : 'Não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
