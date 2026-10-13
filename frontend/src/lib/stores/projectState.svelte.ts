import type {
  FloorData,
  ProjectCut,
  ActivityBreakdown,
  UserProfile,
  UserRole,
  PropertyOwnerUnit,
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
import type { IssuedCertificate } from '../types/certificate';
import { getSupabaseClient } from '../supabase';
import {
  PROJECT_FICHAS,
  INITIAL_MANDATORY_DOCS,
  INITIAL_LEGAL_COMPLIANCE,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_MILESTONES,
  INITIAL_TECHNICAL_FINDINGS,
  INITIAL_MATERIAL_LAB_TESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_UNIT_SNAG_ITEMS
} from './businessData';



export const AVAILABLE_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@tramo.co',
    fullName: 'Juan Jose Carabali (Admin)',
    role: 'admin',
    companyName: 'Tramo Protocol',
    licenseNumber: 'TRAMO-ROOT-01',
    avatarInitials: 'JC'
  },
  {
    id: 'usr-fid-01',
    email: 'fiduciaria@bancolombia.com.co',
    fullName: 'Dra. Carolina Mendoza',
    role: 'fiduciaria',
    companyName: 'Fiduciaria Bancolombia S.A.',
    licenseNumber: 'SFC-FID-9921',
    avatarInitials: 'CM'
  },
  {
    id: 'usr-con-01',
    email: 'gerencia@constructoraurbana.co',
    fullName: 'Arq. Roberto Vélez',
    role: 'constructor',
    companyName: 'Constructora Urbana S.A.S.',
    licenseNumber: 'NIT 900.412.881-2',
    avatarInitials: 'RV'
  },
  {
    id: 'usr-int-01',
    email: 'interventor@copnia.gov.co',
    fullName: 'Ing. Juan Jose Carabali',
    role: 'interventor',
    companyName: 'Interventoría Técnica Nacional',
    licenseNumber: 'MP 25202-99881 COPNIA',
    avatarInitials: 'IC'
  }
];

export const INITIAL_ACTIVITIES: ActivityBreakdown[] = [
  {
    id: 'act-1',
    name: 'Estructura en Concreto Reforzado (Columnas y Placas)',
    scheduledPercent: 100,
    aiEstimatedPercent: 99.4,
    calibratedPercent: 100,
    variance: 0.0,
    confidenceScore: 98.7
  },
  {
    id: 'act-2',
    name: 'Mampostería y Muros Divisorios en Bloque',
    scheduledPercent: 85.0,
    aiEstimatedPercent: 88.2,
    calibratedPercent: 87.5,
    variance: 2.5,
    confidenceScore: 96.1
  },
  {
    id: 'act-3',
    name: 'Redes Hidráulicas y Sanitarias (Tubería y Pases)',
    scheduledPercent: 70.0,
    aiEstimatedPercent: 68.9,
    calibratedPercent: 70.0,
    variance: 0.0,
    confidenceScore: 94.3
  },
  {
    id: 'act-4',
    name: 'Instalaciones Eléctricas y Conducciones',
    scheduledPercent: 60.0,
    aiEstimatedPercent: 57.8,
    calibratedPercent: 58.5,
    variance: -1.5,
    confidenceScore: 92.5
  },
  {
    id: 'act-5',
    name: 'Enchapes, Estucos y Acabados de Piso',
    scheduledPercent: 35.0,
    aiEstimatedPercent: 33.1,
    calibratedPercent: 34.0,
    variance: -1.0,
    confidenceScore: 91.2
  }
];

function createFloorsForProject(totalFloors: number, certifiedCount: number, reviewingLevel: number | null): FloorData[] {
  const sampleConstructionPhotos = [
    {
      url: 'https://lh3.googleusercontent.com/d/1SAE6L2P4x7HRsRt-xpLvXK84ZPjtaIyb=w1600',
      category: 'Estructura y placa',
      elements: ['Columnas en concreto', 'Fraguado de losa 100%', 'Acero de refuerzo']
    },
    {
      url: 'https://lh3.googleusercontent.com/d/18yzfpifx9p7bLTnSbm3pnwFP4Xm9UW9L=w1600',
      category: 'Mampostería y cerramientos',
      elements: ['Muros divisorios en bloque', 'Alineación láser verificada', 'Vanos de puertas']
    },
    {
      url: 'https://lh3.googleusercontent.com/d/1f6yXglfQmH7HO-IwqQBCPylJEMpv4uMm=w1600',
      category: 'Redes hidrosanitarias y eléctricas',
      elements: ['Tubería PVC presión', 'Bandejas portacables', 'Pases estructurales']
    },
    {
      url: 'https://lh3.googleusercontent.com/d/1JLkII_o4tLz5eekqWTHVGYrZEwfMywQy=w1600',
      category: 'Acabados y ventanería',
      elements: ['Estuco y pintura base', 'Marcos de aluminio', 'Nivelación de piso']
    }
  ];

  const list: FloorData[] = [];
  for (let i = 1; i <= totalFloors; i++) {
    let status: FloorData['status'] = 'planned';
    let completion = 0;
    let scheduled = 0;

    if (i <= certifiedCount) {
      status = 'certified';
      completion = 100;
      scheduled = 100;
    } else if (reviewingLevel === i) {
      status = 'reviewing';
      completion = 78.5;
      scheduled = 75.0;
    } else if (i === (reviewingLevel ? reviewingLevel + 1 : certifiedCount + 1)) {
      status = 'in_progress';
      completion = 45.0;
      scheduled = 50.0;
    }

    const floorPhotos =
      status === 'planned'
        ? []
        : [
            {
              id: `p-${i}-1`,
              title: `${sampleConstructionPhotos[(i - 1) % sampleConstructionPhotos.length].category} — Nivel ${i}`,
              location: `Nivel ${i} • Eje estructural A-C`,
              thumbnailUrl: sampleConstructionPhotos[(i - 1) % sampleConstructionPhotos.length].url,
              fullUrl: sampleConstructionPhotos[(i - 1) % sampleConstructionPhotos.length].url,
              timestamp: `2026-10-${String(Math.min(12, 2 + i)).padStart(2, '0')} 09:${10 + i}:00 COT`,
              gps: { lat: +(4.6781 + i * 0.00002).toFixed(5), lng: -74.05834, accuracyMeters: 1.5 },
              faceBlurApplied: true,
              duplicateChecked: true,
              aiDetectedElements: sampleConstructionPhotos[(i - 1) % sampleConstructionPhotos.length].elements
            },
            {
              id: `p-${i}-2`,
              title: `${sampleConstructionPhotos[i % sampleConstructionPhotos.length].category} — Nivel ${i}`,
              location: `Nivel ${i} • Punto fijo y hall`,
              thumbnailUrl: sampleConstructionPhotos[i % sampleConstructionPhotos.length].url,
              fullUrl: sampleConstructionPhotos[i % sampleConstructionPhotos.length].url,
              timestamp: `2026-10-${String(Math.min(12, 2 + i)).padStart(2, '0')} 14:${20 + i}:00 COT`,
              gps: { lat: +(4.67812 + i * 0.00002).toFixed(5), lng: -74.05831, accuracyMeters: 1.8 },
              faceBlurApplied: true,
              duplicateChecked: true,
              aiDetectedElements: sampleConstructionPhotos[i % sampleConstructionPhotos.length].elements
            }
          ];

    list.push({
      id: i,
      levelNumber: i,
      name: i === 1 ? 'Nivel 1 — Lobby y acceso principal' : `Nivel ${i} — Planta estructural tipo`,
      status,
      completionPercent: completion,
      scheduledPercent: scheduled,
      hashSha256: status === 'certified' ? `9f83a21e4c7b8d0e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d0${i}` : undefined,
      stellarTx: status === 'certified' ? `c4e97a82fb10d3f6a2410a8234bb5812e9124a9e223fa871cd8126e831bb210${i}` : undefined,
      lastUpdated: '2026-10-10T11:20:00Z',
      activities: INITIAL_ACTIVITIES.map((a) => ({
        ...a,
        calibratedPercent: status === 'certified' ? 100 : status === 'reviewing' ? a.calibratedPercent : completion
      })),
      photos: floorPhotos
    });
  }
  return list;
}

