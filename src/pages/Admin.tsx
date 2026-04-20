import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useExclusoesPendentes } from "@/hooks/useExclusoesPendentes";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useUserRole } from "@/hooks/useUserRole";
import { useOfficeManagement } from "@/hooks/useOfficeManagement";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Shield, Check, X, Clock, User, FileText, AlertCircle, Building2, CreditCard, Users, TrendingUp, Activity } from "lucide-react";
import { OfficeControlPanel } from "@/components/SuperAdmin/OfficeControlPanel";
import { SubscriptionControlPanel } from "@/components/SuperAdmin/SubscriptionControlPanel";
import { GlobalMetrics } from "@/components/Admin/GlobalMetrics";
import { useAuth } from "@/contexts/AuthContext";

const getTabelaDisplayName = (tabela: string) => {
  const nomes: Record<string, string> = {
    clientes: 'Cliente',
    processos: 'Processo',
    audiencias: 'Audiência',
    prazos: 'Prazo',
    tarefas: 'Tarefa',
    atendimentos: 'Atendimento',
    metas: 'Meta',
    financeiro: 'Financeiro',
  };
  return nomes[tabela] || tabela;
};

const getTabelaIcon = (tabela: string) => {
  const icones: Record<string, any> = {
    clientes: User,
    processos: FileText,
    audiencias: Clock,
    prazos: AlertCircle,
    tarefas: Check,
    atendimentos: User,
    metas: FileText,
    financeiro: FileText,
  };
  return icones[tabela] || FileText;
};

