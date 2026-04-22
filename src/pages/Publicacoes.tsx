
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutoPublicationFetcher } from "@/components/Publications/AutoPublicationFetcher";
import { PublicationDetailsDialog } from "@/components/Publications/PublicationDetailsDialog";
import { ScheduleDialog } from "@/components/Publications/ScheduleDialog";
import { PublicationSummary } from "@/components/Publications/PublicationSummary";
import { PublicationTable } from "@/components/Publications/PublicationTable";
import { PublicationFilters } from "@/components/Publications/PublicationFilters";
import { 
  BookOpen, 
  Trash2, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  CheckSquare, 
  Archive, 
  Eye,
  Download,
  Filter,
  Inbox,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileSpreadsheet, FileText as FileTextIcon } from "lucide-react";

import { usePublicacoes } from "@/hooks/usePublicacoes";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function Publicacoes() {
  const { toast } = useToast();
  const { publications, loading, deletePublication, updateStatus, fetchByCnj } = usePublicacoes();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConsulting, setIsConsulting] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    urgencia: 'all',
    cnj: '',
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined }
  });

  // Cálculo de Estatísticas
  const stats = useMemo(() => {
    return {
      prazosSemana: publications.filter(p => p.urgencia === 'alta').length,
      naoTratadas: publications.filter(p => p.status === 'nova' || p.status === 'pendente').length,
      semVinculo: publications.filter(p => !p.processo_id).length,
      novosAndamentos: publications.filter(p => {
        const d = new Date(p.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length
    };
  }, [publications]);

  // Filtragem
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = pub.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
                           pub.numero_processo.includes(filters.search);
      const matchesStatus = filters.status === 'all' || pub.status === filters.status;
      const matchesUrgencia = filters.urgencia === 'all' || pub.urgencia === filters.urgencia;
      
      let matchesDate = true;
      if (filters.dateRange.from) {
        const pubDate = new Date(pub.data_publicacao);
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = pubDate >= fromDate;
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && pubDate <= toDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesUrgencia && matchesDate;
    });
  }, [publications, filters]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.search !== '',
      filters.status !== 'all',
      filters.urgencia !== 'all',
      filters.cnj !== '',
      filters.dateRange.from !== undefined
    ].filter(Boolean).length;
  }, [filters]);

  // Handlers
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    if (selectedIds.length === filteredPublications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPublications.map(p => p.id));
    }
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    toast({
      title: "Processando...",
      description: `Atualizando ${selectedIds.length} publicações para "${newStatus}".`,
    });
    
    for (const id of selectedIds) {
      await updateStatus(id, newStatus);
    }
    
    setSelectedIds([]);
    toast({
      title: "Sucesso",
      description: `${selectedIds.length} publicações atualizadas com sucesso.`,
    });
  };

  const handleCnjConsult = async (cnj: string) => {
    if (!cnj) return;
    
    setIsConsulting(true);
    try {
      const newPubs = await fetchByCnj(cnj);
      if (newPubs.length > 0) {
        toast({
          title: "Publicações capturadas",
          description: `${newPubs.length} novas publicações encontradas para o processo ${cnj}.`,
        });
        setFilters(prev => ({ ...prev, search: cnj })); // Auto filter to show the results
      } else {
        toast({
          title: "Nenhum resultado",
          description: `Não encontramos novas publicações para o processo ${cnj} no momento.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao tentar consultar o CNJ.",
        variant: "destructive"
      });
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden entry-animate">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary shadow-sm" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
              Expediente
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl px-1">
            Gestão centralizada de intimações e andamentos processuais.
          </p>
        </div>
        
        <div className="flex items-center gap-2 glass-morphism p-1.5 rounded-2xl border-white/5">
          <Button 
            variant={view === 'grid' ? "secondary" : "ghost"} 
            size="sm" 
            className={cn("rounded-xl h-10 px-4 transition-all duration-500", view === 'grid' && "shadow-lg scale-105")}
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="font-bold text-xs uppercase tracking-wider">Cartões</span>
          </Button>
          <Button 
            variant={view === 'table' ? "secondary" : "ghost"} 
            size="sm" 
            className={cn("rounded-xl h-10 px-4 transition-all duration-500", view === 'table' && "shadow-lg scale-105")}
            onClick={() => setView('table')}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            <span className="font-bold text-xs uppercase tracking-wider">Tabela</span>
          </Button>
        </div>
      </div>

      <PublicationSummary stats={stats} />

      <div className="grid grid-cols-1 gap-10">
        <div className="glass-card p-1 rounded-[2.5rem] shadow-premium border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <AutoPublicationFetcher />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end px-4">
               <h3 className="text-2xl font-black tracking-tight">Lista de Expedientes</h3>
               <Badge variant="secondary" className="rounded-lg h-7 font-black tracking-[0.1em] text-[10px] uppercase">
                 {filteredPublications.length} Itens Encontrados
               </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <PublicationFilters 
                filters={filters}
                setFilters={setFilters}
                activeFiltersCount={activeFiltersCount}
                isConsulting={isConsulting}
                onCnjConsult={handleCnjConsult}
                onClear={() => setFilters({
                  search: '',
                  status: 'all',
                  urgencia: 'all',
                  cnj: '',
                  dateRange: { from: undefined, to: undefined }
                })}
              />
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest text-primary gap-2 transition-all duration-300 shadow-lg">
                      <Download className="h-4 w-4" />
                      Exportar
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl">
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer group flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-tight">Excel (.xlsx)</span>
                        <span className="text-[10px] text-muted-foreground/60 italic">Relatório em planilha</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer group flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <FileTextIcon className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-tight">PDF (.pdf)</span>
                        <span className="text-[10px] text-muted-foreground/60 italic">Documento formatado</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button className="h-12 rounded-2xl px-8 font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all duration-300">
                   Consultar
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <Card className="glass-card border-primary/20 bg-primary/10 backdrop-blur-2xl px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 border-2">
                  <div className="flex items-center gap-3 pr-6 border-r border-white/10 text-primary">
                    <CheckSquare className="h-5 w-5" />
                    <span className="text-sm font-black uppercase tracking-widest">{selectedIds.length} Selecionados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleBulkUpdateStatus('lida')}
                      className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6"
                    >
                      Marcar como Lida
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkUpdateStatus('arquivada')}
                      className="rounded-xl border-white/10 hover:bg-white/5 font-black text-[10px] uppercase tracking-widest h-10 px-6"
                    >
                      Arquivar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-xl h-10 w-10 p-0 text-red-500 hover:bg-red-500/10"
                      onClick={() => setSelectedIds([])}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {filteredPublications.length === 0 ? (
              <div className="py-24 text-center glass-card rounded-[3rem] space-y-6 border-white/5">
                <div className="p-8 bg-white/5 rounded-full inline-block border border-white/10">
                  <Inbox className="h-16 w-16 text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black uppercase tracking-widest text-muted-foreground/40">Caixa de Entrada Vazia</p>
                  <p className="text-sm text-muted-foreground/60 font-medium">Nenhum registro encontrado para os filtros aplicados.</p>
                </div>
              </div>
            ) : view === 'table' ? (
              <PublicationTable 
                publications={filteredPublications}
                selectedIds={selectedIds}
                onToggleSelection={handleToggleSelection}
                onToggleAll={handleToggleAll}
                onViewDetails={(pub) => {}} // Handle in sync with grid or separate modal
                onDelete={deletePublication}
                onUpdateStatus={updateStatus}
              />
            ) : (
              <div className="grid gap-6">
                {filteredPublications.map((publication) => (
                  <div 
                    key={publication.id} 
                    className={cn(
                      "glass-card hover-lift p-8 rounded-[2.5rem] border-white/5 shadow-premium group relative transition-all duration-300",
                      selectedIds.includes(publication.id) && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    {/* Checkbox Overlay for Card View */}
                    <div 
                      className="absolute top-8 left-8 z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelection(publication.id);
                      }}
                    >
                      <Checkbox 
                        checked={selectedIds.includes(publication.id)}
                        className="h-6 w-6 rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all scale-110 shadow-lg"
                      />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between gap-8 pl-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="text-2xl font-black group-hover:text-primary transition-colors duration-500 leading-tight tracking-tight">
                              {publication.titulo}
                            </h4>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg text-[10px] tracking-widest uppercase">
                                {publication.numero_processo}
                              </Badge>
                              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider opacity-60">
                                Publicado em: {new Date(publication.data_publicacao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <Badge className={cn(
                            "px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg",
                            publication.status === 'lida' || publication.status === 'processada' ? "bg-emerald-500 text-white" : 
                            publication.status === 'pendente' ? "bg-sky-500 text-white" :
                            "bg-primary text-white"
                          )}>
                            {
                              publication.status === 'lida' || publication.status === 'processada' ? 'Tratada' : 
                              publication.status === 'pendente' ? 'Pendente' : 'Nova'
                            }
                          </Badge>
                        </div>

                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 text-muted-foreground/80 font-medium line-clamp-4 leading-relaxed text-sm backdrop-blur-sm">
                          {publication.conteudo}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {publication.tags?.map((tag) => (
                            <Badge key={tag} className="bg-white/5 text-muted-foreground/60 border-white/5 px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all cursor-default">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="lg:w-48 flex flex-col gap-3 justify-center">
                        <PublicationDetailsDialog publication={publication} />
                        <div className="h-px bg-white/5 my-2" />
                        <div className="grid grid-cols-3 gap-2">
                          <ScheduleDialog 
                            publicationTitle={publication.titulo}
                            processNumber={publication.numero_processo}
                            type="prazo"
                            iconOnly={true}
                          />
                          <ScheduleDialog 
                            publicationTitle={publication.titulo}
                            processNumber={publication.numero_processo}
                            type="audiencia"
                            iconOnly={true}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" className="h-12 w-full rounded-2xl hover:bg-red-500/10 hover:text-red-500 group/del transition-all duration-300">
                                <Trash2 className="h-5 w-5 text-red-500/50 group-hover/del:text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] border-white/10 bg-background/80 backdrop-blur-2xl p-10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-3xl font-black tracking-tighter">Eliminar Expediente</AlertDialogTitle>
                                <AlertDialogDescription className="text-base font-medium text-muted-foreground">
                                  Esta publicação será removida permanentemente do sistema. Prosseguir com a exclusão definitiva?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-10 gap-4">
                                <AlertDialogCancel className="rounded-2xl border-white/10 h-14 px-8 font-black uppercase text-xs tracking-widest">Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletePublication(publication.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20"
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


