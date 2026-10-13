import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseClient } from '$lib/supabase';
import { INITIAL_PROJECTS } from '$lib/stores/projectState.svelte';

export const GET: RequestHandler = async () => {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return json({
        source: 'supabase',
        projects: data
      });
    }
  }

  return json({
    source: 'memory_fallback',
    projects: INITIAL_PROJECTS
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { projectId, corteNumber, certifiedPercent, sha256Hash, stellarTxHash } = body;

  const supabase = getSupabaseClient();

  if (supabase && projectId) {
    await supabase
      .from('projects')
      .update({
        certified_progress: certifiedPercent,
        sha256_hash: sha256Hash,
        stellar_tx_hash: stellarTxHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    await supabase.from('certificates').upsert({
      id: `CERT-${projectId}-00${corteNumber}`,
      project_id: projectId,
      corte_number: corteNumber,
      certified_percent: certifiedPercent,
      disbursement_cop: 1850000000,
      sha256_hash: sha256Hash,
      stellar_tx_hash: stellarTxHash,
      ledger_sequence: 5220194,
      interventor_name: 'Ing. Juan Jose Carabali'
    });

    return json({ ok: true, syncedWithSupabase: true });
  }

  return json({ ok: true, syncedWithSupabase: false });
};

