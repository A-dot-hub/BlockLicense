from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class SoftwareVerifyResponse(BaseModel):
    isAuthentic: bool
    status: str
    message: str
    computedHash: str
    matchedLicense: Optional[Dict[str, Any]] = None

class LicenseVerifyResponse(BaseModel):
    isAuthentic: bool
    status: str
    licenseId: str
    softwareName: str
    version: str
    ownerWallet: str
    issuedAt: str
    expiresAt: str
    softwareHash: str
    blockchainVerified: bool
    contractAddress: str
    transactionHash: Optional[str] = None
    verificationTimestamp: str
    reason: Optional[str] = None

class VerificationLogCreate(BaseModel):
    licenseId: str
    verificationType: str = Field(..., description="LICENSE_ID or FILE_HASH")
    result: str = Field(..., description="VALID, INVALID, EXPIRED, REVOKED, MISMATCH")
    ipAddress: Optional[str] = "127.0.0.1"
    userAgent: Optional[str] = "Web Browser"
