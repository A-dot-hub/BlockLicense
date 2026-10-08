"""
Seed script for BlockLicense MongoDB database.
Run this to populate initial licenses and verification logs for testing.
"""
from datetime import datetime, timezone
from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "blocklicense_db")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

sample_licenses = [
    {
        "licenseId": "BL-2026-000001",
        "blockchainLicenseId": 1,
        "softwareName": "SecureSuite Pro",
        "version": "4.2.1",
        "licenseType": "Enterprise",
        "ownerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "customerName": "Abhishek Jaiswar",
        "customerEmail": "abhishek@enterprise.corp",
        "softwareHash": "a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6",
        "transactionHash": "0x8a91b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "issuedAt": "2026-10-01T10:00:00Z",
        "expiresAt": "2027-10-01T10:00:00Z",
        "status": "ACTIVE",
        "createdAt": "2026-10-01T10:00:00Z"
    },
    {
        "licenseId": "BL-2026-000002",
        "blockchainLicenseId": 2,
        "softwareName": "DataShield Architect",
        "version": "2.0.4",
        "licenseType": "Professional",
        "ownerWallet": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "customerName": "Rahul Verma",
        "customerEmail": "rahul.verma@fintech.io",
        "softwareHash": "b5e8c1f9d4a2b0e6c8f4a2d0b8e6c4a2f0e8d6b4c2a0f8e6d4c2b0a8f6e4d2b0",
        "transactionHash": "0x4b5c6d7e8f90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "issuedAt": "2025-01-15T09:00:00Z",
        "expiresAt": "2025-10-01T09:00:00Z",
        "status": "EXPIRED",
        "createdAt": "2025-01-15T09:00:00Z"
    },
    {
        "licenseId": "BL-2026-000003",
        "blockchainLicenseId": 3,
        "softwareName": "CloudGuard Sentinel",
        "version": "1.8.0",
        "licenseType": "Developer",
        "ownerWallet": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "customerName": "Elena Rostova",
        "customerEmail": "elena@devlabs.tech",
        "softwareHash": "c7d2e9f4a1b8c0e3d6f9a2b5c8e1d4f7a0b3c6e9d2f5a8b1c4e7d0f3a6b9c2e5",
        "transactionHash": "0x90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a4b5c6d7e8f",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "issuedAt": "2026-03-10T12:00:00Z",
        "expiresAt": "2027-03-10T12:00:00Z",
        "status": "REVOKED",
        "createdAt": "2026-03-10T12:00:00Z"
    }
]

print("Seeding licenses into MongoDB...")
for lic in sample_licenses:
    db.licenses.update_one({"licenseId": lic["licenseId"]}, {"$set": lic}, upsert=True)
    print(f"Upserted: {lic['licenseId']} ({lic['softwareName']} - {lic['status']})")

print("Seeding complete!")
