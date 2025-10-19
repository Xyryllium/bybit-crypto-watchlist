import { useState } from "react";
import { BybitWatchlist } from "../components/BybitWatchlist";
import { BybitKlineChart } from "../components/BybitKlineChart";
import VolumeTradeLog from "../components/VolumeTradeLog";
import { BybitWebSocketProvider } from "../contexts/BybitWebSocketContext";
import { BarChart3 } from "lucide-react";

export default function Trading() {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");
  return (
    <BybitWebSocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-4">
        <div className="w-full px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-slate-300" />
                <h1 className="text-3xl font-bold text-slate-100">
                  Bybit Perp Charts
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BybitKlineChart symbol={activeSymbol} />
            </div>
            <div className="lg:col-span-1">
              <BybitWatchlist onSelect={(s) => setActiveSymbol(s)} />
            </div>
          </div>

          <VolumeTradeLog onSymbolClick={(symbol) => setActiveSymbol(symbol)} />
        </div>
      </div>
    </BybitWebSocketProvider>
  );
}
