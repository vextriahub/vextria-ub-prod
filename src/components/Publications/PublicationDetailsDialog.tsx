import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, FileText, Scale, Building2, MapPin, CheckCircle, Link, PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Publication {
  id: string;
  numero_processo: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  tags: string[];
  status: 'nova' | 'lida' | 'arquivada' | 'processada';
  tribunal?: string;
  vara?: string;
  comarca?: string;
}

interface PublicationDetailsDialogProps {
  publication: Publication;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onDelete?: (id: string) => void;
  onProcess?: (id: string) => void;
  onRegister?: (publication: Publication) => void;
  onSchedule?: (publication: Publication) => void;
}

const deepCleanHTML = (html: string): string => {
  if (!html) return "";
  let cleaned = html;
  
  // Substituir quebras de linha HTML por quebras reais antes de limpar tags
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");
  cleaned = cleaned.replace(/<\/p>/gi, "\n\n");
  cleaned = cleaned.replace(/<\/div>/gi, "\n");
  
  cleaned = cleaned.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  // Limpar todas as outras tags mantendo o conteúdo
  cleaned = cleaned.replace(/<[^>]*>?/gm, " ");
  
  // Decodificar entidades HTML comuns
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ").replace(/&quot;/gi, '"').replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&ordm;/gi, "º").replace(/&ordf;/gi, "ª");
    
  // Normalizar espaços mas manter quebras de linha únicas
  return cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n\n');
};

export const PublicationDetailsDialog = ({ publication, open, onOpenChange, trigger, onDelete, onProcess, onRegister, onSchedule }: PublicationDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const cleanContent = React.useMemo(() => deepCleanHTML(publication.conteudo), [publication.conteudo]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl h-[90vh] md:h-auto md:max-h-[85vh] border-white/10 bg-background/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl p-0 overflow-hidden flex flex-col focus:outline-none">
        <DialogHeader className="p-6 md:p-8 pb-4 shrink-0 border-b border-white/5">
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl font-black tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            Detalhes da Publicação
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 min-h-0 custom-scrollbar overscroll-contain">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <h3 className="text-lg md:text-xl font-bold leading-tight text-foreground/90 uppercase tracking-tight">{publication.titulo}</h3>
                <Badge className={cn(
                  "w-fit px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shrink-0",
                  publication.status === 'lida' || publication.status === 'processada' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                )}>
                  {publication.status === 'lida' || publication.status === 'processada' ? 'Processada' : 'Nova'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold opacity-60">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span>Publicado em: {new Date(publication.data_publicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Número do Processo:</label>
                  <p className="text-sm font-mono bg-primary/5 border border-primary/10 p-3 rounded-xl font-bold break-all shadow-inner">{publication.numero_processo}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tribunal / Vara:</label>
                  <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-xl min-h-[44px] shadow-inner">
                    <Building2 className="h-4 w-4 text-primary/60 shrink-0" />
                    <span className="text-sm font-bold truncate">{publication.tribunal || 'TRIBUNAL'}</span>
                  </div>
                </div>
              </div>

              {(publication.comarca || publication.vara) && (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground/40 pl-1">
                  <MapPin className="h-3 w-3" />
                  <span>{publication.comarca}{publication.vara ? ` - ${publication.vara}` : ''}</span>
                </div>
              )}
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tags e Marcadores:</label>
              <div className="flex gap-2 flex-wrap">
                {publication.tags?.filter(t => t !== 'auto-sync').length > 0 ? (
                  publication.tags.filter(t => t !== 'auto-sync').map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/20 border-white/5 py-1 px-3 rounded-lg shadow-sm">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground/40 italic">Nenhuma tag vinculada</span>
                )}
              </div>
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="space-y-3 pb-4">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Teor da Publicação (Completo):</label>
              <div className="bg-muted/30 p-5 md:p-8 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">
                  {cleanContent || "O conteúdo integral desta publicação está sendo processado ou não está disponível."}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6 bg-muted/20 shrink-0 border-t border-white/5 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap items-center gap-4 w-full justify-start">
             <Button 
                onClick={() => onSchedule?.(publication)}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-6 font-bold text-[12px] uppercase tracking-widest gap-2 h-12 transition-all shadow-lg shadow-orange-500/20"
             >
               <Calendar className="h-4 w-4" />
               Agendar Prazo
             </Button>

             <Button 
                onClick={() => onRegister?.(publication)}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary px-6 font-bold text-[12px] uppercase tracking-widest gap-2 h-12 transition-all"
             >
               <PlusCircle className="h-4 w-4" />
               Cadastrar Processo
             </Button>
             
             <Button 
                onClick={() => onProcess?.(publication.id)}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 px-6 font-bold text-[12px] uppercase tracking-widest gap-2 h-12 transition-all"
             >
               <CheckCircle className="h-4 w-4" />
               Tratar
             </Button>
             
             <Button 
                onClick={() => onDelete?.(publication.id)}
                variant="ghost" 
                className="rounded-xl hover:bg-red-500/10 hover:text-red-500 px-6 font-bold text-[12px] uppercase tracking-widest gap-2 h-12 transition-all ml-auto"
             >
               <Trash2 className="h-4 w-4" />
               Excluir 
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};