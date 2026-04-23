import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Publication {
  id: string;
  numero_processo: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  tags: string[];
  status: 'nova' | 'lida' | 'arquivada' | 'processada';
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
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Número do Processo:</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{publication.numero_processo}</p>
              </div>
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
              <label className="text-sm font-medium">Conteúdo da Publicação:</label>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {publication.conteudo}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};