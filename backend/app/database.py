import logging
from typing import Dict, Any, List, Optional
import pymongo
from pymongo import MongoClient
from app.config import settings

logger = logging.getLogger("blocklicense.database")

class DatabaseManager:
    """
    Manages MongoDB connections with an integrated resilient memory fallback.
    Ensures seamless operation during local hardhat/fastapi demos even if Mongo daemon is starting.
    """
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected = False
        
        # In-memory document storage fallback
        self._memory_store = {
            "licenses": {},
            "verification_logs": [],
            "ownership_history": {},
            "users": {}
        }
        self.connect()

    def connect(self):
        try:
            self.client = MongoClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            # Test ping
            self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info("Successfully connected to live MongoDB instance.")
            self._ensure_indexes()
        except Exception as e:
            logger.warning(f"MongoDB not reachable at {settings.MONGO_URI} ({e}). Using resilient in-memory fallback store.")
            self.is_connected = False
            self.db = None
            self._seed_sample_data()

    def _ensure_indexes(self):
        if self.is_connected and self.db is not None:
            try:
                self.db.licenses.create_index("licenseId", unique=True)
                self.db.licenses.create_index("softwareHash")
                self.db.licenses.create_index("ownerWallet")
                self.db.verification_logs.create_index("licenseId")
            except Exception as e:
                logger.warning(f"Failed to create indexes: {e}")

    def _seed_sample_data(self):
        """Initial seed demo data for college presentation & testing"""
        demo_licenses = [
            {
                "licenseId": "BL-2026-000001",
                "softwareName": "SecureSuite Pro",
                "version": "4.2.1",
                "licenseType": "Enterprise",
                "ownerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "customerName": "Abhishek Jaiswar",
                "customerEmail": "abhishek@enterprise.corp",
                "softwareHash": "a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6",
                "blockchainLicenseId": 1,
                "transactionHash": "0x8a91b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
                "contractAddress": settings.CONTRACT_ADDRESS,
                "issuedAt": "2026-10-01T10:00:00Z",
                "expiresAt": "2027-10-01T10:00:00Z",
                "status": "ACTIVE",
                "createdAt": "2026-10-01T10:00:00Z"
            },
            {
                "licenseId": "BL-2026-000002",
                "softwareName": "DataShield Architect",
                "version": "2.0.4",
                "licenseType": "Professional",
                "ownerWallet": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "customerName": "Rahul Verma",
                "customerEmail": "rahul.verma@fintech.io",
                "softwareHash": "b5e8c1f9d4a2b0e6c8f4a2d0b8e6c4a2f0e8d6b4c2a0f8e6d4c2b0a8f6e4d2b0",
                "blockchainLicenseId": 2,
                "transactionHash": "0x4b5c6d7e8f90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a",
                "contractAddress": settings.CONTRACT_ADDRESS,
                "issuedAt": "2025-01-15T09:00:00Z",
                "expiresAt": "2025-10-01T09:00:00Z",
                "status": "EXPIRED",
                "createdAt": "2025-01-15T09:00:00Z"
            },
            {
                "licenseId": "BL-2026-000003",
                "softwareName": "CloudGuard Sentinel",
                "version": "1.8.0",
                "licenseType": "Developer",
                "ownerWallet": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
                "customerName": "Elena Rostova",
                "customerEmail": "elena@devlabs.tech",
                "softwareHash": "c7d2e9f4a1b8c0e3d6f9a2b5c8e1d4f7a0b3c6e9d2f5a8b1c4e7d0f3a6b9c2e5",
                "blockchainLicenseId": 3,
                "transactionHash": "0x90123456789abcdef0123456789abcde8a91b2c3d4e5f60718293a4b5c6d7e8f",
                "contractAddress": settings.CONTRACT_ADDRESS,
                "issuedAt": "2026-03-10T12:00:00Z",
                "expiresAt": "2027-03-10T12:00:00Z",
                "status": "REVOKED",
                "createdAt": "2026-03-10T12:00:00Z"
            }
        ]
        for lic in demo_licenses:
            self._memory_store["licenses"][lic["licenseId"]] = lic

    # License operations
    def insert_license(self, license_doc: Dict[str, Any]) -> bool:
        if self.is_connected and self.db is not None:
            try:
                self.db.licenses.insert_one(license_doc)
                return True
            except Exception as e:
                logger.error(f"MongoDB insert error: {e}")
        # Always mirror in memory store
        self._memory_store["licenses"][license_doc["licenseId"]] = license_doc
        return True

    def find_license(self, license_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                doc = self.db.licenses.find_one({"licenseId": license_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"MongoDB find error: {e}")
        return self._memory_store["licenses"].get(license_id)

    def find_license_by_hash(self, software_hash: str) -> Optional[Dict[str, Any]]:
        clean_hash = software_hash.lower().replace("0x", "")
        if self.is_connected and self.db is not None:
            try:
                doc = self.db.licenses.find_one({
                    "$or": [
                        {"softwareHash": clean_hash},
                        {"softwareHash": f"0x{clean_hash}"}
                    ]
                }, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"MongoDB find by hash error: {e}")
        for lic in self._memory_store["licenses"].values():
            target = lic.get("softwareHash", "").lower().replace("0x", "")
            if target == clean_hash:
                return lic
        return None

    def list_licenses(self, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        if self.is_connected and self.db is not None:
            try:
                query = {}
                if status and status.upper() != "ALL":
                    query["status"] = status.upper()
                if search:
                    regex = {"$regex": search, "$options": "i"}
                    query["$or"] = [
                        {"licenseId": regex},
                        {"softwareName": regex},
                        {"ownerWallet": regex},
                        {"customerName": regex}
                    ]
                cursor = self.db.licenses.find(query, {"_id": 0}).sort("createdAt", -1)
                return list(cursor)
            except Exception as e:
                logger.error(f"MongoDB list error: {e}")

        # Memory store fallback
        for lic in self._memory_store["licenses"].values():
            if status and status.upper() != "ALL" and lic.get("status") != status.upper():
                continue
            if search:
                s_lower = search.lower()
                matches = (
                    s_lower in lic.get("licenseId", "").lower() or
                    s_lower in lic.get("softwareName", "").lower() or
                    s_lower in lic.get("ownerWallet", "").lower() or
                    s_lower in lic.get("customerName", "").lower()
                )
                if not matches:
                    continue
            results.append(lic)
        return sorted(results, key=lambda x: x.get("createdAt", ""), reverse=True)

    def update_license_status(self, license_id: str, new_status: str, new_owner: Optional[str] = None) -> bool:
        update_fields = {"status": new_status}
        if new_owner:
            update_fields["ownerWallet"] = new_owner
            
        if self.is_connected and self.db is not None:
            try:
                self.db.licenses.update_one({"licenseId": license_id}, {"$set": update_fields})
            except Exception as e:
                logger.error(f"MongoDB update error: {e}")
        if license_id in self._memory_store["licenses"]:
            self._memory_store["licenses"][license_id].update(update_fields)
            return True
        return False

    # Verification logs
    def insert_verification_log(self, log_doc: Dict[str, Any]) -> bool:
        if self.is_connected and self.db is not None:
            try:
                self.db.verification_logs.insert_one(log_doc)
            except Exception as e:
                logger.error(f"MongoDB log insert error: {e}")
        self._memory_store["verification_logs"].append(log_doc)
        return True

    def get_recent_verification_logs(self, limit: int = 15) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.verification_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
                return list(cursor)
            except Exception as e:
                logger.error(f"MongoDB logs find error: {e}")
        return sorted(self._memory_store["verification_logs"], key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]

db_manager = DatabaseManager()
