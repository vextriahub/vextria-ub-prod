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
}

export const PublicationDetailsDialog = ({ publication, open, onOpenChange, trigger, onDelete, onProcess }: PublicationDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[80vh] border-white/10 bg-background/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-8 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Detalhes da Publicação
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-8">
          <div className="space-y-6 pb-8">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold leading-tight max-w-[80%]">{publication.titulo}</h3>
                <Badge className={cn(
                  "px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg",
                  publication.status === 'lida' || publication.status === 'processada' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                )}>
                  {publication.status === 'lida' || publication.status === 'processada' ? 'Processada' : 'Nova'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold opacity-60">
                <Calendar className="h-4 w-4" />
                <span>Data: {new Date(publication.data_publicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Número do Processo:</label>
                  <p className="text-sm font-mono bg-primary/5 border border-primary/10 p-3 rounded-xl font-bold">{publication.numero_processo}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tribunal / Vara:</label>
                  <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-xl">
                    <Building2 className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-bold">{publication.tribunal || 'TRIBUNAL'}</span>
                    {publication.vara && <span className="text-xs text-muted-foreground">({publication.vara})</span>}
                  </div>
                </div>
              </div>

              {publication.comarca && (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground/40 pl-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{publication.comarca}</span>
                </div>
              )}
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tags:</label>
              <div className="flex gap-2 flex-wrap">
                {publication.tags.filter(t => t !== 'auto-sync').map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/20 border-white/5 py-1 px-3 rounded-lg">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Conteúdo da Publicação:</label>
              <div className="bg-muted/30 p-6 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/80">
                  {publication.conteudo || "Sem conteúdo disponível para este expediente."}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <Separator className="bg-white/5 shrink-0" />

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-6 md:p-8 bg-muted/20 shrink-0">
          <div className="flex flex-col md:flex-row gap-3 w-full">
             <Button 
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-2 md:order-1"
             >
               <PlusCircle className="h-4 w-4" />
               Cadastrar Processo
             </Button>
             <Button 
                onClick={() => onProcess?.(publication.id)}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-1 md:order-2"
             >
               <CheckCircle className="h-4 w-4" />
               Marcar como Trata
             </Button>
             <Button 
                onClick={() => onDelete?.(publication.id)}
                variant="ghost" 
                className="rounded-xl hover:bg-red-500/10 hover:text-red-500 px-5 font-bold text-xs uppercase tracking-widest gap-2 h-12 md:h-11 transition-all w-full md:w-auto order-3"
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