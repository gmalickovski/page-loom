import React, { useState } from "react";
import { Printer, RefreshCw, Layers, CheckCircle2, ChevronRight, X, Play, RotateCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface Order {
  id: string;
  clientName: string;
  date: string;
  format: string;
  binding: string;
  totalPages: number;
  summary: string;
  status: "Aguardando" | "Frente Impressa" | "Concluído";
}

const mockOrders: Order[] = [
  {
    id: "PL-2061",
    clientName: "Mariana Souza Silva",
    date: "29/05/2026",
    format: "A5",
    binding: "Caderno Inteligente (Discos)",
    totalPages: 120,
    summary: "12 pgs Calendário + 80 pgs Pautadas + 28 pgs Pontilhadas (3 Separadores Coloridos)",
    status: "Aguardando",
  },
  {
    id: "PL-2062",
    clientName: "Rodrigo Alencar Santos",
    date: "29/05/2026",
    format: "A5",
    binding: "Fichário Clássico (4 Furos)",
    totalPages: 160,
    summary: "24 pgs Calendário + 100 pgs Quadriculadas + 36 pgs em Branco (4 Separadores Coloridos)",
    status: "Aguardando",
  },
  {
    id: "PL-2063",
    clientName: "Juliana Mendes Garcia",
    date: "28/05/2026",
    format: "A5",
    binding: "Espiral Wire-O (Capa Dura)",
    totalPages: 90,
    summary: "12 pgs Calendário + 78 pgs Pautadas (Sem Separadores)",
    status: "Concluído",
  },
];

interface AdminPrintScreenProps {
  onBack: () => void;
}

export function AdminPrintScreen({ onBack }: AdminPrintScreenProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("epson-l3250");
  const [isConfirmedStep3, setIsConfirmedStep3] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printProgress, setPrintProgress] = useState<number>(0);

  const startPrintFlow = (order: Order) => {
    setSelectedOrder(order);
    setActiveStep(1);
    setIsConfirmedStep3(false);
    setIsPrinting(false);
    setPrintProgress(0);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      setActiveStep(2);
      simulatePrinting(() => setActiveStep(3));
    } else if (activeStep === 3) {
      if (!isConfirmedStep3) return;
      setActiveStep(4);
      simulatePrinting(() => {
        // Atualizar status do pedido para concluído
        setOrders(prev =>
          prev.map(o => o.id === selectedOrder?.id ? { ...o, status: "Concluído" } : o)
        );
        setActiveStep(5);
      });
    }
  };

  const simulatePrinting = (callback: () => void) => {
    setIsPrinting(true);
    setPrintProgress(0);
    const interval = setInterval(() => {
      setPrintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPrinting(false);
          callback();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Aguardando":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Aguardando</Badge>;
      case "Frente Impressa":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">Frente Impressa</Badge>;
      case "Concluído":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-300">Concluído</Badge>;
    }
  };

  return (
    <div className="admin-print-screen p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800 flex items-center gap-2">
            <Printer className="h-6 w-6 text-stone-600" />
            Painel Logístico de Impressão (Duplex Assistido)
          </h2>
          <p className="text-sm text-stone-500">Gerencie e imprima lotes de folhas físicas de planners personalizados para montagem.</p>
        </div>
        <Button variant="outline" onClick={onBack}>Voltar à Biblioteca</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-stone-400 font-bold">{order.id}</span>
                  <h3 className="font-semibold text-stone-800 text-lg leading-tight mt-0.5">{order.clientName}</h3>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="space-y-2 text-sm text-stone-600">
                <p className="flex justify-between">
                  <span className="text-stone-400">Data Pedido:</span>
                  <span className="font-medium">{order.date}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-stone-400">Tamanho/Template:</span>
                  <span className="font-medium">{order.format} — {order.totalPages} páginas</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-stone-400">Acabamento:</span>
                  <span className="font-medium text-stone-700">{order.binding}</span>
                </p>
              </div>

              <Separator />

              <div className="bg-stone-50 p-3 rounded text-xs text-stone-500 leading-relaxed italic">
                {order.summary}
              </div>
            </div>

            <div className="bg-stone-50 border-t p-4 flex gap-2">
              {order.status !== "Concluído" ? (
                <Button 
                  className="w-full bg-[#c2773a] hover:bg-[#a6612c] text-white flex items-center justify-center gap-2"
                  onClick={() => startPrintFlow(order)}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Lote
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  onClick={() => startPrintFlow(order)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reimprimir Lote
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PRINT WIZARD MODAL */}
      <Dialog open={selectedOrder !== null} onOpenChange={() => !isPrinting && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[550px] border-stone-200">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-stone-800 text-xl font-bold flex items-center gap-2">
                  <Printer className="h-5 w-5 text-[#c2773a]" />
                  Assistente Duplex: {selectedOrder?.id}
                </DialogTitle>
                <DialogDescription className="text-stone-500">
                  Impressão assistida para {selectedOrder?.clientName} ({selectedOrder?.format})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* PROGRESS STEPS BAR */}
          <div className="flex items-center justify-between py-2 px-1 bg-stone-50 rounded-lg">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === step 
                      ? "bg-[#c2773a] text-white" 
                      : activeStep > step 
                        ? "bg-emerald-500 text-white" 
                        : "bg-stone-200 text-stone-500"
                  }`}>
                    {activeStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                  </div>
                  <span className={`text-xs font-medium ${activeStep === step ? "text-stone-800 font-bold" : "text-stone-400"}`}>
                    {step === 1 && "Setup"}
                    {step === 2 && "Frentes"}
                    {step === 3 && "Virar"}
                    {step === 4 && "Versos"}
                    {step === 5 && "Fim"}
                  </span>
                </div>
                {step < 5 && <ChevronRight className="h-4 w-4 text-stone-300" />}
              </React.Fragment>
            ))}
          </div>

          <Separator className="my-2" />

          {/* STEP CONTENTS */}
          <div className="py-4 min-h-[220px] flex flex-col justify-center">
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded text-sm text-amber-800 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5">⚠️ Atenção à Furação Física</h4>
                  <p>Este planner usa **{selectedOrder?.binding}**. Certifique-se de que o bloco de folhas já furado está posicionado na bandeja correta.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Selecione a Impressora Ativa:</label>
                  <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a impressora..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="epson-l3250">Epson EcoTank L3250 Jato de Tinta</SelectItem>
                      <SelectItem value="epson-l4260">Epson EcoTank L4260 Duplex-Manual</SelectItem>
                      <SelectItem value="pdf-virtual">Microsoft Print to PDF (Lote Digital)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-stone-400 italic">O sistema irá compilar as {selectedOrder?.totalPages} páginas e separá-las em frentes e versos.</p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 text-center">
                <div className="relative border rounded-lg bg-stone-50 p-6 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-stone-100/50 flex items-center justify-center pointer-events-none">
                    {/* Linhas de furos simuladas à esquerda */}
                    <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-4">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-3 w-3 rounded-full bg-stone-300 border border-stone-400" />)}
                    </div>
                  </div>
                  <Printer className="h-12 w-12 text-[#c2773a] animate-bounce" />
                  <h4 className="font-bold text-stone-700 mt-3">Alimentação das Frentes (Páginas Ímpares)</h4>
                  <p className="text-xs text-stone-500 max-w-sm leading-relaxed mt-1">
                    Insira as folhas em branco na bandeja com a **FURAÇÃO voltada para a ESQUERDA** e a face lisa voltada para **CIMA**.
                  </p>
                </div>
                {isPrinting && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-stone-100 rounded overflow-hidden">
                      <div className="h-full bg-[#c2773a] transition-all duration-300" style={{ width: `${printProgress}%` }} />
                    </div>
                    <span className="text-xs text-stone-400 font-mono">Enviando lote de frentes... {printProgress}%</span>
                  </div>
                )}
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="relative border-2 border-amber-300 rounded-lg bg-amber-50/50 p-5 flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 animate-pulse">
                    <RotateCw className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-stone-700 mt-2">Ação Obrigatória: Virar as Folhas!</h4>
                  <p className="text-xs text-stone-600 max-w-sm leading-relaxed mt-1">
                    Retire o bloco de folhas impressas da saída da impressora. **Gire o bloco em 180 graus** mantendo a **FURAÇÃO voltada para a DIREITA** e a face em branco para **CIMA** ao reinserir na bandeja.
                  </p>
                </div>
                <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded border">
                  <input
                    type="checkbox"
                    id="confirm-rotate"
                    className="h-4 w-4 text-[#c2773a] focus:ring-[#c2773a] border-stone-300 rounded"
                    checked={isConfirmedStep3}
                    onChange={(e) => setIsConfirmedStep3(e.target.checked)}
                  />
                  <label htmlFor="confirm-rotate" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Confirmo que as folhas foram viradas e a furação está do lado DIREITO.
                  </label>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="relative border rounded-lg bg-stone-50 p-6 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-stone-100/50 flex items-center justify-center pointer-events-none">
                    {/* Linhas de furos simuladas à direita */}
                    <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-between py-4">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-3 w-3 rounded-full bg-stone-300 border border-stone-400" />)}
                    </div>
                  </div>
                  <Printer className="h-12 w-12 text-emerald-500 animate-pulse" />
                  <h4 className="font-bold text-stone-700 mt-3">Alimentação dos Versos (Páginas Pares)</h4>
                  <p className="text-xs text-stone-500 max-w-sm leading-relaxed mt-1">
                    Processando impressão de versos. Certifique-se de que a impressora está alimentada e as folhas viradas corretamente.
                  </p>
                </div>
                {isPrinting && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-stone-100 rounded overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${printProgress}%` }} />
                    </div>
                    <span className="text-xs text-stone-400 font-mono">Enviando lote de versos... {printProgress}%</span>
                  </div>
                )}
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800 text-lg">Lote Finalizado com Sucesso!</h4>
                  <p className="text-sm text-stone-500 max-w-xs mx-auto mt-1">
                    O planner de {selectedOrder?.clientName} está impresso de ponta a ponta. 
                  </p>
                </div>
                <div className="bg-stone-50 p-4 border rounded-lg text-xs text-stone-500 text-left space-y-1 max-w-sm mx-auto">
                  <h5 className="font-bold text-stone-700">Checklist de Montagem Física:</h5>
                  <p>✔ Confirme se a página 1 bate com a página 2 (Verso).</p>
                  <p>✔ Junte as capas plásticas de polaseal e fure no gabarito.</p>
                  <p>✔ Monte os discos do caderno inteligente e junte os refis.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            {activeStep === 1 && (
              <Button 
                className="bg-[#c2773a] hover:bg-[#a6612c] text-white flex items-center gap-1.5"
                onClick={handleNextStep}
              >
                Começar Impressão
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {activeStep === 2 && (
              <Button disabled className="bg-stone-300 text-stone-500 cursor-not-allowed">
                Aguarde Imprimir Frentes...
              </Button>
            )}
            {activeStep === 3 && (
              <Button 
                disabled={!isConfirmedStep3}
                className={`flex items-center gap-1.5 text-white ${
                  isConfirmedStep3 ? "bg-emerald-500 hover:bg-emerald-600" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
                onClick={handleNextStep}
              >
                Prosseguir com Versos
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {activeStep === 4 && (
              <Button disabled className="bg-stone-300 text-stone-500 cursor-not-allowed">
                Aguarde Imprimir Versos...
              </Button>
            )}
            {activeStep === 5 && (
              <Button 
                className="bg-stone-800 hover:bg-stone-900 text-white"
                onClick={() => setSelectedOrder(null)}
              >
                Concluir Pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
