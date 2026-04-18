
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Publication {
  id: string;
  title: string;
  date: string;
  processNumber: string;
  oabNumber: string;
  content: string;
  urgency: "alta" | "media" | "baixa";
}

interface PublicationViewerProps {
  publication: Publication;
}

export const PublicationViewer = ({ publication }: PublicationViewerProps) => {
  const { toast } = useToast();
  const [isProcessed, setIsProcessed] = useState(false);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "alta":
        return "bg-red-500 text-white";
      case "media":
        return "bg-yellow-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const handleProcessPublication = () => {
    setIsProcessed(true);
    toast({
      title: "Publicação tratada",
      description: "A publicação foi marcada como tratada com sucesso.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes da Publicação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Publication Header */}
          <div className="border-b pb-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-lg">{publication.title}</h3>
              <div className="flex gap-2">
                <Badge className={getUrgencyColor(publication.urgency)}>
                  {publication.urgency}
                </Badge>
                {isProcessed && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Tratada
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Data:</span> {publication.date}
              </div>
              <div>
                <span className="font-medium">Processo:</span> {publication.processNumber}
              </div>
              <div>
                <span className="font-medium">OAB:</span> {publication.oabNumber}
              </div>
            </div>
          </div>

          {/* Publication Content */}
          <div className="space-y-3">
            <h4 className="font-medium">Teor da Publicação:</h4>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed">{publication.content}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Prazo agendado",
                  description: "Prazo foi adicionado ao calendário com sucesso.",
                });
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Prazo
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Audiência agendada",
                  description: "Audiência foi adicionada ao calendário com sucesso.",
                });
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              Agendar Audiência
            </Button>
            
            <Button 
              variant={isProcessed ? "secondary" : "default"}
              className="flex-1"
              onClick={handleProcessPublication}
              disabled={isProcessed}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessed ? "Já Tratada" : "Marcar como Tratada"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
