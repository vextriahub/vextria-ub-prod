import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OfficeControlPanel } from '@/components/SuperAdmin/OfficeControlPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Home, Settings, CreditCard } from 'lucide-react';

const SuperAdmin: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Se não for super admin, mostrar acesso negado
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-destructive">Acesso Negado</h3>
            <p className="text-muted-foreground mb-4">
              Você precisa ser um Super Administrador para acessar esta página.
            </p>
            <Button onClick={goToDashboard} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Isolado */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Super Admin</h1>
                  <p className="text-xs text-muted-foreground">VextriaHub Control Panel</p>
                </div>
              </div>
            </div>

            {/* Info do usuário e ações */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToDashboard}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Controle de Escritórios
              </h2>
              <p className="text-muted-foreground mt-2">
                Gerencie o status de pagamento e acesso dos escritórios cadastrados no sistema.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/subscriptions')}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Controle de Assinaturas
              </Button>
              <Card className="px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Sistema Ativo</span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Painel de Controle */}
        <OfficeControlPanel />

        {/* Informações adicionais */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/subscriptions')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Controle de Assinaturas</h4>
                  <p className="text-xs text-muted-foreground">
                    Gerencie pagamentos e status de acesso dos usuários
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Integração Stripe</h4>
              <p className="text-sm text-muted-foreground">
                Sistema de pagamentos integrado com Stripe
              </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Controle de Acesso</h4>
                  <p className="text-xs text-muted-foreground">
                    Suspenda ou reative escritórios conforme necessário
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Auditoria</h4>
                  <p className="text-xs text-muted-foreground">
                    Todas as ações são registradas para auditoria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 VextriaHub. Super Admin Panel - Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdmin;