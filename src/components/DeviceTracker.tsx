import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDeviceTracking } from '@/hooks/useDeviceTracking';
import { Monitor, Smartphone, Wifi, WifiOff, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';

export function DeviceTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const { devices, getDeviceStatus, isLoading, refreshSessions, currentSessionId } = useDeviceTracking();

  const onlineCount = devices.filter(device => 
    getDeviceStatus(device).status === 'online'
  ).length;

  const currentDevice = devices.find(device => device.id === currentSessionId);
  const currentDeviceStatus = currentDevice ? getDeviceStatus(currentDevice) : null;

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'Mobile' ? Smartphone : Monitor;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Users size={16} className="mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Users size={16} className="mr-2" />
          <span className="hidden sm:inline">Devices</span>
          <span className="sm:hidden">Dev</span>
          <Badge 
            variant={onlineCount > 0 ? "default" : "secondary"} 
            className="ml-2 px-1.5 py-0.5 text-xs"
          >
            {onlineCount}/{devices.length}
          </Badge>
          {currentDeviceStatus && (
            <div className="absolute -top-1 -right-1">
              {currentDeviceStatus.status === 'online' ? (
                <CheckCircle size={12} className="text-green-500 bg-white rounded-full" />
              ) : (
                <AlertCircle size={12} className="text-yellow-500 bg-white rounded-full" />
              )}
            </div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Active Devices
            <Badge variant="outline" className="ml-2">
              {onlineCount} online of {devices.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Current Device Status */}
        {currentDevice && (
          <Card className="mb-4 border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {getDeviceIcon(currentDevice.device_type) === Smartphone ? (
                    <Smartphone size={20} className="text-blue-600" />
                  ) : (
                    <Monitor size={20} className="text-blue-600" />
                  )}
                  {currentDeviceStatus?.status === 'online' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-blue-900">This Device</h4>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700">
                      Current
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <span>{currentDevice.device_name}</span>
                    <span>•</span>
                    {currentDeviceStatus?.status === 'online' ? (
                      <>
                        <Wifi size={12} className="text-green-500" />
                        <span className="text-green-600 font-medium">Online & Synced</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={12} className="text-yellow-500" />
                        <span className="text-yellow-600 font-medium">{currentDeviceStatus?.text}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {devices.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                <Monitor className="mx-auto mb-2 opacity-50" size={32} />
                <div>No active devices found</div>
                <div className="text-xs mt-1">
                  {isLoading ? 'Loading devices...' : 'Try refreshing to detect devices'}
                </div>
              </CardContent>
            </Card>
          ) : (
            devices.map((device) => {
              const status = getDeviceStatus(device);
              const DeviceIcon = getDeviceIcon(device.device_type);
              const isCurrentDevice = device.id === currentSessionId;

              return (
                <Card 
                  key={device.id} 
                  className={`transition-all duration-200 ${
                    status.status === 'online' 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-border'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <DeviceIcon size={20} className="text-muted-foreground" />
                          {status.status === 'online' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {device.device_name}
                            </h4>
                            {isCurrentDevice && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                This device
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock size={12} />
                            <span>Active since {formatTime(device.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {status.status === 'online' ? (
                              <Wifi size={12} className="text-green-500" />
                            ) : (
                              <WifiOff size={12} className="text-gray-400" />
                            )}
                            <span className={`text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                            {status.status === 'online' && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">
                                Synced
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Real-time updates</span>
              {currentDeviceStatus?.status === 'online' && (
                <CheckCircle size={12} className="text-green-500" />
              )}
            </div>
            {onlineCount > 0 && (
              <div className="text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
                <span>{onlineCount} device{onlineCount > 1 ? 's' : ''} synced</span>
              </div>
            )}
            {currentDeviceStatus && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-blue-600">Your device:</span>
                <span className={currentDeviceStatus.color}>{currentDeviceStatus.text}</span>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSessions}
          >
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}