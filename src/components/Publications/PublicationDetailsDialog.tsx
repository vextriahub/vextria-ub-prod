import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Publication {
  id: string;
  processNumber: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  status: "pending" | "processed";
}

interface PublicationDetailsDialogProps {
  publication: Publication;
}

export const PublicationDetailsDialog = ({ publication }: PublicationDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </DialogTrigger>
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
                <h3 className="text-lg font-semibold">{publication.title}</h3>
                <Badge variant={publication.status === 'processed' ? 'default' : 'secondary'}>
                  {publication.status === 'processed' ? 'Processada' : 'Pendente'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data: {publication.date}</span>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Número do Processo:</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{publication.processNumber}</p>
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
                  {publication.content}
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