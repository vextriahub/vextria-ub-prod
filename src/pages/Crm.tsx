import { useState } from "react";
import { UserCheck, Phone, Mail, Building2, Calendar, Filter, Search, Plus, Target, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NovoLeadDialog } from "@/components/Crm/NovoLeadDialog";
import { getStatusColor } from "@/components/Crm/CrmUtils";

// Importações dos novos componentes modularizados
import { CrmLeadsList } from "@/components/Crm/CrmLeadsList";
import { CrmConversoes } from "@/components/Crm/CrmConversoes";
import { CrmPipelineVendas } from "@/components/Crm/CrmPipelineVendas";
import { CrmFunilVendas } from "@/components/Crm/CrmFunilVendas";
import { CrmOportunidades } from "@/components/Crm/CrmOportunidades";
import { CrmOportunidadeDetail } from "@/components/Crm/CrmOportunidadeDetail";
import { 
  CrmRelatorios, 
  CrmMetas, 
  CrmEmailMarketing, 
  CrmFollowUp 
} from "@/components/Crm/CrmDashboards";

export default function Crm() {
  const [activeTab, setActiveTab] = useState("leads");
  const [currentView, setCurrentView] = useState("main");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showNovoLeadDialog, setShowNovoLeadDialog] = useState(false);

  const handleMenuClick = (view: string) => {
    setCurrentView(view);
    setActiveTab("leads");
  };

  const handleCardClick = (view: string) => {
    setCurrentView(view);
    setActiveTab("leads");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setActiveTab("leads");
  };

  const handleOpportunityClick = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setCurrentView("opportunity-detail");
  };

  const renderSpecificView = () => {
    switch (currentView) {
      case "leads":
        return <CrmLeadsList onBack={handleBackToMain} tipo="todos" />;
      case "leads-quentes":
        return <CrmLeadsList onBack={handleBackToMain} tipo="quentes" />;
      case "conversoes":
        return <CrmConversoes onBack={handleBackToMain} />;
      case "receita-potencial":
        return <CrmPipelineVendas onBack={handleBackToMain} />;
      case "funil-vendas":
        return <CrmFunilVendas onBack={handleBackToMain} />;
      case "oportunidades":
        return <CrmOportunidades onBack={handleBackToMain} onOpportunityClick={handleOpportunityClick} />;
      case "opportunity-detail":
        return <CrmOportunidadeDetail onBack={() => setCurrentView("oportunidades")} opportunity={selectedOpportunity} />;
      case "relatorios":
        return <CrmRelatorios onBack={handleBackToMain} />;
      case "metas":
        return <CrmMetas onBack={handleBackToMain} />;
      case "email-marketing":
        return <CrmEmailMarketing onBack={handleBackToMain} />;
      case "follow-up":
        return <CrmFollowUp onBack={handleBackToMain} />;
      default:
        return null;
    }
  };

  if (currentView !== "main") {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {renderSpecificView()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden animate-in">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                CRM & Leads
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              Transforme prospecções em contratos com gestão inteligente de relacionamento.
            </p>
          </div>
          <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl">
            <Button size="lg" className="rounded-xl shadow-premium h-10 md:h-12 px-4 md:px-6" onClick={() => setShowNovoLeadDialog(true)}>
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-center">
                Pipeline
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("funil-vendas")}>
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Funil de Vendas</div>
                  <div className="text-sm text-muted-foreground">Visualize o pipeline completo</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("oportunidades")}>
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Oportunidades</div>
                  <div className="text-sm text-muted-foreground">Gerencie oportunidades ativas</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-center">Análises</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("relatorios")}>
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Relatórios</div>
                  <div className="text-sm text-muted-foreground">Análises detalhadas de performance</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("metas")}>
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Metas</div>
                  <div className="text-sm text-muted-foreground">Acompanhe o progresso das metas</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-center">Automação</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("email-marketing")}>
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">E-mail Marketing</div>
                  <div className="text-sm text-muted-foreground">Campanhas automatizadas</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer" onSelect={() => handleMenuClick("follow-up")}>
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Follow-up</div>
                  <div className="text-sm text-muted-foreground">Lembretes automáticos</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = '/configuracoes'}>
            Configurações
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift border-white/5 bg-card/40 overflow-hidden cursor-pointer group" onClick={() => handleCardClick("leads")}>
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Leads</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">0</div>
              <p className="text-xs font-medium text-muted-foreground mt-1 opacity-70">Ver base completa</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40 overflow-hidden cursor-pointer group" onClick={() => handleCardClick("leads-quentes")}>
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Leads Quentes</CardTitle>
              <Phone className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">0</div>
              <p className="text-xs font-medium text-muted-foreground mt-1 opacity-70">Oportunidades imediatas</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40 overflow-hidden cursor-pointer group" onClick={() => handleCardClick("conversoes")}>
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversões</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">0</div>
              <p className="text-xs font-medium text-muted-foreground mt-1 opacity-70">Taxa de sucesso mensal</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40 overflow-hidden cursor-pointer group" onClick={() => handleCardClick("receita-potencial")}>
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">VPL Estimado</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">R$ 110k</div>
              <p className="text-xs font-medium text-muted-foreground mt-1 opacity-70">Pipeline ponderado</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Buscar..." className="pl-10" />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Leads Ativos</CardTitle>
                <CardDescription className="text-sm">Gerencie seus leads e oportunidades de negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((lead: any) => (
                    <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{lead.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{lead.company}</div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {lead.phone}
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-2">
                          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          <div className="text-xs md:text-sm text-gray-500">{lead.lastContact}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Clientes Ativos</CardTitle>
                <CardDescription className="text-sm">Clientes que já contrataram seus serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((cliente: any) => (
                    <div key={cliente.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{cliente.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{cliente.company}</div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {cliente.phone}
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-4">
                          <div className="text-center">
                            <div className="font-medium text-green-600 text-sm md:text-base">{cliente.value}</div>
                            <div className="text-xs md:text-sm text-gray-500">{cliente.cases} casos</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog de Novo Lead */}
      <NovoLeadDialog
        open={showNovoLeadDialog}
        onOpenChange={setShowNovoLeadDialog}
        onSave={() => console.log("Lead saved")}
      />
    </div>
  );
}
