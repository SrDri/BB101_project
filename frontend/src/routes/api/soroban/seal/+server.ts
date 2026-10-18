import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sealCertificateOnChain } from '$lib/server/soroban';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      projectId,
      corteNumber,
      sha256Hex,
      copniaLicense = '25202-99881 COPNIA',
      physicalProgressPercent = 44.5,
      disbursementCOP = 185000000,
      metadataUri,
    } = body;

    if (!projectId || corteNumber === undefined || !sha256Hex) {
      return json(
        { error: 'Parámetros obligatorios faltantes (projectId, corteNumber, sha256Hex)' },
        { status: 400 }
      );
    }

    const result = await sealCertificateOnChain({
      projectId,
      corteNumber: Number(corteNumber),
      sha256Hex: String(sha256Hex),
      copniaLicense: String(copniaLicense),
      physicalProgressPercent: Number(physicalProgressPercent),
      disbursementCOP: Number(disbursementCOP),
      metadataUri,
    });

    return json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error en /api/soroban/seal:', err);
    return json(
      {
        success: false,
        error: err.message || 'Error interno al sellar certificado en Soroban',
      },
      { status: 500 }
    );
  }
};

