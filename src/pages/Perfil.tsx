

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
import { useState } from "react";

const Perfil = () => {
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nome: "Não informado",
    email: "Não informado",
    telefone: "Não informado",
    endereco: "Não informado",
    cargo: "Não informado",
    oab: "Não informado",
    especializacao: "Não informado",
    dataAdmissao: "Não informado"
  });

  const estatisticas = {
    processosAtivos: 0,
    processosFinalizados: 0,
    clientesAtendidos: 0,
    pontuacaoTotal: 0,
    ranking: "--"
  };

  const handleSave = () => {
    setEditMode(false);
    // Aqui você salvaria as informações
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
                      variant="outline"
                      size="sm"
                      onClick={() => editMode ? handleSave() : setEditMode(true)}
                    >
                      {editMode ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                      {editMode ? "Salvar" : "Editar"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-lg">JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{userInfo.nome}</h3>
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
    </div>
  );
};

export default Perfil;
