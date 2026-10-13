import type {
  ProjectFichaDetails,
  MandatoryDocument,
  LegalComplianceItem,
  ProjectCalendarEvent,
  FiduciaryMilestone,
  TechnicalFinding,
  MaterialLabTest,
  AuditLogEntry,
  UnitSnagItem
} from '../types/twin';



export const PROJECT_FICHAS: Record<string, ProjectFichaDetails> = {
  'PROJ-ALAMEDA-01': {
    description:
      'Torre Alameda — Etapa 1 es un desarrollo residencial de alta especificación ubicado en el corazón de Chicó Reservado en Bogotá. Diseñado bajo estándares sismorresistentes NSR-10 y certificación de sostenibilidad EDGE, cuenta con 8 niveles residenciales, 2 sótanos de parqueaderos, diseño bioclimático con ventanería termoacústica y más de 680 m² de zonas sociales.',
    propertyType: 'Apartamentos residenciales',
    stratum: 'Estrato 6',
    totalTowers: 1,
    totalUnits: 64,
    soldUnits: 56,
    reservedUnits: 3,
    availableUnits: 5,
    equilibriumPointPercent: 70.0,
    currentSalesPercent: 87.5,
    startDate: 'Febrero 2026',
    estimatedDelivery: 'Marzo 2027',
    developerProfile: {
      name: 'Constructora Urbana S.A.S.',
      nit: '900.412.881-2',
      legalRepresentative: 'Arq. Roberto Vélez Uribe',
      experienceYears: 18,
      completedProjectsCount: 24,
      creditRating: 'AA+ (BRC Standard & Poor’s)',
      address: 'Calle 93B #13-45 Of. 502, Bogotá D.C.',
      email: 'gerencia@constructoraurbana.co'
    },
    supervisorProfile: {
      name: 'Ing. Juan Jose Carabali',
      companyName: 'Carabali Ingeniería & Supervisión Técnica S.A.S.',
      copniaLicense: '25202-99881 COPNIA',
      roleTitle: 'Supervisor Técnico Independiente (Ley 1796 de 2016)',
      experienceYears: 14,
      rcPolicyNumber: 'POL-RC-8829104-SURA',
      independenceVerified: true
    },
    amenities: [
      {
        id: 'am-1',
        name: 'Piscina climatizada tipo lap pool y solárium',
        category: 'recreacion',
        description: 'Carril de nado de 18 metros climatizado con paneles solares y terraza húmeda en cubierta.',
        progressPercent: 45,
        status: 'en_obra'
      },
      {
        id: 'am-2',
        name: 'Gimnasio dotado y zona de TRX / Yoga',
        category: 'bienestar',
        description: 'Salón de acondicionamiento físico de 110 m² con ventilación cruzada y piso caucho de alto impacto.',
        progressPercent: 72,
        status: 'en_obra'
      },
      {
        id: 'am-3',
        name: 'Salón de coworking y salas de juntas privadas',
        category: 'social',
        description: 'Espacio corporativo en Piso 1 con fibra óptica redundante, cabinas acústicas y estación de café.',
        progressPercent: 95,
        status: 'completado'
      },
      {
        id: 'am-4',
        name: 'Terraza BBQ, Teppanyaki & Sky Lounge',
        category: 'social',
        description: 'Terraza panorámica con pérgola bioclimática, chimenea a gas y dos estaciones de asados.',
        progressPercent: 25,
        status: 'proyectado'
      },
      {
        id: 'am-5',
        name: 'Lobby doble altura y portería blindada 24/7',
        category: 'infraestructura',
        description: 'Acceso peatonal con control biométrico, esclusa de seguridad y sala de espera de visitantes.',
        progressPercent: 100,
        status: 'completado'
      },
      {
        id: 'am-6',
        name: 'Planta eléctrica de suplencia total y 2 ascensores de alta velocidad',
        category: 'infraestructura',
        description: 'Respaldo energético del 100% para áreas comunes y privadas, con celdas para carga de vehículos eléctricos.',
        progressPercent: 85,
        status: 'en_obra'
      },
      {
        id: 'am-7',
        name: 'Zona infantil cubierta y parque exterior',
        category: 'recreacion',
        description: 'Salón interactivo para niños y terraza segura con juegos modulares certificados.',
        progressPercent: 68,
        status: 'en_obra'
      },
      {
        id: 'am-8',
        name: 'Zona Pet Friendly & Spa de mascotas',
        category: 'bienestar',
        description: 'Estación de lavado e hidratación para mascotas en semisótano con salida directa al parque.',
        progressPercent: 90,
        status: 'completado'
      }
    ],
    typologies: [
      {
        id: 'typ-a',
        code: 'Tipo A • Esquinero',
        name: 'Apartamento Familiar + Estudio + Balcón Terraza',
        areaBuiltM2: 118.5,
        areaPrivateM2: 109.2,
        bedrooms: 3,
        bathrooms: 4,
        parkingSpots: 2,
        totalUnits: 24,
        soldUnits: 22,
        priceFromCOP: 980000000,
        floorRange: 'Pisos 2 al 7',
        features: ['3 alcobas con baño', 'Estudio independiente', 'Balcón terraza de 11 m²', 'Cocina abierta con isla']
      },
      {
        id: 'typ-b',
        code: 'Tipo B • Exterior',
        name: 'Apartamento 2 Alcobas + Family Room',
        areaBuiltM2: 94.0,
        areaPrivateM2: 86.4,
        bedrooms: 2,
        bathrooms: 3,
        parkingSpots: 2,
        totalUnits: 24,
        soldUnits: 21,
        priceFromCOP: 760000000,
        floorRange: 'Pisos 2 al 7',
        features: ['2 alcobas amplias', 'Family room o estudio', 'Balcón corrido', 'Zona de ropas independiente']
      },
      {
        id: 'typ-c',
        code: 'Tipo C • Ejecutivo',
        name: 'Suite 1 Alcoba + Estudio + Terraza',
        areaBuiltM2: 68.0,
        areaPrivateM2: 61.5,
        bedrooms: 1,
        bathrooms: 2,
        parkingSpots: 1,
        totalUnits: 12,
        soldUnits: 10,
        priceFromCOP: 545000000,
        floorRange: 'Pisos 2 al 6',
        features: ['Alcoba principal con walk-in closet', 'Baño social completo', 'Ventanería piso-techo', 'Ideal inversión']
      },
      {
        id: 'typ-ph',
        code: 'Tipo PH • Penthouse',
        name: 'Penthouse Duplex Panorámico',
        areaBuiltM2: 165.0,
        areaPrivateM2: 148.0,
        bedrooms: 3,
        bathrooms: 5,
        parkingSpots: 3,
        totalUnits: 4,
        soldUnits: 3,
        priceFromCOP: 1420000000,
        floorRange: 'Piso 8 (Nivel superior)',
        features: ['Doble altura en salón', 'Terraza privada de 32 m²', 'Ascensor con llegada directa', '3 parqueaderos + depósito']
      }
    ]
  }
};

