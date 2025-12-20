# Multi-Tier Access Control System

## Overview

This guide explains the multi-level authorization system used in the Confidential Fertility Records example, demonstrating how to implement HIPAA-compliant healthcare access control in smart contracts.

## Three-Tier Authorization Model

### Tier 1: System-Level Authorization
- **Who**: Contract owner (system administrator)
- **Power**: Authorize healthcare providers to use the system
- **Function**: `authorizeDoctor(address doctor)`
- **Purpose**: Vet healthcare providers before they can create records

### Tier 2: Patient-Level Authorization
- **Who**: Patients (data owners)
- **Power**: Grant/revoke specific doctor access to their records
- **Functions**: `grantDoctorAccess(address doctor)`, `revokeDoctorAccess(address doctor)`
- **Purpose**: Patient maintains control over who sees their data

### Tier 3: Data Access
- **Who**: Authorized doctors with patient permission
- **Power**: Read and update encrypted medical records
- **Enforcement**: `onlyPatientOrDoctor` modifier on sensitive functions
- **Purpose**: Enable healthcare delivery while maintaining privacy

## Implementation Pattern

### Contract Modifiers

```solidity
// System-level authorization check
modifier onlyAuthorizedDoctor() {
    require(authorizedDoctors[msg.sender], "Doctor not authorized");
    _;
}

// Patient-level authorization check
modifier onlyPatientOrDoctor(uint256 recordId) {
    RecordMetadata memory metadata = recordMetadata[recordId];
    require(
        msg.sender == metadata.patient ||
        doctorAccess[metadata.patient][msg.sender],
        "Access denied"
    );
    _;
}
```

### State Variables for Access Control

```solidity
// System-level: Authorized healthcare providers
mapping(address => bool) public authorizedDoctors;

// Patient-level: Doctors who patient granted access to
mapping(address => mapping(address => bool)) public doctorAccess;

// Metadata with owner information
mapping(uint256 => RecordMetadata) public recordMetadata;

struct RecordMetadata {
    address patient;              // Record owner
    address authorizedDoctor;     // Creator
    uint256 createdAt;
    bool emergencyAccess;
    bool isActive;
}
```

## Authorization Flows

### Creating a Record

```
┌─────────────────────────────────────────────────────┐
│ 1. Check: Is doctor system-authorized?              │
│    (authorizedDoctors[msg.sender] == true)          │
│    └─> If NO: Reject with "Not authorized"         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 2. Create encrypted record with patient address    │
│    └─> Store encrypted data                        │
│    └─> Store metadata with patient address         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 3. Grant FHE permissions                           │
│    └─> FHE.allowThis(encryptedField)              │
│    └─> FHE.allow(encryptedField, patient)         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ ✅ Record created - only patient can access        │
└─────────────────────────────────────────────────────┘
```

### Reading a Record

```
┌──────────────────────────────────────────────────────────┐
│ 1. Check: Is caller patient OR doctor with permission?  │
│    ├─> Is caller == recordMetadata.patient? YES ✅       │
│    └─> OR doctorAccess[patient][caller]? YES ✅          │
│        └─> If NO: Reject with "Access denied"           │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Return encrypted data as handles (bytes32)           │
│    └─> Client decrypts with fhevmjs library             │
└──────────────────────────────────────────────────────────┘
```

## Code Examples

### Granting Doctor Access

```solidity
function grantDoctorAccess(address doctor) external {
    require(doctor != address(0), "Invalid doctor address");
    require(authorizedDoctors[doctor], "Doctor not system-authorized");
    require(doctor != msg.sender, "Cannot grant access to self");

    doctorAccess[msg.sender][doctor] = true;

    emit DoctorAuthorized(doctor, msg.sender);
}
```

### Revoking Doctor Access

```solidity
function revokeDoctorAccess(address doctor) external {
    require(doctor != address(0), "Invalid doctor address");

    doctorAccess[msg.sender][doctor] = false;

    emit DoctorRevoked(doctor, msg.sender);
}
```

### Checking Access

```solidity
function hasDoctorAccess(address patient, address doctor)
    external
    view
    returns (bool)
{
    return doctorAccess[patient][doctor];
}
```

### Protected Function Example

