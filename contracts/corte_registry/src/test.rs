#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, BytesN, Env, String};

#[test]
fn test_register_and_get_certificate() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CorteRegistryContract, ());
    let client = CorteRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let interventor = Address::generate(&env);

    client.init(&admin);

    let project_id = String::from_str(&env, "TORRE-ALAMEDA-1");
    let corte_number = 4u32;
    let sha256_bytes: [u8; 32] = [
        0xa7, 0xc9, 0x3e, 0x41, 0xb2, 0xe8, 0xd7, 0x54, 0x1f, 0x6e, 0x29, 0x83, 0xc4, 0x85, 0x20,
        0xd8, 0x8b, 0x48, 0x99, 0x20, 0xef, 0xbc, 0x75, 0x63, 0x12, 0xa0, 0xf8, 0xd9, 0xb1, 0xc7,
        0x84, 0x9e,
    ];
    let sha256_hash = BytesN::from_array(&env, &sha256_bytes);
    let copnia_license = String::from_str(&env, "25202-99881 COPNIA");
    let physical_progress_bps = 4450u32; // 44.50%
    let disbursement_cop = 185_000_000i128; // $185,000,000 COP
    let metadata_uri = String::from_str(&env, "ipfs://bafybeicertificate4alameda");

    env.ledger().set_timestamp(1728743400); // 2026-10-12 14:30:00 UTC

    let cert = client.register_certificate(
        &interventor,
        &project_id,
        &corte_number,
        &sha256_hash,
        &copnia_license,
        &physical_progress_bps,
        &disbursement_cop,
        &metadata_uri,
    );

    assert_eq!(cert.project_id, project_id);
    assert_eq!(cert.corte_number, 4);
    assert_eq!(cert.sha256_hash, sha256_hash);
    assert_eq!(cert.physical_progress_bps, 4450);
    assert_eq!(cert.disbursement_cop, 185_000_000i128);
    assert_eq!(cert.timestamp, 1728743400);

    // Consulta directa
    let retrieved = client.get_certificate(&project_id, &corte_number);
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap(), cert);

    // Verificación por huella SHA-256
    let verified = client.verify_by_hash(&sha256_hash);
    assert!(verified.is_some());
    assert_eq!(verified.unwrap().corte_number, 4);

    // Contador y lista de cortes
    assert_eq!(client.get_total_cortes(), 1);
    let cortes = client.get_project_cortes(&project_id);
    assert_eq!(cortes.len(), 1);
    assert_eq!(cortes.get(0).unwrap(), 4);
}

#[test]
fn test_immutability_prevents_duplicate_corte() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CorteRegistryContract, ());
    let client = CorteRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let interventor = Address::generate(&env);
    client.init(&admin);

    let project_id = String::from_str(&env, "TORRE-ALAMEDA-1");
    let corte_number = 4u32;
    let hash1 = BytesN::from_array(&env, &[1u8; 32]);
    let hash2 = BytesN::from_array(&env, &[2u8; 32]);
    let license = String::from_str(&env, "25202-99881 COPNIA");

    client.register_certificate(
        &interventor,
        &project_id,
        &corte_number,
        &hash1,
        &license,
        &4000,
        &100_000_000,
        &String::from_str(&env, "uri1"),
    );

    // Intentar sobrescribir el mismo corte con nuevos datos debe fallar
    let res = client.try_register_certificate(
        &interventor,
        &project_id,
        &corte_number,
        &hash2,
        &license,
        &5000,
        &120_000_000,
        &String::from_str(&env, "uri2"),
    );

    assert_eq!(res, Err(Ok(Error::CertificateAlreadyExists)));
}

#[test]
fn test_prevent_duplicate_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CorteRegistryContract, ());
    let client = CorteRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let interventor = Address::generate(&env);
    client.init(&admin);

    let hash_identical = BytesN::from_array(&env, &[42u8; 32]);
    let license = String::from_str(&env, "25202-99881 COPNIA");

    client.register_certificate(
        &interventor,
        &String::from_str(&env, "PROJECT-A"),
        &1,
        &hash_identical,
        &license,
        &1000,
        &50_000_000,
        &String::from_str(&env, "uriA"),
    );

    // Intentar registrar la misma huella en otro proyecto o corte debe fallar
    let res = client.try_register_certificate(
        &interventor,
        &String::from_str(&env, "PROJECT-B"),
        &1,
        &hash_identical,
        &license,
        &1000,
        &50_000_000,
        &String::from_str(&env, "uriB"),
    );

    assert_eq!(res, Err(Ok(Error::HashAlreadyRegistered)));
}

