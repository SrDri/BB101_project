import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseClient } from '$lib/supabase';
import { AVAILABLE_PROFILES } from '$lib/stores/projectState.svelte';

export const GET: RequestHandler = async () => {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data && data.length > 0) {
      return json({ source: 'supabase', profiles: data });
    }
  }

  return json({ source: 'memory_fallback', profiles: AVAILABLE_PROFILES });
};

export const POST: RequestHandler = async ({ request }) => {
  const { email, role } = await request.json();

  const supabase = getSupabaseClient();
  if (supabase && email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!error && data) {
      return json({
        ok: true,
        profile: {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          companyName: data.company_name,
          licenseNumber: data.license_number,
          avatarInitials: data.full_name.slice(0, 2).toUpperCase()
        }
      });
    }
  }

  const cleanEmail = email?.trim().toLowerCase();
  let matched = cleanEmail
    ? AVAILABLE_PROFILES.find(p => p.email.toLowerCase() === cleanEmail)
    : role
      ? AVAILABLE_PROFILES.find(p => p.role === role)
      : undefined;

  // Fallback inteligente para tomas de demostración en video
  if (!matched && cleanEmail) {
    if (cleanEmail.includes('admin') || cleanEmail.includes('tramo') || cleanEmail.includes('juan')) {
      matched = AVAILABLE_PROFILES[0];
    } else if (cleanEmail.includes('fid') || cleanEmail.includes('banco') || cleanEmail.includes('carolina')) {
      matched = AVAILABLE_PROFILES[1];
    } else if (cleanEmail.includes('const') || cleanEmail.includes('obra') || cleanEmail.includes('roberto')) {
      matched = AVAILABLE_PROFILES[2];
    } else if (cleanEmail.includes('inter') || cleanEmail.includes('civil') || cleanEmail.includes('diego')) {
      matched = AVAILABLE_PROFILES[3];
    } else {
      matched = AVAILABLE_PROFILES[0]; // Admin por defecto para no bloquear la toma
    }
  }

  if (!matched) {
    matched = AVAILABLE_PROFILES[0];
  }

  return json({ ok: true, profile: matched });
};

