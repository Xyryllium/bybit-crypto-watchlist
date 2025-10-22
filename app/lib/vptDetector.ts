export interface VPTData {
  id: string;
  symbol: string;
  display: string;
  price: number;
  priceChange: number;
  volume: number;
  vptValue: number;
  vptChange: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong' | 'extreme';
  timestamp: number;
}

export interface VPTConfig {
  enabled: boolean;
  lookbackPeriod: number;
  minVolumeFilter: number;
  minPriceChange: number;
  strongThreshold: number;
  extremeThreshold: number;
}

const DEFAULT_VPT_CONFIG: VPTConfig = {
  enabled: true,
  lookbackPeriod: 20,
  minVolumeFilter: 100000,
  minPriceChange: 0.5,
  strongThreshold: 2.0,
  extremeThreshold: 5.0,
};

class VPTDetector {
  private config: VPTConfig;
  private vptHistory: Record<string, number[]> = {};
  private lastAlertTime: Record<string, number> = {};
  private alertCooldown = 300000;

  constructor() {
    this.config = { ...DEFAULT_VPT_CONFIG };
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('vpt-config');
      if (saved) {
        this.config = { ...DEFAULT_VPT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load VPT config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('vpt-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save VPT config:', error);
    }
  }

  private calculateVPT(currentPrice: number, previousPrice: number, volume: number): number {
    if (previousPrice === 0) return 0;
    
    const priceChange = (currentPrice - previousPrice) / previousPrice;
    return priceChange * volume;
  }

  private calculateVPTChange(currentVPT: number, previousVPT: number): number {
    if (previousVPT === 0) return 0;
    
    const minDenominator = Math.max(Math.abs(previousVPT), 1.0);
    const change = ((currentVPT - previousVPT) / minDenominator) * 100;
    
    return Math.min(Math.max(change, -1000), 1000);
  }

  private determineTrend(vptChange: number, priceChange: number): VPTData['trend'] {
    if (vptChange > 0 && priceChange > 0) return 'bullish';
    if (vptChange < 0 && priceChange < 0) return 'bearish';
    return 'neutral';
  }

  private determineStrength(vptChange: number): VPTData['strength'] {
    const absChange = Math.abs(vptChange);
    if (absChange >= this.config.extremeThreshold) return 'extreme';
    if (absChange >= this.config.strongThreshold) return 'strong';
    if (absChange >= 1.0) return 'moderate';
    return 'weak';
  }

  private shouldProcessAlert(symbol: string, timestamp: number): boolean {
    if (!this.config.enabled) return false;
    
    const lastTime = this.lastAlertTime[symbol];
    if (lastTime && timestamp - lastTime < this.alertCooldown) {
      return false;
    }
    
    return true;
  }

  processVPTData(
    symbol: string,
    currentPrice: number,
    previousPrice: number,
    volume: number,
    timestamp: number
  ): VPTData | null {
    if (!this.shouldProcessAlert(symbol, timestamp)) {
      return null;
    }

    if (!this.vptHistory[symbol]) {
      this.vptHistory[symbol] = [];
    }

    const vptValue = this.calculateVPT(currentPrice, previousPrice, volume);
    this.vptHistory[symbol].push(vptValue);
    
    if (this.vptHistory[symbol].length > this.config.lookbackPeriod) {
      this.vptHistory[symbol] = this.vptHistory[symbol].slice(-this.config.lookbackPeriod);
    }

    if (this.vptHistory[symbol].length < 2) {
      return null;
    }

    const previousVPT = this.vptHistory[symbol][this.vptHistory[symbol].length - 2];
    const vptChange = this.calculateVPTChange(vptValue, previousVPT);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    const isSignificant = Math.abs(priceChange) >= this.config.minPriceChange &&
                         volume >= this.config.minVolumeFilter &&
                         Math.abs(vptChange) >= 1.0;

    if (!isSignificant) return null;

    const trend = this.determineTrend(vptChange, priceChange);
    const strength = this.determineStrength(vptChange);

    const vptData: VPTData = {
      id: `${symbol}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      display: symbol.replace('USDT', ''),
      price: currentPrice,
      priceChange,
      volume,
      vptValue,
      vptChange,
      trend,
      strength,
      timestamp,
    };

    this.lastAlertTime[symbol] = timestamp;
    return vptData;
  }

  updateConfig(newConfig: Partial<VPTConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig(): VPTConfig {
    return { ...this.config };
  }

  getTrendColor(trend: VPTData['trend']): string {
    switch (trend) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  getStrengthColor(strength: VPTData['strength']): string {
    switch (strength) {
      case 'weak': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'moderate': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'strong': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'extreme': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  formatVPTChange(change: number): string {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }
}

export const vptDetector = new VPTDetector();
