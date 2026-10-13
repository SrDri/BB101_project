export type FloorStatus = 'certified' | 'reviewing' | 'in_progress' | 'planned';

export type UserRole = 'admin' | 'fiduciaria' | 'constructor' | 'interventor';

export type ProjectLifecycleStatus = 'in_progress' | 'upcoming' | 'completed';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  companyName: string;
  licenseNumber: string;
  avatarInitials: string;
}

export interface ActivityBreakdown {
  id: string;
  name: string;
  scheduledPercent: number;
  aiEstimatedPercent: number;
  calibratedPercent: number;
  variance: number;
  confidenceScore: number;
}

export interface PhotoEvidence {
  id: string;
  thumbnailUrl: string;
  fullUrl: string;
  title: string;
  location: string;
  timestamp: string;
  gps: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  faceBlurApplied: boolean;
  duplicateChecked: boolean;
  aiDetectedElements: string[];
}

export interface FloorData {
  id: number;
  levelNumber: number;
  name: string;
  status: FloorStatus;
  completionPercent: number;
  scheduledPercent: number;
  hashSha256?: string;
  stellarTx?: string;
  lastUpdated: string;
  activities: ActivityBreakdown[];
  photos: PhotoEvidence[];
}

export interface ProjectCut {
  id: string;
  projectId: string;
  code: string;
  city: string;
  address: string;
  fiduciaryTrustCode: string;
  lifecycleStatus: ProjectLifecycleStatus;
  number: number;
  totalCutsPlanned: number;
  projectName: string;
  developerName: string;
  fiduciaryEntity: string;
  interventorName: string;
  interventorId: string;
  status: 'certified' | 'in_review' | 'pending';
  totalBudgetCOP: number;
  disbursedCOP: number;
  cutDisbursementCOP: number;
  scheduledPhysicalProgress: number;
  certifiedPhysicalProgress: number;
  sha256Hash?: string;
  stellarTxHash?: string;
  stellarLedgerSequence?: number;
  certificationTimestamp?: string;
  floors: FloorData[];
}

export interface OwnerRoomProgress {
  id: string;
  name: string;
  areaM2: number;
  percent: number;
  status: 'completado' | 'en_ejecucion' | 'pendiente';
  description: string;
}

export interface OwnerPhotoEvidence {
  id: string;
  scope: 'unit' | 'project';
  roomOrArea: string;
  title: string;
  timestamp: string;
  thumbnailUrl: string;
  fullUrl: string;
  inspectorNote: string;
  aiDetectedElements: string[];
  gpsVerified: boolean;
}

export interface PropertyOwnerUnit {
  cedula: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  projectId: string;
  projectName: string;
  city: string;
  address: string;
  fiduciaryEntity: string;
  fiduciaryEncargoCode: string;
  unitNumber: string;
  tower: string;
  floorLevel: number;
  unitPositionInFloor?: 1 | 2 | 3 | 4;
  orientationLabel?: string;
  areaM2: number;
  typology: string;
  parkingSpot: string;
  estimatedDeliveryDate: string;
  unitStatus: 'estructura_completada' | 'en_acabados' | 'listo_entrega' | 'en_cimentacion';
  unitProgressPercent: number;
  financialPlan: {
    totalUnitValueCOP: number;
    downPaymentGoalCOP: number;
    downPaymentPaidCOP: number;
    installmentsPaid: number;
    installmentsTotal: number;
    nextInstallmentDate: string;
  };
  unitActivities: {
    name: string;
    percent: number;
    status: 'completado' | 'en_ejecucion' | 'pendiente';
  }[];
  unitRooms?: OwnerRoomProgress[];
  unitPhotos?: OwnerPhotoEvidence[];
  projectPhotos?: OwnerPhotoEvidence[];
}

export interface ProjectAmenity {
  id: string;
  name: string;
  category: 'recreacion' | 'bienestar' | 'social' | 'infraestructura';
  description: string;
  progressPercent: number;
  status: 'completado' | 'en_obra' | 'proyectado';
}

export interface ApartmentTypology {
  id: string;
  code: string;
  name: string;
  areaBuiltM2: number;
  areaPrivateM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  totalUnits: number;
  soldUnits: number;
  priceFromCOP: number;
  floorRange: string;
  features: string[];
}

