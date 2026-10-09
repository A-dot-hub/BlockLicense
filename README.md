# BlockLicense

### Blockchain-Based Software License Ownership & Authenticity Verification System

BlockLicense is a full-stack, enterprise-grade decentralized platform designed to solve critical software piracy, unauthorized license transfers, fraudulent key generation, and binary tampering challenges. By coupling Solidity smart contracts on the Ethereum Virtual Machine (EVM) with SHA-256 cryptographic software digests, MongoDB off-chain document tracking, and high-speed Web Crypto APIs, BlockLicense provides an immutable, transparent, and publicly verifiable single source of truth for software authenticity.

---

## 1. Project Overview & Core Problem

Traditional software licensing paradigms rely heavily on centralized vendor authentication servers and static text keys. These legacy mechanisms suffer from several vulnerabilities:

- **Binary Tampering & Malware Injection:** Crackers alter application executables, remove DRM, or inject trojans into distributed binaries without end users having a cryptographic guarantee of integrity.
- **Key Forgery & Duplication:** License strings are susceptible to keygen algorithms, leaked secrets, and concurrent unauthorized use.
- **Unauthorized Transfers & Piracy:** Secondary market license transfers cannot be verified by vendors or buyers, leading to double-selling.
- **Revocation Latency:** Compromised or refunded keys often continue running undetected in disconnected or cached environments.
- **Vendor Lock-in & Record Tampering:** Centralized databases can be modified, deleted, or taken offline.

**BlockLicense solves these challenges through:**

1. **Immutable Smart Contracts:** Critical license parameters (License ID, Release SHA-256 Hash, Owner Address, Expiry, and Status) are etched on an EVM blockchain.
2. **Cryptographic Binary Anchoring:** Software files are digested locally via SHA-256. Comparing local binaries against the on-chain hash flags even a 1-bit alteration.
3. **Decentralized Ownership Tracking:** Licenses are owned by Ethereum addresses. Ownership transfers require cryptographic signatures from the current owner.
4. **Instant Revocation:** Vendor authorities can permanently invalidate compromised licenses via smart contract events.
5. **Zero-Knowledge Public Verification:** Anyone can verify software or license validity via web interface or QR code without revealing private keys.

---

## 2. System Architecture

```
                      +-----------------------------+
                      |       React Frontend        |
                      | (Vite, Tailwind, Ethers.js) |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | HTTP / REST                               | Web3 / Ethers.js
               v                                           v
+-------------------------------+             +---------------------------+
|        FastAPI Backend        |             |      MetaMask Wallet      |
|  (Python, Pydantic, PyMongo)  |             |      (Signed Txns)        |
+---------------+---------------+             +-------------+-------------+
                |                                           |
        +-------+-------+                                   | RPC Call
        |               |                                   v
        v               v                     +---------------------------+
  +-----------+   +-----------+               |  Hardhat / EVM Blockchain |
  |  MongoDB  |   |  SHA-256  |               | (Localhost 31337 / Sepolia|
  | Off-Chain |   | Streaming |               +-------------+-------------+
  |  Metadata |   |  Hasher   |                             |
  +-----------+   +-----------+                             v
                                              +---------------------------+
                                              |    SoftwareLicense.sol    |
                                              |      Smart Contract       |
                                              +---------------------------+
```

### On-Chain vs. Off-Chain Separation of Concerns

| Attribute          | On-Chain (Smart Contract)                                               | Off-Chain (MongoDB / App Layer)                                                     |
| :----------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Data Scope**     | Internal ID, Software SHA-256, Owner Wallet, Expiry, Status, Event Logs | Customer Name, Email, Billing Address, Human ID (`BL-2026-000001`), App Description |
| **Storage Cost**   | Minimal gas consumption (32-byte hash, 20-byte address)                 | Free arbitrary document storage                                                     |
| **Trust Model**    | Cryptographically tamper-evident, decentralized consensus               | Fast querying, pagination, search, and analytics                                    |
| **Binary Storage** | **NEVER store software binaries on blockchain**                         | Binaries hashed in streaming memory; zero permanent file retention                  |

---

## 3. Technology Stack

