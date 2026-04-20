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
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden entry-animate">
      {/* Page Header Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Gestão de Relacionamento
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Converta prospecções em contratos e gerencie seu funil de vendas com inteligência.
          </p>
        </div>
        
        <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl shadow-premium">
          <Button 
            onClick={() => setShowNovoLeadDialog(true)}
            size="lg"
            className="rounded-xl h-12 shadow-premium bg-primary hover:bg-primary/90 font-bold px-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Navigation Groups Premium */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="glass-card p-2 rounded-2xl flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-xl font-bold px-6 h-11 hover:bg-primary/10 hover:text-primary transition-all">
                Pipeline & Prospecção
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 rounded-2xl border-white/5 bg-background/80 backdrop-blur-2xl p-2">
              <DropdownMenuItem className="rounded-xl p-4 cursor-pointer hover:bg-primary/10 mb-1 transition-all" onSelect={() => handleMenuClick("funil-vendas")}>
                <Target className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="font-extrabold text-sm">Funil Estratégico</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Fluxo completo de vendas</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-all" onSelect={() => handleMenuClick("oportunidades")}>
                <TrendingUp className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="font-extrabold text-sm">Oportunidades Ativas</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Gestão de leads qualificados</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="glass-card p-2 rounded-2xl flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-xl font-bold px-6 h-11 hover:bg-primary/10 hover:text-primary transition-all">
                Análises Dinâmicas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 rounded-2xl border-white/5 bg-background/80 backdrop-blur-2xl p-2">
              <DropdownMenuItem className="rounded-xl p-4 cursor-pointer hover:bg-primary/10 mb-1 transition-all" onSelect={() => handleMenuClick("relatorios")}>
                <BarChart3 className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="font-extrabold text-sm">Performance CRM</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Relatórios e ROI</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-all" onSelect={() => handleMenuClick("metas")}>
                <Target className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="font-extrabold text-sm">Metas Comerciais</p>
                  <p className="text-[10px] text-muted-foreground font-medium">KPIs de aquisição</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="glass-card p-2 rounded-2xl flex items-center gap-1 ml-auto">
          <Button variant="ghost" className="rounded-xl font-bold px-6 h-11 hover:bg-white/5 opacity-60 hover:opacity-100 transition-all" onClick={() => window.location.href = '/configuracoes'}>
            Parâmetros CRM
          </Button>
        </div>
      </div>

      {/* Stats Premium Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group cursor-pointer" onClick={() => handleCardClick("leads")}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Base Total</p>
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-black text-foreground">124</p>
          <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">Leads em observação</p>
        </div>
        
        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group cursor-pointer" onClick={() => handleCardClick("leads-quentes")}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Leads Quentes</p>
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Phone className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-orange-500">28</p>
          <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">Potencial de contrato imediato</p>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group cursor-pointer" onClick={() => handleCardClick("conversoes")}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sucesso Conversão</p>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-emerald-500">32%</p>
          <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">Taxa média mensal</p>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group cursor-pointer" onClick={() => handleCardClick("receita-potencial")}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Valor Pipeline</p>
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-black text-gradient">R$ 142k</p>
          <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">Previsão para 60 dias</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="glass-card p-2 rounded-3xl inline-flex h-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger value="leads" className="rounded-2xl px-10 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium transition-all">
                Pipeline Leads
              </TabsTrigger>
              <TabsTrigger value="clientes" className="rounded-2xl px-10 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium transition-all">
                Histórico Conversão
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input
                placeholder="Filtrar base de leads..."
                className="pl-12 h-12 bg-background/50 border-white/5 rounded-xl font-medium"
              />
            </div>
            <Button variant="ghost" className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/5">
              <Filter className="h-5 w-5 opacity-40 hover:opacity-100 transition-opacity" />
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
      
      {/* Dialog de Novo Lead */}
      <NovoLeadDialog
        open={showNovoLeadDialog}
        onOpenChange={setShowNovoLeadDialog}
        onSave={() => console.log("Lead saved")}
      />
    </div>
  );
}
