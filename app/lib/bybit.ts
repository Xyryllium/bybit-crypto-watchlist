export const BYBIT_WS_ENDPOINTS = [
    "wss://stream.bybit.com/v5/public/linear",
    "wss://stream-testnet.bybit.com/v5/public/linear",
];

export const CHART_COLORS = {
    bullish: "#16a34a",    // green-600
    bearish: "#dc2626",    // red-600
    wick: "#6b7280",       // gray-500
    grid: "#f3f4f6",       // gray-100
    axis: "#9ca3af",       // gray-400
} as const;

export type TimeFrame = "1" | "5" | "15" | "30" | "60" | "120" | "240" | "D" | "M";

export type PerpSymbol = {
    name: string;
    display: string;
};

export type BybitTicker = {
    symbol: string;
    lastPrice: string;
    price24hPcnt: string;
    highPrice24h: string;
    lowPrice24h: string;
    volume24h: string;
};

export type Candle = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
};

export const POPULAR_SYMBOLS: PerpSymbol[] = [
    { name: "BTCUSDT", display: "BTC" },
    { name: "ETHUSDT", display: "ETH" },
    { name: "SOLUSDT", display: "SOL" },
    { name: "XRPUSDT", display: "XRP" },
    { name: "BNBUSDT", display: "BNB" },
    { name: "ADAUSDT", display: "ADA" },
    { name: "DOGEUSDT", display: "DOGE" },
    { name: "DOTUSDT", display: "DOT" },
    { name: "LINKUSDT", display: "LINK" },
    { name: "AVAXUSDT", display: "AVAX" },
    { name: "UNIUSDT", display: "UNI" },
    { name: "LTCUSDT", display: "LTC" },
    { name: "ATOMUSDT", display: "ATOM" },
    { name: "ETCUSDT", display: "ETC" },
    { name: "FILUSDT", display: "FIL" },
    { name: "TRXUSDT", display: "TRX" },
    { name: "NEARUSDT", display: "NEAR" },
    { name: "APTUSDT", display: "APT" },
    { name: "ARBUSDT", display: "ARB" },
    { name: "OPUSDT", display: "OP" },
    { name: "INJUSDT", display: "INJ" },
    { name: "SUIUSDT", display: "SUI" },
    { name: "WLDUSDT", display: "WLD" },
    { name: "SEIUSDT", display: "SEI" },
    { name: "RENDERUSDT", display: "RENDER" },
    { name: "LDOUSDT", display: "LDO" },
    { name: "TIAUSDT", display: "TIA" },
    { name: "ORBSUSDT", display: "ORBS" },
    { name: "ICPUSDT", display: "ICP" },
    { name: "AAVEUSDT", display: "AAVE" },
    { name: "ALGOUSDT", display: "ALGO" },
    { name: "SANDUSDT", display: "SAND" },
    { name: "MANAUSDT", display: "MANA" },
    { name: "AXSUSDT", display: "AXS" },
    { name: "GMXUSDT", display: "GMX" },
    { name: "APEUSDT", display: "APE" },
    { name: "GALAUSDT", display: "GALA" },
    { name: "BLURUSDT", display: "BLUR" },
    { name: "STXUSDT", display: "STX" },
    { name: "IMXUSDT", display: "IMX" },
    { name: "TONUSDT", display: "TON" },
    { name: "TRUMPUSDT", display: "TRUMP" },
    { name: "COAIUSDT", display: "COAI" },
    { name: "BLESSUSDT", display: "BLESS" },
    { name: "SOONUSDT", display: "SOON" },
    { name: "ASTERUSDT", display: "ASTER" },
    { name: "STRKUSDT", display: "STRK" },
    { name: "PUMPFUNUSDT", display: "PUMPFUN" },
    { name: "WIFUSDT", display: "WIF" },
    { name: "TWTUSDT", display: "TWT" },
    { name: "ZECUSDT", display: "ZEC" },
    { name: "ONDOUSDT", display: "ONDO" },
    { name: "CAKEUSDT", display: "CAKE" },
    { name: "1000BONKUSDT", display: "1000BONK" },
    { name: "CELOUSDT", display: "CELO" },
    { name: "PENGUUSDT", display: "PENGU" },
    { name: "APEXUSDT", display: "APEX" },
    { name: "PLUMEUSDT", display: "PLUME" },
    { name: "STOUSDT", display: "STO" },
    { name: "EIGENUSDT", display: "EIGEN" },
    { name: "HBARUSDT", display: "HBAR" },
    { name: "ALPINEUSDT", display: "ALPINE" },
    { name: "EPTUSDT", display: "EPT" },
    { name: "LYNUSDT", display: "LYN" },
    { name: "WLFIUSDT", display: "WLFI" },
    { name: "SOMIUSDT", display: "SOMI" },
    { name: "QUSDT", display: "Q" },
    { name: "1000FLOKIUSDT", display: "1000FLOKI" },
    { name: "ORDERUSDT", display: "ORDER" },
    { name: "STBLUSDT", display: "STBL" },
    { name: "SPXUSDT", display: "SPX" },
    { name: "NAORISUSDT", display: "NAORIS" },
    { name: "CRVUSDT", display: "CRV" },
    { name: "TAOUSDT", display: "TAO" },
    { name: "XLMUSDT", display: "XLM" },
    { name: "DRIFTUSDT", display: "DRIFT" },
    { name: "FORMUSDT", display: "FORM" },
    { name: "ASTRUSDT", display: "ASTR" },
    { name: "MOODENGUSDT", display: "MOODENG" },
    { name: "IPUSDT", display: "IP" },
    { name: "OPENUSDT", display: "OPEN" },
    { name: "USELESSUSDT", display: "USELESS" },
    { name: "WUSDT", display: "W" },
    { name: "VFYUSDT", display: "VFY" },
    { name: "ETHFIUSDT", display: "ETHFI" },
    { name: "LINEAUSDT", display: "LINEA" },
    { name: "AVNTUSDT", display: "AVNT" },
    { name: "FFUSDT", display: "FF" },
    { name: "POPCATUSDT", display: "POPCAT" },
    { name: "JELLYJELLYUSDT", display: "JELLYJELLY" },
    { name: "BCHUSDT", display: "BCH" },
    { name: "0GUSDT", display: "0G" },
    { name: "XAUTUSDT", display: "XAUT" },
    { name: "GORKUSDT", display: "GORK" },
    { name: "TUTUSDT", display: "TUT" },
    { name: "HOLOUSDT", display: "HOLO" },
    { name: "2ZUSDT", display: "2Z" },
    { name: "VIRTUALUSDT", display: "VIRTUAL" },
    { name: "KAITOUSDT", display: "KAITO" },
    { name: "ORDIUSDT", display: "ORDI" },
    { name: "ALEOUSDT", display: "ALEO" },
    { name: "TRUTHUSDT", display: "TRUTH" },
    { name: "INUSDT", display: "IN" },
    { name: "XANUSDT", display: "XAN" },
    { name: "SHIB1000USDT", display: "SHIB1000" },
    { name: "MIRAUSDT", display: "MIRA" },
    { name: "LAUNCHCOINUSDT", display: "LAUNCHCOIN" },
    { name: "SNXUSDT", display: "SNX" },
    { name: "SKATEUSDT", display: "SKATE" },
    { name: "KASUSDT", display: "KAS" },
    { name: "XMRUSDT", display: "XMR" },
    { name: "SKYAIUSDT", display: "SKYAI" },
    { name: "EDENUSDT", display: "EDEN" },
    { name: "MUSDT", display: "M" },
    { name: "AI16ZUSDT", display: "AI16Z" },
    { name: "ZROUSDT", display: "ZRO" },
    { name: "B2USDT", display: "B2" },
    { name: "SUSDT", display: "S" },
    { name: "LIGHTUSDT", display: "LIGHT" },
    { name: "AEROUSDT", display: "AERO" },
    { name: "FLOCKUSDT", display: "FLOCK" },
    { name: "HYPERUSDT", display: "HYPER" },
    { name: "DEEPUSDT", display: "DEEP" },
    { name: "BARDUSDT", display: "BARD" },
    { name: "PAXGUSDT", display: "PAXG" },
    { name: "GRASSUSDT", display: "GRASS" },
    { name: "POLUSDT", display: "POL" },
    { name: "ZENUSDT", display: "ZEN" },
    { name: "PYTHUSDT", display: "PYTH" },
    { name: "1000000MOGUSDT", display: "1000000MOG" },
    { name: "BERAUSDT", display: "BERA" },
    { name: "XPINUSDT", display: "XPIN" },
    { name: "1000TOSHIUSDT", display: "1000TOSHI" },
    { name: "BIOUSDT", display: "BIO" },
    { name: "MERLUSDT", display: "MERL" },
    { name: "PHBUSDT", display: "PHB" },
    { name: "ZORAUSDT", display: "ZORA" },
    { name: "HEMIUSDT", display: "HEMI" },
    { name: "PENDLEUSDT", display: "PENDLE" },
    { name: "C98USDT", display: "C98" },
    { name: "ZKUSDT", display: "ZK" },
    { name: "BRETTUSDT", display: "BRETT" },
    { name: "ENSUSDT", display: "ENS" },
    { name: "PNUTUSDT", display: "PNUT" },
    { name: "CUDISUSDT", display: "CUDIS" },
    { name: "ZKCUSDT", display: "ZKC" },
    { name: "EPICUSDT", display: "EPIC" },
    { name: "PEAQUSDT", display: "PEAQ" },
    { name: "DYDXUSDT", display: "DYDX" },
    { name: "ALCHUSDT", display: "ALCH" },
    { name: "NMRUSDT", display: "NMR" },
    { name: "BEAMUSDT", display: "BEAM" },
    { name: "SQDUSDT", display: "SQD" },
    { name: "ALICEUSDT", display: "ALICE" },
    { name: "THEUSDT", display: "THE" },
    { name: "DAMUSDT", display: "DAM" },
    { name: "GOATUSDT", display: "GOAT" },
    { name: "CROUSDT", display: "CRO" },
    { name: "ATHUSDT", display: "ATH" },
    { name: "REDUSDT", display: "RED" },
    { name: "AKEUSDT", display: "AKE" },
    { name: "FLUIDUSDT", display: "FLUID" },
    { name: "DASHUSDT", display: "DASH" },
    { name: "JTOUSDT", display: "JTO" },
    { name: "UBUSDT", display: "UB" },
    { name: "ZETAUSDT", display: "ZETA" },
    { name: "MORPHOUSDT", display: "MORPHO" },
    { name: "REZUSDT", display: "REZ" },
    { name: "TAUSDT", display: "TAU" },
    { name: "AVLUSDT", display: "AVL" },
    { name: "DOODUSDT", display: "DOOD" },
    { name: "BTRUSDT", display: "BTR" },
    { name: "PROMPTUSDT", display: "PROMPT" },
    { name: "ARKMUSDT", display: "ARKM" },
    { name: "OMUSDT", display: "OM" },
    { name: "TRBUSDT", display: "TRB" },
    { name: "NOTUSDT", display: "NOT" },
    { name: "1000NEIROCTOUSDT", display: "1000NEIROCTO" },
    { name: "XTZUSDT", display: "XTZ" },
    { name: "LISTAUSDT", display: "LISTA" },
    { name: "SPKUSDT", display: "SPK" },
    { name: "PROVEUSDT", display: "PROVE" },
    { name: "HUSDT", display: "H" },
    { name: "API3USDT", display: "API3" },
    { name: "SUPERUSDT", display: "SUPER" },
    { name: "ROAMUSDT", display: "ROAM" },
    { name: "XNYUSDT", display: "XNY" },
    { name: "CFXUSDT", display: "CFX" },
    { name: "OKBUSDT", display: "OKB" },
    { name: "KERNELUSDT", display: "KERNEL" },
    { name: "GRTUSDT", display: "GRT" },
    { name: "ZBCNUSDT", display: "ZBCN" },
    { name: "JASMYUSDT", display: "JASMY" },
    { name: "LAUSDT", display: "LA" },
    { name: "HIFIUSDT", display: "HIFI" },
    { name: "NOMUSDT", display: "NOM" },
    { name: "ETHBTCUSDT", display: "ETHBTC" },
    { name: "RUNEUSDT", display: "RUNE" },
    { name: "BOMEUSDT", display: "BOME" },
    { name: "CAMPUSDT", display: "CAMP" },
    { name: "AVAAIUSDT", display: "AVAAI" },
    { name: "AXLUSDT", display: "AXL" },
    { name: "AVAILUSDT", display: "AVAIL" },
    { name: "AIXBTUSDT", display: "AIXBT" },
    { name: "YALAUSDT", display: "YALA" },
    { name: "GMTUSDT", display: "GMT" },
    { name: "KMNOUSDT", display: "KMNO" },
    { name: "AIOUSDT", display: "AIO" },
    { name: "10000SATSUSDT", display: "10000SATS" },
    { name: "ARUSDT", display: "AR" },
];

