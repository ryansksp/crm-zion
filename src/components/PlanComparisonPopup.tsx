import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Plan {
  id: string;
  name: string;
  price: number;
  financingDetails: string;
  // Add other relevant fields as needed
}

const plans: Plan[] = [
  {
    id: 'plan1',
    name: 'Plano Básico',
    price: 1000,
    financingDetails: 'Financiamento detalhado do Plano Básico: parcelas fixas, taxa de juros baixa, prazo de 12 meses.',
  },
  {
    id: 'plan2',
    name: 'Plano Intermediário',
    price: 2000,
    financingDetails: 'Financiamento detalhado do Plano Intermediário: parcelas decrescentes, taxa de juros média, prazo de 18 meses.',
  },
  {
    id: 'plan3',
    name: 'Plano Premium',
    price: 3000,
    financingDetails: 'Financiamento detalhado do Plano Premium: parcelas flexíveis, taxa de juros negociável, prazo de 24 meses.',
  },
];

const PlanComparisonPopup: React.FC = () => {
  const { isPlanComparisonOpen, setIsPlanComparisonOpen } = useApp();

  if (!isPlanComparisonOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Comparativo de Planos</h2>
          <Button onClick={() => setIsPlanComparisonOpen(false)}>Fechar</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-4">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="mb-2">Preço: R$ {plan.price.toFixed(2)}</p>
              <div className="text-sm text-gray-700 whitespace-pre-line">{plan.financingDetails}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonPopup;
