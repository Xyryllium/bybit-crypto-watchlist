
export interface NotificationData {
  symbol: string;
  display: string;
  price: number;
  priceChange: number;
  volumeChange: number;
  volume: number;
  timestamp: number;
  type?: 'volume_spike' | 'volume_breakout' | 'vpt_alert';
}

export interface NotificationSettings {
  enabled: boolean;
  volumeSpikeThreshold: number;
  priceChangeThreshold: number;
  minVolume: number;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  volumeSpikeThreshold: 20, // 20% volume spike
  priceChangeThreshold: 1, // 1% price change
  minVolume: 100000, // 100K minimum volume
  soundEnabled: true,
};

class NotificationService {
  private settings: NotificationSettings;
  private permission: NotificationPermission = 'default';
  private lastNotificationTime: Record<string, number> = {};
  private notificationCooldown = 30000;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    
    if (typeof window !== 'undefined') {
      this.loadSettings();
      this.requestPermission();
    }
  }

  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('notification-settings');
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error);
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save notification settings:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return false;
    }
  }

  private shouldNotify(data: NotificationData): boolean {
    if (typeof window === 'undefined') return false;
    
    if (!this.settings.enabled || this.permission !== 'granted') {
      return false;
    }

    const now = Date.now();
    const lastTime = this.lastNotificationTime[data.symbol];
    if (lastTime && now - lastTime < this.notificationCooldown) {
      return false;
    }

    const volumeSpikeMet = data.type === 'vpt_alert'
      ? Math.abs(data.volumeChange) >= 1.0
      : Math.abs(data.volumeChange) >= this.settings.volumeSpikeThreshold;
      
    const priceChangeMet = data.type === 'vpt_alert' 
      ? Math.abs(data.priceChange) >= 1.0
      : Math.abs(data.priceChange) >= this.settings.priceChangeThreshold;
      
    const volumeMet = data.volume >= this.settings.minVolume;

    return volumeSpikeMet && priceChangeMet && volumeMet;
  }

  private createNotification(data: NotificationData): Notification | null {
    if (!this.shouldNotify(data)) {
      return null;
    }

    const isPriceUp = data.priceChange >= 0;
    const isVolumeUp = data.volumeChange >= 0;
    
    const priceIcon = isPriceUp ? '📈' : '📉';
    const volumeIcon = isVolumeUp ? '🔥' : '❄️';
    
    const breakoutIcon = data.type === 'volume_breakout' ? '💥' : data.type === 'vpt_alert' ? '📈' : '📊';
    
    const title = `${priceIcon} ${data.display} ${breakoutIcon}`;
    
    const safePriceChange = Math.min(Math.max(data.priceChange, -1000), 1000);
    const safeVolumeChange = Math.min(Math.max(data.volumeChange, -1000), 1000);
    
    const priceChangeText = safePriceChange >= 0 
      ? `+${safePriceChange.toFixed(2)}%` 
      : `${safePriceChange.toFixed(2)}%`;
    
    const volumeChangeText = safeVolumeChange >= 0 
      ? `+${safeVolumeChange.toFixed(0)}%` 
      : `${safeVolumeChange.toFixed(0)}%`;

    const body = `Price: $${data.price.toFixed(2)} (${priceChangeText})\nVolume: ${this.formatVolume(data.volume)} (${volumeChangeText})`;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `volume-spike-${data.symbol}`,
        requireInteraction: false,
        silent: !this.settings.soundEnabled,
      });

      this.lastNotificationTime[data.symbol] = Date.now();

      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.warn('Failed to create notification:', error);
      return null;
    }
  }

  private formatVolume(volume: number): string {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  }

  initialize(): void {
    if (typeof window !== 'undefined') {
      this.loadSettings();
      this.requestPermission();
    }
  }

  notify(data: NotificationData): boolean {
    try {
      const notification = this.createNotification(data);
      return notification !== null;
    } catch (error) {
      console.warn('Notification service error:', error);
      return false;
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  async enableNotifications(): Promise<boolean> {
    const granted = await this.requestPermission();
    if (granted) {
      this.updateSettings({ enabled: true });
    }
    return granted;
  }

  disableNotifications(): void {
    this.updateSettings({ enabled: false });
  }
}

export const notificationService = new NotificationService();
