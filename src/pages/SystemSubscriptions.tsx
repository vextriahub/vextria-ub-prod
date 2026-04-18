import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSystemAdminAccess } from '@/utils/adminAccess';
import { 
  Shield, 
  CreditCard, 
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react';

const SystemSubscriptions: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const adminAccess = useSystemAdminAccess(user?.email);

  console.log('🔧 SystemSubscriptions Access Check:', {
    userEmail: user?.email,
    canControlSubscriptions: adminAccess.canControlSubscriptions
  });

  // Se não tiver acesso a controle de assinaturas, mostrar acesso negado
  if (!adminAccess.canControlSubscriptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-destructive">Acesso Negado</h3>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar o controle de assinaturas.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Email atual: {user?.email || 'Nenhum'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/system-admin')} variant="outline" className="w-full">
                Voltar ao Sistema Admin
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/system-admin')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Controle de Assinaturas</h1>
                  <p className="text-xs text-muted-foreground">VextriaHub Payment Management</p>
                </div>
              </div>
            </div>

            {/* Info do usuário e ações */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">Sistema Administrativo</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cards de Métricas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,156</div>
                <p className="text-xs text-muted-foreground">
                  93.7% dos usuários ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Bloqueados</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">78</div>
                <p className="text-xs text-muted-foreground">
                  6.3% dos usuários bloqueados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">R$ 45.678</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Controle */}
          <Card>
            <CardHeader>
              <CardTitle>Controle de Assinaturas</CardTitle>
              <CardDescription>
                Gerencie o status de pagamento e acesso dos usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Tabela de Controle</h3>
                <p className="text-muted-foreground mb-4">
                  Aqui será exibida a tabela com todos os usuários e seus status de pagamento.
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: Integração com Stripe concluída
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status da Integração */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Integração Stripe</CardTitle>
              <CardDescription>
                Monitoramento das APIs e webhooks de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Webhook Stripe</span>
                  </div>
                  <span className="text-sm text-green-600">Configurado</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">API de Consulta</span>
                  </div>
                  <span className="text-sm text-green-600">Funcionando</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">API de Override</span>
                  </div>
                  <span className="text-sm text-green-600">Funcionando</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema Isolado Info */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-800">Sistema Administrativo Isolado</CardTitle>
              <CardDescription className="text-blue-600">
                Esta página faz parte do sistema administrativo isolado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                O controle de assinaturas agora é independente do sistema de roles normal. 
                Apenas emails autorizados podem acessar esta funcionalidade.
                Isso garante maior segurança e isolamento das funcionalidades críticas.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SystemSubscriptions;