export const INITIAL_PROJECTS: ProjectCut[] = [
  {
    id: 'CORTE-2026-004',
    projectId: 'PROJ-ALAMEDA-01',
    code: 'TRM-BOG-001',
    city: 'Bogotá, D.C.',
    address: 'Cra. 15 #93-40 • Chicó Reservado',
    fiduciaryTrustCode: 'FIDEICOMISO #992-0129',
    lifecycleStatus: 'in_progress',
    number: 4,
    totalCutsPlanned: 12,
    projectName: 'Torre Alameda — Etapa 1',
    developerName: 'Constructora Urbana S.A.S.',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    interventorName: 'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)',
    interventorId: 'GDN-2026-INSPECT-01',
    status: 'in_review',
    totalBudgetCOP: 24500000000,
    disbursedCOP: 8300000000,
    cutDisbursementCOP: 1850000000,
    scheduledPhysicalProgress: 42.5,
    certifiedPhysicalProgress: 43.1,
    sha256Hash: 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
    stellarTxHash: '3d8fa19e84b029384752c01928475a89201e9284756201938475a02938475b10',
    stellarLedgerSequence: 5219482,
    certificationTimestamp: '2026-10-12T14:30:00Z',
    floors: createFloorsForProject(8, 3, 4)
  },
  {
    id: 'CORTE-2026-007',
    projectId: 'PROJ-MIRADOR-02',
    code: 'TRM-MED-002',
    city: 'Medellín, Ant.',
    address: 'Av. El Poblado #12-85',
    fiduciaryTrustCode: 'FIDEICOMISO #841-3310',
    lifecycleStatus: 'in_progress',
    number: 7,
    totalCutsPlanned: 12,
    projectName: 'Mirador del Parque — Reservado',
    developerName: 'Constructora Urbana S.A.S.',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    interventorName: 'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)',
    interventorId: 'GDN-2026-INSPECT-01',
    status: 'certified',
    totalBudgetCOP: 38200000000,
    disbursedCOP: 22400000000,
    cutDisbursementCOP: 3100000000,
    scheduledPhysicalProgress: 66.0,
    certifiedPhysicalProgress: 68.5,
    sha256Hash: 'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e',
    stellarTxHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    stellarLedgerSequence: 5218100,
    certificationTimestamp: '2026-10-09T16:10:00Z',
    floors: createFloorsForProject(10, 6, 7)
  },
  {
    id: 'CORTE-2026-002',
    projectId: 'PROJ-SIETEMARES-03',
    code: 'TRM-BAQ-003',
    city: 'Barranquilla, Atl.',
    address: 'Calle 79B #55-20 • Alto Prado',
    fiduciaryTrustCode: 'FIDEICOMISO #710-4402',
    lifecycleStatus: 'in_progress',
    number: 2,
    totalCutsPlanned: 14,
    projectName: 'Centro Empresarial Siete Mares',
    developerName: 'Inversiones del Caribe S.A.',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    interventorName: 'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)',
    interventorId: 'GDN-2026-INSPECT-01',
    status: 'in_review',
    totalBudgetCOP: 52000000000,
    disbursedCOP: 9100000000,
    cutDisbursementCOP: 4200000000,
    scheduledPhysicalProgress: 22.0,
    certifiedPhysicalProgress: 21.0,
    sha256Hash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    stellarTxHash: '1f2e3d4c5b6a798897a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4',
    stellarLedgerSequence: 5215091,
    certificationTimestamp: '2026-10-05T11:00:00Z',
    floors: createFloorsForProject(10, 2, 3)
  },
  {
    id: 'CORTE-2026-000',
    projectId: 'PROJ-CERROS-04',
    code: 'TRM-CLO-004',
    city: 'Cali, Valle',
    address: 'Cra. 100 #16-40 • Ciudad Jardín',
    fiduciaryTrustCode: 'ENCARGO #102-8891',
    lifecycleStatus: 'upcoming',
    number: 0,
    totalCutsPlanned: 10,
    projectName: 'Reserva de los Cerros — VIS',
    developerName: 'Constructora Urbana S.A.S.',
    fiduciaryEntity: 'Alianza Fiduciaria S.A.',
    interventorName: 'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)',
    interventorId: 'GDN-2026-INSPECT-01',
    status: 'pending',
    totalBudgetCOP: 16800000000,
    disbursedCOP: 0,
    cutDisbursementCOP: 1200000000,
    scheduledPhysicalProgress: 0.0,
    certifiedPhysicalProgress: 0.0,
    floors: createFloorsForProject(6, 0, null)
  },
  {
    id: 'CORTE-2026-010',
    projectId: 'PROJ-CASTELLANA-05',
    code: 'TRM-BOG-005',
    city: 'Bogotá, D.C.',
    address: 'Calle 98 #45-12 • La Castellana',
    fiduciaryTrustCode: 'FIDEICOMISO #550-0019',
    lifecycleStatus: 'completed',
    number: 10,
    totalCutsPlanned: 10,
    projectName: 'Edificio Castellana 98',
    developerName: 'Constructora Urbana S.A.S.',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    interventorName: 'Ing. Juan Jose Carabali (MP: 25202-99881 COPNIA)',
    interventorId: 'GDN-2026-INSPECT-01',
    status: 'certified',
    totalBudgetCOP: 19400000000,
    disbursedCOP: 19400000000,
    cutDisbursementCOP: 0,
    scheduledPhysicalProgress: 100.0,
    certifiedPhysicalProgress: 100.0,
    sha256Hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    stellarTxHash: '7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
    stellarLedgerSequence: 4980112,
    certificationTimestamp: '2026-08-20T18:00:00Z',
    floors: createFloorsForProject(8, 8, null)
  }
];

