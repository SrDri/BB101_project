import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  rpc,
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Address,
  Contract,
  nativeToScVal,
  xdr,
} from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const server = new rpc.Server(RPC_URL);

// Clave patrocinadora / relayer de Tramo (financiada en Testnet)
const RELAYER_SECRET =
  process.env.TRAMO_RELAYER_SECRET ||
  'SAVQIMPYL4KGOP34SWYJGM43VTNG7Z3AF7NUWZEV4VPWYNT2LA3JAQ7B';
const keypair = Keypair.fromSecret(RELAYER_SECRET);

console.log('====================================================');
console.log(' Tramo — Despliegue de CorteRegistry en Testnet');
console.log('====================================================');
console.log('Cuenta Relayer:', keypair.publicKey());

async function ensureFunded() {
  try {
    const acc = await server.getAccount(keypair.publicKey());
    console.log('Cuenta verificada en ledger. Sequence:', acc.sequence);
    return acc;
  } catch (err) {
    console.log('Solicitando fondos a Friendbot...');
    const res = await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
    if (!res.ok) throw new Error('Error al fondear con Friendbot: ' + res.statusText);
    console.log('Fondos recibidos exitosamente.');
    await new Promise((r) => setTimeout(r, 2000));
    return await server.getAccount(keypair.publicKey());
  }
}

async function sendAndPoll(tx, label) {
  console.log(`\n[${label}] Simulando y preparando transacción...`);
  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(keypair);

  console.log(`[${label}] Enviando a Stellar Testnet RPC...`);
  const sendRes = await server.sendTransaction(preparedTx);

  if (sendRes.status === 'ERROR') {
    throw new Error(`[${label}] Error al enviar transacción: ${JSON.stringify(sendRes.errorResult)}`);
  }

  console.log(`[${label}] Hash: ${sendRes.hash}`);
  console.log(`[${label}] Esperando inclusión en ledger (polling)...`);
  const pollRes = await server.pollTransaction(sendRes.hash);

  if (pollRes.status !== 'SUCCESS') {
    throw new Error(`[${label}] Transacción falló con estado: ${pollRes.status}`);
  }

  console.log(`[${label}] Confirmada en ledger: ${pollRes.ledger}`);
  return { hash: sendRes.hash, ledger: pollRes.ledger, result: pollRes };
}

