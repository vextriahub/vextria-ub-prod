
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, FileText, Plus, Search, Filter, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { NovaAudienciaDialog } from "@/components/Audiencias/NovaAudienciaDialog";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getInitialData } from "@/utils/initialData";


const Audiencias = () => {
  const { isFirstLogin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mockAudienciasData: any[] = [];

  const [audiencias, setAudiencias] = useState(mockAudienciasData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada": return "bg-blue-500";
      case "confirmada": return "bg-green-500";
      case "pendente": return "bg-yellow-500";
      case "realizada": return "bg-gray-500";
      case "cancelada": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendada": return "Agendada";
      case "confirmada": return "Confirmada";
      case "pendente": return "Pendente";
      case "realizada": return "Realizada";
      case "cancelada": return "Cancelada";
      default: return status;
    }
  };

  const filteredAudiencias = audiencias.filter(audiencia => {
    const matchesSearch = audiencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audiencia.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || audiencia.status === statusFilter;
    const matchesTipo = tipoFilter === "todos" || audiencia.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const multiSelect = useMultiSelect(filteredAudiencias);

  const handleAddAudiencia = (novaAudiencia: any) => {
    const audienciaComId = {
      ...novaAudiencia,
      id: Date.now()
    };
    setAudiencias(prev => [audienciaComId, ...prev]);
  };

  const handleDeleteSelected = () => {
    const selectedItems = multiSelect.getSelectedItems();
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhuma audiência selecionada",
        description: "Selecione pelo menos uma audiência para excluir.",
        variant: "destructive"
      });
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const selectedIds = multiSelect.getSelectedItems().map(item => item.id);
    setAudiencias(prev => prev.filter(audiencia => !selectedIds.includes(audiencia.id)));
    
    toast({
      title: "Audiências excluídas",
      description: `${multiSelect.selectedCount} audiência(s) foram excluídas com sucesso.`,
    });
    
    multiSelect.clearSelection();
    setDeleteDialogOpen(false);
    setIsDeleting(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audiências</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Gerencie suas audiências e compromissos judiciais
                </p>
              </div>
              <div className="flex gap-2">
                {!multiSelect.isNoneSelected && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Selecionadas ({multiSelect.selectedCount})
                  </Button>
                )}
                <NovaAudienciaDialog onAddAudiencia={handleAddAudiencia} />
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar audiências..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="agendada">Agendada</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                      <SelectItem value="Família">Família</SelectItem>
                      <SelectItem value="Previdenciário">Previdenciário</SelectItem>
                      <SelectItem value="Cível">Cível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="lista" className="space-y-4">
              <TabsList>
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="calendario">Calendário</TabsTrigger>
              </TabsList>

              <TabsContent value="lista" className="space-y-4">
                {/* Selection Controls */}
                {filteredAudiencias.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={multiSelect.isAllSelected}
                        onCheckedChange={() => 
                          multiSelect.isAllSelected ? multiSelect.clearSelection() : multiSelect.selectAll()
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {multiSelect.selectedCount > 0 ? (
                          `${multiSelect.selectedCount} de ${filteredAudiencias.length} selecionada(s)`
                        ) : (
                          "Selecionar todas"
                        )}
                      </span>
                    </div>
                    {multiSelect.selectedCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={multiSelect.clearSelection}
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </div>
                )}

                <div className="grid gap-4">
                  {filteredAudiencias.map((audiencia) => (
                    <Card key={audiencia.id} className={`hover:shadow-md transition-all duration-200 ${
                      multiSelect.isSelected(audiencia.id) ? "ring-2 ring-primary" : ""
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                          <Checkbox
                            checked={multiSelect.isSelected(audiencia.id)}
                            onCheckedChange={() => multiSelect.toggleItem(audiencia.id)}
                            className="self-start"
                          />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-lg">{audiencia.titulo}</h3>
                              <Badge className={`${getStatusColor(audiencia.status)} text-white`}>
                                {getStatusText(audiencia.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(audiencia.data).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{audiencia.hora}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{audiencia.local}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{audiencia.cliente}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{audiencia.tipo}</Badge>
                              {audiencia.observacao && (
                                <p className="text-sm text-muted-foreground italic">
                                  {audiencia.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex lg:flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calendario" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendário de Audiências</CardTitle>
                    <CardDescription>
                      Visualização mensal das suas audiências agendadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Calendário de audiências em desenvolvimento</p>
                      <p className="text-sm">Em breve você poderá visualizar suas audiências em formato de calendário</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DeleteConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={handleConfirmDelete}
              title="Excluir Audiências"
              description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} audiência(s)? Esta ação não pode ser desfeita.`}
              isLoading={isDeleting}
            />
    </div>
  );
};

export default Audiencias;