export interface ProjectFichaDetails {
  description: string;
  propertyType: 'Apartamentos residenciales' | 'Casas en conjunto' | 'Uso mixto y corporativo' | 'Vivienda VIS';
  stratum: string;
  totalTowers: number;
  totalUnits: number;
  soldUnits: number;
  reservedUnits: number;
  availableUnits: number;
  equilibriumPointPercent: number;
  currentSalesPercent: number;
  startDate: string;
  estimatedDelivery: string;
  developerProfile: {
    name: string;
    nit: string;
    legalRepresentative: string;
    experienceYears: number;
    completedProjectsCount: number;
    creditRating: string;
    address: string;
    email: string;
  };
  supervisorProfile: {
    name: string;
    companyName: string;
    copniaLicense: string;
    roleTitle: string;
    experienceYears: number;
    rcPolicyNumber: string;
    independenceVerified: boolean;
  };
  amenities: ProjectAmenity[];
  typologies: ApartmentTypology[];
}

export interface MandatoryDocument {
  id: string;
  category: 'licencias' | 'polizas' | 'fiduciarios' | 'tecnicos';
  title: string;
  issuer: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'vigente' | 'en_renovacion' | 'pendiente';
  responsibleEntity: 'Constructora' | 'Interventoría' | 'Fiduciaria';
  sha256Hash: string;
  summary: string;
}

export interface LegalComplianceItem {
  id: string;
  entityType: 'constructora' | 'interventor';
  requirement: string;
  regulationRef: string;
  status: 'cumple' | 'en_revision' | 'pendiente';
  verificationDate: string;
  verifiedBy: string;
  notes: string;
}

export interface ProjectCalendarEvent {
  id: string;
  date: string;
  dayNumber: number;
  monthShort: string;
  title: string;
  category: 'corte_obra' | 'desembolso' | 'inspeccion' | 'legal' | 'entrega';
  status: 'completado' | 'en_curso' | 'programado';
  responsible: string;
  description: string;
  amountCOP?: number;
}

export interface FiduciaryMilestone {
  id: string;
  milestoneNumber: number;
  cutNumber: number;
  title: string;
  description: string;
  targetPhysicalPercent: number;
  certifiedPhysicalPercent: number;
  grossAmountCOP: number;
  retentionFivePercentCOP: number;
  netDisbursementCOP: number;
  status: 'desembolsado' | 'listo_para_giro' | 'en_ejecucion' | 'programado';
  dueDate: string;
  disbursedDate?: string;
  achReference?: string;
  beneficiaryAccount: string;
  stellarTxHash?: string;
  sha256Hash?: string;
  constructorSubmitted: boolean;
  interventorSigned: boolean;
  legalDocsVerified: boolean;
}

export interface TechnicalFinding {
  id: string;
  code: string;
  floorLevel: number;
  locationAxis: string;
  severity: 'critica' | 'moderada' | 'menor';
  title: string;
  description: string;
  correctiveAction: string;
  reportedDate: string;
  resolvedDate?: string;
  status: 'abierto' | 'subsanado';
  blocksDisbursement: boolean;
}

export interface MaterialLabTest {
  id: string;
  testType: 'concreto_28d' | 'acero_traccion' | 'esclerometria' | 'hidrostatica';
  title: string;
  laboratory: string;
  floorLevel: number;
  sampleDate: string;
  targetSpec: string;
  obtainedResult: string;
  compliancePercent: number;
  status: 'aprobado' | 'en_curado';
  certificateCode: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: 'desembolso' | 'interventoria' | 'cumplimiento' | 'hallazgo_ncr' | 'blockchain_soroban' | 'comercial';
  severity: 'alta' | 'media' | 'informativa';
  actionTitle: string;
  summary: string;
  actorName: string;
  actorRole: 'fiduciaria' | 'interventor' | 'constructor' | 'sistema';
  actorCompany: string;
  actorDocument: string;
  moduleRoute: string;
  previousState?: string;
  newState?: string;
  amountCOP?: number;
  sha256Hash: string;
  stellarTxHash: string;
  ledgerSequence: number;
  geofenceOrIp: string;
  signatureMethod: string;
}

export interface UnitSnagItem {
  id: string;
  code: string;
  unitNumber: string;
  floorLevel: number;
  ownerName: string;
  roomZone: string;
  category: 'acabados' | 'carpinteria' | 'hidrosanitario' | 'ventaneria';
  title: string;
  description: string;
  status: 'pendiente_constructora' | 'corregido_por_validar' | 'validado_propietario';
  reportedDate: string;
  resolvedDate?: string;
}