export const PROPERTY_OWNERS: PropertyOwnerUnit[] = [
  {
    cedula: '1020784512',
    ownerName: 'Andrés Felipe Restrepo Gómez',
    ownerEmail: 'andres.restrepo@gmail.com',
    ownerPhone: '+57 310 482 9910',
    projectId: 'PROJ-ALAMEDA-01',
    projectName: 'Torre Alameda — Etapa 1',
    city: 'Bogotá, D.C.',
    address: 'Cra. 15 #93-40 • Chicó Reservado',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    fiduciaryEncargoCode: 'ENC-992-0129-AP402',
    unitNumber: 'Apartamento 402',
    tower: 'Torre A',
    floorLevel: 4,
    unitPositionInFloor: 2,
    orientationLabel: 'Esquina Nororiental • Vista exterior',
    areaM2: 118.5,
    typology: '3 Alcobas + Estudio + Balcón Terraza',
    parkingSpot: 'Sótano 1 — Celdas #14 y #15 + Depósito #08',
    estimatedDeliveryDate: 'Marzo 2027',
    unitStatus: 'en_acabados',
    unitProgressPercent: 78.5,
    financialPlan: {
      totalUnitValueCOP: 980000000,
      downPaymentGoalCOP: 294000000,
      downPaymentPaidCOP: 220500000,
      installmentsPaid: 18,
      installmentsTotal: 24,
      nextInstallmentDate: '2026-11-05'
    },
    unitActivities: [
      { name: 'Placa y estructura en concreto Nivel 4', percent: 100, status: 'completado' },
      { name: 'Mampostería y divisiones internas Apto 402', percent: 87.5, status: 'en_ejecucion' },
      { name: 'Puntos hidrosanitarios y red eléctrica', percent: 70.0, status: 'en_ejecucion' },
      { name: 'Pisos, carpintería arquitectónica y cocina', percent: 56.5, status: 'en_ejecucion' }
    ],
    unitRooms: [
      {
        id: 'room-1',
        name: 'Sala-comedor y balcón terraza',
        areaM2: 38.5,
        percent: 90,
        status: 'en_ejecucion',
        description: 'Losa nivelada, muros con pañete fino, ventanería acústica piso-techo y baranda de vidrio instaladas.'
      },
      {
        id: 'room-2',
        name: 'Cocina abierta y zona de ropas',
        areaM2: 18.0,
        percent: 78,
        status: 'en_ejecucion',
        description: 'Red hidrosanitaria aprobada con prueba de presión, puntos de gas y ductos de extracción listos.'
      },
      {
        id: 'room-3',
        name: 'Alcoba principal, vestier y baño privado',
        areaM2: 32.0,
        percent: 82,
        status: 'en_ejecucion',
        description: 'Mampostería y estuco completados, impermeabilización de ducha verificada y premarcos de madera.'
      },
      {
        id: 'room-4',
        name: 'Alcobas auxiliares 2 y 3 + estudio',
        areaM2: 30.0,
        percent: 64,
        status: 'en_ejecucion',
        description: 'Divisiones internas listas, canalizaciones eléctricas verificadas y alistamiento para piso laminado.'
      }
    ],
    unitPhotos: [
      {
        id: 'AP402-PH-01',
        scope: 'unit',
        roomOrArea: 'Sala-comedor y balcón terraza',
        title: 'Apto 402 — Ventanería y área social con vista nororiental',
        timestamp: '2026-10-12 09:40 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1oSWKCAUAFG_-vb799986sVJn8RUldkeH=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1oSWKCAUAFG_-vb799986sVJn8RUldkeH=w1600',
        inspectorNote: 'Se verifica instalación de perfilería de aluminio y nivelación de mortero en sala-comedor del Apartamento 402.',
        aiDetectedElements: ['Ventanería piso-techo', 'Losa nivelada', 'Muros estucados'],
        gpsVerified: true
      },
      {
        id: 'AP402-PH-02',
        scope: 'unit',
        roomOrArea: 'Cocina abierta y zona de ropas',
        title: 'Apto 402 — Puntos hidrosanitarios y eléctricos en cocina',
        timestamp: '2026-10-12 10:05 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1GUooP4imrAEbbtwbJlGRKJQNLyT5MJ36=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1GUooP4imrAEbbtwbJlGRKJQNLyT5MJ36=w1600',
        inspectorNote: 'Prueba hidrostática superada a 120 PSI en red de agua fría y caliente de cocina y lavandería del Apto 402.',
        aiDetectedElements: ['Tubería presión', 'Cajas eléctricas', 'Impermeabilización'],
        gpsVerified: true
      },
      {
        id: 'AP402-PH-03',
        scope: 'unit',
        roomOrArea: 'Alcoba principal, vestier y baño privado',
        title: 'Apto 402 — Mampostería interior y baño de alcoba principal',
        timestamp: '2026-10-11 15:20 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Ty59v8eJEM1bMhsCZWTiajyAT9WqjtoN=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1Ty59v8eJEM1bMhsCZWTiajyAT9WqjtoN=w1600',
        inspectorNote: 'Alineación láser aprobada en muros de alcoba principal y nicho de ducha impermeabilizado.',
        aiDetectedElements: ['Mampostería interna', 'Vano de puerta', 'Estuco primera capa'],
        gpsVerified: true
      },
      {
        id: 'AP402-PH-04',
        scope: 'unit',
        roomOrArea: 'Alcobas auxiliares 2 y 3 + estudio',
        title: 'Apto 402 — Divisiones de estudio y habitaciones auxiliares',
        timestamp: '2026-10-10 11:30 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/14MMlPyfPwqLPV8csttqtQRSGtGqiQRgA=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/14MMlPyfPwqLPV8csttqtQRSGtGqiQRgA=w1600',
        inspectorNote: 'Tablero de distribución interno del Apto 402 cableado y puntos de datos en zona de estudio.',
        aiDetectedElements: ['Red eléctrica RETIE', 'Alistamiento de piso', 'Dinteles'],
        gpsVerified: true
      }
    ],
    projectPhotos: [
      {
        id: 'PROJ-AL-01',
        scope: 'project',
        roomOrArea: 'Estructura general Torre A',
        title: 'Avance general de fachada y estructura — Torre Alameda',
        timestamp: '2026-10-12 08:30 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1qPDWwRaYzdGqVI5eGi6y6d0kj9e3yGl3=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1qPDWwRaYzdGqVI5eGi6y6d0kj9e3yGl3=w1600',
        inspectorNote: 'Vista exterior de la torre con los primeros 4 niveles certificados y estructura activa en niveles 5 y 6.',
        aiDetectedElements: ['Fachada general', 'Estructura aporticada', 'Grúa torre'],
        gpsVerified: true
      },
      {
        id: 'PROJ-AL-02',
        scope: 'project',
        roomOrArea: 'Punto fijo y ascensores — Piso 4',
        title: 'Hall de circulación y foso de ascensores en tu Piso 4',
        timestamp: '2026-10-11 16:45 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1KGnnMVZn1PExaxZzqLHEXqDkLHwrgSWk=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1KGnnMVZn1PExaxZzqLHEXqDkLHwrgSWk=w1600',
        inspectorNote: 'Guías de ascensores instaladas en el Nivel 4 y escaleras presurizadas con baranda definitiva.',
        aiDetectedElements: ['Foso de ascensor', 'Hall Piso 4', 'Iluminación LED'],
        gpsVerified: true
      },
      {
        id: 'PROJ-AL-03',
        scope: 'project',
        roomOrArea: 'Lobby y acceso peatonal',
        title: 'Avance de lobby doble altura y portería en Piso 1',
        timestamp: '2026-10-09 14:15 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1aVR1HNl9bm-qUkwf7jFL_7L4iqqBBxXi=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1aVR1HNl9bm-qUkwf7jFL_7L4iqqBBxXi=w1600',
        inspectorNote: 'Cerramiento en vidrio templado laminado y enchape de lobby principal en ejecución.',
        aiDetectedElements: ['Acceso principal', 'Doble altura', 'Acabados comunes'],
        gpsVerified: true
      },
      {
        id: 'PROJ-AL-04',
        scope: 'project',
        roomOrArea: 'Sótano 1 — Parqueaderos y depósitos',
        title: 'Zona de parqueaderos asignados (Celdas #14 y #15)',
        timestamp: '2026-10-08 10:00 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1nkUzyN-QZzeF5QOr_i1PcsuBkbEz84HQ=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1nkUzyN-QZzeF5QOr_i1PcsuBkbEz84HQ=w1600',
        inspectorNote: 'Piso industrial endurecido al 100%, red contra incendios rociadores y demarcación de celdas.',
        aiDetectedElements: ['Piso industrial', 'Red RCI', 'Iluminación sótano'],
        gpsVerified: true
      }
    ]
  },
  {
    cedula: '79845120',
    ownerName: 'María Fernanda Valderrama',
    ownerEmail: 'mf.valderrama@outlook.com',
    ownerPhone: '+57 315 891 3340',
    projectId: 'PROJ-ALAMEDA-01',
    projectName: 'Torre Alameda — Etapa 1',
    city: 'Bogotá, D.C.',
    address: 'Cra. 15 #93-40 • Chicó Reservado',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    fiduciaryEncargoCode: 'ENC-992-0129-AP201',
    unitNumber: 'Apartamento 201',
    tower: 'Torre A',
    floorLevel: 2,
    unitPositionInFloor: 1,
    orientationLabel: 'Esquina Noroccidental • Vista parque',
    areaM2: 94.0,
    typology: '2 Alcobas + Family Room',
    parkingSpot: 'Sótano 1 — Celda #04 + Depósito #02',
    estimatedDeliveryDate: 'Febrero 2027',
    unitStatus: 'estructura_completada',
    unitProgressPercent: 100.0,
    financialPlan: {
      totalUnitValueCOP: 760000000,
      downPaymentGoalCOP: 228000000,
      downPaymentPaidCOP: 209000000,
      installmentsPaid: 22,
      installmentsTotal: 24,
      nextInstallmentDate: '2026-11-01'
    },
    unitActivities: [
      { name: 'Placa y estructura en concreto Nivel 2', percent: 100, status: 'completado' },
      { name: 'Mampostería y divisiones internas Apto 201', percent: 100, status: 'completado' },
      { name: 'Puntos hidrosanitarios y red eléctrica', percent: 100, status: 'completado' },
      { name: 'Pisos, carpintería arquitectónica y cocina', percent: 100, status: 'completado' }
    ],
    unitRooms: [
      {
        id: 'room-1',
        name: 'Sala-comedor y balcón terraza',
        areaM2: 31.0,
        percent: 100,
        status: 'completado',
        description: 'Piso instalado, ventanería acústica sellada y pintura final aprobada por interventoría.'
      },
      {
        id: 'room-2',
        name: 'Cocina abierta y zona de ropas',
        areaM2: 15.0,
        percent: 100,
        status: 'completado',
        description: 'Mobiliario de cocina, mesón en cuarzo y grifería instalados al 100%.'
      },
      {
        id: 'room-3',
        name: 'Alcoba principal, vestier y baño privado',
        areaM2: 26.0,
        percent: 100,
        status: 'completado',
        description: 'Carpintería de closets, enchape de baño y división en vidrio templado terminados.'
      },
      {
        id: 'room-4',
        name: 'Alcoba auxiliar + Family Room',
        areaM2: 22.0,
        percent: 100,
        status: 'completado',
        description: 'Iluminación LED, puertas interiores y acabados de piso completados.'
      }
    ],
    unitPhotos: [
      {
        id: 'AP201-PH-01',
        scope: 'unit',
        roomOrArea: 'Sala-comedor y balcón terraza',
        title: 'Apto 201 — Acabados terminados en área social y balcón',
        timestamp: '2026-10-11 11:15 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/16CewcygKicogwmFq3_rDcFHiTHOZ3Fuo=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/16CewcygKicogwmFq3_rDcFHiTHOZ3Fuo=w1600',
        inspectorNote: 'Apartamento 201 con obra blanca, ventanería y pisos verificados al 100% en Nivel 2.',
        aiDetectedElements: ['Obra blanca 100%', 'Ventanería sellada', 'Piso terminado'],
        gpsVerified: true
      },
      {
        id: 'AP201-PH-02',
        scope: 'unit',
        roomOrArea: 'Cocina abierta y zona de ropas',
        title: 'Apto 201 — Carpintería y mesón de cocina instalados',
        timestamp: '2026-10-10 14:20 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/174W9b_PF9xEMFKOmsdayd8WmDQg69etC=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/174W9b_PF9xEMFKOmsdayd8WmDQg69etC=w1600',
        inspectorNote: 'Revisión final de aparatos sanitarios, griferías y red de gas en cocina del Apto 201.',
        aiDetectedElements: ['Carpintería cocina', 'Aparatos instalados', 'Prueba presión OK'],
        gpsVerified: true
      }
    ],
    projectPhotos: [
      {
        id: 'PROJ-AL2-01',
        scope: 'project',
        roomOrArea: 'Estructura general Torre A',
        title: 'Estado general de Torre Alameda — Etapa 1',
        timestamp: '2026-10-12 08:30 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1qPDWwRaYzdGqVI5eGi6y6d0kj9e3yGl3=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1qPDWwRaYzdGqVI5eGi6y6d0kj9e3yGl3=w1600',
        inspectorNote: 'Avance global del edificio conforme al cronograma fiduciario.',
        aiDetectedElements: ['Fachada general', 'Niveles 1-4 certificados'],
        gpsVerified: true
      }
    ]
  },
  {
    cedula: '52418930',
    ownerName: 'Carlos Eduardo Jaramillo Cano',
    ownerEmail: 'cjaramillo@inversiones.co',
    ownerPhone: '+57 300 612 7781',
    projectId: 'PROJ-MIRADOR-02',
    projectName: 'Mirador del Parque — Reservado',
    city: 'Medellín, Ant.',
    address: 'Av. El Poblado #12-85',
    fiduciaryEntity: 'Fiduciaria Bancolombia S.A.',
    fiduciaryEncargoCode: 'ENC-841-3310-AP701',
    unitNumber: 'Penthouse 701',
    tower: 'Torre Única',
    floorLevel: 7,
    unitPositionInFloor: 4,
    orientationLabel: 'Esquina Suroriental • Panorámica El Poblado',
    areaM2: 165.0,
    typology: 'Duplex 3 Alcobas + Terraza Panorámica',
    parkingSpot: 'Nivel P1 — Celdas #21, #22 y Cuarto Útil #11',
    estimatedDeliveryDate: 'Enero 2027',
    unitStatus: 'en_acabados',
    unitProgressPercent: 82.0,
    financialPlan: {
      totalUnitValueCOP: 1420000000,
      downPaymentGoalCOP: 426000000,
      downPaymentPaidCOP: 390500000,
      installmentsPaid: 22,
      installmentsTotal: 24,
      nextInstallmentDate: '2026-10-30'
    },
    unitActivities: [
      { name: 'Estructura y losa postensada Nivel 7', percent: 100, status: 'completado' },
      { name: 'Cerramientos acústicos y mampostería', percent: 95.0, status: 'completado' },
      { name: 'Domótica, redes MEP y aire acondicionado', percent: 80.0, status: 'en_ejecucion' },
      { name: 'Mármoles, cocina importada y ventanería', percent: 55.0, status: 'en_ejecucion' }
    ],
    unitRooms: [
      {
        id: 'room-1',
        name: 'Gran salón y terraza panorámica',
        areaM2: 58.0,
        percent: 92,
        status: 'en_ejecucion',
        description: 'Cerramiento en cristal laminado de control solar y pérgola de terraza instalados.'
      },
      {
        id: 'room-2',
        name: 'Cocina isla y comedor auxiliar',
        areaM2: 26.0,
        percent: 84,
        status: 'en_ejecucion',
        description: 'Instalaciones hidrosanitarias, red de domótica e iluminación indirecta completadas.'
      },
      {
        id: 'room-3',
        name: 'Suite principal + Walk-in closet',
        areaM2: 44.0,
        percent: 80,
        status: 'en_ejecucion',
        description: 'Enchapes en mármol de baño principal y ductos de climatización VRF listos.'
      },
      {
        id: 'room-4',
        name: 'Alcobas 2 y 3 + sala de cine',
        areaM2: 37.0,
        percent: 72,
        status: 'en_ejecucion',
        description: 'Aislamiento acústico interior completado y alistamiento de carpintería de madera.'
      }
    ],
    unitPhotos: [
      {
        id: 'PH701-01',
        scope: 'unit',
        roomOrArea: 'Gran salón y terraza panorámica',
        title: 'Penthouse 701 — Terraza panorámica y ventanería piso-techo',
        timestamp: '2026-10-11 16:00 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1e0XI7KAf11XgbOsHWDYR2l6GuaQNUc9B=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1e0XI7KAf11XgbOsHWDYR2l6GuaQNUc9B=w1600',
        inspectorNote: 'Instalación de ventanería monumental y pruebas de estanqueidad en terraza del Penthouse 701.',
        aiDetectedElements: ['Ventanería acústica', 'Terraza Nivel 7', 'Impermeabilización'],
        gpsVerified: true
      },
      {
        id: 'PH701-02',
        scope: 'unit',
        roomOrArea: 'Suite principal + Walk-in closet',
        title: 'Penthouse 701 — Climatización y acabados en suite principal',
        timestamp: '2026-10-10 10:40 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1tQyxXb1CkWDG9bh3geqTtPfjl7TzSA_s=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1tQyxXb1CkWDG9bh3geqTtPfjl7TzSA_s=w1600',
        inspectorNote: 'Ductos de aire acondicionado ocultos en cielo raso y red de domótica KNX verificada.',
        aiDetectedElements: ['Climatización VRF', 'Domótica', 'Mampostería acústica'],
        gpsVerified: true
      }
    ],
    projectPhotos: [
      {
        id: 'PROJ-MIR-01',
        scope: 'project',
        roomOrArea: 'Fachada general Mirador del Parque',
        title: 'Vista exterior de la torre en El Poblado',
        timestamp: '2026-10-12 09:00 COT',
        thumbnailUrl: 'https://lh3.googleusercontent.com/d/1G5ZhYdXo3pK4OieWjID_0McvmO8jx1rB=w1000',
        fullUrl: 'https://lh3.googleusercontent.com/d/1G5ZhYdXo3pK4OieWjID_0McvmO8jx1rB=w1600',
        inspectorNote: 'Avance general certificado al 81.5% con 8 pisos sellados en Stellar.',
        aiDetectedElements: ['Fachada terminada', '8 niveles sellados'],
        gpsVerified: true
      }
    ]
  }
];

