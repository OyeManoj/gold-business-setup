import { supabase } from '@/integrations/supabase/client';

interface AuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
}

export function useAuditLog() {
  const createAuditLog = async (params: AuditLogParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('audit-log', {
        body: params
      });

      if (error) {
        console.error('Failed to create audit log:', error);
        return false;
      }

      console.log('Audit log created:', data);
      return true;
    } catch (error) {
      console.error('Error creating audit log:', error);
      return false;
    }
  };

  // Convenience methods for common audit actions
  const logTransaction = (action: 'create' | 'update' | 'delete', transactionData: any, oldData?: any) => {
    return createAuditLog({
      action: `transaction_${action}`,
      resourceType: 'transaction',
      resourceId: transactionData.id,
      newData: action !== 'delete' ? transactionData : undefined,
      oldData: action === 'update' || action === 'delete' ? oldData : undefined,
      metadata: {
        transactionType: transactionData.type,
        amount: transactionData.amount,
        weight: transactionData.weight
      }
    });
  };

  const logLogin = (success: boolean, metadata?: any) => {
    return createAuditLog({
      action: success ? 'login_success' : 'login_failed',
      resourceType: 'authentication',
      metadata: {
        success,
        ...metadata
      }
    });
  };

  const logLogout = () => {
    return createAuditLog({
      action: 'logout',
      resourceType: 'authentication'
    });
  };

  const logBusinessProfileUpdate = (profileData: any, oldData?: any) => {
    return createAuditLog({
      action: 'business_profile_update',
      resourceType: 'business_profile',
      resourceId: profileData.id,
      newData: profileData,
      oldData,
      metadata: {
        fields_changed: oldData ? Object.keys(profileData).filter(key => 
          JSON.stringify(profileData[key]) !== JSON.stringify(oldData[key])
        ) : undefined
      }
    });
  };

  const logDataExport = (exportType: string, filters?: any) => {
    return createAuditLog({
      action: 'data_export',
      resourceType: 'export',
      metadata: {
        exportType,
        filters,
        timestamp: new Date().toISOString()
      }
    });
  };

  const logDeviceRegistration = (deviceInfo: any) => {
    return createAuditLog({
      action: 'device_registration',
      resourceType: 'device',
      newData: deviceInfo,
      metadata: {
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType
      }
    });
  };

  return {
    createAuditLog,
    logTransaction,
    logLogin,
    logLogout,
    logBusinessProfileUpdate,
    logDataExport,
    logDeviceRegistration
  };
}