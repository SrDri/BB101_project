import type { ActivityBreakdown, PhotoEvidence } from './twin';

export interface CertificateMetadata {
  projectId: string;
  projectName: string;
  corteNumber: number;
  periodStart: string;
  periodEnd: string;
  interventor: {
    fullName: string;
    professionalLicense: string;
    stellarPublicKey: string;
  };
  financialSummary: {
    totalProjectBudgetCOP: number;
    cutDisbursementCOP: number;
    previousCumulativeDisbursedCOP: number;
  };
  metrics: {
    scheduledProgressPercent: number;
    aiAssistedProgressPercent: number;
    finalCertifiedProgressPercent: number;
    variancePercent: number;
  };
  activities: ActivityBreakdown[];
  evidencePhotosSummary: {
    totalPhotos: number;
    allGeotagged: boolean;
    allFaceBlurred: boolean;
    merkleRootPhotos: string;
  };
}

export interface IssuedCertificate {
  certificateId: string;
  metadata: CertificateMetadata;
  sha256Hash: string;
  issuedAt: string;
  stellarSoroban: {
    network: 'testnet';
    contractId: string;
    transactionHash: string;
    ledgerSequence: number;
    blockTimestamp: string;
    sponsoredBy: string;
  };
}

