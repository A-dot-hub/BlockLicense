import { LicenseRecord, VerificationLog, OwnershipEvent } from '../types';
import contractConfig from '../contracts/SoftwareLicenseConfig.json';

const STORAGE_KEY_LICENSES = 'blocklicense_licenses_v1';
const STORAGE_KEY_LOGS = 'blocklicense_logs_v1';
const STORAGE_KEY_EVENTS = 'blocklicense_events_v1';

const INITIAL_LICENSES: LicenseRecord[] = [
  {
    licenseId: 'BL-2026-000001',
    blockchainLicenseId: 1,
    softwareName: 'SecureSuite Pro',
    version: '4.2.1',
    licenseType: 'Enterprise',
    ownerWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    customerName: 'Abhishek Jaiswar',
    customerEmail: 'abhishek@enterprise.corp',
    softwareHash: 'a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6',
    transactionHash: '0x8a91b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
    contractAddress: contractConfig.address,
    issuedAt: '2026-10-01T10:00:00Z',
    expiresAt: '2027-10-01T10:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    licenseId: 'BL-2026-000002',
    blockchainLicenseId: 2,
    softwareName: 'DataShield Architect',
    version: '2.0.4',
    licenseType: 'Professional',
    ownerWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@fintech.io',
    softwareHash: 'b5e8c1f9d4a2b0e6c8f4a2d0b8e6c4a2f0e8d6b4c2a0f8e6d4c2b0a8f6e4d2b0',
    transactionHash: '0x4b5c6d7e8f90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a',
    contractAddress: contractConfig.address,
    issuedAt: '2025-01-15T09:00:00Z',
    expiresAt: '2025-10-01T09:00:00Z',
    status: 'EXPIRED',
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    licenseId: 'BL-2026-000003',
    blockchainLicenseId: 3,
    softwareName: 'CloudGuard Sentinel',
    version: '1.8.0',
    licenseType: 'Developer',
    ownerWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@devlabs.tech',
    softwareHash: 'c7d2e9f4a1b8c0e3d6f9a2b5c8e1d4f7a0b3c6e9d2f5a8b1c4e7d0f3a6b9c2e5',
    transactionHash: '0x90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a4b5c6d7e8f',
    contractAddress: contractConfig.address,
    issuedAt: '2026-03-10T12:00:00Z',
    expiresAt: '2027-03-10T12:00:00Z',
    status: 'REVOKED',
    createdAt: '2026-03-10T12:00:00Z'
  }
];

const INITIAL_LOGS: VerificationLog[] = [
  {
    id: 'log-1',
    licenseId: 'BL-2026-000001',
    verificationType: 'LICENSE_ID',
    result: 'VALID',
    timestamp: '2026-10-08T02:45:12Z',
    details: 'On-chain verification verified authentic contract state',
    ownerWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  },
  {
    id: 'log-2',
    licenseId: 'BL-2026-000001',
    verificationType: 'FILE_HASH',
    result: 'AUTHENTIC',
    timestamp: '2026-10-08T01:30:00Z',
    details: 'SHA-256 match for SecureSuitePro-v4.2.1.bin'
  },
  {
    id: 'log-3',
    licenseId: 'BL-2026-000002',
    verificationType: 'LICENSE_ID',
    result: 'EXPIRED',
    timestamp: '2026-10-07T21:10:00Z',
    details: 'Expired on 2025-10-01'
  },
  {
    id: 'log-4',
    licenseId: 'BL-2026-000003',
    verificationType: 'LICENSE_ID',
    result: 'REVOKED',
    timestamp: '2026-10-07T18:05:00Z',
    details: 'Revoked by vendor admin'
  }
];

const INITIAL_EVENTS: OwnershipEvent[] = [
  {
    licenseId: 'BL-2026-000001',
    type: 'MINT',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    transactionHash: '0x8a91b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
    timestamp: '2026-10-01T10:00:00Z',
    blockNumber: 1042
  },
  {
    licenseId: 'BL-2026-000002',
    type: 'MINT',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    transactionHash: '0x4b5c6d7e8f90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a',
    timestamp: '2025-01-15T09:00:00Z',
    blockNumber: 820
  },
  {
    licenseId: 'BL-2026-000003',
    type: 'MINT',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    transactionHash: '0x90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a4b5c6d7e8f',
    timestamp: '2026-03-10T12:00:00Z',
    blockNumber: 915
  },
  {
    licenseId: 'BL-2026-000003',
    type: 'REVOCATION',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x0000000000000000000000000000000000000000',
    transactionHash: '0xfa123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a4b5c6d7e8f',
    timestamp: '2026-03-12T15:30:00Z',
    blockNumber: 928,
    reason: 'Vendor EULA violation'
  }
];

