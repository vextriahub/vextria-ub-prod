
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutoPublicationFetcher } from "@/components/Publications/AutoPublicationFetcher";
import { PublicationDetailsDialog } from "@/components/Publications/PublicationDetailsDialog";
import { ScheduleDialog } from "@/components/Publications/ScheduleDialog";
import { BookOpen, Trash2, Search } from "lucide-react";
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
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden animate-in">
      {/* Page Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Publicações Judiciais
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Monitoramento inteligente e centralizado de diários oficiais e intimações eletrônicas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Configurações de Monitoramento Premium */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium border-white/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Search className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold mb-2">Monitoramento Automático</h3>
            <p className="text-muted-foreground font-medium mb-8 max-w-lg">
              Cadastre novos termos ou OABs para que o sistema capture intimações automaticamente.
            </p>
            <AutoPublicationFetcher />
          </div>
        </div>

        {/* Lista de Publicações Encontradas */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            <h3 className="text-2xl font-extrabold">Últimas Intimações</h3>
            <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                  placeholder="Filtrar por título ou processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-white/5 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredPublications.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-[2rem] space-y-4">
                <div className="p-6 bg-white/5 rounded-full inline-block">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold text-lg">Nenhuma publicação encontrada para este filtro.</p>
              </div>
            ) : (
              filteredPublications.map((publication) => (
                <div key={publication.id} className="glass-card hover-lift p-8 rounded-[2.5rem] border-white/5 shadow-premium group relative">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="text-2xl font-extrabold group-hover:text-primary transition-colors duration-500 leading-tight">
                            {publication.title}
                          </h4>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 rounded-lg">
                              {publication.processNumber}
                            </Badge>
                            <span className="text-muted-foreground text-sm font-medium">Publicado em: {publication.date}</span>
                          </div>
                        </div>
                        <Badge className={`${publication.status === 'processed' ? "bg-green-500 text-white" : "bg-primary text-white"} px-4 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-widest`}>
                          {publication.status === 'processed' ? 'Processada' : 'Pendente'}
                        </Badge>
                      </div>

                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-muted-foreground font-medium line-clamp-4 leading-relaxed">
                        {publication.content}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {publication.tags.map((tag) => (
                          <Badge key={tag} className="bg-white/5 text-muted-foreground border-white/5 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-48 flex flex-col gap-3 justify-center">
                      <PublicationDetailsDialog publication={publication} />
                      <div className="h-px bg-white/5 my-2" />
                      <div className="grid grid-cols-3 gap-2">
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
                            <Button variant="ghost" className="h-12 w-full rounded-2xl hover:bg-red-500/10 hover:text-red-500 group/del">
                              <Trash2 className="h-5 w-5 text-red-500/50 group-hover/del:text-red-500 transition-colors" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-white/10 bg-background/80 backdrop-blur-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-extrabold">Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-lg font-medium">
                                Esta publicação será removida permanentemente do sistema. Prosseguir?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-3">
                              <AlertDialogCancel className="rounded-2xl border-white/5 h-12 px-8 font-bold">Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePublication(publication.id)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 px-8 font-bold"
                              >
                                Confirmar Exclusão
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
