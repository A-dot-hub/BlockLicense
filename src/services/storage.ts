import { LicenseRecord, VerificationLog, OwnershipEvent } from '../types';
import contractConfig from '../contracts/SoftwareLicenseConfig.json';

const STORAGE_KEY_LICENSES = 'blocklicense_licenses_v1';
const STORAGE_KEY_LOGS = 'blocklicense_logs_v1';
const STORAGE_KEY_EVENTS = 'blocklicense_events_v1';

const INITIAL_LICENSES: LicenseRecord[] = [];
const INITIAL_LOGS: VerificationLog[] = [];
const INITIAL_EVENTS: OwnershipEvent[] = [];

export const StorageService = {
  getLicenses(): LicenseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_LICENSES);
    if (!raw) {
      return [];
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
      return [];
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
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
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
    let events: OwnershipEvent[] = [];
    if (raw) {
      try {
        events = JSON.parse(raw);
      } catch {
        events = [];
      }
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

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY_LICENSES);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_EVENTS);
  },

  resetToDemo(): void {
    this.clearAllData();
  }
};
