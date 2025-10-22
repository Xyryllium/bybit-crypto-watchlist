import { useEffect, useRef } from "react";
import { notificationService, type NotificationData } from "~/lib/notificationService";

export function useVolumeSpikeNotifications(volumeSpikes: any[]) {
  const lastProcessedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Volume spike notifications disabled - keeping only volume breakouts and VPT signals
    // This hook is kept for potential future use but notifications are disabled
    return;
    
    const newSpikes = volumeSpikes.filter(spike => {
      const spikeKey = `${spike.symbol}-${spike.timestamp}`;
      return !lastProcessedRef.current.has(spikeKey);
    });

    newSpikes.forEach(spike => {
      const spikeKey = `${spike.symbol}-${spike.timestamp}`;
      
      if (Math.abs(spike.priceChange) >= 1) {
        try {
          const notificationData: NotificationData = {
            symbol: spike.symbol,
            display: spike.display,
            price: spike.price,
            priceChange: spike.priceChange,
            volumeChange: spike.volumeChange,
            volume: spike.currentVolume,
            timestamp: spike.timestamp,
          };
          
          notificationService.notify(notificationData);
        } catch (error) {
          console.warn('Failed to send notification:', error);
        }
      }
      
      lastProcessedRef.current.add(spikeKey);
    });

    if (lastProcessedRef.current.size > 1000) {
      const recentSpikes = new Set(
        volumeSpikes.slice(-100).map(spike => `${spike.symbol}-${spike.timestamp}`)
      );
      lastProcessedRef.current = recentSpikes;
    }
  }, [volumeSpikes]);
}
