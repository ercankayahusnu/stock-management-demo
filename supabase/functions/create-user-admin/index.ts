// supabase/functions/create-user-admin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '' 
    )

    const { email, password, personal_data } = await req.json()

    // 1. Auth tarafında kullanıcıyı oluştur (Güvenli Kasaya Koy)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError) throw authError

    // 2. Personal tablosuna kayıt (Senin SQL şemana göre tek tek eşleme)
    const { error: personalError } = await supabaseAdmin
      .from('personal')
      .insert([{
        personal_name: personal_data.personal_name,
        personal_surname: personal_data.personal_surname,
        personal_tel_no: personal_data.personal_tel_no,
        personal_mail: email,
        departman_id: personal_data.departman_id,
        is_active: personal_data.is_active,
        role: personal_data.role,
        auth_user_id: authUser.user.id // Bağı kurduk!
      }])

    if (personalError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id) // Hata olursa Auth'u temizle
      throw personalError
    }

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