export const INITIAL_MANDATORY_DOCS: MandatoryDocument[] = [
  {
    id: 'DOC-LIC-001',
    category: 'licencias',
    title: 'Licencia de Construcción Modalidad Obra Nueva',
    issuer: 'Curaduría Urbana No. 2 de Bogotá D.C.',
    documentNumber: 'Resolución 11001-2-25-0412',
    issueDate: '2025-11-14',
    expiryDate: '2027-11-14',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    summary: 'Aprueba planos arquitectónicos y estructurales para 8 pisos, 2 sótanos y 64 unidades residenciales bajo norma NSR-10.'
  },
  {
    id: 'DOC-LIC-002',
    category: 'licencias',
    title: 'Radicado de Permiso de Enajenación y Ventas Inmobiliarias',
    issuer: 'Secretaría Distrital del Hábitat — Subdirección de Prevención y Seguimiento',
    documentNumber: 'Radicado SDHT-2026-008912',
    issueDate: '2026-01-20',
    expiryDate: '2027-12-31',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    summary: 'Autoriza la comercialización y suscripción de encargos fiduciarios de vinculación conforme al Decreto 510 de 2026.'
  },
  {
    id: 'DOC-FID-003',
    category: 'fiduciarios',
    title: 'Certificación de Cumplimiento de Punto de Equilibrio Comercial y Técnico',
    issuer: 'Fiduciaria Bancolombia S.A. — Comité de Negocios Fiduciarios',
    documentNumber: 'ACTA-FID-992-2026-PE',
    issueDate: '2026-02-05',
    expiryDate: '2027-06-30',
    status: 'vigente',
    responsibleEntity: 'Fiduciaria',
    sha256Hash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    summary: 'Acredita ventas vinculadas superiores al 70% del proyecto, cierre financiero aprobado con crédito constructor y viabilidad jurídica del predio.'
  },
  {
    id: 'DOC-POL-004',
    category: 'polizas',
    title: 'Póliza Todo Riesgo Construcción y Montaje (TRC)',
    issuer: 'Seguros Generales Suramericana S.A. (SURA)',
    documentNumber: 'POL-TRC-4410928-2026',
    issueDate: '2026-02-01',
    expiryDate: '2027-05-01',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    summary: 'Cobertura integral por $24.500.000.000 COP sobre daños materiales de obra, terremoto, asonada y responsabilidad civil extracontractual.'
  },
  {
    id: 'DOC-POL-005',
    category: 'polizas',
    title: 'Póliza de Garantía Decenal y Estabilidad de Obra (Ley de Vivienda Segura)',
    issuer: 'Compañía Mundial de Seguros S.A.',
    documentNumber: 'GAR-DEC-1796-2026-88',
    issueDate: '2026-02-10',
    expiryDate: '2037-02-10',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    summary: 'Ampara por 10 años el patrimonio de los compradores frente a eventuales fallas estructurales o de suelos conforme a la Ley 1796 de 2016.'
  },
  {
    id: 'DOC-TEC-006',
    category: 'tecnicos',
    title: 'Estudio Geotécnico Definitivo y Diseño de Cimentación NSR-10',
    issuer: 'Alfonso Uribe Geotecnia & Suelos S.A.S.',
    documentNumber: 'EST-GEO-2025-ALAMEDA-V3',
    issueDate: '2025-10-12',
    expiryDate: '2028-10-12',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    summary: 'Concepto favorable de capacidad portante sobre pilotes preexcavados a 28 metros de profundidad y pantallas perimetrales.'
  },
  {
    id: 'DOC-TEC-007',
    category: 'tecnicos',
    title: 'Certificado de Independencia y Habilitación COPNIA de Interventoría',
    issuer: 'Consejo Profesional Nacional de Ingeniería (COPNIA)',
    documentNumber: 'CERT-VIG-25202-99881-2026',
    issueDate: '2026-10-01',
    expiryDate: '2027-04-01',
    status: 'vigente',
    responsibleEntity: 'Interventoría',
    sha256Hash: '2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    summary: 'Certifica vigencia de matrícula profesional sin antecedentes disciplinarios e inexistencia de vínculo societario con el constructor.'
  },
  {
    id: 'DOC-FID-008',
    category: 'fiduciarios',
    title: 'Paz y Salvo Aportes Seguridad Social y Parafiscales de Obra (PILA)',
    issuer: 'Revisoría Fiscal Constructora Urbana S.A.S. / Operador Simple',
    documentNumber: 'PILA-OCT-2026-994120',
    issueDate: '2026-10-05',
    expiryDate: '2026-11-05',
    status: 'vigente',
    responsibleEntity: 'Constructora',
    sha256Hash: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    summary: 'Soporte obligatorio mensual de pago de ARL Riesgo V, EPS, Pensión y FIC (SENA) de los 94 trabajadores activos en obra.'
  }
];

