const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoftwareLicense Smart Contract", function () {
  let softwareLicense;
  let admin, issuer, userA, userB, unauthorizedUser;

  const SAMPLE_SOFTWARE_NAME = "SecureSuite Pro";
  const SAMPLE_VERSION = "4.2.1";
  // Sample SHA-256 hash in bytes32 format (e.g. hash of test binary)
  const SAMPLE_HASH_HEX = "0xa3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6";
  const ALTERED_HASH_HEX = "0x1111111122222222333333334444444455555555666666667777777788888888";

  beforeEach(async function () {
    [admin, issuer, userA, userB, unauthorizedUser] = await ethers.getSigners();

    const SoftwareLicense = await ethers.getContractFactory("SoftwareLicense");
    softwareLicense = await SoftwareLicense.deploy();
    await softwareLicense.waitForDeployment();
  });

  describe("1. Deployment & Roles", function () {
    it("Should deploy successfully and set admin as companyAdmin", async function () {
      expect(await softwareLicense.companyAdmin()).to.equal(admin.address);
      expect(await softwareLicense.authorizedIssuers(admin.address)).to.be.true;
    });

    it("Should allow admin to authorize a new company issuer", async function () {
      await expect(softwareLicense.connect(admin).setAuthorizedIssuer(issuer.address, true))
        .to.emit(softwareLicense, "IssuerStatusUpdated")
        .withArgs(issuer.address, true);

      expect(await softwareLicense.authorizedIssuers(issuer.address)).to.be.true;
    });

    it("Should prevent non-admin from authorizing an issuer", async function () {
      await expect(
        softwareLicense.connect(unauthorizedUser).setAuthorizedIssuer(userA.address, true)
      ).to.be.revertedWith("BlockLicense: Caller is not company admin");
    });
  });

  describe("2. License Issuance", function () {
    it("Should issue a new license and emit LicenseIssued event", async function () {
      const licenseId = 1;
      const latestBlock = await ethers.provider.getBlock("latest");
      const oneYearExpiry = latestBlock.timestamp + 365 * 24 * 60 * 60;

      await expect(
        softwareLicense.connect(admin).issueLicense(
          licenseId,
          SAMPLE_SOFTWARE_NAME,
          SAMPLE_VERSION,
          SAMPLE_HASH_HEX,
          userA.address,
          oneYearExpiry
        )
      )
        .to.emit(softwareLicense, "LicenseIssued")
        .withArgs(
          licenseId,
          SAMPLE_SOFTWARE_NAME,
          SAMPLE_VERSION,
          SAMPLE_HASH_HEX,
          userA.address,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), // approx timestamp
          oneYearExpiry
        );

      const lic = await softwareLicense.getLicense(licenseId);
      expect(lic.id).to.equal(licenseId);
      expect(lic.softwareName).to.equal(SAMPLE_SOFTWARE_NAME);
      expect(lic.softwareVersion).to.equal(SAMPLE_VERSION);
      expect(lic.softwareHash).to.equal(SAMPLE_HASH_HEX);
      expect(lic.owner).to.equal(userA.address);
      expect(lic.status).to.equal(0); // ACTIVE
      expect(await softwareLicense.licenseExists(licenseId)).to.be.true;
    });

    it("Should prevent duplicate license IDs", async function () {
      const licenseId = 1;
      const latestBlock = await ethers.provider.getBlock("latest");
      const expiry = latestBlock.timestamp + 10000;

      await softwareLicense.connect(admin).issueLicense(
        licenseId,
        SAMPLE_SOFTWARE_NAME,
        SAMPLE_VERSION,
        SAMPLE_HASH_HEX,
        userA.address,
        expiry
      );

      await expect(
        softwareLicense.connect(admin).issueLicense(
          licenseId,
          "Different App",
          "1.0.0",
          SAMPLE_HASH_HEX,
          userB.address,
          expiry
        )
      ).to.be.revertedWith("BlockLicense: Duplicate license ID already exists");
    });

    it("Should prevent unauthorized users from issuing licenses", async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      const expiry = latestBlock.timestamp + 10000;

      await expect(
        softwareLicense.connect(unauthorizedUser).issueLicense(
          99,
          SAMPLE_SOFTWARE_NAME,
          SAMPLE_VERSION,
          SAMPLE_HASH_HEX,
          userA.address,
          expiry
        )
      ).to.be.revertedWith("BlockLicense: Caller not authorized to perform action");
    });

    it("Should reject zero owner address or past expiry", async function () {
      const latestBlock = await ethers.provider.getBlock("latest");

      await expect(
        softwareLicense.connect(admin).issueLicense(
          2,
          SAMPLE_SOFTWARE_NAME,
          SAMPLE_VERSION,
          SAMPLE_HASH_HEX,
          ethers.ZeroAddress,
          latestBlock.timestamp + 1000
        )
      ).to.be.revertedWith("BlockLicense: Owner address cannot be zero");

      await expect(
        softwareLicense.connect(admin).issueLicense(
          3,
          SAMPLE_SOFTWARE_NAME,
          SAMPLE_VERSION,
          SAMPLE_HASH_HEX,
          userA.address,
          latestBlock.timestamp - 100
        )
      ).to.be.revertedWith("BlockLicense: Expiry timestamp must be in the future");
    });
  });

  describe("3. License & Software Hash Verification", function () {
    const licenseId = 10;
    let expiryTimestamp;

    beforeEach(async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      expiryTimestamp = latestBlock.timestamp + 86400 * 30; // 30 days
      await softwareLicense.connect(admin).issueLicense(
        licenseId,
        SAMPLE_SOFTWARE_NAME,
        SAMPLE_VERSION,
        SAMPLE_HASH_HEX,
        userA.address,
        expiryTimestamp
      );
    });

    it("Should verify authentic license with matching software hash", async function () {
      const [isValid, isHashMatching, status, currentOwner, exp] =
        await softwareLicense.verifyLicense(licenseId, SAMPLE_HASH_HEX);

      expect(isValid).to.be.true;
      expect(isHashMatching).to.be.true;
      expect(status).to.equal(0); // ACTIVE
      expect(currentOwner).to.equal(userA.address);
      expect(exp).to.equal(expiryTimestamp);
    });

    it("Should flag hash mismatch when modified software binary hash is verified", async function () {
      const [isValid, isHashMatching, status] =
        await softwareLicense.verifyLicense(licenseId, ALTERED_HASH_HEX);

      expect(isValid).to.be.true;
      expect(isHashMatching).to.be.false; // Hash mismatch!
      expect(status).to.equal(0);
    });

    it("Should report isLicenseValid as true for active unrevoked license", async function () {
      expect(await softwareLicense.isLicenseValid(licenseId)).to.be.true;
      expect(await softwareLicense.isLicenseValid(9999)).to.be.false;
    });
  });

  describe("4. Ownership Transfer", function () {
    const licenseId = 20;

    beforeEach(async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      await softwareLicense.connect(admin).issueLicense(
        licenseId,
        SAMPLE_SOFTWARE_NAME,
        SAMPLE_VERSION,
        SAMPLE_HASH_HEX,
        userA.address,
        latestBlock.timestamp + 86400 * 60
      );
    });

    it("Should allow current owner to transfer license and emit LicenseTransferred", async function () {
      await expect(
        softwareLicense.connect(userA).transferLicense(licenseId, userB.address)
      )
        .to.emit(softwareLicense, "LicenseTransferred")
        .withArgs(licenseId, userA.address, userB.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const lic = await softwareLicense.getLicense(licenseId);
      expect(lic.owner).to.equal(userB.address);
    });

    it("Should prevent non-owner from transferring license", async function () {
      await expect(
        softwareLicense.connect(unauthorizedUser).transferLicense(licenseId, userB.address)
      ).to.be.revertedWith("BlockLicense: Caller is not the current license owner");
    });

    it("Should prevent transferring to zero address or self", async function () {
      await expect(
        softwareLicense.connect(userA).transferLicense(licenseId, ethers.ZeroAddress)
      ).to.be.revertedWith("BlockLicense: New owner address cannot be zero");

      await expect(
        softwareLicense.connect(userA).transferLicense(licenseId, userA.address)
      ).to.be.revertedWith("BlockLicense: New owner must be different from current owner");
    });
  });

  describe("5. License Revocation", function () {
    const licenseId = 30;

    beforeEach(async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      await softwareLicense.connect(admin).issueLicense(
        licenseId,
        SAMPLE_SOFTWARE_NAME,
        SAMPLE_VERSION,
        SAMPLE_HASH_HEX,
        userA.address,
        latestBlock.timestamp + 86400 * 90
      );
    });

    it("Should allow authorized company admin to revoke license and emit LicenseRevoked", async function () {
      const reason = "Violation of End User License Agreement (EULA)";
      await expect(
        softwareLicense.connect(admin).revokeLicense(licenseId, reason)
      )
        .to.emit(softwareLicense, "LicenseRevoked")
        .withArgs(licenseId, admin.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), reason);

      const lic = await softwareLicense.getLicense(licenseId);
      expect(lic.status).to.equal(2); // REVOKED
      expect(await softwareLicense.isLicenseValid(licenseId)).to.be.false;
    });

    it("Should prevent unauthorized users from revoking license", async function () {
      await expect(
        softwareLicense.connect(userA).revokeLicense(licenseId, "Unauthorized attempt")
      ).to.be.revertedWith("BlockLicense: Caller not authorized to perform action");
    });

    it("Should prevent transferring a revoked license", async function () {
      await softwareLicense.connect(admin).revokeLicense(licenseId, "Breach of contract");

      await expect(
        softwareLicense.connect(userA).transferLicense(licenseId, userB.address)
      ).to.be.revertedWith("BlockLicense: Cannot transfer revoked license");
    });

    it("Should prevent re-revoking an already revoked license", async function () {
      await softwareLicense.connect(admin).revokeLicense(licenseId, "First revocation");

      await expect(
        softwareLicense.connect(admin).revokeLicense(licenseId, "Second revocation")
      ).to.be.revertedWith("BlockLicense: License is already revoked");
    });
  });

  describe("6. Expiration Handling", function () {
    it("Should detect expired status when block time exceeds expiresAt", async function () {
      const licenseId = 40;
      const latestBlock = await ethers.provider.getBlock("latest");
      const shortExpiry = latestBlock.timestamp + 10; // 10 seconds

      await softwareLicense.connect(admin).issueLicense(
        licenseId,
        SAMPLE_SOFTWARE_NAME,
        SAMPLE_VERSION,
        SAMPLE_HASH_HEX,
        userA.address,
        shortExpiry
      );

      // Advance time by 20 seconds
      await ethers.provider.send("evm_increaseTime", [20]);
      await ethers.provider.send("evm_mine");

      expect(await softwareLicense.isLicenseValid(licenseId)).to.be.false;

      const [isValid, isHashMatching, status] = await softwareLicense.verifyLicense(
        licenseId,
        SAMPLE_HASH_HEX
      );
      expect(isValid).to.be.false;
      expect(status).to.equal(1); // EXPIRED
    });
  });
});
