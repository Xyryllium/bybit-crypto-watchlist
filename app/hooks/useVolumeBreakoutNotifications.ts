import { useEffect, useRef } from "react";
import { notificationService, type NotificationData } from "~/lib/notificationService";
import { type VolumeBreakout } from "~/lib/volumeBreakoutDetector";

export function useVolumeBreakoutNotifications(volumeBreakouts: VolumeBreakout[]) {
  const lastProcessedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newBreakouts = volumeBreakouts.filter(breakout => {
      const breakoutKey = `${breakout.symbol}-${breakout.timestamp}`;
      return !lastProcessedRef.current.has(breakoutKey);
    });

    newBreakouts.forEach(breakout => {
      const breakoutKey = `${breakout.symbol}-${breakout.timestamp}`;
      
      if ((breakout.breakoutType === 'volume_surge' || breakout.breakoutType === 'volume_explosion') &&
          Math.abs(breakout.priceChange) >= 1.0) {
        try {
          const notificationData: NotificationData = {
            symbol: breakout.symbol,
            display: breakout.display,
            price: breakout.price,
            priceChange: breakout.priceChange,
            volumeChange: breakout.volumeRatio * 100,
            volume: breakout.currentVolume,
            timestamp: breakout.timestamp,
            type: 'volume_breakout',
          };
          
          notificationService.notify(notificationData);
        } catch (error) {
          console.warn('Failed to send volume breakout notification:', error);
        }
      }
      
      lastProcessedRef.current.add(breakoutKey);
    });

    if (lastProcessedRef.current.size > 1000) {
      const recentBreakouts = new Set(
        volumeBreakouts.slice(-100).map(breakout => `${breakout.symbol}-${breakout.timestamp}`)
      );
      lastProcessedRef.current = recentBreakouts;
    }
  }, [volumeBreakouts]);
}
