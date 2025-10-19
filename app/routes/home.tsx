import type { Route } from "./+types/home";
import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { BarChart3 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shit App - Trading Charts" },
    {
      name: "description",
      content: "Bybit perpetual contracts watchlist and trading charts",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Welcome to Crypto Watchlist App
          </h1>
          <p className="text-slate-300 text-lg">
            Trading charts and market data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Link to="/">
            <Card className="bg-slate-800/60 border-slate-600/40 hover:bg-slate-800/80 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                  <CardTitle className="text-2xl text-slate-100">
                    Trading Charts
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Live Bybit perpetual contracts with real-time WebSocket data,
                  multiple timeframes, and professional candlestick charts.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
