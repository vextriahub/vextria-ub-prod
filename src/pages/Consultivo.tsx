
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Removed duplicate sidebar imports as they're already provided by AppLayout
import { ConsultiveTab } from "@/components/Publications/ConsultiveTab";
import { MessageSquareText, Filter, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Consultivo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filtroCliente, setFiltroCliente] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se veio um filtro de cliente da navegação
    const clientFilter = location.state?.clientFilter;
    if (clientFilter) {
      setFiltroCliente(clientFilter);
    }
  }, [location]);

  const limparFiltro = () => {
    setFiltroCliente(null);
  };

  const voltarParaClientes = () => {
    navigate('/clientes');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {filtroCliente && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={voltarParaClientes}
                      className="p-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <MessageSquareText className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold">Consultivo</h1>
                </div>
                {filtroCliente && (
                  <Button
                    variant="outline"
                    onClick={voltarParaClientes}
                  >
                    Voltar para Clientes
                  </Button>
                )}
              </div>

              {/* Filtro de Cliente Ativo */}
              {filtroCliente && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">
                    Consultivo para: <strong>{filtroCliente}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltro}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Informações específicas do cliente no consultivo */}
              {filtroCliente && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Consultivo Personalizado - {filtroCliente}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Áreas de Interesse</h4>
                        <div className="space-y-1">
                          {filtroCliente === "Maria Silva" && (
                            <>
                              <p className="text-sm">• Direito de Família</p>
                              <p className="text-sm">• Direito Civil - Cobrança</p>
                            </>
                          )}
                          {filtroCliente === "João Santos" && (
                            <>
                              <p className="text-sm">• Direito Trabalhista</p>
                            </>
                          )}
                          {filtroCliente === "Tech Solutions Ltda" && (
                            <>
                              <p className="text-sm">• Direito Empresarial</p>
                              <p className="text-sm">• Contratos Comerciais</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Últimas Consultas</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {filtroCliente === "Maria Silva" && (
                            <>
                              <p>• Processo de divórcio consensual</p>
                              <p>• Ação de cobrança - procedimentos</p>
                            </>
                          )}
                          {filtroCliente === "João Santos" && (
                            <>
                              <p>• Recurso trabalhista - prazos</p>
                            </>
                          )}
                          {filtroCliente === "Tech Solutions Ltda" && (
                            <>
                              <p>• Contratos de prestação de serviços</p>
                              <p>• Questões societárias</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <ConsultiveTab clienteFilter={filtroCliente} />
      </div>
    </div>
  );
}