export const INITIAL_LEGAL_COMPLIANCE: LegalComplianceItem[] = [
  {
    id: 'CMP-CON-01',
    entityType: 'constructora',
    requirement: 'Existencia, representación legal y facultades estatutarias vigentes',
    regulationRef: 'Código de Comercio / Circular Básica Jurídica SFC',
    status: 'cumple',
    verificationDate: '2026-10-02',
    verifiedBy: 'Dirección Jurídica Fiduciaria Bancolombia',
    notes: 'Certificado de Cámara de Comercio de Bogotá expedido con menos de 30 días.'
  },
  {
    id: 'CMP-CON-02',
    entityType: 'constructora',
    requirement: 'Debida diligencia SARLAFT / SAGRILAFT de socios y beneficiarios finales',
    regulationRef: 'Capítulo IV Título IV Parte I CBC — Superintendencia Financiera',
    status: 'cumple',
    verificationDate: '2026-09-28',
    verifiedBy: 'Oficial de Cumplimiento Fiduciaria',
    notes: 'Sin coincidencias en listas restrictivas internacionales (OFAC, ONU) ni PEPs observados.'
  },
  {
    id: 'CMP-CON-03',
    entityType: 'constructora',
    requirement: 'Póliza Todo Riesgo Constructor y Garantía Decenal Ley 1796 activas',
    regulationRef: 'Ley 1796 de 2016 (Ley de Vivienda Segura) — Art. 8',
    status: 'cumple',
    verificationDate: '2026-10-01',
    verifiedBy: 'Comité de Riesgos Fiduciarios',
    notes: 'Primas pagadas al 100% con endoso beneficiario a favor del Patrimonio Autónomo.'
  },
  {
    id: 'CMP-CON-04',
    entityType: 'constructora',
    requirement: 'Paz y salvo de seguridad social (ARL Riesgo V), parafiscales y FIC de obra',
    regulationRef: 'Decreto 1072 de 2015 / Requisito contractual de giro',
    status: 'cumple',
    verificationDate: '2026-10-06',
    verifiedBy: 'Revisoría Fiscal & Interventoría Administrativa',
    notes: 'Planilla PILA #994120 validada para el periodo octubre 2026.'
  },
  {
    id: 'CMP-INT-01',
    entityType: 'interventor',
    requirement: 'Vigencia de matrícula profesional COPNIA y ausencia de sanciones',
    regulationRef: 'Ley 842 de 2003 / Título I NSR-10',
    status: 'cumple',
    verificationDate: '2026-10-01',
    verifiedBy: 'Validación automática API COPNIA',
    notes: 'Matrícula 25202-99881 vigente sin antecedentes éticos ni disciplinarios.'
  },
  {
    id: 'CMP-INT-02',
    entityType: 'interventor',
    requirement: 'Independencia jurídica, económica y societaria frente al constructor',
    regulationRef: 'Ley 1796 de 2016 — Art. 5 (Inhabilidades de Supervisión Técnica)',
    status: 'cumple',
    verificationDate: '2026-02-01',
    verifiedBy: 'Auditoría Legal Fiduciaria Bancolombia',
    notes: 'Declaración juramentada y cruce societario sin vínculos con Constructora Urbana S.A.S.'
  },
  {
    id: 'CMP-INT-03',
    entityType: 'interventor',
    requirement: 'Acreditación de experiencia mayor a 5 años en supervisión estructural NSR-10',
    regulationRef: 'Reglamento Colombiano de Construcción Sismo Resistente NSR-10',
    status: 'cumple',
    verificationDate: '2026-02-01',
    verifiedBy: 'Comité Técnico del Fideicomiso',
    notes: '14 años de experiencia certificada en edificaciones de concreto reforzado y postensado.'
  },
  {
    id: 'CMP-INT-04',
    entityType: 'interventor',
    requirement: 'Llave criptográfica pública registrada en el contrato Soroban del fideicomiso',
    regulationRef: 'Decreto 510 de 2026 — Trazabilidad Digital de Cortes de Obra',
    status: 'cumple',
    verificationDate: '2026-10-12',
    verifiedBy: 'Tramo Protocol Registry (Stellar Testnet)',
    notes: 'Firma Ed25519 habilitada en el contrato inteligente para sellado de actas de corte.'
  }
];

