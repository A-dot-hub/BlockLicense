from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.database import db_manager
from app.services.hash_service import HashService
from app.schemas.verification import SoftwareVerifyResponse

router = APIRouter(prefix="/verify", tags=["Verification"])

@router.post("/software", response_model=SoftwareVerifyResponse)
async def verify_software_binary(
    file: UploadFile = File(..., description="Software distribution file (.exe, .zip, .bin, .tar.gz, etc.)"),
    target_license_id: Optional[str] = Form(None, description="Optional target License ID to verify against")
):
    """
    Computes SHA-256 checksum of an uploaded software binary and compares it against on-chain/database records.
    Never persists large binaries to disk or blockchain.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename provided.")

    try:
        # Stream file to compute SHA-256
        computed_hash = HashService.calculate_sha256(file.file)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute SHA-256 hash: {str(e)}"
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    # Case 1: Verifying against a specific License ID
    if target_license_id:
        target_lic = db_manager.find_license(target_license_id)
        if not target_lic:
            return {
                "isAuthentic": False,
                "status": "LICENSE_NOT_FOUND",
                "message": f"Target license ID {target_license_id} not found in the registry.",
                "computedHash": computed_hash,
                "matchedLicense": None
            }

        expected_hash = target_lic.get("softwareHash", "").lower().replace("0x", "")
        is_match = HashService.compare_hashes(computed_hash, expected_hash)

        # Log verification attempt
        db_manager.insert_verification_log({
            "licenseId": target_license_id,
            "verificationType": "FILE_INTEGRITY",
            "result": "AUTHENTIC" if is_match else "HASH_MISMATCH",
            "computedHash": computed_hash,
            "expectedHash": expected_hash,
            "fileName": file.filename,
            "timestamp": now_iso
        })

        if is_match:
            return {
                "isAuthentic": True,
                "status": "AUTHENTIC",
                "message": "✓ AUTHENTIC SOFTWARE: SHA-256 digest exactly matches the immutable blockchain record.",
                "computedHash": computed_hash,
                "matchedLicense": target_lic
            }
        else:
            return {
                "isAuthentic": False,
                "status": "HASH_MISMATCH",
                "message": "✗ SOFTWARE MODIFIED: SHA-256 digest does not match the official blockchain release hash. File may be tampered with or corrupted.",
                "computedHash": computed_hash,
                "matchedLicense": target_lic
            }

    # Case 2: General lookup by computed software hash
    matched_lic = db_manager.find_license_by_hash(computed_hash)
    if matched_lic:
        db_manager.insert_verification_log({
            "licenseId": matched_lic.get("licenseId"),
            "verificationType": "HASH_DISCOVERY",
            "result": "MATCH",
            "computedHash": computed_hash,
            "fileName": file.filename,
            "timestamp": now_iso
        })
        return {
            "isAuthentic": True,
            "status": "AUTHENTIC",
            "message": f"✓ AUTHENTIC SOFTWARE: Recognized authentic binary for {matched_lic.get('softwareName')} v{matched_lic.get('version')}.",
            "computedHash": computed_hash,
            "matchedLicense": matched_lic
        }
    else:
        db_manager.insert_verification_log({
            "licenseId": "UNKNOWN",
            "verificationType": "HASH_DISCOVERY",
            "result": "UNKNOWN_BINARY",
            "computedHash": computed_hash,
            "fileName": file.filename,
            "timestamp": now_iso
        })
        return {
            "isAuthentic": False,
            "status": "UNRECOGNIZED_HASH",
            "message": "✗ UNREGISTERED BINARY: No licensed software release on record matches this SHA-256 digest.",
            "computedHash": computed_hash,
            "matchedLicense": None
        }

@router.get("/{license_id}")
def get_public_verification_card(license_id: str):
    """
    Public verification endpoint designed for QR code scanning and instant web verification without login.
    """
    lic = db_manager.find_license(license_id)
    if not lic:
        raise HTTPException(status_code=404, detail="License not found.")
    return {
        "licenseId": lic["licenseId"],
        "softwareName": lic["softwareName"],
        "version": lic["version"],
        "ownerWallet": lic["ownerWallet"],
        "customerName": lic["customerName"],
        "status": lic["status"],
        "issuedAt": lic["issuedAt"],
        "expiresAt": lic["expiresAt"],
        "softwareHash": lic["softwareHash"],
        "contractAddress": lic["contractAddress"],
        "transactionHash": lic["transactionHash"]
    }
