/**
 * Browser-native SHA-256 File & Data Hashing Utility
 * Uses Web Crypto API for high-speed cryptographic digests
 */

export async function computeFileSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash.toLowerCase();
}

export async function computeTextSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

export function formatBytes32(hexHash: string): string {
  const clean = hexHash.replace(/^0x/, '');
  return '0x' + clean.padEnd(64, '0').slice(0, 64);
}

export function compareHashes(hashA: string, hashB: string): boolean {
  const cleanA = hashA.trim().toLowerCase().replace(/^0x/, '');
  const cleanB = hashB.trim().toLowerCase().replace(/^0x/, '');
  return cleanA === cleanB;
}
