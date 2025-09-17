// src/components/calculator/CalculatorForm.jsx
"use client";

import React from "react";
import { formatPercent } from "../../utils/formatters";

export default function CalculatorForm({ formData, setFormData }) {
  const handleChange = (field, value) => {
    // Limpa o valor para armazenar apenas números e ponto decimal
    let cleanValue = value.replace(/[^\d,.-]/g, "");

    // Substitui vírgula por ponto para padronizar
    cleanValue = cleanValue.replace(/,/g, ".");

    // Atualiza o estado com o valor limpo (valor numérico bruto)
    setFormData({ ...formData, [field]: cleanValue });
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl border space-y-4">
      {/* Cabeçalho */}
      <div className="bg-red-600 text-white font-bold text-lg px-3 py-2 rounded flex items-center gap-2">
        <span>⚙️</span> Parâmetros da Simulação
      </div>

      {/* Valor Crédito */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          💰 Valor Crédito
        </label>
        <input
          type="text"
          value={formData.valorCredito || ""}
          onChange={(e) => handleChange("valorCredito", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
          placeholder="120000"
        />
      </div>

      {/* Prazo Consórcio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          📅 Prazo (Consórcio)
        </label>
        <select
          value={formData.prazo || ""}
          onChange={(e) => handleChange("prazo", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
        >
          <option value="">Selecione o prazo</option>
          <option value="200">200 Meses (Imóvel)</option>
          <option value="220">220 Meses (Imóvel)</option>
          <option value="240">240 Meses (Imóvel)</option>
          <option value="100">100 Meses (Automóvel)</option>
          <option value="40">40 Meses (Serviços)</option>
        </select>
      </div>

      {/* Taxas principais */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">⚙️ Taxa Adm (%)</label>
          <input
            type="text"
            value={formData.taxaAdm || ""}
            onChange={(e) => handleChange("taxaAdm", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
          placeholder="28%"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">🛡️ Fundo Reserva (%)</label>
          <input
            type="text"
            value={formData.fundoReserva || ""}
            onChange={(e) => handleChange("fundoReserva", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
          placeholder="2%"
          />
        </div>
      </div>

      {/* Taxa Adesão */}
      <div>
        <label className="block text-sm mb-1">🎫 Taxa Adesão (%)</label>
        <input
          type="text"
          value={formData.taxaAdesao || ""}
          onChange={(e) => handleChange("taxaAdesao", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
          placeholder={formatPercent(1.2)}
        />
      </div>

      {/* Antecipação */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">⚡ Antecipação 1 (%)</label>
          <input
            type="text"
            value={formData.antecipacao1 || ""}
            onChange={(e) => handleChange("antecipacao1", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
            placeholder={formatPercent(0.1)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">⚡ Antecipação 2 a 12 (%)</label>
          <input
            type="text"
            value={formData.antecipacao2a12 || ""}
            onChange={(e) => handleChange("antecipacao2a12", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
            placeholder={formatPercent(0.1)}
          />
        </div>
      </div>

      {/* Lances */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">🎯 Lance Embutido (%)</label>
          <input
            type="text"
            value={formData.lanceEmbutido || ""}
            onChange={(e) => handleChange("lanceEmbutido", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
            placeholder={formatPercent(25)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">💎 Lance Próprio (%)</label>
          <input
            type="text"
            value={formData.lanceProprio || ""}
            onChange={(e) => handleChange("lanceProprio", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
            placeholder={formatPercent(25)}
          />
        </div>
      </div>

      <p className="text-xs bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-2 rounded">
        💡 Lance próprio abate do saldo devedor, diminuindo o custo total.
      </p>

      {/* Financiamento */}
      <div className="bg-green-100 text-green-800 font-bold px-3 py-2 rounded mt-4">
        Para Comparação – Financiamento
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">💵 Entrada</label>
        <input
          type="text"
          value={formData.entrada || ""}
          onChange={(e) => handleChange("entrada", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500"
          placeholder="20000"
        />
        </div>
        <div>
          <label className="block text-sm mb-1">📈 Juros (% a.m.)</label>
          <input
            type="text"
            value={formData.taxaJuros || ""}
            onChange={(e) => handleChange("taxaJuros", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500"
            placeholder={formatPercent(1.2)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">⏰ Prazo Financiamento (meses)</label>
        <input
          type="number"
          value={formData.prazoFinanciamento || ""}
          onChange={(e) => handleChange("prazoFinanciamento", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500"
          placeholder="240"
        />
      </div>
    </div>
  );
}
