

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Briefcase,
  Edit,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Perfil = () => {
  const { user, profile, session, isLoading } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    nome: "Carregando...",
    email: "Carregando...",
    telefone: "(xx) xxxxx-xxxx",
    endereco: "Não informado",
    cargo: "Não informado",
    oab: "Não informado",
    especializacao: "Não informado",
    dataAdmissao: "Não informado"
  });

  // Preenche dados reais da Sessão Pessoal logada assim que carregar
  useEffect(() => {
    if (user || profile) {
      setUserInfo(prev => ({
        ...prev,
        nome: profile?.full_name || user?.name || "Usuário",
        email: profile?.email || user?.email || "email@exemplo.com",
        cargo: profile?.role === 'super_admin' ? 'CEO / Super Admin' : 
               profile?.role === 'admin' ? 'Administrador' : 'Membro Comum'
      }));
    }
  }, [user, profile]);

  const estatisticas = {
    processosAtivos: 0,
    processosFinalizados: 0,
    clientesAtendidos: 0,
    pontuacaoTotal: 0,
    ranking: "--"
  };

  const handleSave = async () => {
    try {
      if (!user?.id && !profile?.id) {
        toast({ title: "Aviso", description: "Dados da sessão ainda carregando. Tente novamente." });
        return;
      }
      
      setIsSaving(true);
      console.log('Tentando atualizar perfil do usuário:', user?.id || profile?.id);

      const updatePayload = { full_name: userInfo.nome };
      
      // Update explícito via chave primária (fallback pra .eq('user_id')) se a PK id falhar
      const targetId = profile?.id || user?.id;
      const targetColumn = profile?.id ? 'id' : 'user_id';
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq(targetColumn, targetId)
        .select()
        .single();

      if (error) {
        console.error("Erro do supabase:", error);
        throw error;
      }

      console.log("Sucesso ao atualizar:", data);
      toast({
        title: "Perfil atualizado",
        description: "Seu nome foi alterado com sucesso! Atualize a página com F5 para ver no menu superior.",
      });
      setEditMode(false);
    } catch (err: any) {
      console.error("Erro no catch do update:", err);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: err?.message || "Houve uma falha oculta ao se comunicar com o banco de dados.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <UserCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                Meu Perfil
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Gerencie suas informações pessoais e profissionais.
              </p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Informações Pessoais */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Informações Pessoais</CardTitle>
                    <Button
                      variant={editMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => editMode ? handleSave() : setEditMode(true)}
                      disabled={isSaving}
                    >
                      {editMode ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                      {editMode ? (isSaving ? "Salvando..." : "Salvar") : "Editar"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                          {userInfo.nome?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {editMode ? (
                          <Input
                            className="text-xl font-semibold mb-2 max-w-[300px]"
                            value={userInfo.nome}
                            onChange={(e) => setUserInfo({...userInfo, nome: e.target.value})}
                            placeholder="Seu nome completo"
                          />
                        ) : (
                          <h3 className="text-xl font-semibold">{userInfo.nome}</h3>
                        )}
                        <p className="text-muted-foreground">{userInfo.cargo}</p>
                        <Badge variant="secondary" className="mt-1">
                          {userInfo.oab}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {editMode ? (
                            <Input
                              id="email"
                              value={userInfo.email}
                              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                            />
                          ) : (
                            <span>{userInfo.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {editMode ? (
                            <Input
                              id="telefone"
                              value={userInfo.telefone}
                              onChange={(e) => setUserInfo({...userInfo, telefone: e.target.value})}
                            />
                          ) : (
                            <span>{userInfo.telefone}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {editMode ? (
                            <Input
                              id="endereco"
                              value={userInfo.endereco}
                              onChange={(e) => setUserInfo({...userInfo, endereco: e.target.value})}
                            />
                          ) : (
                            <span>{userInfo.endereco}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="especializacao">Especialização</Label>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {editMode ? (
                            <Input
                              id="especializacao"
                              value={userInfo.especializacao}
                              onChange={(e) => setUserInfo({...userInfo, especializacao: e.target.value})}
                            />
                          ) : (
                            <span>{userInfo.especializacao}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Admissão</Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{userInfo.dataAdmissao}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Estatísticas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{estatisticas.pontuacaoTotal}</div>
                      <p className="text-sm text-muted-foreground">Pontos Totais</p>
                    </div>

                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="text-2xl font-bold">#{estatisticas.ranking}</div>
                      <p className="text-sm text-muted-foreground">Posição no Ranking</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Processos Ativos</span>
                        <span className="font-medium">{estatisticas.processosAtivos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Processos Finalizados</span>
                        <span className="font-medium">{estatisticas.processosFinalizados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Clientes Atendidos</span>
                        <span className="font-medium">{estatisticas.clientesAtendidos}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
      </div>

      {/* PAINEL DE DIAGNÓSTICO TEMPORÁRIO */}
      <div className="mt-10 p-4 bg-muted/30 border border-dashed rounded-lg text-[10px] font-mono opacity-50 hover:opacity-100 transition-opacity">
        <p className="font-bold mb-1 uppercase tracking-wider text-muted-foreground">Diagnóstico de Sessão:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex gap-2">
            <span>Session:</span>
            <span className={session ? "text-green-500" : "text-red-500"}>{session ? "OK" : "NULL"}</span>
          </div>
          <div className="flex gap-2">
            <span>User Object:</span>
            <span className={user?.id ? "text-green-500" : "text-red-500"}>{user?.id ? "OK" : "NULL"}</span>
          </div>
          <div className="flex gap-2">
            <span>Profile Data:</span>
            <span className={profile?.id ? "text-green-500" : "text-red-500"}>{profile?.id ? "OK" : "NULL"}</span>
          </div>
          <div className="flex gap-2">
            <span>Is Loading:</span>
            <span className={isLoading ? "text-amber-500" : "text-blue-500"}>{isLoading ? "TRUE" : "FALSE"}</span>
          </div>
        </div>
        {(!user?.id || !profile?.id) && !isLoading && (
          <p className="text-red-400 mt-2 italic">⚠️ Falha Crítica: Usuário logado mas dados não populados no Context.</p>
        )}
      </div>
    </div>
  );
};

export default Perfil;