- **Blockchain & Smart Contracts:**
  - Solidity `^0.8.20`
  - Hardhat `^2.22`
  - Ethers.js `^6.13`
  - Localhost EVM (Chain ID: `31337`) / Sepolia Testnet (Chain ID: `11155111`)
- **Backend API:**
  - Python 3.10+
  - FastAPI `^0.110`
  - Uvicorn (ASGI web server)
  - PyMongo & Pydantic v2
  - Web3.py
- **Database:**
  - MongoDB 6.0+ (with resilient in-memory fallback for demo environments)
- **Frontend:**
  - React 18 / 19 & Vite
  - Tailwind CSS
  - Lucide React icons
  - Recharts (analytics dashboards)
  - QRCode (PNG / Data URL generation)
  - Web Crypto API (Client-side native SHA-256)
- **Wallet:**
  - MetaMask browser extension & built-in local development signer

---

## 4. Directory Structure

```
BlockLicense/
├── src/                      # React Frontend Source Code
│   ├── components/           # UI components (Navbar, StatusBadge, QRModal, QRScannerModal)
│   ├── context/              # WalletContext (MetaMask & Demo roles), AuthContext
│   ├── contracts/            # SoftwareLicenseConfig.json (ABI & contract address)
│   ├── pages/                # Landing, Dashboard, Issue, Verify, Licenses, Transfer, Revoke
│   ├── services/             # blockchain.ts, storage.ts, hasher.ts
│   ├── types/                # TypeScript schemas & interface definitions
│   ├── App.tsx               # Primary application router & layout
│   ├── main.tsx              # React DOM mounting entrypoint
│   └── index.css             # Tailwind CSS & custom styling
├── public/                   # Public static assets & favicon
├── backend/                  # FastAPI Backend Server
│   ├── app/
│   │   ├── blockchain/       # Web3 RPC provider & contract reader
│   │   ├── routes/           # REST endpoints (/licenses, /verify, /dashboard)
│   │   ├── schemas/          # Pydantic schemas (License, Verification, Logs)
│   │   ├── services/         # HashService (SHA-256 binary streamer)
│   │   ├── config.py         # App configuration & environment variables
│   │   ├── database.py       # PyMongo client & resilient fallback memory store
│   │   └── main.py           # FastAPI application entrypoint & CORS setup
│   ├── uploads/              # Temporary verification binary buffer
│   ├── requirements.txt      # Python dependencies
│   ├── seed.py               # Database seeder script
│   └── test_api.py           # Pytest test suite
├── blockchain/               # Hardhat EVM Blockchain Environment
│   ├── contracts/            # SoftwareLicense.sol Solidity smart contract
│   ├── scripts/              # deploy.js (compiles & exports ABI/address)
│   ├── test/                 # SoftwareLicense.test.js (18 test assertions)
│   ├── hardhat.config.js     # Hardhat network & compiler configuration
│   └── package.json          # Blockchain devDependencies & scripts
├── index.html                # Vite HTML entry template
├── package.json              # Frontend dependencies & run scripts
├── vite.config.ts            # Vite configuration with React & Tailwind plugins
├── tsconfig.json             # TypeScript compiler configuration
└── docker-compose.yml        # Multi-container orchestration (optional)
```

---

## 5. Smart Contract: `SoftwareLicense.sol`

### Data Structures & Enums

```solidity
enum LicenseStatus { ACTIVE, EXPIRED, REVOKED, TRANSFERRED }

struct License {
    uint256 id;
    string softwareName;
    string softwareVersion;
    bytes32 softwareHash; // SHA-256 of authentic binary
    address owner;
    uint256 issuedAt;
    uint256 expiresAt;
    LicenseStatus status;
}
```

### Core Invariants & Security Controls

1. **Access Control:** Only `companyAdmin` or `authorizedIssuers` can call `issueLicense` or `revokeLicense`.
2. **Duplicate Prevention:** Enforces `require(!licenseExists[_id])`.
3. **Owner-Only Transfers:** `require(msg.sender == lic.owner)` prevents unauthorized wallet transfers.
4. **Revocation Enforcement:** Transfers on revoked licenses revert immediately: `require(lic.status != LicenseStatus.REVOKED)`.
5. **Zero-Address Safeguards:** Reverts any issuance or transfer to `address(0)`.
6. **Expiration Auditing:** Dynamic calculation prevents transfers after `expiresAt`.