class ProjectStore {
  isDark = $state<boolean>(true);
  
  // Usuario autenticado y Perfil activo en visualización
  isAuthenticated = $state<boolean>(false);
  authInitialized = $state<boolean>(false);
  currentUser = $state<UserProfile>(AVAILABLE_PROFILES[0]);
  viewingAsRole = $state<UserRole>('admin');
  isConnectedToSupabase = $state<boolean>(false);
  isAccountModalOpen = $state<boolean>(false);

  // Portafolio Multi-Proyecto
  projects = $state<ProjectCut[]>(INITIAL_PROJECTS);
  propertyOwners = $state<PropertyOwnerUnit[]>(PROPERTY_OWNERS);
  projectFichas = $state<Record<string, ProjectFichaDetails>>(PROJECT_FICHAS);
  mandatoryDocs = $state<MandatoryDocument[]>(INITIAL_MANDATORY_DOCS);
  legalCompliance = $state<LegalComplianceItem[]>(INITIAL_LEGAL_COMPLIANCE);
  calendarEvents = $state<ProjectCalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  milestones = $state<FiduciaryMilestone[]>(INITIAL_MILESTONES);
  technicalFindings = $state<TechnicalFinding[]>(INITIAL_TECHNICAL_FINDINGS);
  materialLabTests = $state<MaterialLabTest[]>(INITIAL_MATERIAL_LAB_TESTS);
  auditLogs = $state<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  unitSnagItems = $state<UnitSnagItem[]>(INITIAL_UNIT_SNAG_ITEMS);
  signedHandoverUnits = $state<Record<string, { signedAt: string; txHash: string }>>({
    '301': {
      signedAt: '2026-10-08 15:20 COT',
      txHash: '0x82b419a0c7f2e8419d03a621c5901e48b2019f34a812c904e51b2893a710391e'
    },
    'Penthouse 701': {
      signedAt: '2026-10-09 11:45 COT',
      txHash: '0x59c381f2a104b9382e710d49c6281a39f0182b47c6391e02a481c920b371882b'
    }
  });
  retentionReleased = $state<boolean>(false);