export const INITIAL_CALENDAR_EVENTS: ProjectCalendarEvent[] = [
  {
    id: 'EVT-01',
    date: '2026-10-05',
    dayNumber: 5,
    monthShort: 'OCT',
    title: 'Validación de planilla PILA y seguridad social de obra',
    category: 'legal',
    status: 'completado',
    responsible: 'Constructora Urbana S.A.S.',
    description: 'Carga del certificado de aportes parafiscales y ARL de los 94 operarios del proyecto.'
  },
  {
    id: 'EVT-02',
    date: '2026-10-09',
    dayNumber: 9,
    monthShort: 'OCT',
    title: 'Inspección técnica de campo y captura fotográfica — Corte #4',
    category: 'inspeccion',
    status: 'completado',
    responsible: 'Ing. Juan Jose Carabali (Interventor COPNIA)',
    description: 'Recorrido técnico en Pisos 4, 5 y 6 con verificación de ensayos de cilindros de concreto y mampostería.'
  },
  {
    id: 'EVT-03',
    date: '2026-10-12',
    dayNumber: 12,
    monthShort: 'OCT',
    title: 'Calibración asistida por IA y sellado en Stellar — Corte #4',
    category: 'corte_obra',
    status: 'en_curso',
    responsible: 'Interventoría Técnica & Constructora',
    description: 'Emisión de certificado SHA-256 por el 52.4% de avance físico acumulado del proyecto.',
    amountCOP: 2100000000
  },
  {
    id: 'EVT-04',
    date: '2026-10-15',
    dayNumber: 15,
    monthShort: 'OCT',
    title: 'Comité fiduciario de aprobación y desembolso — Hito #3 (Corte #4)',
    category: 'desembolso',
    status: 'programado',
    responsible: 'Fiduciaria Bancolombia S.A.',
    description: 'Revisión de matriz de hitos y orden de giro electrónico ACH a favor de la constructora.',
    amountCOP: 1995000000
  },
  {
    id: 'EVT-05',
    date: '2026-10-22',
    dayNumber: 22,
    monthShort: 'OCT',
    title: 'Vaciado de placa postensada Nivel 7 y ensayos de laboratorio',
    category: 'inspeccion',
    status: 'programado',
    responsible: 'Constructora & Supervisión Técnica NSR-10',
    description: 'Toma de muestras de concreto de 4000 PSI y revisión de tensionamiento de cables.'
  },
  {
    id: 'EVT-06',
    date: '2026-10-28',
    dayNumber: 28,
    monthShort: 'OCT',
    title: 'Radicación de pre-acta para Corte de Obra #5 (Estructura Nivel 7 y 8)',
    category: 'corte_obra',
    status: 'programado',
    responsible: 'Constructora Urbana S.A.S.',
    description: 'Cierre de mediciones del mes de octubre para alcanzar el 65% de avance físico.',
    amountCOP: 2450000000
  },
  {
    id: 'EVT-07',
    date: '2026-11-05',
    dayNumber: 5,
    monthShort: 'NOV',
    title: 'Renovación de anexo de Póliza de Responsabilidad Civil',
    category: 'legal',
    status: 'programado',
    responsible: 'Constructora & Corredor de Seguros',
    description: 'Actualización de valor asegurado por ingreso de equipos de ascensores a obra.'
  },
  {
    id: 'EVT-08',
    date: '2026-11-18',
    dayNumber: 18,
    monthShort: 'NOV',
    title: 'Inicio de pre-entregas e inspección con propietarios de Pisos 2 y 3',
    category: 'entrega',
    status: 'programado',
    responsible: 'Dirección de Entregas & Fiduciaria',
    description: 'Visitas guiadas con compradores de apartamentos con obra blanca al 100%.'
  }
];

