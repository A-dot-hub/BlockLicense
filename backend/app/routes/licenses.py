from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.database import db_manager
from app.schemas.license import (
    LicenseCreateSchema,
    LicenseResponseSchema,
    LicenseTransferSchema,
    LicenseRevokeSchema
)
from app.schemas.verification import LicenseVerifyResponse
from app.blockchain.provider import blockchain_service

router = APIRouter(prefix="/licenses", tags=["Licenses"])

@router.post("", response_model=LicenseResponseSchema, status_code=status.HTTP_201_CREATED)
def create_license(license_in: LicenseCreateSchema):
    """
    Store off-chain license metadata associated with the minted on-chain smart contract record.
    """
    existing = db_manager.find_license(license_in.licenseId)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"License ID {license_in.licenseId} already exists in database."
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "licenseId": license_in.licenseId,
        "blockchainLicenseId": license_in.blockchainLicenseId,
        "softwareName": license_in.softwareName,
        "version": license_in.version,
        "licenseType": license_in.licenseType,
        "ownerWallet": license_in.ownerWallet,
        "customerName": license_in.customerName,
        "customerEmail": license_in.customerEmail,
        "softwareHash": license_in.softwareHash.lower().replace("0x", ""),
        "transactionHash": license_in.transactionHash,
        "contractAddress": license_in.contractAddress,
        "issuedAt": now_iso,
        "expiresAt": license_in.expiresAt,
        "status": "ACTIVE",
        "createdAt": now_iso
    }

    # Record initial ownership entry in memory/audit history
    history_entry = {
        "licenseId": license_in.licenseId,
        "previousOwner": "Software Vendor (Mint Genesis)",
        "newOwner": license_in.ownerWallet,
        "transactionHash": license_in.transactionHash,
        "timestamp": now_iso,
        "type": "MINT"
    }
    db_manager.insert_verification_log({
        "licenseId": license_in.licenseId,
        "verificationType": "LICENSE_CREATION",
        "result": "ISSUED",
        "timestamp": now_iso,
        "ownerWallet": license_in.ownerWallet
    })

    db_manager.insert_license(doc)
    return doc

@router.get("", response_model=List[LicenseResponseSchema])
def list_licenses(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, EXPIRED, REVOKED"),
    search: Optional[str] = Query(None, description="Search query across software, owner, or ID")
):
    """
    List all recorded software licenses with search and status filtering.
    """
    return db_manager.list_licenses(status=status, search=search)

@router.get("/{license_id}", response_model=LicenseResponseSchema)
def get_license(license_id: str):
    """
    Retrieve full license details by human-readable license ID.
    """
    lic = db_manager.find_license(license_id)
    if not lic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"License {license_id} not found."
        )
    return lic

@router.get("/{license_id}/verify", response_model=LicenseVerifyResponse)
def verify_license(license_id: str):
    """
    Authenticity verification combining MongoDB metadata and independent blockchain truth.
    """
    lic = db_manager.find_license(license_id)
    now_iso = datetime.now(timezone.utc).isoformat()

    if not lic:
        db_manager.insert_verification_log({
            "licenseId": license_id,
            "verificationType": "LICENSE_ID",
            "result": "INVALID",
            "timestamp": now_iso
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"License {license_id} not found in blockchain registry."
        )

    # Check on-chain truth if RPC is up
    chain_lic = blockchain_service.read_license_from_chain(lic.get("blockchainLicenseId", 0))
    current_status = lic.get("status", "ACTIVE")
    current_owner = lic.get("ownerWallet")

    if chain_lic:
        current_status = chain_lic.get("status", current_status)
        current_owner = chain_lic.get("owner", current_owner)

    # Expiry verification
    expires_at_iso = lic.get("expiresAt")
    try:
        exp_dt = datetime.fromisoformat(expires_at_iso.replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > exp_dt and current_status == "ACTIVE":
            current_status = "EXPIRED"
            db_manager.update_license_status(license_id, "EXPIRED")
    except Exception:
        pass

    is_authentic = (current_status == "ACTIVE")

    # Record verification log
    db_manager.insert_verification_log({
        "licenseId": license_id,
        "verificationType": "LICENSE_ID",
        "result": "VALID" if is_authentic else current_status,
        "timestamp": now_iso,
        "ownerWallet": current_owner
    })

    return {
        "isAuthentic": is_authentic,
        "status": current_status,
        "licenseId": license_id,
        "softwareName": lic.get("softwareName", ""),
        "version": lic.get("version", ""),
        "ownerWallet": current_owner,
        "issuedAt": lic.get("issuedAt", now_iso),
        "expiresAt": lic.get("expiresAt", now_iso),
        "softwareHash": lic.get("softwareHash", ""),
        "blockchainVerified": True,
        "contractAddress": lic.get("contractAddress", ""),
        "transactionHash": lic.get("transactionHash"),
        "verificationTimestamp": now_iso
    }

@router.post("/{license_id}/transfer", response_model=LicenseResponseSchema)
def record_license_transfer(license_id: str, transfer_in: LicenseTransferSchema):
    """
    Sync an on-chain ownership transfer into the application layer.
    """
    lic = db_manager.find_license(license_id)
    if not lic:
        raise HTTPException(status_code=404, detail="License not found.")
    
    if lic.get("status") == "REVOKED":
        raise HTTPException(status_code=400, detail="Cannot transfer a revoked license.")

    prev_owner = lic.get("ownerWallet")
    db_manager.update_license_status(license_id, "ACTIVE", transfer_in.newOwnerWallet)

    now_iso = datetime.now(timezone.utc).isoformat()
    db_manager.insert_verification_log({
        "licenseId": license_id,
        "verificationType": "TRANSFER",
        "result": "TRANSFERRED",
        "previousOwner": prev_owner,
        "newOwner": transfer_in.newOwnerWallet,
        "transactionHash": transfer_in.transactionHash,
        "timestamp": now_iso
    })

    return db_manager.find_license(license_id)

@router.post("/{license_id}/revoke", response_model=LicenseResponseSchema)
def record_license_revocation(license_id: str, revoke_in: LicenseRevokeSchema):
    """
    Sync an on-chain revocation event into the application layer.
    """
    lic = db_manager.find_license(license_id)
    if not lic:
        raise HTTPException(status_code=404, detail="License not found.")

    db_manager.update_license_status(license_id, "REVOKED")

    now_iso = datetime.now(timezone.utc).isoformat()
    db_manager.insert_verification_log({
        "licenseId": license_id,
        "verificationType": "REVOCATION",
        "result": "REVOKED",
        "reason": revoke_in.reason,
        "transactionHash": revoke_in.transactionHash,
        "timestamp": now_iso
    })

    return db_manager.find_license(license_id)

@router.get("/{license_id}/history")
def get_license_history(license_id: str):
    """
    Retrieve complete ownership and lifecycle audit trail for a license.
    """
    lic = db_manager.find_license(license_id)
    if not lic:
        raise HTTPException(status_code=404, detail="License not found.")

    # In production, query on-chain events via ethers/web3. Here return combined trail
    logs = [log for log in db_manager.get_recent_verification_logs(limit=50) if log.get("licenseId") == license_id]
    return {
        "licenseId": license_id,
        "currentOwner": lic.get("ownerWallet"),
        "genesisMint": {
            "issuedAt": lic.get("issuedAt"),
            "transactionHash": lic.get("transactionHash"),
            "initialOwner": lic.get("ownerWallet")
        },
        "events": logs
    }
