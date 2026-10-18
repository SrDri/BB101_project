#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    CertificateAlreadyExists = 3,
    HashAlreadyRegistered = 4,
    CertificateNotFound = 5,
    InvalidProgressValue = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    TotalCortes,
    Cert(String, u32),       // (project_id, corte_number) -> CertificateRecord
    CertByHash(BytesN<32>),   // sha256_hash -> (String, u32)
    ProjectCortes(String),    // project_id -> Vec<u32>
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificateRecord {
    pub project_id: String,
    pub corte_number: u32,
    pub sha256_hash: BytesN<32>,
    pub interventor: Address,
    pub copnia_license: String,
    pub timestamp: u64,
    pub physical_progress_bps: u32, // Progreso en puntos base (ej: 4450 = 44.50%)
    pub disbursement_cop: i128,      // Desembolso autorizado en pesos colombianos
    pub metadata_uri: String,        // URI o resumen del payload canónico
}

#[contract]
pub struct CorteRegistryContract;

#[contractimpl]
impl CorteRegistryContract {
    /// Inicializa el contrato con una cuenta administradora
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().persistent().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::TotalCortes, &0u32);
        Ok(())
    }

    /// Registra y sella un certificado de avance de obra.
    /// Garantiza la regla de inmutabilidad: un corte ya sellado para un proyecto no puede sobrescribirse.
    pub fn register_certificate(
        env: Env,
        caller: Address,
        project_id: String,
        corte_number: u32,
        sha256_hash: BytesN<32>,
        copnia_license: String,
        physical_progress_bps: u32,
        disbursement_cop: i128,
        metadata_uri: String,
    ) -> Result<CertificateRecord, Error> {
        // Exige autenticación criptográfica del firmante (interventor o relayer patrocinador)
        caller.require_auth();

        if physical_progress_bps > 10000 {
            return Err(Error::InvalidProgressValue);
        }

        let cert_key = DataKey::Cert(project_id.clone(), corte_number);
        if env.storage().persistent().has(&cert_key) {
            return Err(Error::CertificateAlreadyExists);
        }

        let hash_key = DataKey::CertByHash(sha256_hash.clone());
        if env.storage().persistent().has(&hash_key) {
            return Err(Error::HashAlreadyRegistered);
        }

        let timestamp = env.ledger().timestamp();

        let record = CertificateRecord {
            project_id: project_id.clone(),
            corte_number,
            sha256_hash: sha256_hash.clone(),
            interventor: caller.clone(),
            copnia_license,
            timestamp,
            physical_progress_bps,
            disbursement_cop,
            metadata_uri,
        };

        // Almacenar certificado principal
        env.storage().persistent().set(&cert_key, &record);

        // Almacenar índice inverso por huella SHA-256 para verificación directa O(1)
        let lookup_tuple: (String, u32) = (project_id.clone(), corte_number);
        env.storage().persistent().set(&hash_key, &lookup_tuple);

        // Actualizar lista de cortes del proyecto
        let project_key = DataKey::ProjectCortes(project_id.clone());
        let mut cortes: Vec<u32> = env
            .storage()
            .persistent()
            .get(&project_key)
            .unwrap_or_else(|| Vec::new(&env));
        cortes.push_back(corte_number);
        env.storage().persistent().set(&project_key, &cortes);

        // Incrementar contador global
        let total: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalCortes)
            .unwrap_or(0);
        env.storage().persistent().set(&DataKey::TotalCortes, &(total + 1));

        // Publicar evento en el ledger de Stellar
        #[allow(deprecated)]
        env.events().publish(
            (symbol_short!("seal_cert"), corte_number),
            sha256_hash,
        );

        Ok(record)
    }

    /// Consulta un certificado sellado por identificador de proyecto y número de corte
    pub fn get_certificate(
        env: Env,
        project_id: String,
        corte_number: u32,
    ) -> Option<CertificateRecord> {
        let cert_key = DataKey::Cert(project_id, corte_number);
        env.storage().persistent().get(&cert_key)
    }

    /// Verifica y recupera un certificado a partir de su huella SHA-256
    pub fn verify_by_hash(env: Env, sha256_hash: BytesN<32>) -> Option<CertificateRecord> {
        let hash_key = DataKey::CertByHash(sha256_hash);
        let lookup: Option<(String, u32)> = env.storage().persistent().get(&hash_key);
        match lookup {
            Some((proj, num)) => Self::get_certificate(env, proj, num),
            None => None,
        }
    }

    /// Obtiene la lista de números de corte registrados para un proyecto
    pub fn get_project_cortes(env: Env, project_id: String) -> Vec<u32> {
        let project_key = DataKey::ProjectCortes(project_id);
        env.storage()
            .persistent()
            .get(&project_key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Devuelve el total global de certificados registrados en el contrato
    pub fn get_total_cortes(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalCortes)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

