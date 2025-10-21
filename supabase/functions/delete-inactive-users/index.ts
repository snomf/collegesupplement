import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var imported from Supabase project settings
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var imported from Supabase project settings
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

    const { data: usersToDelete, error: selectError } = await supabaseClient
      .from('profiles')
      .select('id')
      .lt('last_active', oneYearAgo)

    if (selectError) {
      throw selectError
    }

    if (usersToDelete && usersToDelete.length > 0) {
      const userIds = usersToDelete.map((user) => user.id)

      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userIds)

      if (deleteError) {
        throw deleteError
      }

      return new Response(JSON.stringify({ message: `${userIds.length} inactive users deleted.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ message: 'No inactive users to delete.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
