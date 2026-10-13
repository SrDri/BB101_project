-- ==========================================================================
-- TRAMO — Esquema de Base de Datos en Supabase (PostgreSQL)
-- ==========================================================================

-- 1. Tabla de Perfiles y Roles (Fiduciaria, Constructor, Interventor, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'fiduciaria', 'constructor', 'interventor')),
  company_name TEXT NOT NULL,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Proyectos Inmobiliarios (Multi-Proyecto)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'upcoming', 'completed')),
  developer_name TEXT NOT NULL,
  fiduciary_entity TEXT NOT NULL,
  fiduciary_trust_code TEXT NOT NULL,
  interventor_name TEXT NOT NULL,
  interventor_id TEXT NOT NULL,
  total_budget_cop BIGINT NOT NULL,
  disbursed_cop BIGINT NOT NULL DEFAULT 0,
  current_cut_disbursement_cop BIGINT NOT NULL DEFAULT 0,
  current_cut_number INT NOT NULL DEFAULT 1,
  total_cuts_planned INT NOT NULL DEFAULT 12,
  scheduled_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  certified_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_floors INT NOT NULL DEFAULT 8,
  sha256_hash TEXT,
  stellar_tx_hash TEXT,
  stellar_ledger BIGINT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Certificados Emitidos y Sellados en Stellar Soroban
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  corte_number INT NOT NULL,
  certified_percent NUMERIC(5,2) NOT NULL,
  disbursement_cop BIGINT NOT NULL,
  sha256_hash TEXT NOT NULL,
  stellar_tx_hash TEXT NOT NULL,
  ledger_sequence BIGINT NOT NULL,
  interventor_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, corte_number)
);

-- Datos Iniciales de Perfiles
INSERT INTO public.profiles (email, full_name, role, company_name, license_number)
VALUES
  ('admin@tramo.co', 'Juan Jose Carabali (Admin)', 'admin', 'Tramo Protocol', 'TRAMO-ROOT-01'),
  ('fiduciaria@bancolombia.com.co', 'Dra. Carolina Mendoza', 'fiduciaria', 'Fiduciaria Bancolombia S.A.', 'SFC-FID-9921'),
  ('gerencia@constructoraurbana.co', 'Arq. Roberto Vélez', 'constructor', 'Constructora Urbana S.A.S.', 'NIT 900.412.881-2'),
  ('interventor@copnia.gov.co', 'Ing. Juan Jose Carabali', 'interventor', 'Interventoría Técnica Nacional', 'MP 25202-99881 COPNIA')
ON CONFLICT (email) DO NOTHING;