export const INITIAL_MILESTONES: FiduciaryMilestone[] = [
  {
    id: 'MIL-01',
    milestoneNumber: 1,
    cutNumber: 1,
    title: 'Hito 1 — Preliminares, excavación, pilotes y cimentación profunda',
    description: 'Ejecución del 100% de pilotes preexcavados, pantallas perimetrales y losa de subpresión Sótano 2.',
    targetPhysicalPercent: 15.0,
    certifiedPhysicalPercent: 15.0,
    grossAmountCOP: 2400000000,
    retentionFivePercentCOP: 120000000,
    netDisbursementCOP: 2280000000,
    status: 'desembolsado',
    dueDate: '2026-06-30',
    disbursedDate: '2026-07-03 14:22 COT',
    achReference: 'ACH-BANCO-882910-01',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    stellarTxHash: '4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    sha256Hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    constructorSubmitted: true,
    interventorSigned: true,
    legalDocsVerified: true
  },
  {
    id: 'MIL-02',
    milestoneNumber: 2,
    cutNumber: 2,
    title: 'Hito 2 — Estructura de sótanos, lobby y placas de Piso 1 y Piso 2',
    description: 'Levantamiento de columnas, muros de contención, rampa vehicular y losas aéreas hasta Nivel 2.',
    targetPhysicalPercent: 28.0,
    certifiedPhysicalPercent: 28.5,
    grossAmountCOP: 1900000000,
    retentionFivePercentCOP: 95000000,
    netDisbursementCOP: 1805000000,
    status: 'desembolsado',
    dueDate: '2026-08-15',
    disbursedDate: '2026-08-18 11:05 COT',
    achReference: 'ACH-BANCO-910442-02',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    stellarTxHash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    sha256Hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    constructorSubmitted: true,
    interventorSigned: true,
    legalDocsVerified: true
  },
  {
    id: 'MIL-03',
    milestoneNumber: 3,
    cutNumber: 3,
    title: 'Hito 3 — Estructura Piso 3 y acabados iniciales de niveles inferiores',
    description: 'Certificación de losa Nivel 3, mampostería estructural y redes hidrosanitarias en niveles 1 y 2.',
    targetPhysicalPercent: 38.0,
    certifiedPhysicalPercent: 39.2,
    grossAmountCOP: 1900000000,
    retentionFivePercentCOP: 95000000,
    netDisbursementCOP: 1805000000,
    status: 'desembolsado',
    dueDate: '2026-09-28',
    disbursedDate: '2026-09-30 17:40 COT',
    achReference: 'ACH-BANCO-954812-03',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    stellarTxHash: 'c4e97a82fb10d3f6a2410a8234bb5812e9124a9e223fa871cd8126e831bb2198',
    sha256Hash: 'e89a42f11c7b8d0e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    constructorSubmitted: true,
    interventorSigned: true,
    legalDocsVerified: true
  },
  {
    id: 'MIL-04',
    milestoneNumber: 4,
    cutNumber: 4,
    title: 'Hito 4 (Corte #4 Actual) — Estructura Piso 4 y 5 + Mampostería Piso 4',
    description: 'Hito activo para revisión fiduciaria: losa de Piso 4 terminada, mampostería al 87.5% y avance en estructura de Piso 5 y 6.',
    targetPhysicalPercent: 50.0,
    certifiedPhysicalPercent: 52.4,
    grossAmountCOP: 2100000000,
    retentionFivePercentCOP: 105000000,
    netDisbursementCOP: 1995000000,
    status: 'listo_para_giro',
    dueDate: '2026-10-15',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    stellarTxHash: 'c4e97a82fb10d3f6a2410a8234bb5812e9124a9e223fa871cd8126e831bb2198',
    sha256Hash: 'e89a42f11c7b8d0e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    constructorSubmitted: true,
    interventorSigned: true,
    legalDocsVerified: true
  },
  {
    id: 'MIL-05',
    milestoneNumber: 5,
    cutNumber: 5,
    title: 'Hito 5 — Cierre de estructura hasta cubierta (Pisos 6, 7 y 8)',
    description: 'Terminación de estructura aporticada hasta el nivel de cubierta, foso de ascensores y terraza superior.',
    targetPhysicalPercent: 68.0,
    certifiedPhysicalPercent: 52.4,
    grossAmountCOP: 2450000000,
    retentionFivePercentCOP: 122500000,
    netDisbursementCOP: 2327500000,
    status: 'en_ejecucion',
    dueDate: '2026-11-15',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    constructorSubmitted: false,
    interventorSigned: false,
    legalDocsVerified: true
  },
  {
    id: 'MIL-06',
    milestoneNumber: 6,
    cutNumber: 6,
    title: 'Hito 6 — Fachada flotante, equipos de ascensores y acabados Pisos 5 a 8',
    description: 'Instalación de ventanería acústica en todos los niveles, pruebas de ascensores y zonas comunes.',
    targetPhysicalPercent: 85.0,
    certifiedPhysicalPercent: 52.4,
    grossAmountCOP: 2800000000,
    retentionFivePercentCOP: 140000000,
    netDisbursementCOP: 2660000000,
    status: 'programado',
    dueDate: '2026-12-20',
    beneficiaryAccount: 'Bancolombia Cta. Corriente #031-889201-44 (Constructora Urbana S.A.S.)',
    constructorSubmitted: false,
    interventorSigned: false,
    legalDocsVerified: true
  }
];

export const INITIAL_TECHNICAL_FINDINGS: TechnicalFinding[] = [
  {
    id: 'NCR-01',
    code: 'NCR-2026-014',
    floorLevel: 4,
    locationAxis: 'Eje C-4 • Columna perimetral sur',
    severity: 'moderada',
    title: 'Segregación superficial menor en desencofre de columna C-4',
    description:
      'Durante la inspección post-vaciado en Nivel 4 se identificó hormigueo superficial (recubrimiento sin afectación de núcleo estructural).',
    correctiveAction:
      'Escarificado, limpieza y reparación con mortero epóxico estructural SikaRep-500 verificada con esclerometría.',
    reportedDate: '2026-10-06',
    resolvedDate: '2026-10-09',
    status: 'subsanado',
    blocksDisbursement: false
  },
  {
    id: 'NCR-02',
    code: 'NCR-2026-018',
    floorLevel: 4,
    locationAxis: 'Buitrón principal • Red contra incendios (RCI)',
    severity: 'moderada',
    title: 'Prueba hidrostática a 200 PSI en montante RCI Nivel 4',
    description:
      'Requisito previo al cierre de mampostería en punto fijo: sostener presión de 200 PSI durante 2 horas sin caída en manómetro.',
    correctiveAction:
      'Ajuste de acople ranurado en derivación de piso 4 y repetición exitosa de protocolo hidrostático con interventoría.',
    reportedDate: '2026-10-08',
    resolvedDate: '2026-10-11',
    status: 'subsanado',
    blocksDisbursement: false
  },
  {
    id: 'NCR-03',
    code: 'NCR-2026-021',
    floorLevel: 5,
    locationAxis: 'Borde de losa oriental • Ejes 1 a 4',
    severity: 'menor',
    title: 'Refuerzo de rodapié y malla anticaída perimetral SST en Piso 5',
    description:
      'Previo al armado de formaleta de columnas en nivel 5 se exige doble línea de vida y rodapié continuo según norma SST.',
    correctiveAction:
      'Instalación de soportes metálicos certificados cada 2.40 m y verificación por residente HSE.',
    reportedDate: '2026-10-11',
    status: 'abierto',
    blocksDisbursement: false
  }
];