  activeOwnerCedula = $state<string | null>(null);


  selectedProjectId = $state<string>('PROJ-ALAMEDA-01');
  selectedFloorId = $state<number | null>(4);
  isDrawerOpen = $state<boolean>(false);

  // Getters reactivos del proyecto activo
  activeCut = $derived<ProjectCut>(
    this.projects.find(p => p.projectId === this.selectedProjectId) || this.projects[0]
  );

  activeFicha = $derived<ProjectFichaDetails>(
    this.projectFichas[this.selectedProjectId] || this.projectFichas['PROJ-ALAMEDA-01']
  );

  activeOwner = $derived<PropertyOwnerUnit | null>(
    this.activeOwnerCedula
      ? this.propertyOwners.find(o => o.cedula === this.activeOwnerCedula) || null
      : null
  );

  floors = $derived<FloorData[]>(this.activeCut.floors);

  // El rol efectivo determina qué vistas y permisos se muestran en pantalla
  effectiveRole = $derived<UserRole>(
    this.currentUser.role === 'admin' ? this.viewingAsRole : this.currentUser.role
  );

  issuedCertificates = $state<IssuedCertificate[]>([
    {
      certificateId: 'CERT-ALAMEDA-003',
      metadata: {
        projectId: 'PROJ-ALAMEDA-01',
        projectName: 'Torre Alameda — Etapa 1',
        corteNumber: 3,
        periodStart: '2026-09-01',
        periodEnd: '2026-09-30',
        interventor: {
          fullName: 'Juan Jose Carabali',
          professionalLicense: '25202-99881 COPNIA',
          stellarPublicKey: 'GBBD...TRAMO_INTERVENTOR_KEY'
        },
        financialSummary: {
          totalProjectBudgetCOP: 24500000000,
          cutDisbursementCOP: 2100000000,
          previousCumulativeDisbursedCOP: 6200000000
        },
        metrics: {
          scheduledProgressPercent: 35.0,
          aiAssistedProgressPercent: 35.8,
          finalCertifiedProgressPercent: 35.5,
          variancePercent: 0.5
        },
        activities: INITIAL_ACTIVITIES,
        evidencePhotosSummary: {
          totalPhotos: 42,
          allGeotagged: true,
          allFaceBlurred: true,
          merkleRootPhotos: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        }
      },
      sha256Hash: 'e89a42f11c7b8d0e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      issuedAt: '2026-09-30T17:00:00Z',
      stellarSoroban: {
        network: 'testnet',
        contractId: 'CA7TRAMO_REGISTRY_TESTNET_7392841029384756',
        transactionHash: 'c4e97a82fb10d3f6a2410a8234bb5812e9124a9e223fa871cd8126e831bb2198',
        ledgerSequence: 5184920,
        blockTimestamp: '2026-09-30T17:01:14Z',
        sponsoredBy: 'LAUNCHTUBE_RELAYER_STX9'
      }
    },
    {
      certificateId: 'CERT-MIRADOR-007',
      metadata: {
        projectId: 'PROJ-MIRADOR-02',
        projectName: 'Mirador del Parque — Reservado',
        corteNumber: 7,
        periodStart: '2026-09-15',
        periodEnd: '2026-10-09',
        interventor: {
          fullName: 'Juan Jose Carabali',
          professionalLicense: '25202-99881 COPNIA',
          stellarPublicKey: 'GBBD...TRAMO_INTERVENTOR_KEY'
        },
        financialSummary: {
          totalProjectBudgetCOP: 38200000000,
          cutDisbursementCOP: 3100000000,
          previousCumulativeDisbursedCOP: 19300000000
        },
        metrics: {
          scheduledProgressPercent: 66.0,
          aiAssistedProgressPercent: 68.1,
          finalCertifiedProgressPercent: 68.5,
          variancePercent: 2.5
        },
        activities: INITIAL_ACTIVITIES,
        evidencePhotosSummary: {
          totalPhotos: 56,
          allGeotagged: true,
          allFaceBlurred: true,
          merkleRootPhotos: 'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e'
        }
      },
      sha256Hash: 'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e',
      issuedAt: '2026-10-09T16:10:00Z',
      stellarSoroban: {
        network: 'testnet',
        contractId: 'CA7TRAMO_REGISTRY_TESTNET_7392841029384756',
        transactionHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        ledgerSequence: 5218100,
        blockTimestamp: '2026-10-09T16:10:25Z',
        sponsoredBy: 'LAUNCHTUBE_RELAYER_STX9'
      }
    }
  ]);

