import {
  rpc,
  Keypair,
  Networks,
  TransactionBuilder,
  Account,
  Address,
  Contract,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import deployedInfo from './deployed_contract.json' with { type: 'json' };

const RPC_URL = process.env.PUBLIC_STELLAR_RPC_URL || deployedInfo.rpcUrl || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
export const CONTRACT_ID = process.env.PUBLIC_STELLAR_CONTRACT_ID || deployedInfo.contractId;

const RELAYER_SECRET =
  process.env.TRAMO_RELAYER_SECRET_KEY ||
  deployedInfo.relayerSecretKey ||
  'SAVQIMPYL4KGOP34SWYJGM43VTNG7Z3AF7NUWZEV4VPWYNT2LA3JAQ7B';

const relayerKeypair = Keypair.fromSecret(RELAYER_SECRET);
const server = new rpc.Server(RPC_URL);

export interface SealParams {
  projectId: string;
  corteNumber: number;
  sha256Hex: string;
  copniaLicense: string;
  physicalProgressPercent: number; // Ej: 44.5 -> 4450 bps
  disbursementCOP: number;
  metadataUri?: string;
}

export interface ChainCertificate {
  projectId: string;
  corteNumber: number;
  sha256Hash: string;
  interventor: string;
  copniaLicense: string;
  timestamp: string;
  timestampUnix: number;
  physicalProgressPercent: number;
  disbursementCOP: number;
  metadataUri: string;
}

function parseCertificateRecord(raw: any): ChainCertificate {
  let hexHash = '';
  if (raw.sha256_hash instanceof Uint8Array || Buffer.isBuffer(raw.sha256_hash)) {
    hexHash = Buffer.from(raw.sha256_hash).toString('hex');
  } else if (typeof raw.sha256_hash === 'string') {
    hexHash = raw.sha256_hash;
  }

  const timestampUnix = Number(raw.timestamp || 0);
  const dateStr = timestampUnix > 0 ? new Date(timestampUnix * 1000).toISOString() : new Date().toISOString();

  return {
    projectId: String(raw.project_id),
    corteNumber: Number(raw.corte_number),
    sha256Hash: hexHash,
    interventor: String(raw.interventor),
    copniaLicense: String(raw.copnia_license),
    timestamp: dateStr,
    timestampUnix,
    physicalProgressPercent: Number(raw.physical_progress_bps || 0) / 100,
    disbursementCOP: Number(raw.disbursement_cop || 0),
    metadataUri: String(raw.metadata_uri || ''),
  };
}

/**
 * Consulta un certificado directamente desde el ledger de Stellar Soroban
 */
export async function getCertificateFromChain(
  projectId: string,
  corteNumber: number
): Promise<ChainCertificate | null> {
  try {
    const contract = new Contract(CONTRACT_ID);
    const dummyAccount = new Account(Keypair.random().publicKey(), '0');

    const tx = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'get_certificate',
          nativeToScVal(projectId, { type: 'string' }),
          nativeToScVal(corteNumber, { type: 'u32' })
        )
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result?.retval) {
      return null;
    }

    const native = scValToNative(sim.result.retval);
    if (!native) return null;

    return parseCertificateRecord(native);
  } catch (err) {
    console.error('Error al consultar get_certificate en Soroban:', err);
    return null;
  }
}

/**
 * Verifica bit a bit una huella digital SHA-256 contra el contrato en Soroban Testnet
 */
export async function verifyHashOnChain(sha256Hex: string): Promise<ChainCertificate | null> {
  try {
    const cleanHash = sha256Hex.trim().toLowerCase();
    if (cleanHash.length !== 64) return null;

    const hashBytes = Buffer.from(cleanHash, 'hex');
    const contract = new Contract(CONTRACT_ID);
    const dummyAccount = new Account(Keypair.random().publicKey(), '0');

    const tx = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call('verify_by_hash', nativeToScVal(hashBytes, { type: 'bytes' }))
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result?.retval) {
      return null;
    }

    const native = scValToNative(sim.result.retval);
    if (!native) return null;

    return parseCertificateRecord(native);
  } catch (err) {
    console.error('Error al verificar hash en Soroban:', err);
    return null;
  }
}

/**
 * Sella un certificado en Stellar Soroban a través de la cuenta relayer patrocinadora
 */
export async function sealCertificateOnChain(params: SealParams) {
  const {
    projectId,
    corteNumber,
    sha256Hex,
    copniaLicense,
    physicalProgressPercent,
    disbursementCOP,
    metadataUri = `ipfs://corte-${corteNumber}-${projectId.toLowerCase()}`,
  } = params;

  // 1. Verificar si ya existe en la blockchain
  const existing = await getCertificateFromChain(projectId, corteNumber);
  if (existing) {
    return {
      alreadyExisted: true,
      contractId: CONTRACT_ID,
      txHash: deployedInfo.transactions?.registerCorte4 || '0x_already_registered_onchain',
      ledger: deployedInfo.corte4Sample?.ledger || 5264904,
      certificate: existing,
      explorerUrl: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
    };
  }

  // 2. Preparar e invocar en el contrato
  const account = await server.getAccount(relayerKeypair.publicKey());
  const contract = new Contract(CONTRACT_ID);
  const hashBytes = Buffer.from(sha256Hex.trim(), 'hex');
  const bps = Math.round(physicalProgressPercent * 100);

  const registerOp = contract.call(
    'register_certificate',
    Address.fromString(relayerKeypair.publicKey()).toScVal(),
    nativeToScVal(projectId, { type: 'string' }),
    nativeToScVal(corteNumber, { type: 'u32' }),
    nativeToScVal(hashBytes, { type: 'bytes' }),
    nativeToScVal(copniaLicense, { type: 'string' }),
    nativeToScVal(bps, { type: 'u32' }),
    nativeToScVal(BigInt(Math.round(disbursementCOP)), { type: 'i128' }),
    nativeToScVal(metadataUri, { type: 'string' })
  );

  const tx = new TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(registerOp)
    .setTimeout(60)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(relayerKeypair);

  const sendRes = await server.sendTransaction(preparedTx);
  if (sendRes.status === 'ERROR') {
    throw new Error('Fallo al someter transacción: ' + JSON.stringify(sendRes.errorResult));
  }

  const pollRes = await server.pollTransaction(sendRes.hash);
  if (pollRes.status !== 'SUCCESS') {
    throw new Error(`Transacción en Soroban falló con estado: ${pollRes.status}`);
  }

  const updatedCert = await getCertificateFromChain(projectId, corteNumber);

  return {
    alreadyExisted: false,
    contractId: CONTRACT_ID,
    txHash: sendRes.hash,
    ledger: pollRes.ledger,
    certificate: updatedCert,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${sendRes.hash}`,
  };
}

export function getNetworkConfig() {
  return {
    network: 'testnet',
    rpcUrl: RPC_URL,
    contractId: CONTRACT_ID,
    relayerPublicKey: relayerKeypair.publicKey(),
    contractExplorer: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
  };
}
