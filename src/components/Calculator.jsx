"use client";
import React, { useState, useEffect } from "react";
import calculate from "../../utils/CalculatorLogic";
import CalculatorForm from "./CalculatorForm";
import ConsortiumResults from "./ConsortiumResults";
import FinancingResults from "./FinancingResults";
import ComparisonSummary from "./ComparisonSummary";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import LogoCarousel from "./LogoCarousel";

export default function Calculator() {
  const [formData, setFormData] = useState({
    valorCredito: "120000",
    prazo: "240",
    taxaAdm: "28",
    fundoReserva: "2",
    taxaAdesao: "1,2",
    antecipacao1: "0,1",
    antecipacao2a12: "0,1",
    lanceEmbutido: "25",
    lanceProprio: "25",
    entrada: "30000",
    taxaJuros: "1,2",
    prazoFinanciamento: "240",
  });

  const [results, setResults] = useState(null);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [unread, setUnread] = useState(1); // Contador de notificações

  const whatsappNumbers = [
    { number: "5516996510984", display: "(16) 99651-0984" },
    { number: "5511930224318", display: "(11) 93022-4318" },
  ];

  const openWhatsApp = (number) => {
    window.open(
      `https://wa.me/${number}?text=Olá! Gostaria de saber mais sobre consórcios e financiamentos.`,
      "_blank"
    );
    setShowWhatsAppPopup(false);
  };

  const openRandomWhatsApp = () => {
    const randomNumber =
      whatsappNumbers[Math.floor(Math.random() * whatsappNumbers.length)];
    openWhatsApp(randomNumber.number);
  };

  useEffect(() => {
    const newResults = calculate(formData);
    setResults(newResults);
  }, [formData]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
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

      {/* Logo Carousel */}
      <div className="bg-white py-4 shadow">
        <div className="max-w-7xl mx-auto px-4">
          <LogoCarousel />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CalculatorForm formData={formData} setFormData={setFormData} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <motion.div
                key={JSON.stringify(results)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <ComparisonSummary results={results} />
                <div className="grid md:grid-cols-2 gap-6">
                  <ConsortiumResults data={results.consorcio} />
                  <FinancingResults
                    data={results.financiamento}
                    formData={formData}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                Aguardando dados válidos...
              </div>
            )}
          </div>
        </div>
      </main>

            {/* WhatsApp Button */}
            {/* Botão WhatsApp removido conforme solicitado */}

      {/* WhatsApp Popup */}
      <AnimatePresence>
        {showWhatsAppPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWhatsAppPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Fale Conosco!</h3>
                    <p className="text-sm text-gray-600">Escolha uma opção</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowWhatsAppPopup(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={openRandomWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl"
                >
                  🎲 Conectar Automaticamente
                </Button>

                <div className="text-center text-sm text-gray-500 font-medium">ou escolha:</div>

                {whatsappNumbers.map((contact, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => openWhatsApp(contact.number)}
                    className="w-full py-3 border-green-200 hover:bg-green-50 rounded-xl"
                  >
                    📱 {contact.display}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-bold text-xl mb-2">América Financeira</h3>
          <p className="text-gray-300 mb-4">
            Realizando seus sonhos com as melhores condições do mercado.
          </p>
          <h4 className="font-semibold mb-2">Contato (WhatsApp)</h4>
          <div className="flex justify-center gap-4 text-gray-200">
            {whatsappNumbers.map((contact, index) => (
              <button
                key={index}
                onClick={() => openWhatsApp(contact.number)}
                className="hover:text-green-400 transition-colors cursor-pointer underline"
              >
                {contact.display}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-gray-400 text-sm">
            <p>&copy; 2024 América Financeira. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
