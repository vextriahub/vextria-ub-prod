import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  RotateCw, 
  ShieldCheck, 
  Gavel, 
  User, 
  Users,
  Loader2, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UFs = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export interface JudicialProcessResult {
  id: string;
  numeroProcesso: string;
  titulo: string;
  partes: string;
  tribunal: string;
  ultimoAndamento: {
    descricao: string;
    data: string;
  } | null;
  faseProcessual: string;
  valorCausa: number;
  vara: string;
  comarca: string;
  autor?: string;
  reu?: string;
}

interface JudicialSyncContentProps {
  onImport: (processes: (JudicialProcessResult & { clienteId?: string | null })[]) => Promise<void>;
  onCancel: () => void;
}

export const JudicialSyncContent: React.FC<JudicialSyncContentProps> = ({
  onImport,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [oab, setOab] = useState('');
  const [uf, setUf] = useState('DF');
  const [results, setResults] = useState<JudicialProcessResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clientPolos, setClientPolos] = useState<Record<string, 'autor' | 'reu'>>({});
  const [previewProc, setPreviewProc] = useState<JudicialProcessResult | null>(null);

  const handleSearch = async () => {
    if (!oab || !uf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe a OAB e o Estado.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());
    setCurrentPage(1);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const response = await fetch(`https://xrtmyhuqbbtaelczemag.supabase.co/functions/v1/fetch-by-oab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'sb_publishable_RQVoreC1A29Ix5EtrxsB7A_nkvwR7xQ'
        },
        body: JSON.stringify({ oab, uf })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Erro ${response.status}: Falha na comunicação com o servidor judicial.`);
      }

      const data = await response.json();
      
      const items = data || [];
      const mappedResults = items.map((item: any) => ({
        ...item,
        id: item.id || item.numeroProcesso
      }));

      setResults(mappedResults);
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar ao serviço de busca.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const processesToImport = results.filter(p => selectedIds.has(p.id));
      
      const finalProcesses = await Promise.all(processesToImport.map(async (proc) => {
        let finalClienteId = null;
        const polo = clientPolos[proc.id];
        
        if (polo) {
          const nomeCliente = polo === 'autor' ? proc.autor : proc.reu;
          if (nomeCliente) {
            const { data: novoCliente, error: errCliente } = await supabase
              .from('clientes')
              .insert({ nome: nomeCliente.substring(0, 100), office_id: user?.office_id })
              .select('id').single();
              
            if (!errCliente && novoCliente) {
              finalClienteId = novoCliente.id;
            }
          }
        }
        
        return {
          ...proc,
          clienteId: finalClienteId
        };
      }));

      await onImport(finalProcesses);
      toast({ title: "Importação concluída", description: `${selectedIds.size} processos foram salvos.` });
    } catch (e: any) {
      toast({ title: 'Erro ao importar', description: e.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end p-1">
        <div className="space-y-2">
          <Label className="text-white/60">UF do Tribunal</Label>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {UFs.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 space-y-2">
          <Label className="text-white/60">Número da OAB</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 bg-white/5 border-white/10 h-10"
              placeholder="Ex: 61199" 
              value={oab}
              onChange={(e) => setOab(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading} className="gap-2 h-10 bg-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-white/70">
            Dica: Clique no processo para ver a pasta e configurar quem é o cliente (Autor ou Réu).
          </span>
        </div>
      )}

      {/* Resultados e Paginação */}
      {results.length > 0 && (
        <div className="bg-slate-900/50 border border-white/5 p-3 rounded-xl mb-4 flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white/90">Resultados encontrados ({results.length})</span>
            </div>
            
            {/* Controles de Paginação */}
            <div className="flex items-center gap-2 border-l border-white/10 ml-2 pl-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white/40"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <span className="text-[10px] text-white/40 font-mono">
                {currentPage} / {totalPages}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white/40"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <span className="text-xs text-white/40">{selectedIds.size} selecionados</span>
             <button 
               onClick={toggleSelectAll}
               className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
             >
               {selectedIds.size === results.length ? 'Desmarcar todos' : 'Selecionar todos'}
             </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-[300px] border border-white/5 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden flex flex-col mb-4">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[40px] px-4">
                    <Checkbox 
                      checked={selectedIds.size === results.length && results.length > 0} 
                      onCheckedChange={toggleSelectAll}
                      className="border-white/20 data-[state=checked]:bg-primary"
                    />
                  </TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Processo</TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Autor</TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Réu</TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Fase Processual</TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Tribunal</TableHead>
                  <TableHead className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Andamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.map((proc) => (
                  <TableRow 
                    key={proc.id} 
                    className="group border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.checkbox-cell')) return;
                      setPreviewProc(proc);
                    }}
                  >
                    <TableCell className="px-4 checkbox-cell">
                      <Checkbox 
                        checked={selectedIds.has(proc.id)} 
                        onCheckedChange={() => toggleSelect(proc.id)}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[10px] font-bold text-primary whitespace-nowrap">
                        {proc.numeroProcesso.replace(/[.-]/g, '').length === 20 
                          ? proc.numeroProcesso.replace(/[.-]/g, '').replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6')
                          : proc.numeroProcesso}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-[10px] font-medium line-clamp-2 text-white/90 cursor-default max-w-[200px]">
                              {proc.partes}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 border-white/10 text-white max-w-sm">
                            {proc.autor || 'Não identificado'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-[10px] font-medium line-clamp-2 text-white/90 cursor-default max-w-[200px]">
                              {proc.reu || 'Não identificada'}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 border-white/10 text-white max-w-sm">
                            {proc.reu || 'Não identificada'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] h-5 uppercase font-bold bg-white/5 border-white/10 text-white/40 whitespace-nowrap">
                        {proc.faseProcessual}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-white/60 truncate max-w-[120px] inline-block font-medium">
                        {proc.tribunal} {proc.vara && `• ${proc.vara}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {proc.ultimoAndamento ? (
                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                          <span className="text-[9px] text-primary/70 font-bold uppercase">
                            {new Date(proc.ultimoAndamento.data).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] line-clamp-1 italic text-white/50">{proc.ultimoAndamento.descricao}</span>
                        </div>
                      ) : <span className="text-white/20 italic text-[10px]">Sem andamento</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-white/20 h-full">
              {loading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                  <p className="text-white/60 animate-pulse">Sincronizando com tribunais...</p>
                  <p className="text-[10px] text-white/30 mt-2">Isso pode levar alguns segundos.</p>
                </>
              ) : (
                <>
                  <Database className="h-12 w-12 mb-4 opacity-10" />
                  <p className="text-lg font-medium text-white/40">Busca pronta</p>
                  <p className="text-xs mt-2 max-w-[240px] mx-auto text-white/30">
                    Informe sua OAB e Estado para sincronizar processos.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between bg-transparent">
        <Button variant="ghost" onClick={onCancel} disabled={importing} className="text-white/40 hover:text-white hover:bg-white/5">
          Cancelar
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={selectedIds.size === 0 || importing}
          className={`gap-2 px-8 bg-primary shadow-lg shadow-primary/20 h-11 font-bold transition-all hover:scale-[1.02] ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          {importing ? 'Importando...' : `Importar ${selectedIds.size} Processos`}
        </Button>
      </div>
    </div>

  );
};

interface JudicialSyncDialogProps {
  onImport: (processes: JudicialProcessResult[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export const JudicialSyncDialog: React.FC<JudicialSyncDialogProps> = ({
  onImport,
  trigger
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Sincronizar OAB
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[1200px] w-[95vw] bg-background/45 backdrop-blur-3xl border-white/5 p-0 overflow-hidden flex flex-col h-[90vh] max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 border-b border-white/5 bg-transparent">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Sincronização Judicial (PJE/CNJ)</DialogTitle>
              <DialogDescription className="text-white/40">
                Busque processos vinculados à sua OAB e importe-os seletivamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-8 pb-6">
          <JudicialSyncContent 
            onImport={async (procs) => {
              await onImport(procs);
              setOpen(false);
            }} 
            onCancel={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