  setTheme(dark: boolean) {
    this.isDark = dark;
    if (typeof document !== 'undefined') {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('tramo_theme_preference', dark ? 'dark' : 'light');
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  }

  toggleTheme() {
    this.setTheme(!this.isDark);
  }

  initAuth() {
    if (typeof window !== 'undefined' && !this.authInitialized) {
      try {
        const savedTheme = window.localStorage.getItem('tramo_theme_preference');
        if (savedTheme === 'light') {
          this.isDark = false;
          document.documentElement.classList.remove('dark');
        } else if (savedTheme === 'dark') {
          this.isDark = true;
          document.documentElement.classList.add('dark');
        }
      } catch {
        // Ignorar errores de localStorage
      }

      try {
        const saved = window.sessionStorage.getItem('tramo_corporate_session');
        if (saved) {
          const parsed = JSON.parse(saved) as UserProfile;
          if (parsed && parsed.email && parsed.role) {
            this.currentUser = parsed;
            this.viewingAsRole = parsed.role;
            this.isAuthenticated = true;
          }
        }
      } catch {
        // Ignorar errores de parseo en sessionStorage
      }
      this.authInitialized = true;
    }
  }

  loginWithProfile(profile: UserProfile) {
    this.currentUser = profile;
    this.viewingAsRole = profile.role;
    this.isAuthenticated = true;
    this.authInitialized = true;
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('tramo_corporate_session', JSON.stringify(profile));
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.isAccountModalOpen = false;
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem('tramo_corporate_session');
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  }

  setViewingRole(role: UserRole) {
    this.viewingAsRole = role;
  }

  openAccountModal() {
    this.isAccountModalOpen = true;
  }

  closeAccountModal() {
    this.isAccountModalOpen = false;
  }

  findOwnerByCedula(cedula: string): PropertyOwnerUnit | null {
    const clean = cedula.replace(/\D/g, '').trim();
    if (!clean) return null;
    return this.propertyOwners.find(o => o.cedula === clean) || null;
  }

  selectProject(projectId: string) {
    this.selectedProjectId = projectId;
    this.isDrawerOpen = false;
    const proj = this.projects.find(p => p.projectId === projectId);
    if (proj && proj.floors.length > 0) {
      const reviewingFloor = proj.floors.find(f => f.status === 'reviewing') || proj.floors[0];
      this.selectedFloorId = reviewingFloor.id;
    }
  }

  selectFloor(id: number | null) {
    this.selectedFloorId = id;
    if (id !== null) {
      this.isDrawerOpen = true;
    }
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  async syncFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data && data.length > 0) {
        this.isConnectedToSupabase = true;
      }
    } catch {
      this.isConnectedToSupabase = false;
    }
  }

  async commitCutToStellar(hashSha256: string, finalPercent: number) {
    const proj = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (!proj) return;

    proj.status = 'certified';
    proj.certifiedPhysicalProgress = finalPercent;
    proj.sha256Hash = hashSha256;
    proj.stellarTxHash = 'tx_' + Math.random().toString(16).substring(2, 10) + '9e84b029384752c01928475a89201e9284756201';
    proj.stellarLedgerSequence = 5220194;
    proj.certificationTimestamp = new Date().toISOString();

    const reviewingFloor = proj.floors.find(f => f.status === 'reviewing') || proj.floors[3];
    if (reviewingFloor) {
      reviewingFloor.status = 'certified';
      reviewingFloor.completionPercent = finalPercent;
      reviewingFloor.hashSha256 = hashSha256;
      reviewingFloor.stellarTx = proj.stellarTxHash;
    }

    const newCert: IssuedCertificate = {
      certificateId: `CERT-${proj.code}-00${proj.number}`,
      metadata: {
        projectId: proj.projectId,
        projectName: proj.projectName,
        corteNumber: proj.number,
        periodStart: '2026-10-01',
        periodEnd: '2026-10-12',
        interventor: {
          fullName: 'Juan Jose Carabali',
          professionalLicense: '25202-99881 COPNIA',
          stellarPublicKey: 'GBBD...TRAMO_INTERVENTOR_KEY'
        },
        financialSummary: {
          totalProjectBudgetCOP: proj.totalBudgetCOP,
          cutDisbursementCOP: proj.cutDisbursementCOP,
          previousCumulativeDisbursedCOP: proj.disbursedCOP
        },
        metrics: {
          scheduledProgressPercent: proj.scheduledPhysicalProgress,
          aiAssistedProgressPercent: 42.8,
          finalCertifiedProgressPercent: finalPercent,
          variancePercent: +(finalPercent - proj.scheduledPhysicalProgress).toFixed(1)
        },
        activities: INITIAL_ACTIVITIES,
        evidencePhotosSummary: {
          totalPhotos: 28,
          allGeotagged: true,
          allFaceBlurred: true,
          merkleRootPhotos: hashSha256.slice(0, 32)
        }
      },
      sha256Hash: hashSha256,
      issuedAt: proj.certificationTimestamp,
      stellarSoroban: {
        network: 'testnet',
        contractId: 'CA7TRAMO_REGISTRY_TESTNET_7392841029384756',
        transactionHash: proj.stellarTxHash,
        ledgerSequence: 5220194,
        blockTimestamp: proj.certificationTimestamp,
        sponsoredBy: 'LAUNCHTUBE_RELAYER_STX9'
      }
    };

    this.issuedCertificates.unshift(newCert);

    // Sincronizar con backend / Supabase si está configurado
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: proj.projectId,
          corteNumber: proj.number,
          certifiedPercent: finalPercent,
          sha256Hash: hashSha256,
          stellarTxHash: proj.stellarTxHash
        })
      });
    } catch {
      // Operación local completada
    }
  }

  approveMilestoneDisbursement(milestoneId: string) {
    const m = this.milestones.find((item) => item.id === milestoneId);
    if (!m || m.status === 'desembolsado') return;

    const prevStatus = m.status;
    m.status = 'desembolsado';
    m.disbursedDate = '2026-10-12 18:40 COT';
    m.achReference = `ACH-BANCO-998120-0${m.milestoneNumber}`;
    if (!m.stellarTxHash) {
      m.stellarTxHash = this.activeCut.stellarTxHash || 'c4e97a82fb10d3f6a2410a8234bb5812e9124a9e223fa871cd8126e831bb2198';
    }
    if (!m.sha256Hash) {
      m.sha256Hash = this.activeCut.sha256Hash || 'e89a42f11c7b8d0e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e';
    }

    const proj = this.projects.find((p) => p.projectId === this.selectedProjectId);
    if (proj) {
      proj.disbursedCOP += m.grossAmountCOP;
      proj.status = 'certified';
    }

    const evt = this.calendarEvents.find((e) => e.id === 'EVT-04');
    if (evt) {
      evt.status = 'completado';
    }

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:35:00',
      category: 'desembolso',
      severity: 'alta',
      actionTitle: `Autorización y Giro Bancario ACH — Hito #${m.milestoneNumber} (${m.title})`,
      summary: `Comité Fiduciario aprobó giro neto por ${formatCOP(m.netDisbursementCOP)} a cuenta ${m.beneficiaryAccount} con retención del 5%.`,
      actorName: this.currentUser.fullName.split('(')[0].trim(),
      actorRole: 'fiduciaria',
      actorCompany: this.activeCut.fiduciaryEntity,
      actorDocument: this.currentUser.licenseNumber,
      moduleRoute: '/fiduciaria',
      previousState: `Hito #${m.milestoneNumber}: ${prevStatus}`,
      newState: `Hito #${m.milestoneNumber}: desembolsado (${m.achReference})`,
      amountCOP: m.netDisbursementCOP,
      sha256Hash: m.sha256Hash,
      stellarTxHash: m.stellarTxHash,
      ledgerSequence: 54984512 + this.auditLogs.length,
      geofenceOrIp: 'Comité Fiduciario Digital • TLS 1.3',
      signatureMethod: 'Multifirma Fiduciaria + Sello Soroban'
    });
  }

  submitConstructorMilestone(milestoneId: string) {
    const m = this.milestones.find((item) => item.id === milestoneId);
    if (!m) return;
    const prevStatus = m.status;
    m.constructorSubmitted = true;
    if (m.status === 'en_ejecucion') {
      m.status = 'listo_para_giro';
    }

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:34:10',
      category: 'desembolso',
      severity: 'alta',
      actionTitle: `Radicación Formal de Cobro Constructora — Hito #${m.milestoneNumber}`,
      summary: `Constructora radicó Factura Electrónica DIAN y Planilla PILA al día para someter el Hito #${m.milestoneNumber} (${m.title}) a Comité Fiduciario.`,
      actorName: 'Arq. Camilo Restrepo',
      actorRole: 'constructor',
      actorCompany: this.activeCut.developerName,
      actorDocument: 'NIT 860.034.313-7',
      moduleRoute: '/fiduciaria',
      previousState: `Hito #${m.milestoneNumber}: ${prevStatus}`,
      newState: `Hito #${m.milestoneNumber}: listo_para_giro (Radicado en Comité)`,
      amountCOP: m.netDisbursementCOP,
      sha256Hash: this.activeCut.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
      stellarTxHash: this.activeCut.stellarTxHash || '0x94fa82e10bc37192d04e771a83c5910b44e821c07a9381f2c65018b39a7421ef',
      ledgerSequence: 54984310 + this.auditLogs.length,
      geofenceOrIp: 'Portal Constructora • Firma Representante Legal',
      signatureMethod: 'Factura Electrónica DIAN + Token 2FA'
    });
  }

  addMandatoryDocument(doc: {
    category: MandatoryDocument['category'];
    title: string;
    issuer: string;
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    responsibleEntity: MandatoryDocument['responsibleEntity'];
    summary: string;
  }) {
    const randomHash =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    this.mandatoryDocs.unshift({
      id: `DOC-NEW-${this.mandatoryDocs.length + 1}`,
      ...doc,
      status: 'vigente',
      sha256Hash: randomHash
    });

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:33:00',
      category: 'cumplimiento',
      severity: 'media',
      actionTitle: `Radicación y Sellado de Documento Legal — ${doc.title}`,
      summary: `Expediente #${doc.documentNumber} emitido por ${doc.issuer} incorporado al repositorio fiduciario con hash SHA-256 en Stellar.`,
      actorName: this.currentUser.fullName.split('(')[0].trim(),
      actorRole: this.effectiveRole === 'constructor' ? 'constructor' : 'fiduciaria',
      actorCompany: this.currentUser.companyName,
      actorDocument: doc.documentNumber,
      moduleRoute: '/cumplimiento',
      previousState: 'Sin registro en expediente activo',
      newState: `Documento Vigente (Vence: ${doc.expiryDate})`,
      sha256Hash: randomHash,
      stellarTxHash: `0x${randomHash.slice(0, 62)}`,
      ledgerSequence: 54984100 + this.auditLogs.length,
      geofenceOrIp: 'Repositorio Legal Fiduciario • TLS 1.3',
      signatureMethod: 'Sello Criptográfico SHA-256 en Soroban'
    });
  }

  addCalendarEvent(evt: {
    date: string;
    title: string;
    category: ProjectCalendarEvent['category'];
    responsible: string;
    description: string;
    amountCOP?: number;
  }) {
    const parts = evt.date.split('-');
    const dayNum = parseInt(parts[2] || '12', 10);
    const monthNames: Record<string, string> = {
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dic'
    };
    const monthShort = monthNames[parts[1]] || 'Oct';
    this.calendarEvents.push({
      id: `EVT-0${this.calendarEvents.length + 1}`,
      date: evt.date,
      dayNumber: dayNum,
      monthShort,
      title: evt.title,
      category: evt.category,
      status: 'programado',
      responsible: evt.responsible,
      description: evt.description,
      amountCOP: evt.amountCOP
    });
  }

  resolveTechnicalFinding(findingId: string) {
    const f = this.technicalFindings.find((item) => item.id === findingId);
    if (!f) return;
    f.status = 'subsanado';
    f.resolvedDate = '2026-10-12';
    f.blocksDisbursement = false;

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:32:00',
      category: 'hallazgo_ncr',
      severity: 'media',
      actionTitle: `Subsanación Aprobada en Campo — ${f.code} (${f.title})`,
      summary: `Interventoría verificó la acción correctiva en Piso ${f.floorLevel} (${f.locationAxis}) y levantó la restricción para comité de giro.`,
      actorName: this.activeCut.interventorName,
      actorRole: 'interventor',
      actorCompany: 'ConTech Interventoría S.A.S.',
      actorDocument: 'COPNIA 25202-094812 CND',
      moduleRoute: '/interventor',
      previousState: `${f.code}: Abierto (${f.severity})`,
      newState: `${f.code}: Subsanado y Liberado`,
      sha256Hash: this.activeCut.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
      stellarTxHash: this.activeCut.stellarTxHash || '0x94fa82e10bc37192d04e771a83c5910b44e821c07a9381f2c65018b39a7421ef',
      ledgerSequence: 54983950 + this.auditLogs.length,
      geofenceOrIp: `GPS Obra Piso ${f.floorLevel} • Geocerca Validada`,
      signatureMethod: 'Firma Pericial COPNIA + Registro Stellar'
    });
  }

  addTechnicalFinding(finding: {
    floorLevel: number;
    locationAxis: string;
    severity: TechnicalFinding['severity'];
    title: string;
    description: string;
    correctiveAction: string;
  }) {
    const num = this.technicalFindings.length + 1;
    const code = `NCR-2026-0${20 + num}`;
    this.technicalFindings.unshift({
      id: `NCR-0${num}`,
      code,
      floorLevel: finding.floorLevel,
      locationAxis: finding.locationAxis,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      correctiveAction: finding.correctiveAction,
      reportedDate: '2026-10-12',
      status: 'abierto',
      blocksDisbursement: finding.severity === 'critica'
    });

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:31:00',
      category: 'hallazgo_ncr',
      severity: finding.severity === 'critica' ? 'alta' : 'media',
      actionTitle: `Apertura de Hallazgo Técnico (NCR) — ${code}`,
      summary: `Interventoría reportó hallazgo (${finding.severity}) en Piso ${finding.floorLevel} (${finding.locationAxis}): ${finding.title}.`,
      actorName: this.activeCut.interventorName,
      actorRole: 'interventor',
      actorCompany: 'ConTech Interventoría S.A.S.',
      actorDocument: 'COPNIA 25202-094812 CND',
      moduleRoute: '/interventor',
      previousState: `Piso ${finding.floorLevel}: Sin restricción en eje`,
      newState: `${code}: Abierto (${finding.severity === 'critica' ? 'Bloquea giro' : 'En seguimiento'})`,
      sha256Hash: this.activeCut.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
      stellarTxHash: this.activeCut.stellarTxHash || '0x94fa82e10bc37192d04e771a83c5910b44e821c07a9381f2c65018b39a7421ef',
      ledgerSequence: 54983800 + this.auditLogs.length,
      geofenceOrIp: `GPS Obra Piso ${finding.floorLevel} • Geocerca Validada`,
      signatureMethod: 'Firma Pericial COPNIA'
    });
  }

  validateUnitSnagItem(snagId: string) {
    const item = this.unitSnagItems.find((s) => s.id === snagId);
    if (!item || item.status === 'validado_propietario') return;
    const prev = item.status;
    item.status = 'validado_propietario';
    item.resolvedDate = '2026-10-12';

    const randomHash =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:50:12',
      category: 'comercial',
      severity: 'informativa',
      actionTitle: `Visto Bueno Posventa Propietario — ${item.code} (Apto ${item.unitNumber})`,
      summary: `El propietario ${item.ownerName} aprobó la corrección en ${item.roomZone}: "${item.title}".`,
      actorName: item.ownerName,
      actorRole: 'sistema',
      actorCompany: `Propietario Apto ${item.unitNumber}`,
      actorDocument: 'Firma Digital Portal Propietario',
      moduleRoute: '/propietario',
      previousState: `${item.code}: ${prev}`,
      newState: `${item.code}: validado_propietario (Recibido a satisfacción)`,
      sha256Hash: randomHash,
      stellarTxHash: `0x${randomHash.slice(0, 62)}`,
      ledgerSequence: 54984900 + this.auditLogs.length,
      geofenceOrIp: `Portal Propietario • Apto ${item.unitNumber}`,
      signatureMethod: 'Token Cédula Verificada + Sello Stellar'
    });
  }

  addUnitSnagItem(payload: {
    unitNumber: string;
    floorLevel: number;
    ownerName: string;
    roomZone: string;
    category: UnitSnagItem['category'];
    title: string;
    description: string;
  }) {
    const num = this.unitSnagItems.length + 1;
    const code = `POS-${payload.unitNumber}-0${num}`;
    this.unitSnagItems.unshift({
      id: `SNAG-0${num}`,
      code,
      unitNumber: payload.unitNumber,
      floorLevel: payload.floorLevel,
      ownerName: payload.ownerName,
      roomZone: payload.roomZone,
      category: payload.category,
      title: payload.title,
      description: payload.description,
      status: 'corregido_por_validar',
      reportedDate: '2026-10-12',
      resolvedDate: '2026-10-12'
    });

    const randomHash =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:51:00',
      category: 'comercial',
      severity: 'media',
      actionTitle: `Reporte de Detalle Pre-Entrega (Snag List) — ${code}`,
      summary: `Propietario de Apto ${payload.unitNumber} registró observación en ${payload.roomZone}: "${payload.title}".`,
      actorName: payload.ownerName,
      actorRole: 'sistema',
      actorCompany: `Propietario Apto ${payload.unitNumber}`,
      actorDocument: 'Portal de Pre-Entrega Digital',
      moduleRoute: '/propietario',
      previousState: `Apto ${payload.unitNumber}: Sin observación en ${payload.roomZone}`,
      newState: `${code}: Registrado en lista de pre-entrega`,
      sha256Hash: randomHash,
      stellarTxHash: `0x${randomHash.slice(0, 62)}`,
      ledgerSequence: 54984950 + this.auditLogs.length,
      geofenceOrIp: `Portal Propietario • Apto ${payload.unitNumber}`,
      signatureMethod: 'Registro Digital Pre-Entrega'
    });
  }

  signUnitHandoverAct(unitNumber: string, ownerName: string) {
    const randomHash =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = `0x${randomHash.slice(0, 62)}`;
    this.signedHandoverUnits = {
      ...this.signedHandoverUnits,
      [unitNumber]: {
        signedAt: '2026-10-12 19:52 COT',
        txHash
      }
    };

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:52:00',
      category: 'blockchain_soroban',
      severity: 'alta',
      actionTitle: `Firma de Acta Digital de Entrega a Satisfacción — Apto ${unitNumber}`,
      summary: `Con 100% de ítems de pre-entrega validados, ${ownerName} firmó el Acta de Recibo del Apto ${unitNumber}, habilitando liberación de retención fiduciaria.`,
      actorName: ownerName,
      actorRole: 'sistema',
      actorCompany: `Adherente Fiduciario Apto ${unitNumber}`,
      actorDocument: 'Acta Digital de Entrega Ley 1796',
      moduleRoute: '/propietario',
      previousState: `Apto ${unitNumber}: En pre-entrega técnica`,
      newState: `Apto ${unitNumber}: Acta de Entrega Firmada en Stellar`,
      sha256Hash: randomHash,
      stellarTxHash: txHash,
      ledgerSequence: 54985010 + this.auditLogs.length,
      geofenceOrIp: `Inmueble Apto ${unitNumber} • Firma Biométrica / Token`,
      signatureMethod: 'Firma Criptográfica Soroban Handover Registry'
    });
  }

  releaseRetentionGuaranteeFund(amountCOP: number) {
    if (this.retentionReleased) return;
    this.retentionReleased = true;

    const randomHash =
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    this.auditLogs.unshift({
      id: `AUD-2026-00${this.auditLogs.length + 1}`,
      timestamp: '2026-10-12 19:54:00',
      category: 'desembolso',
      severity: 'alta',
      actionTitle: 'Liberación de Fondo de Retención en Garantía (5%) — Cierre Posventa',
      summary: `Verificadas las actas de entrega sin pendientes y vigencia de Póliza Decenal, Fiduciaria libera el fondo de retención acumulado por ${formatCOP(amountCOP)}.`,
      actorName: 'Dra. Carolina Mendoza',
      actorRole: 'fiduciaria',
      actorCompany: this.activeCut.fiduciaryEntity,
      actorDocument: 'Comité Fiduciario de Liquidación de Garantía',
      moduleRoute: '/fiduciaria',
      previousState: 'Fondo Retención 5%: Retenido en garantía posventa',
      newState: 'Fondo Retención 5%: Liberado y girado a Constructora (ACH)',
      amountCOP,
      sha256Hash: randomHash,
      stellarTxHash: `0x${randomHash.slice(0, 62)}`,
      ledgerSequence: 54985120 + this.auditLogs.length,
      geofenceOrIp: 'Nodo Bancario Fiduciaria • TLS 1.3',
      signatureMethod: 'Multifirma Fiduciaria + Smart Contract Soroban'
    });
  }
}


export const projectStore = new ProjectStore();

export function formatCOP(value: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

