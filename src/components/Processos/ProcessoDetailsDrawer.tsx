import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Processo } from '@/types/processo';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle,
  MapPin,
  Building2,
  ExternalLink,
  Files,
  Users
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatCNJ } from '@/utils/formatCNJ';

interface Movimentacao {
  id: string;
  data_movimentacao: string;
  descricao: string;
  detalhes?: string;
  tipo?: string;
}

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

  const [movements, setMovements] = useState<Movimentacao[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [activeTab, setActiveTab] = useState("resumo");

  useEffect(() => {
    const fetchMovements = async () => {
      if (!processo?.id || !open) return;
      
      setLoadingMovements(true);
      try {
        const { data, error } = await supabase
          .from('movimentacoes_processo')
          .select('*')
          .eq('processo_id', processo.id)
          .order('data_movimentacao', { ascending: false });

        if (!error && data) {
          setMovements(data);
        }
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
      } finally {
        setLoadingMovements(false);
      }
    };

    fetchMovements();
  }, [processo?.id, open]);

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('andamento') || s === 'ativo') 
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s.includes('concluído') || s.includes('encerrado')) 
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s.includes('suspenso')) 
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 border-l border-white/5 bg-[#0D0D0E] w-full sm:max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header Consolidado */}
        <div className="p-8 pb-4 space-y-6 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between relative">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2", getStatusStyle(processo.status))}>
                   {processo.status}
                </Badge>
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase font-black tracking-widest leading-none">
                  <Clock className="h-3 w-3" />
                  Desde {processo.dataInicio ? new Date(processo.dataInicio).toLocaleDateString() : '—'}
                </div>
              </div>
              
              <div className="space-y-1">
                <SheetTitle className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {processo.titulo}
                </SheetTitle>
                <div className="flex items-center gap-2 group">
                   <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors animate-pulse" />
                   <span className="font-mono text-sm font-bold text-primary tracking-tight">
                     {formatCNJ(processo.numeroProcesso)}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 p-1 h-12 rounded-2xl w-full justify-between">
              <TabsTrigger value="resumo" className="flex-1 rounded-xl data-[state=active]:bg-[#1A1A1B] data-[state=active]:text-primary font-bold text-xs">
                <Info className="h-3.5 w-3.5 mr-2" /> RESUMO
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1 rounded-xl data-[state=active]:bg-[#1A1A1B] data-[state=active]:text-primary font-bold text-xs">
                <History className="h-3.5 w-3.5 mr-2" /> HISTÓRICO
              </TabsTrigger>
              <TabsTrigger value="partes" className="flex-1 rounded-xl data-[state=active]:bg-[#1A1A1B] data-[state=active]:text-primary font-bold text-xs">
                <Users className="h-3.5 w-3.5 mr-2" /> PARTES
              </TabsTrigger>
              <TabsTrigger value="documentos" className="flex-1 rounded-xl data-[state=active]:bg-[#1A1A1B] data-[state=active]:text-primary font-bold text-xs">
                <Files className="h-3.5 w-3.5 mr-2" /> DOCS
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              {/* ABA: RESUMO */}
              <TabsContent value="resumo" className="space-y-8 animate-in fade-in duration-300">
                {/* Métricas Principais */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Valor da Causa</span>
                    </div>
                    <p className="text-xl font-black text-emerald-400 tracking-tighter">
                      {processo.valorCausa ? 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valorCausa) 
                        : 'R$ 0,00'}
                    </p>
                  </div>
                  <div className="p-5 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Scale className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Área Jurídica</span>
                    </div>
                    <p className="text-lg font-black text-blue-400 uppercase leading-none">
                      {processo.tipoProcesso || 'Cível'}
                    </p>
                  </div>
                </div>

                {/* Capa Jurídica Detalhada */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[.2em]">
                    <Gavel className="h-4 w-4" />
                    <span>Capa Jurídica</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Tribunal</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-primary/60" />
                        <p className="text-sm font-bold text-white/80">{processo.tribunal || '—'}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Vara</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary/60" />
                        <p className="text-sm font-bold text-white/80">{processo.vara || '—'}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Comarca / UF</p>
                      <p className="text-sm font-bold text-white/80 pl-5.5">{processo.comarca || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Segredo / Justiça Grat.</p>
                      <div className="flex gap-2 pl-3">
                         {processo.segredoJustica && <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px]">Segredo</Badge>}
                         {processo.justicaGratuita && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px]">Gratuita</Badge>}
                         {!processo.segredoJustica && !processo.justicaGratuita && <span className="text-xs text-white/20">Não consta</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cliente e Observações */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/40 font-black text-[10px] uppercase tracking-[.2em]">
                    <User className="h-4 w-4" />
                    <span>Vinculação & Notas</span>
                  </div>
                  <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Cliente Associado</p>
                         <p className="font-bold text-primary group cursor-pointer flex items-center gap-2">
                           {processo.cliente}
                           <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </p>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Anotações Internas</p>
                       <p className="text-sm text-white/60 leading-relaxed italic">
                         {processo.observacoes || processo.descricao || 'Nenhuma observação registrada.'}
                       </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ABA: TIMELINE */}
              <TabsContent value="timeline" className="space-y-6 animate-in fade-in duration-300">
                 {loadingMovements ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
                       <Clock className="h-10 w-10 animate-pulse text-primary" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Consultando cronologia...</p>
                    </div>
                 ) : movements.length > 0 ? (
                    <div className="relative pl-6 space-y-10 border-l border-white/5 ml-2 pt-4 pb-20">
                       {movements.map((mov, idx) => (
                         <div key={mov.id} className="relative">
                            <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-[#0D0D0E] border-2 border-primary/40 ring-4 ring-primary/5" />
                            <div className="space-y-2">
                               <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md">
                                   {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                                 </span>
                                 <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-40">
                                   {mov.tipo || 'Andamento'}
                                 </Badge>
                               </div>
                               <h4 className="font-bold text-white/90 leading-tight">
                                 {mov.descricao}
                               </h4>
                               {mov.detalhes && (
                                 <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-white/50 leading-relaxed font-medium">
                                   {mov.detalhes}
                                 </div>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                       <History className="h-16 w-16" />
                       <div className="space-y-2">
                         <p className="font-black uppercase tracking-widest">Sem Histórico de Atividades</p>
                         <p className="text-xs max-w-xs mx-auto">Não encontramos movimentações para este processo no banco de dados.</p>
                       </div>
                    </div>
                 )}
              </TabsContent>

              {/* ABA: PARTES */}
              <TabsContent value="partes" className="space-y-6 animate-in fade-in duration-300">
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40 grayscale">
                   <Users className="h-16 w-16" />
                   <div className="space-y-2">
                     <p className="font-black uppercase tracking-widest">Gestão de Partes</p>
                     <p className="text-xs max-w-xs mx-auto">Em breve: visualize o histórico completo de advogados e prepostos envolvidos.</p>
                   </div>
                </div>
              </TabsContent>

              {/* ABA: DOCUMENTOS */}
              <TabsContent value="documentos" className="space-y-6 animate-in fade-in duration-300">
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40 grayscale">
                   <Files className="h-16 w-16" />
                   <div className="space-y-2">
                     <p className="font-black uppercase tracking-widest">Cofre de Documentos</p>
                     <p className="text-xs max-w-xs mx-auto">Anexe petições, mandados e comprovantes diretamente ao seu processo.</p>
                   </div>
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
