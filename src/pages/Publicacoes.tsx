
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutoPublicationFetcher } from "@/components/Publications/AutoPublicationFetcher";
import { PublicationDetailsDialog } from "@/components/Publications/PublicationDetailsDialog";
import { ScheduleDialog } from "@/components/Publications/ScheduleDialog";
import { BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Publicacoes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [publications, setPublications] = useState([

    {
      id: "1",
      processNumber: "1234567-89.2023.8.26.0001",
      title: "Citação - João Silva vs. Empresa XYZ Ltda",
      content: "Fica o requerido citado para apresentar contestação no prazo de 15 dias...",
      date: "2023-12-15",
      tags: ["citacao", "urgente"],
      status: "pending" as const
    },
    {
      id: "2", 
      processNumber: "9876543-21.2023.8.26.0002",
      title: "Sentença - Maria Santos vs. Banco ABC",
      content: "Julgo procedente o pedido para condenar o réu ao pagamento de...",
      date: "2023-12-14",
      tags: ["sentenca", "procedente"],
      status: "processed" as const
    }
  ]);

  const handleDeletePublication = (id: string) => {
    setPublications(prev => prev.filter(pub => pub.id !== id));
    toast({
      title: "Publicação excluída",
      description: "A publicação foi removida com sucesso.",
    });
  };

  const filteredPublications = publications.filter(pub =>
    pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.processNumber.includes(searchTerm) ||
    (selectedTags.length === 0 || selectedTags.some(tag => pub.tags.includes(tag)))
  );

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden animate-in">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Publicações Judiciais
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              Monitoramento inteligente de diários de justiça e intimações.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-white/5 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-sm overflow-hidden shadow-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Configuração de Monitoramento</CardTitle>
              <CardDescription className="text-sm font-medium">
                Configure a busca automática por publicações usando números CNJ de processos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoPublicationFetcher />
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/40 backdrop-blur-sm">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Publicações Encontradas</CardTitle>
                  <CardDescription className="text-sm font-medium">Lista de intimações capturadas pelo sistema.</CardDescription>
                </div>
                <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                    <Input
                      placeholder="Buscar por título ou processo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-muted/20 border-white/5 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-4">
                {filteredPublications.map((publication) => (
                  <Card key={publication.id} className="hover-lift border-white/5 bg-card/30 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                            {publication.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono bg-muted/30 w-fit px-3 py-1 rounded-full border border-white/5">
                            <span className="font-bold text-primary/70">{publication.processNumber}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span>{publication.date}</span>
                          </div>
                        </div>
                        <Badge className={cn("px-4 py-1 rounded-full font-bold uppercase tracking-tighter text-[10px]", 
                          publication.status === 'processed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20")}>
                          {publication.status === 'processed' ? 'Processada' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {publication.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0 border-white/10 bg-muted/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 bg-muted/10 p-4 rounded-xl border border-white/5">
                        {publication.content}
                      </p>
                      <div className="flex gap-3 flex-wrap items-center">
                        <PublicationDetailsDialog publication={publication} />
                        <div className="flex items-center gap-2 glass-morphism p-1 rounded-xl ml-auto">
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-white/5">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold">Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-medium">
                                  Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-4">
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePublication(publication.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                >
                                  Confirmar Exclusão
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
