import { useState, useEffect, useCallback } from "react";
import { useBybitWS } from "~/contexts/BybitWebSocketContext";
import { POPULAR_SYMBOLS } from "~/lib/bybit";
import { formatPrice, formatPercentage, classNames } from "~/lib/utils";

// Configuration constants
const CONFIG = {
  MAX_LOGS: 50,
  SPIKE_THRESHOLD: 20, // % increase
  MIN_VOLUME_FILTER: 100000, // 100K minimum volume
  MIN_PRICE_CHANGE: 1, // 1% minimum price change
  HISTORY_MINUTES: 10,
  CLEANUP_INTERVAL: 60000, // 1 minute
  SPIKE_RETENTION: 5 * 60 * 1000, // 5 minutes
} as const;

interface VolumeSpike {
  id: string;
  symbol: string;
  display: string;
  currentVolume: number;
  previousVolume: number;
  volumeChange: number;
  price: number;
  priceChange: number;
  timestamp: number;
}

interface VolumeSnapshot {
  volume: number;
  timestamp: number;
  minuteStart: number;
  price: number;
}

interface KlineData {
  symbol?: string;
  volume: string;
  close: string;
  start: string;
}

interface VolumeTradeLogProps {
  onSymbolClick?: (symbol: string) => void;
}

export default function VolumeTradeLog({ onSymbolClick }: VolumeTradeLogProps) {
  const { subscribe } = useBybitWS();
  const [volumeSpikes, setVolumeSpikes] = useState<VolumeSpike[]>([]);
  const [volumeHistory, setVolumeHistory] = useState<
    Record<string, VolumeSnapshot[]>
  >({});

  const extractSymbol = (topic: string): string => {
    return topic.replace("kline.1.", "").replace("tickers.", "");
  };

  const calculateVolumeChange = (current: number, previous: number): number => {
    if (previous === 0) return 1000;
    return ((current - previous) / previous) * 100;
  };

  const createVolumeSpike = (
    symbol: string,
    currentVolume: number,
    previousVolume: number,
    volumeChange: number,
    price: number,
    timestamp: number
  ): VolumeSpike => {
    const symbolInfo = POPULAR_SYMBOLS.find((s) => s.name === symbol);
    return {
      id: `${symbol}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      display: symbolInfo?.display || symbol.replace("USDT", ""),
      currentVolume,
      previousVolume,
      volumeChange,
      price,
      priceChange: 0,
      timestamp,
    };
  };

  const updateVolumeHistory = useCallback(
    (
      symbol: string,
      minuteVolume: number,
      closePrice: number,
      currentTime: number
    ) => {
      setVolumeHistory((prev) => {
        const history = prev[symbol] || [];
        const currentMinuteStart = Math.floor(currentTime / 60000) * 60000;

        // Find or create snapshot for this minute
        let currentSnapshot = history.find(
          (h) => h.minuteStart === currentMinuteStart
        );

        if (!currentSnapshot) {
          currentSnapshot = {
            volume: minuteVolume,
            timestamp: currentTime,
            minuteStart: currentMinuteStart,
            price: closePrice,
          };
          history.push(currentSnapshot);
        } else {
          currentSnapshot.volume = minuteVolume;
          currentSnapshot.timestamp = currentTime;
          currentSnapshot.price = closePrice;
        }

        // Keep only recent history
        const cutoffTime = currentTime - CONFIG.HISTORY_MINUTES * 60 * 1000;
        const filteredHistory = history.filter((h) => h.timestamp > cutoffTime);
        const sortedHistory = filteredHistory.sort(
          (a, b) => a.minuteStart - b.minuteStart
        );

        // Check for volume spike
        const currentIndex = sortedHistory.findIndex(
          (h) => h.minuteStart === currentMinuteStart
        );
        const previousSnapshot =
          currentIndex > 0 ? sortedHistory[currentIndex - 1] : null;

        if (previousSnapshot && currentSnapshot.volume > 0) {
          const volumeChange = calculateVolumeChange(
            currentSnapshot.volume,
            previousSnapshot.volume
          );

          // Detect spike if conditions are met
          if (
            volumeChange >= CONFIG.SPIKE_THRESHOLD &&
            currentSnapshot.volume >= CONFIG.MIN_VOLUME_FILTER
          ) {
            // Calculate price change from previous minute
            const priceChange =
              previousSnapshot.price > 0
                ? ((currentSnapshot.price - previousSnapshot.price) /
                    previousSnapshot.price) *
                  100
                : 0;

            // Only show spikes with significant price change
            const absPriceChange = Math.abs(priceChange);
            if (absPriceChange < CONFIG.MIN_PRICE_CHANGE) {
              return { ...prev, [symbol]: sortedHistory };
            }

            const spike = createVolumeSpike(
              symbol,
              currentSnapshot.volume,
              previousSnapshot.volume,
              volumeChange,
              currentSnapshot.price,
              currentTime
            );

            // Update spike with minute-to-minute price change
            spike.priceChange = priceChange;

            setVolumeSpikes((prev) => {
              // Check if we already have a spike for this symbol at this minute
              const isDuplicate = prev.some(
                (s) =>
                  s.symbol === spike.symbol &&
                  Math.floor(s.timestamp / 60000) ===
                    Math.floor(spike.timestamp / 60000)
              );

              if (isDuplicate) return prev;

              return [spike, ...prev].slice(0, CONFIG.MAX_LOGS);
            });
          }
        }

        return { ...prev, [symbol]: sortedHistory };
      });
    },
    []
  );

  const handleVolumeMessage = useCallback(
    (msg: any) => {
      if (!msg.topic?.startsWith("kline.1.") || !msg.data) return;

      const items: KlineData[] = Array.isArray(msg.data)
        ? msg.data
        : [msg.data];

      for (const kline of items) {
        const symbol = extractSymbol(msg.topic);
        if (!symbol || !kline.start) continue;

        const minuteVolume = parseFloat(kline.volume) || 0;
        const closePrice = parseFloat(kline.close) || 0;
        const currentTime = parseInt(kline.start);

        updateVolumeHistory(symbol, minuteVolume, closePrice, currentTime);
      }
    },
    [updateVolumeHistory]
  );

  useEffect(() => {
    const topics = POPULAR_SYMBOLS.map((s) => `kline.1.${s.name}`);
    const unsubscribe = subscribe(topics, handleVolumeMessage);
    return unsubscribe;
  }, [subscribe, handleVolumeMessage]);

  // Clean up old spikes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const cutoffTime = Date.now() - CONFIG.SPIKE_RETENTION;
      setVolumeSpikes((prev) =>
        prev.filter((spike) => spike.timestamp > cutoffTime)
      );
    }, CONFIG.CLEANUP_INTERVAL);

    return () => clearInterval(cleanupInterval);
  }, []);

  const getVolumeChangeColor = (change: number): string => {
    if (change >= 100) return "text-red-600 bg-red-50";
    if (change >= 50) return "text-orange-600 bg-orange-50";
    if (change >= 20) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-48 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Volume Spike Log
              <span className="ml-2 text-xs font-normal text-gray-500">
                (≥{CONFIG.SPIKE_THRESHOLD}% vol, ≥{CONFIG.MIN_PRICE_CHANGE}%
                price, ≥{(CONFIG.MIN_VOLUME_FILTER / 1000).toFixed(0)}K)
              </span>
            </h3>
            <div className="text-xs text-gray-500">
              {volumeSpikes.length} spikes
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto volume-log-scroll"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#9ca3af #f3f4f6",
          }}
        >
          {volumeSpikes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No volume spikes detected (monitoring minute-by-minute)
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {volumeSpikes.map((spike) => (
                <div
                  key={spike.id}
                  onClick={() => onSymbolClick?.(spike.symbol)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900">
                        {spike.display}
                      </div>
                      <div className="text-xs text-gray-500">
                        {spike.symbol}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div
                        className={classNames(
                          "text-sm font-medium",
                          getPriceChangeColor(spike.priceChange)
                        )}
                      >
                        {formatPrice(spike.price)}
                      </div>
                      <div
                        className={classNames(
                          "text-xs",
                          getPriceChangeColor(spike.priceChange)
                        )}
                      >
                        {formatPercentage(spike.priceChange)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatVolume(spike.currentVolume)}
                      </div>
                      <div className="text-xs text-gray-500">
                        vs {formatVolume(spike.previousVolume)}
                      </div>
                    </div>

                    <div
                      className={classNames(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getVolumeChangeColor(spike.volumeChange)
                      )}
                    >
                      +{spike.volumeChange.toFixed(0)}%
                    </div>

                    <div className="text-xs text-gray-400 w-12 text-right">
                      {formatTimestamp(spike.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
