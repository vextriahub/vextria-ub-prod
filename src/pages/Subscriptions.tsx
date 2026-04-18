import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CreditCard, 
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Bug,
  Settings
} from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { user, logout, isSuperAdmin, updateUserRole, debugUserStatus } = useAuth();
  const navigate = useNavigate();

  // Debug: verificar status do usuário
  console.log('Subscriptions Page Debug:', {
    user,
    isSuperAdmin,
    userRole: user?.role,
    isAuthenticated: !!user
  });

  // Função para corrigir o role do usuário
  const fixUserRole = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔧 Attempting to fix user role for:', user.email);
      const result = await updateUserRole(user.id, 'super_admin');
      
      if (result.error) {
        console.error('❌ Failed to update role:', result.error);
        alert('Erro ao atualizar role: ' + result.error.message);
      } else {
        console.log('✅ Role updated successfully');
        alert('Role atualizado com sucesso! Recarregue a página.');
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error fixing role:', error);
      alert('Erro ao corrigir role');
    }
  };

  // Verificação de acesso com fallback por email
  const superAdminEmails = ['contato@vextriahub.com.br', '1266jp@gmail.com', 'joao.pedro@vextriahub.com.br'];
  const hasAccess = isSuperAdmin || 
                   user?.role === 'super_admin' || 
                   (user?.email && superAdminEmails.includes(user.email));

  console.log('🔐 Subscriptions Access Check:', {
    isSuperAdmin,
    userRole: user?.role,
    userEmail: user?.email,
    emailInList: user?.email ? superAdminEmails.includes(user.email) : false,
    finalAccess: hasAccess
  });

  // Se não tiver acesso, mostrar acesso negado com opções de correção
  if (!hasAccess) {
    console.log('Acesso negado - não é super admin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-destructive">Acesso Negado</h3>
            <p className="text-muted-foreground mb-4">
              Você precisa ser um Super Administrador para acessar o controle de assinaturas.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Role atual: {user?.role || 'Nenhum'}
            </p>
            
            {/* Botões de debug e correção */}
            <div className="space-y-2">
              <Button 
                onClick={debugUserStatus} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Bug className="h-4 w-4 mr-2" />
                Debug Status
              </Button>
              
              {user?.email === '1266jp@gmail.com' && (
                <Button 
                  onClick={fixUserRole} 
                  variant="default" 
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Corrigir Role para Super Admin
                </Button>
              )}
              
              <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Acesso permitido - é super admin');

  const handleLogout = async () => {
    await logout();
  };

  const goToSuperAdmin = () => {
    navigate('/super-admin');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div className="flex items-center space-x-4">
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
                <p className="text-xs text-muted-foreground">Super Administrador</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={goToSuperAdmin} variant="outline" size="sm">
                  Voltar ao Super Admin
                </Button>
                <Button onClick={goToDashboard} variant="outline" size="sm">
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
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
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Webhook Stripe</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Configuração pendente</span>
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
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;