export const StorageService = {
  getLicenses(): LicenseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_LICENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(INITIAL_LICENSES));
      return INITIAL_LICENSES;
    }
    try {
      const list: LicenseRecord[] = JSON.parse(raw);
      // dynamically compute expiry check
      const now = new Date();
      return list.map(l => {
        if (l.status === 'ACTIVE' && new Date(l.expiresAt) < now) {
          return { ...l, status: 'EXPIRED' };
        }
        return l;
      });
    } catch {
      return INITIAL_LICENSES;
    }
  },

  getLicenseById(id: string): LicenseRecord | undefined {
    const licenses = this.getLicenses();
    const cleanId = id.trim().toUpperCase();
    return licenses.find(l => l.licenseId.toUpperCase() === cleanId);
  },

  getLicenseByHash(sha256Hash: string): LicenseRecord | undefined {
    const licenses = this.getLicenses();
    const clean = sha256Hash.toLowerCase().replace(/^0x/, '');
    return licenses.find(l => l.softwareHash.toLowerCase().replace(/^0x/, '') === clean);
  },

  saveLicense(license: LicenseRecord): void {
    const licenses = this.getLicenses();
    const existingIndex = licenses.findIndex(l => l.licenseId === license.licenseId);
    if (existingIndex >= 0) {
      licenses[existingIndex] = license;
    } else {
      licenses.unshift(license);
    }
    localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(licenses));

    // Record mint ownership event
    this.addOwnershipEvent({
      licenseId: license.licenseId,
      type: 'MINT',
      from: contractConfig.companyAdmin,
      to: license.ownerWallet,
      transactionHash: license.transactionHash,
      timestamp: license.issuedAt,
      blockNumber: Math.floor(1000 + Math.random() * 500)
    });
  },

  transferLicense(licenseId: string, newOwnerWallet: string, txHash: string): LicenseRecord | null {
    const licenses = this.getLicenses();
    const target = licenses.find(l => l.licenseId.toUpperCase() === licenseId.toUpperCase());
    if (!target) return null;

    const previousOwner = target.ownerWallet;
    target.ownerWallet = newOwnerWallet;
    // Remains active under new owner
    target.status = 'ACTIVE';

    localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(licenses));

    this.addOwnershipEvent({
      licenseId: target.licenseId,
      type: 'TRANSFER',
      from: previousOwner,
      to: newOwnerWallet,
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(1500 + Math.random() * 200)
    });

    this.addLog({
      id: 'log-' + Date.now(),
      licenseId: target.licenseId,
      verificationType: 'TRANSFER',
      result: 'TRANSFERRED',
      timestamp: new Date().toISOString(),
      details: `Ownership transferred from ${previousOwner.slice(0, 8)}... to ${newOwnerWallet.slice(0, 8)}...`,
      ownerWallet: newOwnerWallet
    });

    return target;
  },

  revokeLicense(licenseId: string, reason: string, txHash: string, adminWallet: string): LicenseRecord | null {
    const licenses = this.getLicenses();
    const target = licenses.find(l => l.licenseId.toUpperCase() === licenseId.toUpperCase());
    if (!target) return null;

    target.status = 'REVOKED';
    localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(licenses));

    this.addOwnershipEvent({
      licenseId: target.licenseId,
      type: 'REVOCATION',
      from: adminWallet || contractConfig.companyAdmin,
      to: '0x0000000000000000000000000000000000000000',
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(1700 + Math.random() * 200),
      reason
    });

    this.addLog({
      id: 'log-' + Date.now(),
      licenseId: target.licenseId,
      verificationType: 'REVOCATION',
      result: 'REVOKED',
      timestamp: new Date().toISOString(),
      details: `Revocation executed. Reason: ${reason}`
    });

    return target;
  },

  generateNextLicenseId(): { readableId: string; numericId: number } {
    const licenses = this.getLicenses();
    const currentYear = new Date().getFullYear();
    const highestNumeric = licenses.reduce((max, l) => Math.max(max, l.blockchainLicenseId || 0), 0);
    const nextNumeric = highestNumeric + 1;
    const formattedNum = String(nextNumeric).padStart(6, '0');
    return {
      readableId: `BL-${currentYear}-${formattedNum}`,
      numericId: nextNumeric
    };
  },

  getVerificationLogs(): VerificationLog[] {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(log: VerificationLog): void {
    const logs = this.getVerificationLogs();
    logs.unshift(log);
    // keep max 50
    if (logs.length > 50) logs.pop();
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  },

  getOwnershipEvents(licenseId?: string): OwnershipEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    let events: OwnershipEvent[] = INITIAL_EVENTS;
    if (raw) {
      try {
        events = JSON.parse(raw);
      } catch {
        events = INITIAL_EVENTS;
      }
    } else {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_EVENTS));
    }

    if (licenseId) {
      return events.filter(e => e.licenseId.toUpperCase() === licenseId.toUpperCase());
    }
    return events;
  },

  addOwnershipEvent(event: OwnershipEvent): void {
    const events = this.getOwnershipEvents();
    events.unshift(event);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  },

  resetToDemo(): void {
    localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(INITIAL_LICENSES));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
};
