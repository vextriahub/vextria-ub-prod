import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdminOffices } from '@/hooks/useSuperAdminOffices';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Search, 
  Eye, 
  UserX, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Users,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OfficeControlPanel: React.FC = () => {
  const { admins, loading, error, refresh, isEmpty } = useSuperAdminOffices();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar administradores baseado na busca e status
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = !searchTerm || 
      admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.office_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || admin.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funções para gerenciar escritórios
  const handleVerDetalhes = (adminId: string) => {
    toast({
      title: "Ver Detalhes",
      description: "Detalhes do escritório serão exibidos em breve",
    });
  };

  const handleSuspenderAcesso = (adminId: string) => {
    toast({
      title: "Suspender Acesso",
      description: "Funcionalidade será implementada com controle de permissões",
      variant: "destructive",
    });
  };

  const handleEnviarCobranca = (adminId: string) => {
    toast({
      title: "Enviar Cobrança",
      description: "Sistema de cobrança será implementado em breve",
    });
  };

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Em dia
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Próximo do vencimento
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Desconhecido
          </Badge>
        );
    }
  };

  // Estatísticas para os cards superiores
  const stats = {
    total: admins.length,
    emDia: admins.filter(a => a.payment_status === 'em_dia').length,
    proximoVencimento: admins.filter(a => a.payment_status === 'proximo_vencimento').length,
    vencidos: admins.filter(a => a.payment_status === 'vencido').length,
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Escritórios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Dia</p>
                <p className="text-2xl font-bold text-green-600">{stats.emDia}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximo Vencimento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.proximoVencimento}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Controle de Escritórios
              </CardTitle>
              <CardDescription>
                Gerencie o status de pagamento e acesso dos escritórios
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou escritório..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="em_dia">Em dia</SelectItem>
                <SelectItem value="proximo_vencimento">Próximo vencimento</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Carregando administradores...</span>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum administrador encontrado</h3>
              <p className="text-muted-foreground">
                Não há administradores cadastrados no sistema.
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Escritório</TableHead>
                    <TableHead>Status do Pagamento</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {admin.full_name || 'Nome não informado'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {admin.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {admin.office_name || 'Sem escritório'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(admin.payment_status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(admin.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalhes(admin.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEnviarCobranca(admin.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspenderAcesso(admin.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Resultado da busca */}
          {!loading && !isEmpty && filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termos de busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};