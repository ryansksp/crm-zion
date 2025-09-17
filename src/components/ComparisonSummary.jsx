import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Trophy } from "lucide-react";
import { formatCurrency, formatPercent } from "../../utils/formatters";

export default function ComparisonSummary({ results }) {
    if (!results) return null;

    const { consorcio, financiamento, economia } = results;
    const isConsorcioCheaper = economia.valor > 0;

    return (
        <Card className="shadow-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Resumo da Comparação
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-green-300 mb-2">🎯 Custo Total Consórcio</h3>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(consorcio.custoTotalConsorcio)}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-red-300 mb-2">🏦 Custo Total Financiamento</h3>
                        <p className="text-2xl font-bold text-red-400">{formatCurrency(financiamento.custoTotalFinanciamento)}</p>
                    </div>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-4 rounded-lg ${isConsorcioCheaper ? 'bg-green-600' : 'bg-red-600'}`}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-2 text-center">
                        {isConsorcioCheaper ? "🎉 Economia com Consórcio" : "❌ Custo Extra do Consórcio"}
                    </h3>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-2xl font-bold text-white">{formatCurrency(Math.abs(economia.valor))}</p>
                        <Badge variant="secondary" className="text-xs">
                            {formatPercent(Math.abs(economia.percentual))}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