export function getMarketOpenTime(): number {
    const now = new Date();
    const utc8Now = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const today8am = new Date(Date.UTC(
        utc8Now.getUTCFullYear(),
        utc8Now.getUTCMonth(),
        utc8Now.getUTCDate(),
        0, 0, 0, 0
    ));
    return today8am.getTime();
}

export function formatTimeframeLabel(tf: TimeFrame): string {
    const labels: Record<TimeFrame, string> = {
        "1": "1m", "5": "5m", "15": "15m", "30": "30m",
        "60": "1h", "120": "2h", "240": "4h",
        "D": "1D", "M": "1M"
    };
    return labels[tf] || tf;
}

export function getIntervalMs(tf: TimeFrame): number {
    const intervals: Record<TimeFrame, number> = {
        "1": 60000,
        "5": 5 * 60000,
        "15": 15 * 60000,
        "30": 30 * 60000,
        "60": 60 * 60000,
        "120": 120 * 60000,
        "240": 240 * 60000,
        "D": 24 * 60 * 60000,
        "M": 30 * 24 * 60 * 60000,
    };
    return intervals[tf] || 60000;
}

export function formatTimestamp(ts: number, tf: TimeFrame): string {
    const d = new Date(ts);
    if (tf === "D" || tf === "M") {
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export async function fetchHistoricalKlines(
    symbol: string,
    interval: TimeFrame,
    start: number,
    end: number
): Promise<Candle[]> {
    try {
        const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&start=${start}&end=${end}&limit=1000`;
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const json = await res.json();
        
        if (json.error || json.retCode !== 0) {
            throw new Error(json.error || json.retMsg || "API error");
        }

        if (json.result?.list) {
            return json.result.list
                .map((item: any) => ({
                    time: Number(item[0]),
                    open: parseFloat(item[1]),
                    high: parseFloat(item[2]),
                    low: parseFloat(item[3]),
                    close: parseFloat(item[4]),
                    volume: parseFloat(item[5]) || 0,
                }))
                .filter((c: Candle) => !isNaN(c.close))
                .sort((a: Candle, b: Candle) => a.time - b.time);
        }
    } catch (e) {
    }
    return [];
}

export function safeParseFloat(value: any, fallback: number = 0): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

