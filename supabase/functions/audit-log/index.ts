import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditLogRequest {
  action: string;
  resourceType: string;
  resourceId?: string;
  customUserId?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role client since we have custom auth (not Supabase Auth)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      action,
      resourceType,
      resourceId,
      customUserId,
      oldData,
      newData,
      metadata = {}
    }: AuditLogRequest = await req.json();

    if (!action || !resourceType) {
      return new Response(
        JSON.stringify({ error: 'Action and resourceType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!customUserId) {
      return new Response(
        JSON.stringify({ error: 'customUserId is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userAgent = req.headers.get('user-agent');
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';

    const auditLogData = {
      custom_user_id: customUserId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      old_data: oldData || null,
      new_data: newData || null,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        endpoint: req.url,
        method: req.method
      },
      ip_address: ipAddress !== 'unknown' ? ipAddress : null,
      user_agent: userAgent,
      device_info: { user_agent: userAgent, ip: ipAddress }
    };

    const { data, error } = await supabaseClient
      .from('audit_logs')
      .insert(auditLogData)
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create audit log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, auditLogId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in audit-log function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
