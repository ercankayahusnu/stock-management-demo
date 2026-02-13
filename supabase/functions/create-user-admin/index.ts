// supabase/functions/create-user-admin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // BURAYI DÜZELTTİK: SUPABASE_ prefixini sildik çünkü secret'ı SERVICE_ROLE_KEY olarak set ettik
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '' 
    )

    const { email, password, personal_data } = await req.json()

    // 1. Auth tarafında kullanıcıyı oluştur
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError) throw authError

    // 2. Personal tablosuna kaydet
    const { error: personalError } = await supabaseAdmin
      .from('personal')
      .insert([{
        ...personal_data,
        personal_mail: email,
        auth_user_id: authUser.user.id
      }])

    if (personalError) throw personalError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})