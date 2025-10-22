import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from "recharts";
import { useBybitWS } from "~/contexts/BybitWebSocketContext";
import {
  CHART_COLORS,
  fetchHistoricalKlines,
  formatTimeframeLabel,
  formatTimestamp,
  getMarketOpenTime,
  safeParseFloat,
  type Candle,
  type TimeFrame,
} from "~/lib/bybit";
import { formatPrice, formatPercentage } from "~/lib/utils";

function CustomCandlestick(props: any) {
  const { payload, x, y, width, height, chartDomain } = props;
  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const centerX = x + width / 2;
  const candleWidth = Math.max(Math.min(width * 0.8, 12), 3);
  const left = centerX - candleWidth / 2;
  const [minP, maxP] = chartDomain;
  const range = maxP - minP;

  if (range === 0) return null;

  const pct = (p: number) => y + height * (1 - (p - minP) / range);
  const highY = pct(high);
  const lowY = pct(low);
  const openY = pct(open);
  const closeY = pct(close);
  const fill = isGreen ? CHART_COLORS.bullish : CHART_COLORS.bearish;
  const wickColor = CHART_COLORS.wick;

  return (
    <g>
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={wickColor}
        strokeWidth={1.5}
      />
      <rect
        x={left}
        y={Math.min(openY, closeY)}
        width={candleWidth}
        height={Math.max(Math.abs(closeY - openY), 2)}
        fill={fill}
      />
    </g>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const { open, high, low, close, volume, label } = data;
  const changePct = open > 0 ? ((close - open) / open) * 100 : 0;
  const isGreen = close >= open;

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toFixed(0);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-900 mb-2">{label}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Open:</span>
          <span className="font-mono text-gray-900">{formatPrice(open)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">High:</span>
          <span className="font-mono text-gray-900">{formatPrice(high)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Low:</span>
          <span className="font-mono text-gray-900">{formatPrice(low)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Close:</span>
          <span className="font-mono text-gray-900">{formatPrice(close)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Volume:</span>
          <span className="font-mono text-blue-600">
            {formatVolume(volume || 0)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
          <span className="text-gray-500">Change:</span>
          <span
            className={`font-semibold ${isGreen ? "text-green-600" : "text-red-600"}`}
          >
            {formatPercentage(changePct, true)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BybitKlineChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<Candle[]>([]);
  const [tf, setTf] = useState<TimeFrame>("15");
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  const topic = useMemo(() => `kline.${tf}.${symbol}`, [symbol, tf]);

  // Clear data immediately when symbol or timeframe changes
  useEffect(() => {
    setData([]);
    setCurrentSymbol(symbol);
  }, [symbol, tf]);

  // Try to fetch historical data (after data is cleared above)
  useEffect(() => {
    async function loadHistorical() {
      try {
        const start = getMarketOpenTime();
        const end = Date.now();
        const historical = await fetchHistoricalKlines(symbol, tf, start, end);
        if (historical.length > 0) {
          setData(historical);
        }
      } catch (e) {
        console.log("Using live WebSocket data only (historical fetch failed)");
      }
    }

    const timer = setTimeout(loadHistorical, 200);
    return () => clearTimeout(timer);
  }, [symbol, tf]);

  const { isConnected, subscribe } = useBybitWS();

  useEffect(() => {
    const unsubscribe = subscribe([topic], (msg) => {
      if (!msg.data) return;

      const items: any[] = Array.isArray(msg.data) ? msg.data : [msg.data];

      setData((prev) => {
        const updated = [...prev];
        for (const it of items) {
          // Verify symbol matches current selection
          if (it.symbol && it.symbol !== currentSymbol) {
            return prev;
          }

          if (!it.start || !it.close) continue;

          const c: Candle = {
            time: Number(it.start),
            open: safeParseFloat(it.open),
            high: safeParseFloat(it.high),
            low: safeParseFloat(it.low),
            close: safeParseFloat(it.close),
            volume: safeParseFloat(it.volume),
          };

          if (isNaN(c.close)) continue;

          const idx = updated.findIndex((d) => d.time === c.time);
          if (idx >= 0) {
            updated[idx] = c;
          } else {
            updated.push(c);
          }
        }
        return updated.sort((a, b) => a.time - b.time).slice(-300);
      });
    });

    return unsubscribe;
  }, [topic, currentSymbol, subscribe]);

  // Filter to show candles from market open (including current forming candle)
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const cutoff = getMarketOpenTime();
    return data.filter((d) => d.time >= cutoff);
  }, [data]);

  const minPrice = filteredData.length
    ? Math.min(...filteredData.map((d) => d.low))
    : 0;
  const maxPrice = filteredData.length
    ? Math.max(...filteredData.map((d) => d.high))
    : 1;
  const priceRange = maxPrice - minPrice;
  const chartMin = minPrice - priceRange * 0.02;
  const chartMax = maxPrice + priceRange * 0.02;

  const last = filteredData[filteredData.length - 1];
  const first = filteredData[0];
  const price = last?.close ?? 0;
  // Use first candle's OPEN as market open (not first candle's close)
  const changePct =
    last && first ? ((last.close - first.open) / first.open) * 100 : 0;

  const timeframes: TimeFrame[] = [
    "1",
    "5",
    "15",
    "30",
    "60",
    "120",
    "240",
    "D",
    "M",
  ];

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <a
            href={`https://www.tradingview.com/chart/?symbol=BYBIT%3A${symbol}.P`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 text-xs flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              TradingView
            </Button>
          </a>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl text-gray-900">{symbol}.P</CardTitle>
            <Badge
              variant="outline"
              className={
                isConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-right mr-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(price)}
              </div>
              <div
                className={
                  changePct >= 0
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {formatPercentage(changePct, true)}
              </div>
            </div>
            {timeframes.map((k) => (
              <Button
                key={k}
                size="sm"
                variant={tf === k ? "default" : "outline"}
                onClick={() => setTf(k)}
                className={
                  tf === k
                    ? "bg-gray-900 hover:bg-gray-800 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }
              >
                {formatTimeframeLabel(k)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] sm:h-[550px] xl:h-[600px] bg-white rounded-lg border border-gray-200 p-6">
          {filteredData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Loading chart data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredData.map((d) => ({
                  time: d.time,
                  open: d.open,
                  high: d.high,
                  low: d.low,
                  close: d.close,
                  volume: d.volume || 0,
                  label: formatTimestamp(d.time, tf),
                }))}
                margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke={CHART_COLORS.grid}
                  strokeOpacity={0.8}
                />
                <XAxis
                  dataKey="label"
                  stroke={CHART_COLORS.axis}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="price"
                  domain={[chartMin, chartMax]}
                  stroke={CHART_COLORS.axis}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatPrice(v)}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, "dataMax"]}
                  stroke={CHART_COLORS.axis}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
                    return v.toFixed(0);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  radius={[1, 1, 0, 0]}
                />
                <Bar
                  yAxisId="price"
                  dataKey="close"
                  shape={(p: any) => (
                    <CustomCandlestick
                      {...p}
                      chartDomain={[chartMin, chartMax]}
                    />
                  )}
                  fill="transparent"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BybitKlineChart;
