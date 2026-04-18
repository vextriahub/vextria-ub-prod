import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

export function CrmPipelineVendas({ onBack }: Props) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">Receita Potencial</h2>
          <p className="text-sm md:text-base text-muted-foreground">Pipeline de vendas e oportunidades</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[].map((opp: any) => (
                <div key={opp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{opp.lead}</div>
                    <div className="text-xs text-gray-500">{opp.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{opp.value}</div>
                    <div className="text-xs text-gray-500">{opp.probability}% prob.</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Receita Confirmada:</span>
                <span className="font-medium text-green-600">R$ 40.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Receita Potencial:</span>
                <span className="font-medium text-blue-600">R$ 70.000</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Pipeline:</span>
                <span className="font-bold text-lg">R$ 110.000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
