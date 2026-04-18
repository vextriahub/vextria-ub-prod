
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicationViewer } from "./PublicationViewer";
import { ScheduleDialog } from "./ScheduleDialog";

interface Publication {
  id: string;
  title: string;
  date: string;
  processNumber: string;
  oabNumber: string;
  content: string;
  urgency: "alta" | "media" | "baixa";
}

export const AutoPublicationFetcher = () => {
  const { toast } = useToast();
  
  // OAB search states
  const [oabNumber, setOabNumber] = useState("");
  const [oabSeccional, setOabSeccional] = useState("");
  
  // CNJ search states
  const [processCnj, setProcessCnj] = useState("");
  
  const [isSearching, setIsSearching] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);

  const handleOabSearch = async () => {
    if (!oabNumber || !oabSeccional) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número da OAB e a seccional",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulação da busca automática por OAB
      // Em produção, aqui seria feita uma chamada para API do tribunal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPublications: Publication[] = [];

      setPublications(mockPublications);
      
      toast({
        title: "Busca concluída",
        description: `Nenhuma publicação encontrada para OAB ${oabNumber}/${oabSeccional}`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar as publicações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCnjSearch = async () => {
    if (!processCnj) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número CNJ do processo",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulação da busca automática por número CNJ
      // Em produção, aqui seria feita uma chamada para API do tribunal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPublications: Publication[] = [
        {
          id: "4",
              title: "Intimação para depósito - Processo 4004567-12.2025.8.26.0400",
    date: "24/01/2025",
    processNumber: "4004567-12.2025.8.26.0400",
          oabNumber: "Diversos advogados",
          content: "Intimo a parte executada para efetuar o depósito do valor da condenação no prazo de 15 dias.",
          urgency: "alta"
        },
        {
          id: "5",
              title: "Edital de citação - Processo 5005678-23.2025.8.26.0500",
    date: "22/01/2025",
    processNumber: "5005678-23.2025.8.26.0500",
          oabNumber: "Diversos advogados",
          content: "Citação por edital da empresa para contestar a ação no prazo legal.",
          urgency: "media"
        }
      ];

      setPublications(mockPublications);
      
      toast({
        title: "Busca concluída",
        description: `${mockPublications.length} publicações encontradas para processo CNJ ${processCnj}`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar as publicações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Automática de Publicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="oab" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oab">Busca por OAB</TabsTrigger>
              <TabsTrigger value="cnj">Busca por CNJ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="oab" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oab-number">Número da OAB</Label>
                  <Input
                    id="oab-number"
                    placeholder="Ex: 123456"
                    value={oabNumber}
                    onChange={(e) => setOabNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab-seccional">Seccional da OAB</Label>
                  <Input
                    id="oab-seccional"
                    placeholder="Ex: SP"
                    value={oabSeccional}
                    onChange={(e) => setOabSeccional(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <Button 
                onClick={handleOabSearch} 
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Buscando publicações...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar por OAB
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="cnj" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="process-cnj">Número CNJ do Processo</Label>
                <Input
                  id="process-cnj"
                  placeholder="Ex: 1234567-89.2025.8.26.0100"
                  value={processCnj}
                  onChange={(e) => setProcessCnj(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCnjSearch} 
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Buscando publicações...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar por CNJ
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Publications Results */}
      {publications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Publicações Encontradas ({publications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publications.map((publication) => (
              <div
                key={publication.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{publication.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>{publication.date}</span>
                      <span className="mx-2">•</span>
                      <span>OAB: {publication.oabNumber}</span>
                    </div>
                  </div>
                  <Badge className={getUrgencyColor(publication.urgency)}>
                    {publication.urgency}
                  </Badge>
                </div>
                
                <p className="text-sm bg-muted/30 p-3 rounded">
                  {publication.content}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <PublicationViewer publication={publication} />
                  
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <ScheduleDialog 
                    publicationTitle={publication.title}
                    processNumber={publication.processNumber}
                    type="prazo"
                  />
                  
                  <ScheduleDialog 
                    publicationTitle={publication.title}
                    processNumber={publication.processNumber}
                    type="audiencia"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