```solidity
function getEncryptedRecord(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (
        bytes32 age,
        bytes32 pregnancyCount,
        bytes32 cycleLength
    )
{
    EncryptedRecord memory record = medicalRecords[recordId];
    RecordMetadata memory metadata = recordMetadata[recordId];

    // Only return if caller has permission
    require(metadata.isActive, "Record deactivated");

    return (
        FHE.toBytes32(record.age),
        FHE.toBytes32(record.pregnancyCount),
        FHE.toBytes32(record.cycleLength)
    );
}
```

## Emergency Access

For critical medical situations requiring immediate access:

```solidity
function emergencyAccess(uint256 recordId)
    external
    onlyAuthorizedDoctor
{
    RecordMetadata storage metadata = recordMetadata[recordId];

    // Mark as emergency access
    metadata.emergencyAccess = true;

    // Log for audit trail
    emergencyAccessLog[recordId] = true;

    emit EmergencyAccessGranted(recordId, msg.sender);
}
```

**Security Note**: Emergency access:
- Still requires doctor to be system-authorized
- Creates permanent on-chain audit log
- Visible to patient for transparency
- Can be reviewed for abuse detection

## Common Pitfalls

### 1. Missing Patient Check
```solidity
// ❌ WRONG: Only checks doctor access, not patient ownership
modifier onlyDoctor(uint256 recordId) {
    require(doctorAccess[msg.sender][recordMetadata[recordId].patient], "No access");
    _;
}

// ✅ CORRECT: Checks both patient and doctor
modifier onlyPatientOrDoctor(uint256 recordId) {
    RecordMetadata memory metadata = recordMetadata[recordId];
    require(
        msg.sender == metadata.patient ||
        doctorAccess[metadata.patient][msg.sender],
        "Access denied"
    );
    _;
}
```

### 2. Not Revoking Access

```solidity
// ❌ WRONG: No way to revoke access once granted
function grantDoctorAccess(address doctor) external {
    doctorAccess[msg.sender][doctor] = true;
}

// ✅ CORRECT: Implement both grant and revoke
function grantDoctorAccess(address doctor) external {
    doctorAccess[msg.sender][doctor] = true;
    emit DoctorAuthorized(doctor, msg.sender);
}

function revokeDoctorAccess(address doctor) external {
    doctorAccess[msg.sender][doctor] = false;
    emit DoctorRevoked(doctor, msg.sender);
}
```

### 3. Forgetting View Function Protection

```solidity
// ❌ WRONG: View functions aren't protected
function getRecord(uint256 recordId) external view returns (bytes32) {
    // Anyone can call this!
    return FHE.toBytes32(medicalRecords[recordId].age);
}

// ✅ CORRECT: Even view functions use access control
function getRecord(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (bytes32)
{
    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

## Testing Access Control

```typescript
describe("Access Control", function () {
    it("should deny unauthorized doctor access", async () => {
        const { contract, doctor, unauthorized } = await setupTest();

        // Doctor not authorized by patient
        await expect(
            contract.connect(unauthorized).getEncryptedRecord(recordId)
        ).to.be.revertedWith("Access denied");
    });

    it("should grant access to authorized doctor", async () => {
        const { contract, patient, doctor } = await setupTest();

        // Patient grants access
        await contract.connect(patient).grantDoctorAccess(doctor.address);

        // Doctor can now access
        const record = await contract.connect(doctor).getEncryptedRecord(recordId);
        expect(record.age).to.not.be.undefined;
    });
});
```

## Best Practices

1. ✅ Always validate both system and patient-level permissions
2. ✅ Protect view functions with access control
3. ✅ Implement both grant AND revoke mechanisms
4. ✅ Log all access changes via events
5. ✅ Use modifiers to enforce authorization
6. ✅ Default to deny (fail-secure approach)
7. ✅ Document all access control changes

## Related Concepts

- [Encryption](encryption.md) - Data protection
- [User Decryption](user-decryption.md) - Safe data retrieval
- [Audit Trails](audit-trails.md) - Logging access
- [Emergency Access](emergency-access.md) - Critical care patterns

## Learn More

- [HIPAA Guidelines](https://www.hhs.gov/hipaa)
- [GDPR Data Protection](https://gdpr.eu/)
- [Smart Contract Security Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
