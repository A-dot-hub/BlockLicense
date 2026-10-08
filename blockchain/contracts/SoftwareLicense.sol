// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoftwareLicense
 * @dev Smart Contract for Blockchain-Based Software License Ownership & Authenticity Verification
 * Implements tamper-evident license issuing, ownership transfer, revocation, and SHA-256 integrity verification.
 */
contract SoftwareLicense {
    // Enum representing possible states of a software license
    enum LicenseStatus {
        ACTIVE,
        EXPIRED,
        REVOKED,
        TRANSFERRED
    }

    // Core on-chain license record struct
    struct License {
        uint256 id;
        string softwareName;
        string softwareVersion;
        bytes32 softwareHash; // SHA-256 hash of the authentic software release binary
        address owner;
        uint256 issuedAt;
        uint256 expiresAt;
        LicenseStatus status;
    }

    // Contract administrators and authorized issuing companies
    address public companyAdmin;
    mapping(address => bool) public authorizedIssuers;

    // License storage mappings
    mapping(uint256 => License) public licenses;
    mapping(uint256 => bool) public licenseExists;
    mapping(bytes32 => uint256) public softwareHashToLicense;

    // Sequential tracking
    uint256 public totalLicenses;

    // Authoritative Blockchain Events
    event LicenseIssued(
        uint256 indexed licenseId,
        string softwareName,
        string softwareVersion,
        bytes32 softwareHash,
        address indexed owner,
        uint256 issuedAt,
        uint256 expiresAt
    );

    event LicenseTransferred(
        uint256 indexed licenseId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed revokedBy,
        uint256 timestamp,
        string reason
    );

    event IssuerStatusUpdated(address indexed issuer, bool isAuthorized);

    // Access control modifiers
    modifier onlyAdmin() {
        require(msg.sender == companyAdmin, "BlockLicense: Caller is not company admin");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == companyAdmin || authorizedIssuers[msg.sender],
            "BlockLicense: Caller not authorized to perform action"
        );
        _;
    }

    modifier licenseMustExist(uint256 _id) {
        require(licenseExists[_id], "BlockLicense: License does not exist");
        _;
    }

    constructor() {
        companyAdmin = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @notice Authorizes or deauthorizes a company/issuer address
     */
    function setAuthorizedIssuer(address _issuer, bool _status) external onlyAdmin {
        require(_issuer != address(0), "BlockLicense: Invalid issuer address");
        authorizedIssuers[_issuer] = _status;
        emit IssuerStatusUpdated(_issuer, _status);
    }

    /**
     * @notice Issue a new software license on the blockchain
     * @param _id Unique numeric license identifier
     * @param _softwareName Title of the software application
     * @param _softwareVersion Semantic version string (e.g., "4.2.1")
     * @param _softwareHash SHA-256 hash of authentic software distribution file
     * @param _owner Target customer/enterprise wallet address
     * @param _expiresAt Unix timestamp when license expires
     */
    function issueLicense(
        uint256 _id,
        string memory _softwareName,
        string memory _softwareVersion,
        bytes32 _softwareHash,
        address _owner,
        uint256 _expiresAt
    ) external onlyAuthorized {
        require(_id > 0, "BlockLicense: License ID must be greater than zero");
        require(!licenseExists[_id], "BlockLicense: Duplicate license ID already exists");
        require(_owner != address(0), "BlockLicense: Owner address cannot be zero");
        require(_softwareHash != bytes32(0), "BlockLicense: Software SHA-256 hash required");
        require(_expiresAt > block.timestamp, "BlockLicense: Expiry timestamp must be in the future");
        require(bytes(_softwareName).length > 0, "BlockLicense: Software name required");
        require(bytes(_softwareVersion).length > 0, "BlockLicense: Software version required");

        licenses[_id] = License({
            id: _id,
            softwareName: _softwareName,
            softwareVersion: _softwareVersion,
            softwareHash: _softwareHash,
            owner: _owner,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            status: LicenseStatus.ACTIVE
        });

        licenseExists[_id] = true;
        totalLicenses += 1;
        softwareHashToLicense[_softwareHash] = _id;

        emit LicenseIssued(
            _id,
            _softwareName,
            _softwareVersion,
            _softwareHash,
            _owner,
            block.timestamp,
            _expiresAt
        );
    }

    /**
     * @notice Transfer license ownership to another wallet
     * @dev Only the current verified owner can transfer an active, unexpired license
     */
    function transferLicense(uint256 _id, address _newOwner) external licenseMustExist(_id) {
        License storage lic = licenses[_id];

        require(msg.sender == lic.owner, "BlockLicense: Caller is not the current license owner");
        require(lic.status != LicenseStatus.REVOKED, "BlockLicense: Cannot transfer revoked license");
        require(block.timestamp <= lic.expiresAt, "BlockLicense: Cannot transfer expired license");
        require(_newOwner != address(0), "BlockLicense: New owner address cannot be zero");
        require(_newOwner != lic.owner, "BlockLicense: New owner must be different from current owner");

        address previousOwner = lic.owner;
        lic.owner = _newOwner;
        lic.status = LicenseStatus.ACTIVE; // Transferred license remains active under new owner

        emit LicenseTransferred(_id, previousOwner, _newOwner, block.timestamp);
    }

    /**
     * @notice Revoke a license permanently
     * @dev Only company admin or authorized company issuer can revoke
     */
    function revokeLicense(uint256 _id, string memory _reason) external onlyAuthorized licenseMustExist(_id) {
        License storage lic = licenses[_id];
        require(lic.status != LicenseStatus.REVOKED, "BlockLicense: License is already revoked");

        lic.status = LicenseStatus.REVOKED;

        emit LicenseRevoked(_id, msg.sender, block.timestamp, _reason);
    }

    /**
     * @notice Read comprehensive license record
     */
    function getLicense(uint256 _id) external view licenseMustExist(_id) returns (License memory) {
        return licenses[_id];
    }

    /**
     * @notice Verifies license status and checks whether provided SHA-256 software hash matches
     */
    function verifyLicense(uint256 _id, bytes32 _fileHash)
        external
        view
        licenseMustExist(_id)
        returns (
            bool isValid,
            bool isHashMatching,
            LicenseStatus currentStatus,
            address currentOwner,
            uint256 expiresAt
        )
    {
        License memory lic = licenses[_id];
        
        bool notRevoked = (lic.status != LicenseStatus.REVOKED);
        bool notExpired = (block.timestamp <= lic.expiresAt);
        isValid = notRevoked && notExpired;
        isHashMatching = (lic.softwareHash == _fileHash);

        LicenseStatus computedStatus = lic.status;
        if (lic.status == LicenseStatus.ACTIVE && block.timestamp > lic.expiresAt) {
            computedStatus = LicenseStatus.EXPIRED;
        }

        return (isValid, isHashMatching, computedStatus, lic.owner, lic.expiresAt);
    }

    /**
     * @notice Quick validity check: exists, unrevoked, unexpired
     */
    function isLicenseValid(uint256 _id) external view returns (bool) {
        if (!licenseExists[_id]) return false;
        License memory lic = licenses[_id];
        return (lic.status != LicenseStatus.REVOKED && block.timestamp <= lic.expiresAt);
    }
}
