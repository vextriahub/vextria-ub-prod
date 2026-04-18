import { useState } from "react";
import { ArrowLeft, Calendar, Mail, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface HistoryItem {
  id: number;
  title: string;
  date: string;
  description: string;
  details: string;
  type: string;
  status: string;
}

interface Props {
  onBack: () => void;
  opportunity: any;
}

export function CrmOportunidadeDetail({ onBack, opportunity }: Props) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [editingHistoryItem, setEditingHistoryItem] = useState<HistoryItem | null>(null);
  const [showNewHistoryDialog, setShowNewHistoryDialog] = useState(false);
  const [newHistoryForm, setNewHistoryForm] = useState({
    title: '',
    date: '',
    description: '',
    details: '',
    type: 'meeting',
    status: 'completed'
  });

  const handleCreateNewHistory = () => {
    const newId = historyItems.length > 0 ? Math.max(...historyItems.map((item: any) => item.id)) + 1 : 1;
    const newItem = {
      id: newId,
      ...newHistoryForm
    };
    setHistoryItems((prev: any) => [...prev, newItem]);
    setNewHistoryForm({
      title: '',
      date: '',
      description: '',
      details: '',
      type: 'meeting',
      status: 'completed'
    });
    setShowNewHistoryDialog(false);
  };

  const handleSaveHistoryEdit = () => {
    if (editingHistoryItem) {
      setHistoryItems((prev: any) => 
        prev.map((item: any) => 
          item.id === editingHistoryItem.id ? editingHistoryItem : item
        )
      );
      setEditingHistoryItem(null);
    }
  };

  const handleDeleteHistoryItem = (historyItemId: number) => {
    setHistoryItems((prev: any) => prev.filter((item: any) => item.id !== historyItemId));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Oportunidades
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">{opportunity?.lead}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{opportunity?.company}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes da Oportunidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Valor:</span>
              <span className="text-green-600 font-semibold">{opportunity?.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Probabilidade:</span>
              <Badge className={
                opportunity?.probability >= 80 ? "bg-green-100 text-green-800" :
                opportunity?.probability >= 60 ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }>
                {opportunity?.probability}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Estágio:</span>
              <span className="text-sm capitalize">{opportunity?.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Prazo:</span>
              <span className="text-sm">{opportunity?.dueDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800 text-sm">Próxima Ação</div>
                <div className="text-sm text-blue-600">{opportunity?.nextAction}</div>
                <div className="text-xs text-blue-500 mt-1">Prazo: {opportunity?.dueDate}</div>
              </div>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Follow-up
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar E-mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Interações</CardTitle>
          <Button onClick={() => setShowNewHistoryDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Histórico
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historyItems.map((item: any) => (
              <div 
                key={item.id}
                className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg group hover:bg-blue-100 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.type === 'meeting' ? 'bg-blue-500' : 
                  item.type === 'proposal' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}></div>
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedHistoryItem(item)}>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.date} - {item.description}</div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingHistoryItem(item);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHistoryItem(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Histórico */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={() => setSelectedHistoryItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHistoryItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedHistoryItem?.date} - {selectedHistoryItem?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Detalhes da Interação</h4>
              <p className="text-sm text-muted-foreground">
                {selectedHistoryItem?.details}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={selectedHistoryItem?.status === 'completed' ? 'default' : 'secondary'}>
                {selectedHistoryItem?.status === 'completed' ? 'Concluído' : 
                  selectedHistoryItem?.status === 'pending' ? 'Pendente' : 'Agendado'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Tipo: {selectedHistoryItem?.type === 'meeting' ? 'Reunião' : 
                      selectedHistoryItem?.type === 'proposal' ? 'Proposta' : 'Negociação'}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Histórico */}
      <Dialog open={!!editingHistoryItem} onOpenChange={(open) => !open && setEditingHistoryItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Histórico</DialogTitle>
            <DialogDescription>Edite as informações do histórico de interação</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editingHistoryItem?.title || ''}
                onChange={(e) => setEditingHistoryItem((prev: any) => prev ? {...prev, title: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                value={editingHistoryItem?.date || ''}
                onChange={(e) => setEditingHistoryItem((prev: any) => prev ? {...prev, date: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={editingHistoryItem?.description || ''}
                onChange={(e) => setEditingHistoryItem((prev: any) => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Detalhes</Label>
              <Textarea
                value={editingHistoryItem?.details || ''}
                onChange={(e) => setEditingHistoryItem((prev: any) => prev ? {...prev, details: e.target.value} : null)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={editingHistoryItem?.type || 'meeting'}
                  onValueChange={(value) => setEditingHistoryItem((prev: any) => prev ? {...prev, type: value} : null)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="proposal">Proposta</SelectItem>
                    <SelectItem value="negotiation">Negociação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editingHistoryItem?.status || 'completed'}
                  onValueChange={(value) => setEditingHistoryItem((prev: any) => prev ? {...prev, status: value} : null)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHistoryItem(null)}>Cancelar</Button>
            <Button onClick={handleSaveHistoryEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Histórico */}
      <Dialog open={showNewHistoryDialog} onOpenChange={setShowNewHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Histórico</DialogTitle>
            <DialogDescription>Adicione uma nova interação ao histórico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newHistoryForm.title}
                onChange={(e) => setNewHistoryForm(prev => ({...prev, title: e.target.value}))}
                placeholder="Ex: Reunião de apresentação"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                value={newHistoryForm.date}
                onChange={(e) => setNewHistoryForm(prev => ({...prev, date: e.target.value}))}
                placeholder="Ex: 25/01/2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newHistoryForm.description}
                onChange={(e) => setNewHistoryForm(prev => ({...prev, description: e.target.value}))}
                placeholder="Ex: Reunião para apresentar proposta"
              />
            </div>
            <div className="space-y-2">
              <Label>Detalhes</Label>
              <Textarea
                value={newHistoryForm.details}
                onChange={(e) => setNewHistoryForm(prev => ({...prev, details: e.target.value}))}
                placeholder="Descreva os detalhes da interação..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={newHistoryForm.type}
                  onValueChange={(value) => setNewHistoryForm(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="proposal">Proposta</SelectItem>
                    <SelectItem value="negotiation">Negociação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newHistoryForm.status}
                  onValueChange={(value) => setNewHistoryForm(prev => ({...prev, status: value}))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewHistoryDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateNewHistory}>Criar Histórico</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
