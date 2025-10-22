import { useState } from "react";
import { BybitWatchlist } from "../components/BybitWatchlist";
import { BybitKlineChart } from "../components/BybitKlineChart";
import VolumeTradeLog from "../components/VolumeTradeLog";
import VolumeBreakoutLog from "../components/VolumeBreakoutLog";
import VPTAlerts from "../components/VPTAlerts";
import { NotificationSettings } from "../components/NotificationSettings";
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
            <NotificationSettings />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1 xl:col-span-1">
              <BybitWatchlist onSelect={(s) => setActiveSymbol(s)} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <VolumeTradeLog onSymbolClick={(symbol) => setActiveSymbol(symbol)} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <VolumeBreakoutLog onSymbolClick={(symbol) => setActiveSymbol(symbol)} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <VPTAlerts onSymbolClick={(symbol) => setActiveSymbol(symbol)} />
            </div>
          </div>

          <div className="w-full">
            <BybitKlineChart symbol={activeSymbol} />
          </div>
        </div>
      </div>
    </BybitWebSocketProvider>
  );
}
