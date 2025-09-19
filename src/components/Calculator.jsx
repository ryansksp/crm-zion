"use client";

import React, { useState, useEffect } from "react";

import calculate from "../../utils/CalculatorLogic";

import CalculatorForm from "./CalculatorForm";

import ConsortiumResults from "./ConsortiumResults";

import FinancingResults from "./FinancingResults";

import ComparisonSummary from "./ComparisonSummary";

import LogoCarousel from "./LogoCarousel";

export default function Calculator() {

  const [formData, setFormData] = useState({

    valorCredito: "120000",

    prazo: "240",

    taxaAdm: "28",

    fundoReserva: "2",

    taxaAdesao: "1,2",

    lanceEmbutido: "25",

    lanceProprio: "25",

    entrada: "30000",

    taxaJuros: "1,2",

    prazoFinanciamento: "240",

  });

  const [results, setResults] = useState(null);

  useEffect(() => {

    const newResults = calculate(formData);

    setResults(newResults);

  }, [formData]);

  return (

    <div className="min-h-screen bg-gray-50 font-sans">

      <header className="bg-white shadow-sm sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">

          <img

            src="https://imgur.com/HkhfKK6.png"

            alt="América Financeira"

            className="w-20 h-20 object-contain rounded-md"

          />

          <h1 className="text-3xl font-bold text-gray-800 leading-tight">

            Calculadora Financeira

          </h1>

        </div>

      </header>

      <div className="bg-white py-4 shadow">

        <div className="max-w-7xl mx-auto px-4">

          <LogoCarousel />

        </div>

      </div>

      <main className="max-w-7xl mx-auto px-4 mt-4">

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">

            <CalculatorForm formData={formData} setFormData={setFormData} />

          </div>

          <div className="lg:col-span-2 space-y-6">

            {results ? (

              <div className="space-y-6">

                <ComparisonSummary results={results} />

                <div className="grid md:grid-cols-2 gap-6">

                  <ConsortiumResults data={results.consorcio} />

                  <FinancingResults

                    data={results.financiamento}

                    formData={formData}

                  />

                </div>

              </div>

            ) : (

              <div className="text-center p-8 text-gray-500">

                Aguardando dados válidos...

              </div>

            )}

          </div>

        </div>

      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">

        <div className="max-w-7xl mx-auto px-4 text-center">

          <h3 className="font-bold text-xl mb-2">América Financeira</h3>

          <p className="text-gray-300 mb-4">

            Realizando seus sonhos com as melhores condições do mercado.

          </p>

          <div className="border-t border-gray-700 mt-6 pt-6 text-gray-400 text-sm">

            <p>&copy; 2024 América Financeira. Todos os direitos reservados.</p>

          </div>

        </div>

      </footer>

    </div>

  );

}
