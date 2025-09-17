import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent } from "../../utils/formatters";

export default function FinancingResults({ data, formData }) {
    if (!data) return null;

    return (
        <Card className="h-full shadow-lg border-t-4 border-t-red-500 bg-white">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                    <Landmark className="w-5 h-5" />
                    <span>Financiamento</span>
                </CardTitle>
                <CardDescription className="text-sm">Simulação de financiamento tradicional.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800 text-xs">VALOR FINANCIADO</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">
                        {formatCurrency(data.valorFinanciado)}
                    </div>
                </div>

                <div className="text-xs space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-600">Parcela Mensal Fixa</span>
                        <span className="font-bold text-gray-800">{formatCurrency(data.parcelaMensal)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-600">Prazo</span>
                        <span className="font-bold text-gray-800">{formData.prazoFinanciamento} meses</span>
                    </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-800 text-xs">TOTAL DE JUROS PAGOS</span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                        {formatCurrency(data.jurosTotais)}
                    </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-medium text-gray-500">Valor de Entrada</span>
                        <span className="text-xs font-medium text-gray-500">{formatCurrency(Number(formData.entrada) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-gray-800">Custo Final Total</span>
                        <span className="text-lg font-bold text-red-700">{formatCurrency(data.custoTotalFinanciamento)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-medium text-gray-500">Taxa de Juros</span>
                        <Badge variant="destructive" className="text-xs">{formatPercent(formData.taxaJuros)}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
