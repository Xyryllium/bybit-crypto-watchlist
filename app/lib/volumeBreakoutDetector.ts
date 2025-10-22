
export interface VolumeBreakout {
  id: string;
  symbol: string;
  display: string;
  currentVolume: number;
  averageVolume: number;
  volumeRatio: number;
  price: number;
  priceChange: number;
  breakoutType: 'volume_spike' | 'volume_surge' | 'volume_explosion';
  timestamp: number;
}

export interface VolumeBreakoutConfig {
  enabled: boolean;
  lookbackPeriod: number;
  spikeThreshold: number;
  surgeThreshold: number;
  explosionThreshold: number;
  minVolumeFilter: number;
  minPriceChange: number;
}

const DEFAULT_BREAKOUT_CONFIG: VolumeBreakoutConfig = {
  enabled: true,
  lookbackPeriod: 60,
  spikeThreshold: 2.0,
  surgeThreshold: 5.0,
  explosionThreshold: 10.0,
  minVolumeFilter: 50000,
  minPriceChange: 0.5,
};

class VolumeBreakoutDetector {
  private config: VolumeBreakoutConfig;
  private volumeHistory: Record<string, number[]> = {};
  private lastBreakoutTime: Record<string, number> = {};
  private breakoutCooldown = 300000;

  constructor() {
    this.config = { ...DEFAULT_BREAKOUT_CONFIG };
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('volume-breakout-config');
      if (saved) {
        this.config = { ...DEFAULT_BREAKOUT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load volume breakout config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('volume-breakout-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save volume breakout config:', error);
    }
  }

  private calculateAverageVolume(symbol: string): number {
    const history = this.volumeHistory[symbol];
    if (!history || history.length === 0) return 0;
    
    const sum = history.reduce((acc, vol) => acc + vol, 0);
    return sum / history.length;
  }

  private determineBreakoutType(ratio: number): VolumeBreakout['breakoutType'] {
    if (ratio >= this.config.explosionThreshold) return 'volume_explosion';
    if (ratio >= this.config.surgeThreshold) return 'volume_surge';
    return 'volume_spike';
  }

  private shouldProcessBreakout(symbol: string, timestamp: number): boolean {
    if (!this.config.enabled) return false;
    
    // Check cooldown
    const lastTime = this.lastBreakoutTime[symbol];
    if (lastTime && timestamp - lastTime < this.breakoutCooldown) {
      return false;
    }
    
    return true;
  }

  processVolumeData(
    symbol: string,
    currentVolume: number,
    price: number,
    priceChange: number,
    timestamp: number
  ): VolumeBreakout | null {
    if (!this.shouldProcessBreakout(symbol, timestamp)) {
      return null;
    }

    if (!this.volumeHistory[symbol]) {
      this.volumeHistory[symbol] = [];
    }

    this.volumeHistory[symbol].push(currentVolume);
    
    const maxHistoryLength = this.config.lookbackPeriod;
    if (this.volumeHistory[symbol].length > maxHistoryLength) {
      this.volumeHistory[symbol] = this.volumeHistory[symbol].slice(-maxHistoryLength);
    }

    if (this.volumeHistory[symbol].length < 10) {
      return null;
    }

    const averageVolume = this.calculateAverageVolume(symbol);
    if (averageVolume === 0) return null;

    const volumeRatio = currentVolume / averageVolume;
    
    const isBreakout = volumeRatio >= this.config.spikeThreshold &&
                      currentVolume >= this.config.minVolumeFilter &&
                      Math.abs(priceChange) >= this.config.minPriceChange;

    if (!isBreakout) return null;

    const breakout: VolumeBreakout = {
      id: `${symbol}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      display: symbol.replace('USDT', ''),
      currentVolume,
      averageVolume,
      volumeRatio,
      price,
      priceChange,
      breakoutType: this.determineBreakoutType(volumeRatio),
      timestamp,
    };

    this.lastBreakoutTime[symbol] = timestamp;

    return breakout;
  }

  updateConfig(newConfig: Partial<VolumeBreakoutConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig(): VolumeBreakoutConfig {
    return { ...this.config };
  }

  getBreakoutTypeLabel(type: VolumeBreakout['breakoutType']): string {
    switch (type) {
      case 'volume_spike': return 'Volume Spike';
      case 'volume_surge': return 'Volume Surge';
      case 'volume_explosion': return 'Volume Explosion';
      default: return 'Volume Breakout';
    }
  }

  getBreakoutTypeColor(type: VolumeBreakout['breakoutType']): string {
    switch (type) {
      case 'volume_spike': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'volume_surge': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'volume_explosion': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  formatVolumeRatio(ratio: number): string {
    return `${ratio.toFixed(1)}x`;
  }
}

export const volumeBreakoutDetector = new VolumeBreakoutDetector();
