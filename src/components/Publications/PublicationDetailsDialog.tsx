import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, FileText, Scale, Building2, MapPin, CheckCircle, Link } from "lucide-react";
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
}

export const PublicationDetailsDialog = ({ publication, open, onOpenChange, trigger }: PublicationDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Publicação
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{publication.titulo}</h3>
                <Badge variant={publication.status === 'lida' || publication.status === 'processada' ? 'default' : 'secondary'}>
                  {publication.status === 'lida' || publication.status === 'processada' ? 'Processada' : 'Nova'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data: {new Date(publication.data_publicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Número do Processo:</label>
                  <p className="text-sm font-mono bg-primary/5 border border-primary/10 p-2.5 rounded-xl font-bold">{publication.numero_processo}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Tribunal / Vara:</label>
                  <div className="flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl">
                    <Building2 className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-bold">{publication.tribunal || 'PJE/Datajud'}</span>
                    {publication.vara && <span className="text-xs text-muted-foreground">({publication.vara})</span>}
                  </div>
                </div>
              </div>

              {publication.comarca && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{publication.comarca}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Tags:</label>
              <div className="flex gap-2 flex-wrap">
                {publication.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Conteúdo da Publicação:</label>
              <div className="bg-muted/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">
                  {publication.conteudo || "Sem conteúdo disponível para este expediente."}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <Separator className="bg-white/5" />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl border-border px-4 font-bold text-xs uppercase tracking-widest gap-2">
               <Link className="h-4 w-4" />
               Vincular Processo
             </Button>
             <Button variant="outline" className="rounded-xl border-border px-4 font-bold text-xs uppercase tracking-widest gap-2">
               <CheckCircle className="h-4 w-4" />
               Marcar como Trata
             </Button>
          </div>
          <Button onClick={() => setIsOpen(false)} variant="secondary" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-lg">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};