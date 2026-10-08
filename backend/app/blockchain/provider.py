import json
import logging
import os
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("blocklicense.blockchain")

class BlockchainService:
    """
    Handles read-only inspection of on-chain SoftwareLicense smart contract.
    Transactions are signed by MetaMask on the client side, while the backend
    independently validates contract invariants against RPC.
    """
    def __init__(self):
        self.rpc_url = settings.BLOCKCHAIN_RPC_URL
        self.contract_address = settings.CONTRACT_ADDRESS
        self.abi = self._load_abi()
        self.w3 = None
        self._init_web3()

    def _load_abi(self) -> list:
        cfg_path = os.path.join(os.path.dirname(__file__), "SoftwareLicenseConfig.json")
        if os.path.exists(cfg_path):
            try:
                with open(cfg_path, "r") as f:
                    data = json.load(f)
                    return data.get("abi", [])
            except Exception as e:
                logger.warning(f"Could not load ABI from config: {e}")
        return []

    def _init_web3(self):
        try:
            from web3 import Web3
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url, request_kwargs={'timeout': 2}))
            if self.w3.is_connected():
                logger.info(f"Connected to blockchain RPC at {self.rpc_url}")
            else:
                logger.warning(f"Blockchain RPC at {self.rpc_url} not responsive.")
        except Exception as e:
            logger.warning(f"Web3 initialization note: {e}")
            self.w3 = None

    def read_license_from_chain(self, numeric_id: int) -> Optional[Dict[str, Any]]:
        """
        Queries the SoftwareLicense contract getLicense(uint256) function if RPC is active.
        """
        if not self.w3 or not self.w3.is_connected() or not self.abi:
            return None
        try:
            checksum_addr = self.w3.to_checksum_address(self.contract_address)
            contract = self.w3.eth.contract(address=checksum_addr, abi=self.abi)
            exists = contract.functions.licenseExists(numeric_id).call()
            if not exists:
                return None
            lic = contract.functions.getLicense(numeric_id).call()
            # Status: 0=ACTIVE, 1=EXPIRED, 2=REVOKED, 3=TRANSFERRED
            status_map = {0: "ACTIVE", 1: "EXPIRED", 2: "REVOKED", 3: "TRANSFERRED"}
            return {
                "id": lic[0],
                "softwareName": lic[1],
                "softwareVersion": lic[2],
                "softwareHash": "0x" + lic[3].hex() if isinstance(lic[3], bytes) else str(lic[3]),
                "owner": lic[4],
                "issuedAt": lic[5],
                "expiresAt": lic[6],
                "status": status_map.get(lic[7], "UNKNOWN")
            }
        except Exception as e:
            logger.warning(f"Could not read license {numeric_id} from chain: {e}")
            return None

blockchain_service = BlockchainService()
