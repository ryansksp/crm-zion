import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Award, Target, Wallet } from "lucide-react";
import { formatCurrency, formatPercent } from "../../utils/formatters";

export default function ConsortiumResults({ data }) {
    if (!data) return null;

    return (
        <Card className="h-full shadow-lg border-t-4 border-t-green-500 bg-white">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600 text-lg">
                    <Award className="w-5 h-5" />
                    <span>Consórcio</span>
                </CardTitle>
                <CardDescription className="text-sm">Cenário de contemplação com lance.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800 text-xs">CRÉDITO LIBERADO</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                        {formatCurrency(data.creditoLiberado)}
                    </div>
                </div>

                <div className="text-xs space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-600">1ª Parcela</span>
                        <span className="font-bold text-gray-800">{formatCurrency(data.primeiraParcela)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-600">2ª a 12ª Parcela</span>
                        <span className="font-bold text-gray-800">{formatCurrency(data.segundaA12Parcela)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-600">Demais Parcelas</span>
                        <span className="font-bold text-gray-800">{formatCurrency(data.demaisParcelas)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-800 text-xs">LANCE PRÓPRIO</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600 mb-1">
                        {formatCurrency(data.valorLanceProprio)}
                    </div>
                    <p className="text-xs text-blue-700">
                        Abate do saldo devedor, diminuindo o custo total.
                    </p>
                </div>

                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-gray-800">Custo Final Total</span>
                        <span className="text-lg font-bold text-green-700">{formatCurrency(data.custoTotalConsorcio)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-medium text-gray-500">Custo Efetivo Mensal</span>
                        <Badge variant="secondary" className="text-xs">{formatPercent(data.custoAoMesPercent)}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