import { useSearchParams } from "react-router-dom";

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { canViewAdminFeatures, isSuperAdmin, isLoading: authLoading } = useUserRole();
  const { user } = useAuth();
  
  const isMainSuperAdmin = user?.email?.toLowerCase().trim() === 'contato@vextriahub.com.br';

  // Sync activeTab when URL changes (from sidebar clicks)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };
  
  const {
    data: exclusoesPendentes,
    loading: requestsLoading,
    aprovarExclusao,
    rejeitarExclusao,
    aprovarMultiplasExclusoes,
    canManage,
    isEmpty
  } = useExclusoesPendentes();

  const multiSelect = useMultiSelect(exclusoesPendentes);
  const [processando, setProcessando] = useState<string | null>(null);

  const handleAprovar = async (id: string) => {
    setProcessando(id);
    await aprovarExclusao(id);
    setProcessando(null);
  };

  const handleRejeitar = async (id: string) => {
    setProcessando(id);
    await rejeitarExclusao(id);
    setProcessando(null);
  };

  const handleAprovarSelecionados = async () => {
    const selectedIds = multiSelect.getSelectedItems().map(item => item.id);
    setProcessando('multiplo');
    await aprovarMultiplasExclusoes(selectedIds);
    multiSelect.clearSelection();
    setProcessando(null);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canViewAdminFeatures) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">
              Você precisa ser um administrador para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden animate-in fade-in duration-700">
      <div className="w-full">
        {isMainSuperAdmin ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            {/* TabsList removido — navegação feita pelo sidebar */}

            <TabsContent value="dashboard" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
              <GlobalMetrics />
            </TabsContent>

            <TabsContent value="offices" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
              <OfficeControlPanel />
            </TabsContent>

            <TabsContent value="subscriptions" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
              <SubscriptionControlPanel />
            </TabsContent>

            <TabsContent value="requests" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 mt-0">
            {/* Stats Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pendentes</p>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-4xl font-extrabold text-amber-500">{exclusoesPendentes.length}</p>
              </div>

              <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selecionadas</p>
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-4xl font-extrabold text-foreground">{multiSelect.selectedCount}</p>
              </div>

              <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categorias</p>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-4xl font-extrabold text-emerald-500">{new Set(exclusoesPendentes.map(e => e.tabela)).size}</p>
              </div>
            </div>

            {!multiSelect.isNoneSelected && (
              <div className="glass-card p-6 rounded-3xl bg-primary/5 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl shadow-premium">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold">{multiSelect.selectedCount} Solicitações Selecionadas</p>
                    <p className="text-sm font-medium opacity-70">Ações em massa para otimização de fluxo.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleAprovarSelecionados}
                  size="lg"
                  className="rounded-2xl h-14 px-10 text-lg font-bold shadow-premium bg-primary hover:bg-primary/90"
                >
                  <Check className="mr-2 h-6 w-6" />
                  Aprovar Massa
                </Button>
              </div>
            )}

                  {requestsLoading && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Carregando solicitações...</p>
                      </CardContent>
                    </Card>
                  )}

                  {isEmpty && !requestsLoading && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação pendente</h3>
                        <p className="text-muted-foreground">
                          Todas as solicitações de exclusão foram processadas.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selection Controls */}
                  {exclusoesPendentes.length > 0 && (
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
                            `${multiSelect.selectedCount} de ${exclusoesPendentes.length} selecionado(s)`
                          ) : (
                            "Selecionar todos"
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

                  {/* Exclusões Pendentes */}
                  <div className="space-y-4">
                    {exclusoesPendentes.map((exclusao) => {
                      const TabelaIcon = getTabelaIcon(exclusao.tabela);
                      const dadosRegistro = exclusao.dados_registro as any;
                      
                      return (
                        <Card 
                          key={exclusao.id}
                          className={`transition-all duration-200 ${
                            multiSelect.isSelected(exclusao.id) ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={multiSelect.isSelected(exclusao.id)}
                                  onCheckedChange={() => multiSelect.toggleItem(exclusao.id)}
                                />
                                <div className="flex items-center gap-2">
                                  <TabelaIcon className="h-5 w-5 text-primary" />
                                  <div>
                                    <CardTitle className="text-lg">
                                      Exclusão de {getTabelaDisplayName(exclusao.tabela)}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      Solicitado em {format(new Date(exclusao.solicitado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                Pendente
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Informações do registro */}
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <h4 className="font-medium mb-2">Dados do Registro:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {dadosRegistro.nome && (
                                  <div>
                                    <span className="text-muted-foreground">Nome:</span> {dadosRegistro.nome}
                                  </div>
                                )}
                                {dadosRegistro.titulo && (
                                  <div>
                                    <span className="text-muted-foreground">Título:</span> {dadosRegistro.titulo}
                                  </div>
                                )}
                                {dadosRegistro.numero_processo && (
                                  <div>
                                    <span className="text-muted-foreground">Nº Processo:</span> {dadosRegistro.numero_processo}
                                  </div>
                                )}
                                {dadosRegistro.email && (
                                  <div>
                                    <span className="text-muted-foreground">Email:</span> {dadosRegistro.email}
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Status:</span> {dadosRegistro.status || 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Informações da solicitação */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Solicitado por:</span>{' '}
                                  {(exclusao as any).user?.full_name || (exclusao as any).user?.email || 'Usuário desconhecido'}
                                </p>
                                {exclusao.motivo && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Motivo:</span> {exclusao.motivo}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejeitar(exclusao.id)}
                                  disabled={processando === exclusao.id}
                                  className="flex items-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Rejeitar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAprovar(exclusao.id)}
                                  disabled={processando === exclusao.id}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Aprovar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Non-super admin view (existing deletion requests view)
              <div className="space-y-6">
                {!multiSelect.isNoneSelected && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAprovarSelecionados}
                      disabled={processando === 'multiplo'}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Aprovar Selecionados ({multiSelect.selectedCount})
                    </Button>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">
                        {exclusoesPendentes.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Solicitações Pendentes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-amber-600">
                        {multiSelect.selectedCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Itens Selecionados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {new Set(exclusoesPendentes.map(e => e.tabela)).size}
                      </div>
                      <p className="text-sm text-muted-foreground">Tipos de Registros</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Exclusões Pendentes */}
                <div className="space-y-4">
                  {exclusoesPendentes.map((exclusao) => {
                    const TabelaIcon = getTabelaIcon(exclusao.tabela);
                    const dadosRegistro = exclusao.dados_registro as any;
                    
                    return (
                      <Card 
                        key={exclusao.id}
                        className={`transition-all duration-200 ${
                          multiSelect.isSelected(exclusao.id) ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={multiSelect.isSelected(exclusao.id)}
                                onCheckedChange={() => multiSelect.toggleItem(exclusao.id)}
                              />
                              <div className="flex items-center gap-2">
                                <TabelaIcon className="h-5 w-5 text-primary" />
                                <div>
                                  <CardTitle className="text-lg">
                                    Exclusão de {getTabelaDisplayName(exclusao.tabela)}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    Solicitado em {format(new Date(exclusao.solicitado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                              Pendente
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Informações do registro */}
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <h4 className="font-medium mb-2">Dados do Registro:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {dadosRegistro.nome && (
                                <div>
                                  <span className="text-muted-foreground">Nome:</span> {dadosRegistro.nome}
                                </div>
                              )}
                              {dadosRegistro.titulo && (
                                <div>
                                  <span className="text-muted-foreground">Título:</span> {dadosRegistro.titulo}
                                </div>
                              )}
                              {dadosRegistro.numero_processo && (
                                <div>
                                  <span className="text-muted-foreground">Nº Processo:</span> {dadosRegistro.numero_processo}
                                </div>
                              )}
                              {dadosRegistro.email && (
                                <div>
                                  <span className="text-muted-foreground">Email:</span> {dadosRegistro.email}
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Status:</span> {dadosRegistro.status || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Informações da solicitação */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Solicitado por:</span>{' '}
                                {(exclusao as any).user?.full_name || (exclusao as any).user?.email || 'Usuário desconhecido'}
                              </p>
                              {exclusao.motivo && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Motivo:</span> {exclusao.motivo}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejeitar(exclusao.id)}
                                disabled={processando === exclusao.id}
                                className="flex items-center gap-2"
                              >
                                <X className="h-4 w-4" />
                                Rejeitar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAprovar(exclusao.id)}
                                disabled={processando === exclusao.id}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default Admin;
