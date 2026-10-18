import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNetworkConfig } from '$lib/server/soroban';
import deployedInfo from '$lib/server/deployed_contract.json' with { type: 'json' };

export const GET: RequestHandler = async () => {
  return json({
    ...getNetworkConfig(),
    transactions: deployedInfo.transactions,
    corte4Sample: deployedInfo.corte4Sample,
    links: deployedInfo.links,
  });
};
