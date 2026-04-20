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
  Loader2, 
  ChevronRight,
  Database
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const UFs = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

interface JudicialProcessResult {
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
  valorCausa?: number;
}

interface JudicialSyncDialogProps {
  onImport: (processes: JudicialProcessResult[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export const JudicialSyncDialog: React.FC<JudicialSyncDialogProps> = ({
  onImport,
  trigger
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [oab, setOab] = useState('');
  const [uf, setUf] = useState('SP');
  const [results, setResults] = useState<JudicialProcessResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!oab) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o número da OAB.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('fetch-processo', {
        body: { oab, uf }
      });

      if (error) {
        // Tenta capturar o erro estruturado vindo da Edge Function
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || "Ocorreu um problema ao consultar o DataJud.");
      }

      if (!data || data.length === 0) {
        toast({
          title: "Nenhum processo encontrado",
          description: `Não encontramos processos públicos para a OAB ${oab}-${uf} no TJ local.`,
        });
      } else {
        setResults(data);
        toast({
          title: "Busca concluída",
          description: `Encontramos ${data.length} processos vinculados à sua OAB.`,
        });
      }
    } catch (error: any) {
      console.error('Erro na busca por OAB:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar ao tribunal nacional. Tente novamente.",
        variant: "destructive"
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
    if (selectedIds.size === 0) return;

    setImporting(true);
    try {
      const selectedProcesses = results.filter(r => selectedIds.has(r.id));
      await onImport(selectedProcesses);
      
      toast({
        title: "Importação concluída",
        description: `${selectedIds.size} processos foram importados para o seu Hub.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar alguns processos.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

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
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Sincronização Judicial (PJE/CNJ)</DialogTitle>
              <DialogDescription>
                Busque processos vinculados à sua OAB e importe-os seletivamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col flex-1 min-h-0">
          {/* Busca */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
            <div className="space-y-2">
              <Label>UF do Tribunal</Label>
              <Select value={uf} onValueChange={setUf}>
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {UFs.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Número da OAB (Somente dígitos)</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10"
                  placeholder="Ex: 123456" 
                  value={oab}
                  onChange={(e) => setOab(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Buscando...' : 'Buscar Processos'}
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Resultados */}
          <div className="flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden bg-card">
            <div className="bg-muted/50 p-2 border-b flex items-center justify-between px-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Resultados encontrados {results.length > 0 && `(${results.length})`}
              </h4>
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{selectedIds.size} selecionados</span>
                  <Button variant="link" size="sm" onClick={toggleSelectAll} className="h-auto p-0">
                    {selectedIds.size === results.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              {results.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/20 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Processo / Partes</TableHead>
                      <TableHead>Último Andamento</TableHead>
                      <TableHead>Fase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((proc) => (
                      <TableRow key={proc.id} className="group">
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.has(proc.id)} 
                            onCheckedChange={() => toggleSelect(proc.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs font-bold text-primary">{proc.numeroProcesso}</span>
                            <span className="text-sm font-medium line-clamp-1">{proc.partes}</span>
                            <span className="text-[10px] text-muted-foreground">{proc.tribunal}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {proc.ultimoAndamento ? (
                            <div className="flex flex-col gap-1 max-w-[200px]">
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-100 w-fit">
                                {new Date(proc.ultimoAndamento.data).toLocaleDateString()}
                              </span>
                              <span className="text-xs line-clamp-2 italic">{proc.ultimoAndamento.descricao}</span>
                            </div>
                          ) : '---'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] whitespace-nowrap bg-blue-50/50">
                            {proc.faseProcessual}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  {loading ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                      <p>Consultando banco de dados nacional do CNJ...</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-10 w-10 mb-4 opacity-20" />
                      <p>Sua lista de processos aparecerá aqui após a busca.</p>
                      <p className="text-xs mt-2">Dica: Informe sua OAB principal e o estado do tribunal.</p>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t bg-muted/20">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={selectedIds.size === 0 || importing}
            className="gap-2"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {importing ? 'Importando...' : `Importar ${selectedIds.size} Processos`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
