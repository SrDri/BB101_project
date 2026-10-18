import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyHashOnChain, CONTRACT_ID } from '$lib/server/soroban';

export const GET: RequestHandler = async ({ url }) => {
  const hash = url.searchParams.get('hash');

  if (!hash) {
    return json({ error: 'Parámetro hash requerido' }, { status: 400 });
  }

  try {
    const cert = await verifyHashOnChain(hash);

    if (!cert) {
      return json({
        found: false,
        isValid: false,
        message: 'La huella digital no se encuentra registrada en el contrato inteligente de Stellar.',
      });
    }

    return json({
      found: true,
      isValid: true,
      contractId: CONTRACT_ID,
      certificate: cert,
      explorerContractUrl: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
    });
  } catch (err: any) {
    console.error('Error en /api/soroban/verify:', err);
    return json({ error: err.message || 'Error al verificar en Soroban' }, { status: 500 });
  }
};

