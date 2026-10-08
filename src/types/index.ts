export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'TRANSFERRED';

export interface LicenseRecord {
  licenseId: string; // e.g. "BL-2026-000001"
  blockchainLicenseId: number; // 1, 2, 3...
  softwareName: string;
  version: string;
  licenseType: 'Standard' | 'Professional' | 'Enterprise' | 'Developer' | 'OEM';
  ownerWallet: string;
  customerName: string;
  customerEmail: string;
  softwareHash: string; // SHA-256
  transactionHash: string;
  contractAddress: string;
  issuedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  createdAt: string;
}

export interface VerificationLog {
  id: string;
  licenseId: string;
  verificationType: 'LICENSE_ID' | 'FILE_HASH' | 'QR_SCAN' | 'TRANSFER' | 'REVOCATION';
  result: 'AUTHENTIC' | 'HASH_MISMATCH' | 'VALID' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'TRANSFERRED';
  timestamp: string;
  details?: string;
  ownerWallet?: string;
}

export interface OwnershipEvent {
  licenseId: string;
  type: 'MINT' | 'TRANSFER' | 'REVOCATION';
  from: string;
  to: string;
  transactionHash: string;
  timestamp: string;
  blockNumber: number;
  reason?: string;
}

export interface DashboardMetrics {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  transferredLicenses: number;
}