export const INITIAL_MATERIAL_LAB_TESTS: MaterialLabTest[] = [
  {
    id: 'LAB-01',
    testType: 'concreto_28d',
    title: 'Compresión de cilindros de concreto 28 días — Losa y vigas Piso 3',
    laboratory: 'Laboratorio Geotécnico & Materiales Ingecontrol S.A.S. (ONAC)',
    floorLevel: 3,
    sampleDate: '2026-09-10',
    targetSpec: "f'c ≥ 28.0 MPa (4,000 PSI)",
    obtainedResult: '30.8 MPa (110.0%)',
    compliancePercent: 110,
    status: 'aprobado',
    certificateCode: 'ONAC-CIL-2026-8841'
  },
  {
    id: 'LAB-02',
    testType: 'concreto_28d',
    title: 'Compresión de cilindros de concreto 14 días — Losa y columnas Piso 4',
    laboratory: 'Laboratorio Geotécnico & Materiales Ingecontrol S.A.S. (ONAC)',
    floorLevel: 4,
    sampleDate: '2026-09-28',
    targetSpec: "f'c ≥ 23.8 MPa (85% a 14d)",
    obtainedResult: '26.4 MPa (94.3%)',
    compliancePercent: 100,
    status: 'aprobado',
    certificateCode: 'ONAC-CIL-2026-9104'
  },
  {
    id: 'LAB-03',
    testType: 'acero_traccion',
    title: 'Ensayo de tracción y doblado acero corrugado NTC 2289 (60,000 PSI)',
    laboratory: 'Acerías Paz del Río / Certificación de Lote #PDR-99402',
    floorLevel: 4,
    sampleDate: '2026-10-02',
    targetSpec: 'fy ≥ 420 MPa (Grado 60)',
    obtainedResult: '448 MPa (Cumple)',
    compliancePercent: 106,
    status: 'aprobado',
    certificateCode: 'NTC2289-PDR-99402'
  },
  {
    id: 'LAB-04',
    testType: 'hidrostatica',
    title: 'Protocolo de estanqueidad hidrosanitaria y RCI — Niveles 1 a 4',
    laboratory: 'Interventoría Técnica ConTech Colombia S.A.S.',
    floorLevel: 4,
    sampleDate: '2026-10-11',
    targetSpec: '200 PSI durante 120 min (0% fugas)',
    obtainedResult: '200 PSI estables (0% fugas)',
    compliancePercent: 100,
    status: 'aprobado',
    certificateCode: 'RCI-HID-2026-004'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-008',
    timestamp: '2026-10-12 16:42:18',
    category: 'interventoria',
    severity: 'alta',
    actionTitle: 'Emisión y sellado de Certificado Técnico de Obra — Corte #4',
    summary:
      'Calibración pericial de avance físico al 52.4% (Pisos 1 al 4), validación de cilindros ONAC y anclaje de huella SHA-256 en contrato Soroban corte_registry.',
    actorName: 'Ing. Roberto Andrade',
    actorRole: 'interventor',
    actorCompany: 'ConTech Interventoría S.A.S.',
    actorDocument: 'COPNIA 25202-094812 CND',
    moduleRoute: '/interventor',
    previousState: 'Corte #4: En calibración de campo (51.0%)',
    newState: 'Corte #4: Certificado y Sellado en Stellar (52.4%)',
    amountCOP: 1620000000,
    sha256Hash: 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
    stellarTxHash: '0x94fa82e10bc37192d04e771a83c5910b44e821c07a9381f2c65018b39a7421ef',
    ledgerSequence: 54982104,
    geofenceOrIp: 'GPS 4.6682° N, 74.0535° W (Obra Chicó) • IP 181.54.112.89',
    signatureMethod: 'Firma Criptográfica Ed25519 + Licencia COPNIA'
  },
  {
    id: 'AUD-2026-007',
    timestamp: '2026-10-12 14:15:09',
    category: 'desembolso',
    severity: 'alta',
    actionTitle: 'Radicación de cobro y planilla PILA — Hito #4 (Estructura Piso 4)',
    summary:
      'La constructora radicó Factura Electrónica DIAN FE-9842 y Planilla PILA #88492014 (142 trabajadores activos) para someter el Hito #4 a Comité Fiduciario.',
    actorName: 'Arq. Camilo Restrepo',
    actorRole: 'constructor',
    actorCompany: 'Constructora Bolívar S.A.',
    actorDocument: 'NIT 860.034.313-7',
    moduleRoute: '/fiduciaria',
    previousState: 'Hito #4: en_ejecucion (Sin factura radicada)',
    newState: 'Hito #4: listo_para_giro (Radicado en Comité Fiduciario)',
    amountCOP: 1620000000,
    sha256Hash: 'e8b12d44c903f172a6b89301c47561e29d04a82716f3590c82a147b39e5102cd',
    stellarTxHash: '0x31b984a20cf47812e90a114c72d8391f55a209b41c7382e09f4102a84c6190ab',
    ledgerSequence: 54981420,
    geofenceOrIp: 'Oficina Central Constructora • IP 190.145.28.14',
    signatureMethod: 'Certificado Digital Representante Legal + Token 2FA'
  },
  {
    id: 'AUD-2026-006',
    timestamp: '2026-10-11 17:30:44',
    category: 'hallazgo_ncr',
    severity: 'media',
    actionTitle: 'Aprobación de subsanación técnica — NCR-2026-018 (Montante RCI)',
    summary:
      'Verificación en sitio de prueba hidrostática a 200 PSI durante 120 minutos sin caída de presión en nivel 4. Se levanta restricción técnica.',
    actorName: 'Ing. Roberto Andrade',
    actorRole: 'interventor',
    actorCompany: 'ConTech Interventoría S.A.S.',
    actorDocument: 'COPNIA 25202-094812 CND',
    moduleRoute: '/interventor',
    previousState: 'NCR-2026-018: Abierto (Con observación en montante RCI)',
    newState: 'NCR-2026-018: Subsanado y verificado con protocolo ONAC',
    sha256Hash: 'c294a108f3e7b651d920481a37c5920e84b1726f3901a84c72e6150b93a4821f',
    stellarTxHash: '0x72c109f48a37b612d09e481a37c5920e84b1726f3901a84c72e6150b93a4821f',
    ledgerSequence: 54976890,
    geofenceOrIp: 'GPS 4.6682° N, 74.0535° W (Piso 4 Eje B) • IP 181.54.112.89',
    signatureMethod: 'Firma Criptográfica Ed25519 + Registro Fotográfico GPS'
  },
  {
    id: 'AUD-2026-005',
    timestamp: '2026-09-29 11:05:32',
    category: 'desembolso',
    severity: 'alta',
    actionTitle: 'Autorización y Giro Bancario ACH — Hito #3 (Estructura Niveles 1 a 3)',
    summary:
      'Comité Fiduciario aprobó el desembolso neto (descontando 5% de retención de garantía) tras validar hash SHA-256 en Stellar y paz y salvo de interventoría.',
    actorName: 'Dra. Carolina Mendoza',
    actorRole: 'fiduciaria',
    actorCompany: 'Fiduciaria Bogotá S.A.',
    actorDocument: 'Comité Fiduciario Fidubogotá — Acta #18',
    moduleRoute: '/fiduciaria',
    previousState: 'Hito #3: listo_para_giro (En Comité Fiduciario)',
    newState: 'Hito #3: desembolsado (ACH-2026-0928-4419 ejecutado)',
    amountCOP: 2660000000,
    sha256Hash: '3b89d142a7f0e631c852940b17d6382f90a4172e6381c904b27a5183e90c4127',
    stellarTxHash: '0x64d892a10bf37182c90e471a83c5910b44e821c07a9381f2c65018b39a7421ef',
    ledgerSequence: 54890312,
    geofenceOrIp: 'Nodo Bancario Fiduciaria Bogotá • IP 200.14.88.210',
    signatureMethod: 'Multifirma Fiduciaria (2 de 3 Directores de Fideicomiso)'
  },
  {
    id: 'AUD-2026-004',
    timestamp: '2026-09-18 09:20:15',
    category: 'cumplimiento',
    severity: 'media',
    actionTitle: 'Validación de Póliza Decenal Ley 1796 de 2018 (Vivienda Segura)',
    summary:
      'Inscripción y sellado criptográfico de la póliza de estabilidad estructural por 10 años emitida por Seguros Generales Suramericana S.A.',
    actorName: 'Dra. Carolina Mendoza',
    actorRole: 'fiduciaria',
    actorCompany: 'Fiduciaria Bogotá S.A.',
    actorDocument: 'Dirección Jurídica de Fideicomisos Inmobiliarios',
    moduleRoute: '/cumplimiento',
    previousState: 'Póliza Decenal #DEC-2026-884120: En revisión técnica',
    newState: 'Póliza Decenal #DEC-2026-884120: Vigente y sellada en Stellar',
    sha256Hash: 'f4920a18c73e6519b028471d63c5910a84b2716e3901f84c72a6150b93e4821a',
    stellarTxHash: '0x19a840c27bf38192d04e771a83c5910b44e821c07a9381f2c65018b39a7421ef',
    ledgerSequence: 54712098,
    geofenceOrIp: 'Sede Corporativa Fiduciaria • IP 200.14.88.210',
    signatureMethod: 'Certificado Digital Entidad Vigilada SFC'
  },
  {
    id: 'AUD-2026-003',
    timestamp: '2026-08-30 15:48:00',
    category: 'desembolso',
    severity: 'alta',
    actionTitle: 'Autorización y Giro Bancario ACH — Hito #2 (Cimentación y Sótanos)',
    summary:
      'Giro ejecutado a favor de la constructora tras completar pilotes preexcavados, pantallas perimetrales y placa de subpresión de sótanos 1 y 2.',
    actorName: 'Dra. Carolina Mendoza',
    actorRole: 'fiduciaria',
    actorCompany: 'Fiduciaria Bogotá S.A.',
    actorDocument: 'Comité Fiduciario Fidubogotá — Acta #12',
    moduleRoute: '/fiduciaria',
    previousState: 'Hito #2: listo_para_giro',
    newState: 'Hito #2: desembolsado (ACH-2026-0730-8821 ejecutado)',
    amountCOP: 2850000000,
    sha256Hash: '8d192a47c3f0e651b928471a37c5920e84b1726f3901a84c72e6150b93a4821f',
    stellarTxHash: '0x52b910c48a37b612d09e481a37c5920e84b1726f3901a84c72e6150b93a4821f',
    ledgerSequence: 54520114,
    geofenceOrIp: 'Nodo Bancario Fiduciaria Bogotá • IP 200.14.88.210',
    signatureMethod: 'Multifirma Fiduciaria (2 de 3 Directores de Fideicomiso)'
  },
  {
    id: 'AUD-2026-002',
    timestamp: '2026-08-14 10:12:51',
    category: 'comercial',
    severity: 'informativa',
    actionTitle: 'Conciliación de recaudo fiduciario y vinculación Apto 402 (Piso 4)',
    summary:
      'Acreditación de cuota de aporte en encargo fiduciario individual #4820-019284-04 y actualización de derechos fiduciarios del comprador.',
    actorName: 'Oráculo Bancario / PSE — Fiduciaria',
    actorRole: 'sistema',
    actorCompany: 'Red Bancaria ACH / Stellar Anchor',
    actorDocument: 'Conciliación Automática Encargos Individuales',
    moduleRoute: '/propietario',
    previousState: 'Encargo #4820-019284-04: Cuota #4 programada',
    newState: 'Encargo #4820-019284-04: Cuota #4 conciliada ($28.500.000 COP)',
    amountCOP: 28500000,
    sha256Hash: '7a820c19f4e3b651d920481a37c5920e84b1726f3901a84c72e6150b93a4821f',
    stellarTxHash: '0x88f102c48a37b612d09e481a37c5920e84b1726f3901a84c72e6150b93a4821f',
    ledgerSequence: 54398401,
    geofenceOrIp: 'Pasarela PSE / Recaudo Fiduciario • TLS 1.3',
    signatureMethod: 'Sello Automático Oráculo Financiero'
  },
  {
    id: 'AUD-2026-001',
    timestamp: '2026-04-30 16:00:10',
    category: 'blockchain_soroban',
    severity: 'alta',
    actionTitle: 'Acreditación de Punto de Equilibrio y Despliegue de Contrato Soroban',
    summary:
      'Cumplimiento del 87.5% de preventas vinculadas (superando el 68% exigido), habilitación de Patrimonio Autónomo y apertura del Hito #1.',
    actorName: 'Sistema Tramo / Comité Fiduciario',
    actorRole: 'sistema',
    actorCompany: 'Fiduciaria Bogotá S.A. & Constructora Bolívar',
    actorDocument: 'Escritura Pública #1842 Notaría 38 de Bogotá',
    moduleRoute: '/cumplimiento',
    previousState: 'Fideicomiso de Preventas (Recursos restringidos)',
    newState: 'Patrimonio Autónomo en Ejecución Activa (Hito #1 Girado)',
    amountCOP: 1995000000,
    sha256Hash: '1f920a48c73e6519b028471d63c5910a84b2716e3901f84c72a6150b93e4821a',
    stellarTxHash: '0x41e920a10bf37182c90e471a83c5910b44e821c07a9381f2c65018b39a7421ef',
    ledgerSequence: 53910244,
    geofenceOrIp: 'Stellar Testnet Contract: CC7X...94QA',
    signatureMethod: 'Despliegue Smart Contract Soroban Rust WASM'
  }
];

