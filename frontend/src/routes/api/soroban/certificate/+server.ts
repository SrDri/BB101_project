import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCertificateFromChain, CONTRACT_ID } from '$lib/server/soroban';

export const GET: RequestHandler = async ({ url }) => {
  const projectId = url.searchParams.get('projectId') || 'TORRE-ALAMEDA-1';
  const corte = url.searchParams.get('corte');

  if (!corte) {
    return json({ error: 'Parámetro corte requerido' }, { status: 400 });
  }

  try {
    const cert = await getCertificateFromChain(projectId, Number(corte));

    if (!cert) {
      return json({
        found: false,
        message: `No se encontró certificado para el proyecto ${projectId} corte #${corte}`,
      });
    }

    return json({
      found: true,
      contractId: CONTRACT_ID,
      certificate: cert,
      explorerContractUrl: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
    });
  } catch (err: any) {
    console.error('Error en /api/soroban/certificate:', err);
    return json({ error: err.message || 'Error al consultar certificado' }, { status: 500 });
  }
};

