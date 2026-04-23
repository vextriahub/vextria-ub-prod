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

export const PublicationDetailsDialog = ({ publication, open, onOpenChange, trigger, onDelete, onProcess, onRegister, onSchedule }: PublicationDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] border-white/10 bg-background/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl p-0 overflow-hidden flex flex-col focus:outline-none">
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
                <h3 className="text-lg md:text-xl font-bold leading-tight">{publication.titulo}</h3>
                <Badge className={cn(
                  "w-fit px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shrink-0",
                  publication.status === 'lida' || publication.status === 'processada' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                )}>
                  {publication.status === 'lida' || publication.status === 'processada' ? 'Processada' : 'Nova'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold opacity-60">
                <Calendar className="h-4 w-4" />
                <span>Publicado em: {new Date(publication.data_publicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Número do Processo:</label>
                  <p className="text-sm font-mono bg-primary/5 border border-primary/10 p-3 rounded-xl font-bold break-all">{publication.numero_processo}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tribunal / Vara:</label>
                  <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-xl min-h-[44px]">
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
                    <Badge key={tag} variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/20 border-white/5 py-1 px-3 rounded-lg">
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
              <div className="bg-muted/30 p-5 md:p-6 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">
                  {publication.conteudo || "O conteúdo integral desta publicação está sendo processado ou não está disponível."}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-muted/20 shrink-0 border-t border-white/5 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row gap-3 w-full">
             <Button 
                onClick={() => onRegister?.(publication)}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-2"
             >
               <PlusCircle className="h-4 w-4" />
               Cadastrar Processo
             </Button>
             
             <Button 
                onClick={() => onSchedule?.(publication)}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-1 shadow-lg shadow-orange-500/20"
             >
               <Calendar className="h-4 w-4" />
               Agendar Prazo
             </Button>

             <Button 
                onClick={() => onProcess?.(publication.id)}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-3"
             >
               <CheckCircle className="h-4 w-4" />
               Marcar como Trata
             </Button>
             
             <div className="md:ml-auto">
               <Button 
                  onClick={() => onDelete?.(publication.id)}
                  variant="ghost" 
                  className="rounded-xl hover:bg-red-500/10 hover:text-red-500 px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto"
               >
                 <Trash2 className="h-4 w-4" />
                 Excluir 
               </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};