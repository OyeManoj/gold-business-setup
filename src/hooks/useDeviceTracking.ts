import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeviceSession {
  id: string;
  device_name: string;
  device_type: string;
  browser_info: string;
  last_seen: string;
  is_active: boolean;
  created_at: string;
}

interface DevicePresence {
  session_id: string;
  device_name: string;
  is_online: boolean;
  last_seen: Date;
}

export function useDeviceTracking() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get device info
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop';
    const browserInfo = getBrowserInfo(userAgent);
    const deviceName = `${deviceType} - ${browserInfo}`;
    
    return {
      device_name: deviceName,
      device_type: deviceType,
      browser_info: browserInfo
    };
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  // Get current user info
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('goldease_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  // Register current device session
  const registerDeviceSession = async () => {
    const user = getCurrentUser();
    if (!user) return null;

    const deviceInfo = getDeviceInfo();
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.userId,
          ...deviceInfo
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to register device session:', error);
      return null;
    }
  };

  // Update session activity
  const updateSessionActivity = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ 
          last_seen: new Date().toISOString(),
          is_active: true 
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  };

  // Load user sessions
  const loadUserSessions = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.userId)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Failed to load user sessions:', error);
    }
  };

  // Setup presence tracking
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      console.log('Device tracking: No user found');
      setIsLoading(false);
      return;
    }

    console.log('Device tracking: Initializing for user', user.userId);

    const initializeSession = async () => {
      try {
        const sessionId = await registerDeviceSession();
        console.log('Device tracking: Session registered', sessionId);
        if (sessionId) {
          setCurrentSessionId(sessionId);
        }
        await loadUserSessions();
        setIsLoading(false);
      } catch (error) {
        console.error('Device tracking: Failed to initialize session', error);
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Setup presence channel when session is ready
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !currentSessionId) {
      console.log('Device tracking: User or session not ready', { user: !!user, currentSessionId });
      return;
    }

    console.log('Device tracking: Setting up presence for session', currentSessionId);

    // Setup presence channel
    const deviceInfo = getDeviceInfo();
    const presenceChannel = supabase.channel(`user_presence_${user.userId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineSessionIds = new Set<string>();
        
        console.log('Device tracking: Presence sync', state);
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            onlineSessionIds.add(presence.session_id);
          });
        });
        
        setOnlineDevices(onlineSessionIds);
        console.log('Device tracking: Online devices updated', Array.from(onlineSessionIds));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Device tracking: New device joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Device tracking: Device left:', leftPresences);
      });

    presenceChannel.subscribe(async (status) => {
      console.log('Device tracking: Presence channel status', status);
      if (status === 'SUBSCRIBED') {
        try {
          const trackingResult = await presenceChannel.track({
            session_id: currentSessionId,
            device_name: deviceInfo.device_name,
            online_at: new Date().toISOString()
          });
          console.log('Device tracking: Presence tracking started', trackingResult);
        } catch (error) {
          console.error('Device tracking: Failed to start presence tracking', error);
        }
      }
    });

    // Update activity periodically
    const activityInterval = setInterval(() => {
      if (currentSessionId) {
        updateSessionActivity(currentSessionId);
        console.log('Device tracking: Activity updated for session', currentSessionId);
      }
    }, 30000); // Update every 30 seconds

    // Setup realtime subscription for sessions
    const sessionChannel = supabase
      .channel('user-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
          filter: `user_id=eq.${user.userId}`
        },
        (payload) => {
          console.log('Device tracking: Session change detected', payload);
          loadUserSessions();
        }
      )
      .subscribe();

    // Cleanup on unmount or session change
    return () => {
      console.log('Device tracking: Cleaning up presence and session channels');
      presenceChannel.unsubscribe();
      sessionChannel.unsubscribe();
      clearInterval(activityInterval);
      
      // Mark session as inactive
      if (currentSessionId) {
        supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', currentSessionId)
          .then(() => {
            console.log('Device tracking: Session marked as inactive', currentSessionId);
          });
      }
    };
  }, [currentSessionId]); // This effect depends on currentSessionId

  const getDeviceStatus = (device: DeviceSession) => {
    const isOnline = onlineDevices.has(device.id);
    const lastSeen = new Date(device.last_seen);
    const now = new Date();
    const timeDiff = now.getTime() - lastSeen.getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    
    if (isOnline) {
      return { status: 'online', text: 'Online', color: 'text-green-500' };
    } else if (minutesAgo < 5) {
      return { status: 'recently_active', text: 'Recently active', color: 'text-yellow-500' };
    } else {
      return { 
        status: 'offline', 
        text: `Last seen ${minutesAgo} min ago`, 
        color: 'text-gray-500' 
      };
    }
  };

  return {
    devices,
    onlineDevices,
    currentSessionId,
    isLoading,
    getDeviceStatus,
    refreshSessions: loadUserSessions
  };
}