export const INITIAL_UNIT_SNAG_ITEMS: UnitSnagItem[] = [
  {
    id: 'SNAG-01',
    code: 'POS-402-01',
    unitNumber: '402',
    floorLevel: 4,
    ownerName: 'Carlos Andrés Gómez',
    roomZone: 'Sala-Comedor y Balcón',
    category: 'ventaneria',
    title: 'Ajuste de sello acústico y rodamiento en puerta-ventana corrediza de balcón',
    description:
      'Se identificó fricción leve en riel inferior de la hoja derecha del ventanal termoacústico y retoque de silicona perimetral.',
    status: 'validado_propietario',
    reportedDate: '2026-10-06',
    resolvedDate: '2026-10-10'
  },
  {
    id: 'SNAG-02',
    code: 'POS-402-02',
    unitNumber: '402',
    floorLevel: 4,
    ownerName: 'Carlos Andrés Gómez',
    roomZone: 'Cocina Abierta + Zona Ropas',
    category: 'hidrosanitario',
    title: 'Calibración de presión en mezclador monocontrol y sifón de isla',
    description:
      'La constructora realizó el ajuste de empaque y prueba de estanqueidad por 45 minutos. Listo para visto bueno del propietario.',
    status: 'corregido_por_validar',
    reportedDate: '2026-10-09',
    resolvedDate: '2026-10-12'
  },
  {
    id: 'SNAG-03',
    code: 'POS-402-03',
    unitNumber: '402',
    floorLevel: 4,
    ownerName: 'Carlos Andrés Gómez',
    roomZone: 'Alcoba Principal + Vestier',
    category: 'acabados',
    title: 'Uniformidad de estuco plástico y dilatación de cielo raso en acceso vestier',
    description:
      'Pulido de filo en dintel de entrada al walk-in closet previo a la aplicación de primera mano de pintura.',
    status: 'corregido_por_validar',
    reportedDate: '2026-10-10',
    resolvedDate: '2026-10-12'
  },
  {
    id: 'SNAG-04',
    code: 'POS-301-01',
    unitNumber: '301',
    floorLevel: 3,
    ownerName: 'María Fernanda Rojas',
    roomZone: 'Cocina Abierta + Zona Ropas',
    category: 'carpinteria',
    title: 'Nivelación de bisagras cierre lento en alacena superior',
    description:
      'Ajuste milimétrico de puertas de carpintería arquitectónica en módulo de cocina.',
    status: 'validado_propietario',
    reportedDate: '2026-10-04',
    resolvedDate: '2026-10-08'
  },
  {
    id: 'SNAG-05',
    code: 'POS-701-01',
    unitNumber: 'Penthouse 701',
    floorLevel: 7,
    ownerName: 'Alejandro Vélez',
    roomZone: 'Gran salón y terraza panorámica',
    category: 'ventaneria',
    title: 'Sello cortagotera en pérgola bioclimática de terraza norte',
    description:
      'Verificación de empaque EPDM en unión de perfil estructural con corta-soles.',
    status: 'validado_propietario',
    reportedDate: '2026-10-05',
    resolvedDate: '2026-10-09'
  }
];
