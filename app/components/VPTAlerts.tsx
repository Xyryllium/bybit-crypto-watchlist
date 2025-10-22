import { useState, useEffect, useCallback } from "react";
import { useBybitWS } from "~/contexts/BybitWebSocketContext";
import { POPULAR_SYMBOLS } from "~/lib/bybit";
import { formatPrice, formatPercentage, classNames } from "~/lib/utils";
import { vptDetector, type VPTData } from "~/lib/vptDetector";
import { useVPTNotifications } from "~/hooks/useVPTNotifications";

const CONFIG = {
    MAX_ALERTS: 25,
    CLEANUP_INTERVAL: 60000,
    ALERT_RETENTION: 15 * 60 * 1000,
} as const;

interface KlineData {
    symbol?: string;
    volume: string;
    close: string;
    start: string;
}

interface VPTAlertsProps {
    onSymbolClick?: (symbol: string) => void;
}

export default function VPTAlerts({ onSymbolClick }: VPTAlertsProps) {
    const { subscribe } = useBybitWS();
    const [vptAlerts, setVptAlerts] = useState<VPTData[]>([]);
    const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});

    useVPTNotifications(vptAlerts);

    const extractSymbol = (topic: string): string => {
        return topic.replace("kline.1.", "").replace("tickers.", "");
    };

    const handleVolumeMessage = useCallback(
        (msg: any) => {
            if (!msg.topic?.startsWith("kline.1.") || !msg.data) return;

            const items: KlineData[] = Array.isArray(msg.data)
                ? msg.data
                : [msg.data];

            for (const kline of items) {
                const symbol = extractSymbol(msg.topic);
                if (!symbol || !kline.start) continue;

                const currentPrice = parseFloat(kline.close) || 0;
                const volume = parseFloat(kline.volume) || 0;
                const timestamp = parseInt(kline.start);

                const previousPrice = previousPrices[symbol] || currentPrice;

                const vptAlert = vptDetector.processVPTData(
                    symbol,
                    currentPrice,
                    previousPrice,
                    volume,
                    timestamp
                );

                if (vptAlert) {
                    setVptAlerts((prev) => {
                        const isDuplicate = prev.some(
                            (a) =>
                                a.symbol === vptAlert.symbol &&
                                Math.floor(a.timestamp / 60000) ===
                                Math.floor(vptAlert.timestamp / 60000)
                        );

                        if (isDuplicate) return prev;

                        return [vptAlert, ...prev].slice(0, CONFIG.MAX_ALERTS);
                    });
                }

                setPreviousPrices((prev) => ({
                    ...prev,
                    [symbol]: currentPrice,
                }));
            }
        },
        [previousPrices]
    );

    useEffect(() => {
        const topics = POPULAR_SYMBOLS.map((s) => `kline.1.${s.name}`);
        const unsubscribe = subscribe(topics, handleVolumeMessage);
        return unsubscribe;
    }, [subscribe, handleVolumeMessage]);

    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const cutoffTime = Date.now() - CONFIG.ALERT_RETENTION;
            setVptAlerts((prev) =>
                prev.filter((alert) => alert.timestamp > cutoffTime)
            );
        }, CONFIG.CLEANUP_INTERVAL);

        return () => clearInterval(cleanupInterval);
    }, []);

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
        <div className="h-[300px] sm:h-[350px] xl:h-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="h-full flex flex-col">
                <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                            VPT Alerts
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                (Volume-Price Trend)
                            </span>
                        </h3>
                        <div className="text-xs text-gray-500">
                            {vptAlerts.length} alerts
                        </div>
                    </div>
                </div>

                <div
                    className={`flex-1 overflow-y-auto vpt-alerts-scroll ${vptAlerts.length === 0 ? 'flex items-center justify-center' : ''}`}
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#9ca3af #f3f4f6",
                    }}
                >
                    {vptAlerts.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center">
                            No VPT alerts detected (monitoring volume-price correlation)
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {vptAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    onClick={() => onSymbolClick?.(alert.symbol)}
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <div className="flex-shrink-0">
                                            <div className="text-sm font-medium text-gray-900">
                                                {alert.display}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {alert.symbol}
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(alert.price)}
                                            </div>
                                            <div
                                                className={classNames(
                                                    "text-xs",
                                                    getPriceChangeColor(alert.priceChange)
                                                )}
                                            >
                                                {formatPercentage(alert.priceChange)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatVolume(alert.volume)}
                                            </div>
                                            <div
                                                className={classNames(
                                                    "text-xs font-medium",
                                                    vptDetector.getTrendColor(alert.trend)
                                                )}
                                            >
                                                {alert.trend}
                                            </div>
                                        </div>

                                        <div
                                            className={classNames(
                                                "px-2 py-1 rounded-full text-xs font-medium border",
                                                vptDetector.getStrengthColor(alert.strength)
                                            )}
                                        >
                                            {vptDetector.formatVPTChange(alert.vptChange)}
                                        </div>

                                        <div className="text-xs text-gray-400 w-12 text-right">
                                            {formatTimestamp(alert.timestamp)}
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
