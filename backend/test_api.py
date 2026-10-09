import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_test_license():
    payload = {
        "licenseId": "BL-2026-000001",
        "blockchainLicenseId": 1,
        "softwareName": "SecureSuite Pro",
        "version": "4.2.1",
        "licenseType": "Enterprise",
        "ownerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "customerName": "Test Customer",
        "customerEmail": "customer@enterprise.corp",
        "softwareHash": "a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6",
        "transactionHash": "0x8a91b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "expiresAt": "2027-10-01T10:00:00Z"
    }
    client.post("/api/licenses", json=payload)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "BlockLicense API"
    assert data["status"] == "healthy"

def test_list_licenses():
    response = client.get("/api/licenses")
    assert response.status_code == 200
    licenses = response.json()
    assert isinstance(licenses, list)
    assert len(licenses) >= 1

def test_get_license_details():
    response = client.get("/api/licenses/BL-2026-000001")
    assert response.status_code == 200
    data = response.json()
    assert data["licenseId"] == "BL-2026-000001"
    assert data["softwareName"] == "SecureSuite Pro"

def test_get_nonexistent_license():
    response = client.get("/api/licenses/BL-9999-999999")
    assert response.status_code == 404

def test_verify_license_endpoint():
    response = client.get("/api/licenses/BL-2026-000001/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["licenseId"] == "BL-2026-000001"
    assert data["status"] == "ACTIVE"
    assert data["isAuthentic"] is True

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["totalLicenses"] >= 1
    assert "statusDistribution" in data
    assert "activityTimeline" in data

def test_create_license():
    import uuid
    uid = uuid.uuid4().hex[:6].upper()
    payload = {
        "licenseId": f"BL-2026-{uid}",
        "blockchainLicenseId": int(uuid.uuid4().int % 100000),
        "softwareName": "TestApp Pro",
        "version": "1.0.0",
        "licenseType": "Developer",
        "ownerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "customerName": "Test Developer",
        "customerEmail": f"test_{uid}@dev.com",
        "softwareHash": f"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78{uid.lower()}",
        "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "expiresAt": "2027-10-08T00:00:00Z"
    }
    response = client.post("/api/licenses", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["licenseId"] == f"BL-2026-{uid}"
