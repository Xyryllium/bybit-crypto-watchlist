import { useEffect, useRef } from "react";
import { notificationService, type NotificationData } from "~/lib/notificationService";
import { type VPTData } from "~/lib/vptDetector";

export function useVPTNotifications(vptAlerts: VPTData[]) {
  const lastProcessedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newAlerts = vptAlerts.filter(alert => {
      const alertKey = `${alert.symbol}-${alert.timestamp}`;
      return !lastProcessedRef.current.has(alertKey);
    });

    newAlerts.forEach(alert => {
      const alertKey = `${alert.symbol}-${alert.timestamp}`;
      
      if ((alert.strength === 'strong' || alert.strength === 'extreme') && 
          Math.abs(alert.priceChange) >= 1.0) {
        try {
          const notificationData: NotificationData = {
            symbol: alert.symbol,
            display: alert.display,
            price: alert.price,
            priceChange: alert.priceChange,
            volumeChange: alert.vptChange,
            volume: alert.volume,
            timestamp: alert.timestamp,
            type: 'vpt_alert',
          };
          
          notificationService.notify(notificationData);
        } catch (error) {
          console.warn('Failed to send VPT notification:', error);
        }
      }
      
      lastProcessedRef.current.add(alertKey);
    });

    if (lastProcessedRef.current.size > 1000) {
      const recentAlerts = new Set(
        vptAlerts.slice(-100).map(alert => `${alert.symbol}-${alert.timestamp}`)
      );
      lastProcessedRef.current = recentAlerts;
    }
  }, [vptAlerts]);
}