async function main() {
  const account = await ensureFunded();

  // 1. Cargar archivo WASM
  const wasmPath = path.resolve(
    '../contracts/corte_registry/target/wasm32v1-none/release/corte_registry.wasm'
  );
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`Archivo WASM no encontrado en: ${wasmPath}`);
  }
  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`\nArchivo WASM cargado (${wasmBytes.length} bytes).`);

  const wasmHash = crypto.createHash('sha256').update(wasmBytes).digest();
  const wasmHashHex = wasmHash.toString('hex');
  console.log(`WASM SHA-256 Hash: ${wasmHashHex}`);

  // 2. Subir código WASM al ledger
  let currentAccount = await server.getAccount(keypair.publicKey());
  const uploadOp = Operation.uploadContractWasm({ wasm: wasmBytes });
  const uploadTx = new TransactionBuilder(currentAccount, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(uploadOp)
    .setTimeout(60)
    .build();

  const uploadReceipt = await sendAndPoll(uploadTx, 'UPLOAD_WASM');

  // 3. Crear instancia del contrato inteligente
  currentAccount = await server.getAccount(keypair.publicKey());
  const createOp = Operation.createCustomContract({
    address: new Address(keypair.publicKey()),
    wasmHash: wasmHash,
  });

  const createTxBase = new TransactionBuilder(currentAccount, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(createOp)
    .setTimeout(60)
    .build();

  const simCreate = await server.simulateTransaction(createTxBase);
  if (rpc.Api.isSimulationError(simCreate)) {
    throw new Error('Error simulando creación de contrato: ' + simCreate.error);
  }

  const contractAddressScVal = simCreate.result.retval;
  const contractId = Address.fromScVal(contractAddressScVal).toString();
  console.log(`\n>>> Nuevo Contract ID asignado: ${contractId} <<<`);

  const createReceipt = await sendAndPoll(createTxBase, 'CREATE_CONTRACT');

  // 4. Inicializar contrato con admin
  currentAccount = await server.getAccount(keypair.publicKey());
  const contractInstance = new Contract(contractId);
  const initOp = contractInstance.call(
    'init',
    Address.fromString(keypair.publicKey()).toScVal()
  );

  const initTx = new TransactionBuilder(currentAccount, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(initOp)
    .setTimeout(60)
    .build();

  const initReceipt = await sendAndPoll(initTx, 'INIT_CONTRACT');

  // 5. Registrar el primer certificado de prueba: Corte #4 de Torre Alameda
  currentAccount = await server.getAccount(keypair.publicKey());
  const projectId = 'TORRE-ALAMEDA-1';
  const corteNumber = 4;
  const sampleSha256 = 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e';
  const sampleHashBytes = Buffer.from(sampleSha256, 'hex');

  const registerOp = contractInstance.call(
    'register_certificate',
    Address.fromString(keypair.publicKey()).toScVal(),
    nativeToScVal(projectId, { type: 'string' }),
    nativeToScVal(corteNumber, { type: 'u32' }),
    nativeToScVal(sampleHashBytes, { type: 'bytes' }),
    nativeToScVal('25202-99881 COPNIA', { type: 'string' }),
    nativeToScVal(4450, { type: 'u32' }), // 44.50%
    nativeToScVal(BigInt(185000000), { type: 'i128' }), // 185M COP
    nativeToScVal('ipfs://bafybeicertificate4alameda', { type: 'string' })
  );

  const registerTx = new TransactionBuilder(currentAccount, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(registerOp)
    .setTimeout(60)
    .build();

  const certReceipt = await sendAndPoll(registerTx, 'REGISTER_CORTE_4');

  // 6. Guardar información del despliegue en JSON y .env
  const deployInfo = {
    network: 'testnet',
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    contractId,
    wasmHash: wasmHashHex,
    relayerPublicKey: keypair.publicKey(),
    relayerSecretKey: keypair.secret(),
    transactions: {
      uploadWasm: uploadReceipt.hash,
      createContract: createReceipt.hash,
      initContract: initReceipt.hash,
      registerCorte4: certReceipt.hash,
    },
    corte4Sample: {
      projectId,
      corteNumber,
      sha256: sampleSha256,
      ledger: certReceipt.ledger,
      txHash: certReceipt.hash,
    },
    deployedAt: new Date().toISOString(),
    links: {
      contractExplorer: `https://stellar.expert/explorer/testnet/contract/${contractId}`,
      createTxExplorer: `https://stellar.expert/explorer/testnet/tx/${createReceipt.hash}`,
      corte4TxExplorer: `https://stellar.expert/explorer/testnet/tx/${certReceipt.hash}`,
    },
  };

  const contractsDir = path.resolve('../contracts');
  fs.writeFileSync(
    path.join(contractsDir, 'deployed_contract.json'),
    JSON.stringify(deployInfo, null, 2)
  );
  fs.writeFileSync(
    path.resolve('.env'),
    `PUBLIC_STELLAR_NETWORK=testnet\nPUBLIC_STELLAR_RPC_URL=${RPC_URL}\nPUBLIC_STELLAR_CONTRACT_ID=${contractId}\nTRAMO_RELAYER_PUBLIC_KEY=${keypair.publicKey()}\nTRAMO_RELAYER_SECRET_KEY=${keypair.secret()}\n`
  );

  console.log('\n====================================================');
  console.log(' ¡CONTRATO INTELIGENTE DESPLEGADO EXITOSAMENTE!');
  console.log('====================================================');
  console.log(`Contract ID: ${contractId}`);
  console.log(`Explorador Contrato: https://stellar.expert/explorer/testnet/contract/${contractId}`);
  console.log(`Explorador Tx Despliegue: https://stellar.expert/explorer/testnet/tx/${createReceipt.hash}`);
  console.log(`Explorador Tx Corte #4: https://stellar.expert/explorer/testnet/tx/${certReceipt.hash}`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('\nERROR FATAL EN EL DESPLIEGUE:', err);
  process.exit(1);
});

