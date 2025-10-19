import { useEffect, useState } from "react";
import { getMarketOpenTime, safeParseFloat } from "~/lib/bybit";

const STORAGE_KEY = "bybit_market_open";

type MarketOpenData = {
    date: string; // YYYY-MM-DD
    prices: Record<string, number>;
};

// Get cached market open or fetch from API
export function useMarketOpen(symbols: string[]) {
    const [marketOpen, setMarketOpen] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initMarketOpen() {
            const today = new Date().toISOString().split('T')[0];
            
            try {
                const cached = localStorage.getItem(STORAGE_KEY);
                if (cached) {
                    const data: MarketOpenData = JSON.parse(cached);
                    if (data.date === today) {
                        setMarketOpen(data.prices);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Failed to load cached market open", e);
            }

            // Fetch fresh 8am open prices
            const start = getMarketOpenTime();
            const newPrices: Record<string, number> = {};
            
            for (const symbol of symbols) {
                try {
                    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1&start=${start}&limit=1`;
                    const res = await fetch(url);
                    const json = await res.json();
                    
                    if (json.retCode === 0 && json.result?.list?.[0]) {
                        const openPrice = parseFloat(json.result.list[0][1]);
                        if (!isNaN(openPrice) && openPrice > 0) {
                            newPrices[symbol] = openPrice;
                        }
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (e) {
                    console.warn(`Failed to fetch market open for ${symbol}`);
                }
            }
            
            try {
                const data: MarketOpenData = { date: today, prices: newPrices };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn("Failed to cache market open", e);
            }

            setMarketOpen(newPrices);
            setIsLoading(false);
        }

        initMarketOpen();
    }, [symbols.join(",")]);

    const reset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMarketOpen({});
        setIsLoading(false);
    };

    return { marketOpen, isLoading, reset };
}

