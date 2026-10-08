from typing import Optional
from pydantic import BaseModel, Field

class LicenseCreateSchema(BaseModel):
    licenseId: str = Field(..., description="Human-readable license ID e.g. BL-2026-000001")
    blockchainLicenseId: int = Field(..., description="Numeric on-chain license ID")
    softwareName: str = Field(..., min_length=1, description="Name of software package")
    version: str = Field(..., min_length=1, description="Software version string e.g. 4.2.1")
    licenseType: str = Field(default="Standard", description="Type of license: Personal, Professional, Enterprise")
    ownerWallet: str = Field(..., description="Ethereum wallet address of owner")
    customerName: str = Field(..., min_length=1, description="Licensed entity or user name")
    customerEmail: str = Field(..., description="Contact email for license management")
    softwareHash: str = Field(..., description="SHA-256 hash of authentic binary")
    transactionHash: str = Field(..., description="Blockchain issuance transaction hash")
    contractAddress: str = Field(..., description="Deployed smart contract address")
    expiresAt: str = Field(..., description="ISO timestamp for expiry")

class LicenseTransferSchema(BaseModel):
    newOwnerWallet: str = Field(..., description="Destination Ethereum wallet address")
    transactionHash: str = Field(..., description="Blockchain transfer transaction hash")

class LicenseRevokeSchema(BaseModel):
    reason: str = Field(..., min_length=3, description="Official justification for license revocation")
    transactionHash: str = Field(..., description="Blockchain revocation transaction hash")

class LicenseResponseSchema(BaseModel):
    licenseId: str
    softwareName: str
    version: str
    licenseType: str
    ownerWallet: str
    customerName: str
    customerEmail: str
    softwareHash: str
    blockchainLicenseId: int
    transactionHash: str
    contractAddress: str
    issuedAt: str
    expiresAt: str
    status: str
    createdAt: str