-- Datos Iniciales de Proyectos (Activos, Por Empezar y Terminados)
INSERT INTO public.projects (
  id, code, name, city, address, status, developer_name, fiduciary_entity,
  fiduciary_trust_code, interventor_name, interventor_id, total_budget_cop,
  disbursed_cop, current_cut_disbursement_cop, current_cut_number, total_cuts_planned,
  scheduled_progress, certified_progress, total_floors, sha256_hash, stellar_tx_hash, stellar_ledger
)
VALUES
  (
    'PROJ-ALAMEDA-01', 'TRM-BOG-001', 'Torre Alameda — Etapa 1', 'Bogotá, D.C.', 'Cra. 15 #93-40',
    'in_progress', 'Constructora Urbana S.A.S.', 'Fiduciaria Bancolombia S.A.', 'FIDEICOMISO #992-0129',
    'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)', 'GDN-2026-INSPECT-01',
    24500000000, 8300000000, 1850000000, 4, 12, 42.5, 43.1, 8,
    'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
    '3d8fa19e84b029384752c01928475a89201e9284756201938475a02938475b10', 5219482
  ),
  (
    'PROJ-MIRADOR-02', 'TRM-MED-002', 'Mirador del Parque — Reservado', 'Medellín, Ant.', 'Av. El Poblado #12-85',
    'in_progress', 'Constructora Urbana S.A.S.', 'Fiduciaria Bancolombia S.A.', 'FIDEICOMISO #841-3310',
    'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)', 'GDN-2026-INSPECT-01',
    38200000000, 22400000000, 3100000000, 7, 12, 66.0, 68.5, 10,
    'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e',
    '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b', 5218100
  ),
  (
    'PROJ-SIETEMARES-03', 'TRM-BAQ-003', 'Centro Empresarial Siete Mares', 'Barranquilla, Atl.', 'Calle 79B #55-20',
    'in_progress', 'Inversiones del Caribe S.A.', 'Fiduciaria Bancolombia S.A.', 'FIDEICOMISO #710-4402',
    'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)', 'GDN-2026-INSPECT-01',
    52000000000, 9100000000, 4200000000, 2, 14, 22.0, 21.0, 12,
    'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    '1f2e3d4c5b6a798897a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4', 5215091
  ),
  (
    'PROJ-CERROS-04', 'TRM-CLO-004', 'Reserva de los Cerros — VIS', 'Cali, Valle', 'Cra. 100 #16-40',
    'upcoming', 'Constructora Urbana S.A.S.', 'Alianza Fiduciaria S.A.', 'ENCARGO #102-8891',
    'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)', 'GDN-2026-INSPECT-01',
    16800000000, 0, 1200000000, 0, 10, 0.0, 0.0, 6,
    NULL, NULL, NULL
  ),
  (
    'PROJ-CASTELLANA-05', 'TRM-BOG-005', 'Edificio Castellana 98', 'Bogotá, D.C.', 'Calle 98 #45-12',
    'completed', 'Constructora Urbana S.A.S.', 'Fiduciaria Bancolombia S.A.', 'FIDEICOMISO #550-0019',
    'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)', 'GDN-2026-INSPECT-01',
    19400000000, 19400000000, 0, 10, 10, 100.0, 100.0, 8,
    'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    '7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f', 4980112
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Tabla de Propietarios / Compradores de Unidades Inmobiliarias (Consulta por Cédula)
CREATE TABLE IF NOT EXISTS public.property_owners (
  cedula TEXT PRIMARY KEY,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  fiduciary_encargo_code TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  tower TEXT NOT NULL,
  floor_level INTEGER NOT NULL,
  area_m2 NUMERIC(6, 2) NOT NULL,
  typology TEXT NOT NULL,
  parking_spot TEXT,
  estimated_delivery_date TEXT NOT NULL,
  unit_progress_percent NUMERIC(5, 2) DEFAULT 0,
  total_unit_value_cop NUMERIC(18, 0) NOT NULL,
  down_payment_goal_cop NUMERIC(18, 0) NOT NULL,
  down_payment_paid_cop NUMERIC(18, 0) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read property_owners" ON public.property_owners FOR SELECT USING (true);

INSERT INTO public.property_owners (
  cedula, owner_name, owner_email, owner_phone, project_id, fiduciary_encargo_code,
  unit_number, tower, floor_level, area_m2, typology, parking_spot,
  estimated_delivery_date, unit_progress_percent, total_unit_value_cop,
  down_payment_goal_cop, down_payment_paid_cop
)
VALUES
  (
    '1020784512', 'Andrés Felipe Restrepo Gómez', 'andres.restrepo@gmail.com', '+57 310 482 9910',
    'PROJ-ALAMEDA-01', 'ENC-992-0129-AP402', 'Apartamento 402', 'Torre A', 4, 118.50,
    '3 Alcobas + Estudio + Balcón Terraza', 'Sótano 1 — Celdas #14 y #15 + Depósito #08',
    'Marzo 2027', 78.5, 980000000, 294000000, 220500000
  ),
  (
    '79845120', 'María Fernanda Valderrama', 'mf.valderrama@outlook.com', '+57 315 891 3340',
    'PROJ-ALAMEDA-01', 'ENC-992-0129-AP201', 'Apartamento 201', 'Torre A', 2, 94.00,
    '2 Alcobas + Family Room', 'Sótano 1 — Celda #04 + Depósito #02',
    'Febrero 2027', 100.0, 760000000, 228000000, 209000000
  ),
  (
    '52418930', 'Carlos Eduardo Jaramillo Cano', 'cjaramillo@inversiones.co', '+57 300 612 7781',
    'PROJ-MIRADOR-02', 'ENC-841-3310-AP701', 'Penthouse 701', 'Torre Única', 7, 165.00,
    'Duplex 3 Alcobas + Terraza Panorámica', 'Nivel P1 — Celdas #21, #22 y Cuarto Útil #11',
    'Enero 2027', 82.0, 1420000000, 426000000, 390500000
  )
ON CONFLICT (cedula) DO NOTHING;


