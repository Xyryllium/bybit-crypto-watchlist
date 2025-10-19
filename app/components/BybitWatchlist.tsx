import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useBybitWS } from "~/contexts/BybitWebSocketContext";
import { useMarketOpen } from "~/hooks/useMarketOpen";
import {
  POPULAR_SYMBOLS,
  safeParseFloat,
  type PerpSymbol,
  type BybitTicker,
} from "~/lib/bybit";
import { classNames, formatPrice, formatPercentage } from "~/lib/utils";

type WatchlistRow = {
  key: string;
  display: string;
  ticker?: BybitTicker;
  changePct?: number;
  currentPrice?: number;
};

export function BybitWatchlist({
  symbols = POPULAR_SYMBOLS,
  onSelect,
}: {
  symbols?: PerpSymbol[];
  onSelect?: (symbol: string) => void;
}) {
  const [tickers, setTickers] = useState<Record<string, BybitTicker>>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { marketOpen, reset: resetMarketOpen } = useMarketOpen(
    symbols.map((s) => s.name)
  );

  const tickerTopics = useMemo(
    () => symbols.map((s) => `tickers.${s.name}`),
    [symbols]
  );
  const { isConnected, subscribe } = useBybitWS();

  useEffect(() => {
    const unsubscribe = subscribe(tickerTopics, (msg) => {
      const topic: string = msg.topic;
      if (topic.startsWith("tickers.")) {
        const items: any[] = Array.isArray(msg.data) ? msg.data : [msg.data];
        setTickers((prev) => {
          const next = { ...prev };
          for (const it of items) {
            if (it.symbol && it.lastPrice) {
              next[it.symbol] = {
                symbol: it.symbol,
                lastPrice: it.lastPrice || "0",
                price24hPcnt: it.price24hPcnt || "0",
                highPrice24h: it.highPrice24h || "0",
                lowPrice24h: it.lowPrice24h || "0",
                volume24h: it.volume24h || "0",
              };
            }
          }
          return next;
        });
      }
    });

    return unsubscribe;
  }, [tickerTopics.join(","), subscribe]);

  const ordered = useMemo(() => {
    const rows: WatchlistRow[] = symbols.map((s) => {
      const ticker = tickers[s.name];
      const openPrice = marketOpen[s.name];
      const currentPrice = ticker
        ? safeParseFloat(ticker.lastPrice)
        : undefined;

      let changePct = undefined;
      if (currentPrice && openPrice && openPrice > 0) {
        changePct = ((currentPrice - openPrice) / openPrice) * 100;
      }

      return {
        key: s.name,
        display: s.display,
        ticker,
        changePct,
        currentPrice,
      };
    });

    return rows.sort((a, b) => {
      const aChange = a.changePct ?? -Infinity;
      const bChange = b.changePct ?? -Infinity;
      return sortOrder === "desc" ? bChange - aChange : aChange - bChange;
    });
  }, [symbols, tickers, marketOpen, sortOrder]);

  const handleReset = () => {
    setTickers({});
    resetMarketOpen();
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl text-gray-900">
              Perp Watchlist
            </CardTitle>
            <Badge
              variant="outline"
              className={classNames(
                "border-gray-300",
                isConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="h-7 px-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 text-xs"
            >
              {sortOrder === "desc" ? "↓" : "↑"} Change
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-7 px-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200 h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {ordered.map((row) => {
            const isUp =
              row.changePct !== undefined && !isNaN(row.changePct)
                ? row.changePct >= 0
                : undefined;

            return (
              <div
                key={row.key}
                className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-50"
                onClick={() => onSelect?.(row.key)}
              >
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-gray-900">
                    {row.display}
                  </div>
                  <div className="text-xs text-gray-500">Daily</div>
                </div>
                <div className="flex items-center gap-6 pr-2">
                  <div className="text-right">
                    <div className="text-gray-900 font-mono">
                      {formatPrice(row.currentPrice)}
                    </div>
                    <div
                      className={classNames(
                        "text-sm font-medium",
                        isUp === undefined
                          ? "text-gray-500"
                          : isUp
                            ? "text-green-600"
                            : "text-red-600"
                      )}
                    >
                      {formatPercentage(row.changePct)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default BybitWatchlist;
