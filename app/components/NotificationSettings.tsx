import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, BellOff, Settings, Volume2, VolumeX } from "lucide-react";
import { notificationService, type NotificationSettings } from "~/lib/notificationService";

export function NotificationSettings() {
    const [settings, setSettings] = useState<NotificationSettings>({
        enabled: true,
        volumeSpikeThreshold: 20,
        priceChangeThreshold: 1,
        minVolume: 100000,
        soundEnabled: true,
    });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Initialize the service on client side
        notificationService.initialize();
        setSettings(notificationService.getSettings());
        setPermissionGranted(notificationService.isPermissionGranted());
    }, []);

    const handleEnableNotifications = async () => {
        const granted = await notificationService.enableNotifications();
        setPermissionGranted(granted);
        if (granted) {
            setSettings(notificationService.getSettings());
        }
    };

    const handleDisableNotifications = () => {
        notificationService.disableNotifications();
        setSettings(notificationService.getSettings());
    };

    const testNotification = () => {
        const testData = {
            symbol: 'BTCUSDT',
            display: 'BTC/USDT',
            price: 45000,
            priceChange: 2.5,
            volumeChange: 150,
            volume: 5000000,
            timestamp: Date.now(),
        };
        notificationService.notify(testData);
    };

    const updateSetting = <K extends keyof NotificationSettings>(
        key: K,
        value: NotificationSettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        notificationService.updateSettings(newSettings);
        setSettings(newSettings);
    };

    const getStatusBadge = () => {
        if (!permissionGranted) {
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Permission Denied</Badge>;
        }
        if (!settings.enabled) {
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Disabled</Badge>;
        }
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>;
    };

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="h-7 px-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 text-xs flex items-center gap-1"
            >
                <Settings className="w-3 h-3" />
                Notifications
                {getStatusBadge()}
            </Button>

            {isOpen && (
                <Card className="absolute top-8 right-0 z-50 w-80 bg-white border border-gray-200 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notification Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!permissionGranted ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Enable browser notifications to get alerts for volume spikes and price changes.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={handleEnableNotifications}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Bell className="w-3 h-3 mr-1" />
                                    Enable Notifications
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Notifications</span>
                                    <div className="flex items-center gap-2">
                                        {settings.enabled ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleDisableNotifications}
                                                className="h-6 px-2 text-xs"
                                            >
                                                <BellOff className="w-3 h-3 mr-1" />
                                                Disable
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => updateSetting('enabled', true)}
                                                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Bell className="w-3 h-3 mr-1" />
                                                Enable
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {settings.enabled && (
                                    <>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Volume Spike Threshold (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    value={settings.volumeSpikeThreshold}
                                                    onChange={(e) => updateSetting('volumeSpikeThreshold', Number(e.target.value))}
                                                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Price Change Threshold (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    max="100"
                                                    step="0.1"
                                                    value={settings.priceChangeThreshold}
                                                    onChange={(e) => updateSetting('priceChangeThreshold', Number(e.target.value))}
                                                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Minimum Volume
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1000"
                                                    step="1000"
                                                    value={settings.minVolume}
                                                    onChange={(e) => updateSetting('minVolume', Number(e.target.value))}
                                                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700">Sound</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    {settings.soundEnabled ? (
                                                        <Volume2 className="w-3 h-3" />
                                                    ) : (
                                                        <VolumeX className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={testNotification}
                                                className="w-full h-6 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                            >
                                                Test Notification
                                            </Button>
                                        </div>

                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">
                                                Notifications will trigger when both volume spike and price change thresholds are met.
                                                Cooldown: 30 seconds per symbol.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
