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
        """No demo data - clean production state"""
        pass

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