---

## 6. Setup & Execution Guide

### Prerequisites

- Node.js `v18.x`, `v20.x`, or `v22.x`
- Python `3.10+` (Python 3.10 – 3.13 supported)
- MongoDB `v6.0+` _(Optional: includes an automatic resilient in-memory database store for instant local demos without installing MongoDB)_
- Git & MetaMask Extension _(Optional: built-in demo account switcher lets you switch between Admin, Owner, and User roles instantly without MetaMask)_

---

### Services & Port Reference

| Service                | Working Directory    | Port / URL                                                                                     | Description                                                   |
| :--------------------- | :------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| **Local Hardhat Node** | `./blockchain`       | [`http://127.0.0.1:8545`](http://127.0.0.1:8545)                                               | EVM RPC node (`Chain ID: 31337`) with 20 funded test accounts |
| **Smart Contract**     | `./blockchain`       | `0x5FbDB2315678afecb367f032d93F642f64180aa3`                                                   | `SoftwareLicense.sol` deployed on localhost                   |
| **FastAPI Backend**    | `./backend`          | [`http://127.0.0.1:8000`](http://127.0.0.1:8000) (Docs: [`/docs`](http://127.0.0.1:8000/docs)) | Off-chain metadata REST API, SHA-256 binary validation        |
| **React Frontend**     | Root directory (`.`) | [`http://localhost:3000`](http://localhost:3000)                                               | Web interface (Vite, Tailwind CSS, Ethers.js v6)              |

---

### Step-by-Step Terminal Execution

Follow these 4 terminals to run the entire stack:

#### Terminal 1: Start Blockchain Node

```bash
# Windows (PowerShell / Command Prompt)
cd blockchain
npm install
npx hardhat node  //if installed run this directly

# Linux / macOS
cd blockchain
npm install
npx hardhat node
```

_Node starts on `http://127.0.0.1:8545` with 20 funded test accounts (10,000 ETH each)._

---

#### Terminal 2: Deploy Smart Contract

Leave Terminal 1 running, and in a second terminal deploy the smart contract:

```bash
# Windows (PowerShell / Command Prompt)
cd blockchain
npx hardhat run scripts/deploy.js --network localhost

# Linux / macOS
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

_Output:_

```text
Contract deployed successfully
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: localhost
Company Admin: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Saved deployment config to frontend and backend contracts directories.
```

---

#### Terminal 3: Start FastAPI Backend

```bash
# Windows (PowerShell)
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python seed.py
.\venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Windows (Command Prompt - cmd.exe)
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python seed.py
venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Linux / macOS
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

_API documentation and interactive Swagger UI are available at `http://127.0.0.1:8000/docs`._

---

#### Terminal 4: Start React Frontend

In a new terminal from the **project root directory** (where `package.json` and `src/` are located):

```bash
# Windows (PowerShell / Command Prompt)
npm install
npm run dev

# Linux / macOS
npm install
npm run dev
```

_Open `http://localhost:3000` in your browser._

---

### Production Build

To generate an optimized production bundle of the React frontend:

```bash
npm run build
```

Production assets are generated in `dist/`.

---

### Troubleshooting & Common Tips

1. **PowerShell Script Execution Policy:**
   If activating a virtual environment fails with `running scripts is disabled on this system`, either run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or directly invoke the binary executables: `.\venv\Scripts\python.exe` and `.\venv\Scripts\uvicorn.exe`.
2. **MongoDB Not Installed:**
   MongoDB is completely optional for local evaluations. If MongoDB is not reachable on `mongodb://localhost:27017`, the backend automatically falls back to its built-in in-memory document store.
3. **Hardhat Node Restart:**
   If you restart Terminal 1 (`npx hardhat node`), re-run Terminal 2 (`npx hardhat run scripts/deploy.js --network localhost`) to redeploy the contract to the clean blockchain state.

---

## 7. Testing Suites

### Hardhat Smart Contract Tests

Run the 18-test suite verifying deployment, issuance, duplicate prevention, verification, transfers, unauthorized rejection, revocations, and time expirations:

```bash
cd blockchain
npx hardhat test
```

### FastAPI Backend Tests

Run the endpoint integration suite verifying schemas, health, verification routes, and dashboard analytics:

```bash
cd backend
# Windows
.\venv\Scripts\pytest test_api.py -v

# Linux / macOS
pytest test_api.py -v
```

---

## 8. Complete 20-Step Demo Verification Script

Follow this sequence to demonstrate all system capabilities during evaluation:

1. **Step 1:** Launch the local Hardhat node (`npx hardhat node`).
2. **Step 2:** Deploy `SoftwareLicense.sol` (`npx hardhat run scripts/deploy.js --network localhost`).
3. **Step 3:** Start MongoDB or allow built-in resilient database layer to initialize.
4. **Step 4:** Start the FastAPI backend on port 8000.
5. **Step 5:** Open `http://localhost:3000` to view the BlockLicense dashboard.
6. **Step 6:** Connect MetaMask or use the account selector (select _Software Company Admin_).
7. **Step 7:** Navigate to **Issue License** (`/issue-license`). Fill in Software Name: _SecureSuite Pro_, Version: _4.2.1_.
8. **Step 8:** Upload an authentic software release binary or click "Use sample software file". Observe real-time browser SHA-256 generation.
9. **Step 9:** Click **Sign & Mint License On-Chain**. The smart contract records the transaction on-chain.
10. **Step 10:** Click **Show QR Code** to inspect and download the cryptographic verification QR.
11. **Step 11:** Open the public verification page (`/verify/BL-2026-000001` or click _Test Public Verification_).
12. **Step 12:** Receive the **✓ VERIFIED & ACTIVE** badge, confirming on-chain record existence.
13. **Step 13:** Navigate to **Verify Software** (`/verify-software`).
14. **Step 14:** Upload or simulate the authentic release binary. Receive **✓ AUTHENTIC SOFTWARE: SHA-256 digest matches on-chain record**.
15. **Step 15:** Click **Simulate Tampered File** (alters 1 byte of the binary).
16. **Step 16:** Observe the instant security alert: **✗ HASH MISMATCH: Software may have been modified or corrupted**.
17. **Step 17:** Navigate to **Transfer License** (`/transfer-license`). Select active license `BL-2026-000001` and enter Rahul's recipient wallet (`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`).
18. **Step 18:** Confirm and sign transaction. Verify that the new owner is registered on-chain and appears in the **Immutable Ownership Audit Trail**.
19. **Step 19:** Navigate to **Revoke License** (`/revoke-license`). Enter reason _"Breach of EULA"_ and sign on-chain revocation as Admin.
20. **Step 20:** Return to `/verify` and check `BL-2026-000001`. Notice that the status has irreversibly changed to **✗ REVOKED**, preventing all subsequent transfers.

---

## 9. Security Principles & Architecture Invariants

- **Zero Executable Persistence:** Uploaded binaries are hashed in memory; raw binaries are discarded immediately.
- **Client-Side Signatures:** Private keys are never transmitted to backend servers or stored in web storage.
- **Smart Contract Guards:** Zero-address checks, time validations, and modifier checks prevent state corruption.
- **Cross-Origin Security:** Backend enforces strict CORS origins (`http://localhost:3000`).

---

## 10. Future Scope & Roadmap

1. **ERC-721 / ERC-1155 NFT Licenses:** Wrapping software licenses into tradable tokens for secondary markets.
2. **Decentralized IPFS Metadata:** Pinning vendor release release notes and signed binaries to IPFS or Arweave.
3. **Zero-Knowledge Proof Verification (zk-SNARKs):** Allowing offline license activation without exposing the customer's wallet address.
4. **Automated Cross-Chain Relays:** Multi-chain license verification across Ethereum, Polygon, and Arbitrum.
5. **Decentralized Identity (DID):** Verifiable credentials linking enterprise software seats to corporate SSO.

---

## 11. License

This project is licensed under the MIT License.
