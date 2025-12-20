# Emergency Access Patterns

## Overview

This guide demonstrates how to implement emergency access mechanisms in healthcare applications where immediate data access might be critical in life-threatening situations.

## The Challenge

In healthcare, there are situations where immediate access to patient records is necessary to save a life, even if normal access control would deny it. The challenge is to balance:

- **Patient Privacy**: Default deny access to patient records
- **Emergency Response**: Enable critical care in emergencies
- **Accountability**: Maintain immutable audit trails
- **Transparency**: Let patients know about emergency access

## Emergency Access Model

### Three-Level Authorization

```
┌─────────────────────────────────────────────┐
│ Level 1: System Authorization               │
│ (Doctor must be system-authorized)          │
└────────────────────┬────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────┐
│ Level 2: Emergency Access Request           │
│ (Doctor calls emergencyAccess function)     │
└────────────────────┬────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────┐
│ Level 3: Immediate Access + Audit Log       │
│ (Access granted + logged on-chain)          │
└─────────────────────────────────────────────┘
```

## Implementation

### Smart Contract

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

contract EmergencyAccessExample {
    // Emergency access flag
    mapping(uint256 => bool) public emergencyAccessLog;

    // Authorized healthcare providers
    mapping(address => bool) public authorizedDoctors;

    // Record metadata
    mapping(uint256 => RecordMetadata) public recordMetadata;

    struct RecordMetadata {
        address patient;
        address createdBy;
        uint256 createdAt;
        bool emergencyAccessGranted;
    }

    event EmergencyAccessGranted(
        uint256 indexed recordId,
        address indexed accessor,
        uint256 timestamp
    );

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not authorized");
        _;
    }

    /// @notice Grant emergency access to a record
    /// @dev Emergency access bypasses patient consent
    /// @param recordId The record to access
    function emergencyAccess(uint256 recordId)
        external
        onlyAuthorizedDoctor
    {
        // Verify record exists
        require(
            recordMetadata[recordId].createdAt != 0,
            "Record not found"
        );

        // Grant emergency access
        emergencyAccessLog[recordId] = true;
        recordMetadata[recordId].emergencyAccessGranted = true;

        // Emit immutable audit log
        emit EmergencyAccessGranted(
            recordId,
            msg.sender,
            block.timestamp
        );
    }

    /// @notice Get encrypted record (emergency access included)
    /// @dev View function with emergency access check
    function getEncryptedRecord(uint256 recordId)
        external
        view
        returns (bytes32)
    {
        RecordMetadata memory metadata = recordMetadata[recordId];

        // Allow if patient grants access OR emergency access granted
        require(
            msg.sender == metadata.patient ||
            emergencyAccessLog[recordId],
            "Access denied"
        );

        // Return encrypted data
        return getEncryptedData(recordId);
    }

    /// @notice Check if emergency access was used
    function hasEmergencyAccess(uint256 recordId)
        external
        view
        returns (bool)
    {
        return emergencyAccessLog[recordId];
    }

    function getEncryptedData(uint256 recordId)
        internal
        view
        returns (bytes32)
    {
        // Return encrypted medical data
        return bytes32(0);
    }
}
```

## Access Flow Diagram

### Normal Access (Patient Grants Access)

```
Doctor → Check Patient Permission → YES → Get Data
            ↓
            NO → Access Denied
```

### Emergency Access

```
Doctor → System Authorized? → YES → Grant Emergency Access
            ↓
            NO → Access Denied
         ↓
      Grant Immediate Access
         ↓
      Log Emergency on-chain (immutable)
         ↓
      Patient can see emergency flag
```

## Key Patterns

### 1. Authorization Gate

```solidity
modifier onlyAuthorizedDoctor() {
    require(authorizedDoctors[msg.sender], "Doctor not authorized");
    _;
}

function emergencyAccess(uint256 recordId)
    external
    onlyAuthorizedDoctor  // Still requires system authorization
{
    // Emergency access logic
}
```

### 2. Immutable Audit Trail

```solidity
// Event logs cannot be modified or deleted
event EmergencyAccessGranted(
    uint256 indexed recordId,
    address indexed accessor,
    uint256 timestamp
);

function emergencyAccess(uint256 recordId) external {
    // Grant access
    emergencyAccessLog[recordId] = true;

    // Emit immutable event for audit
    emit EmergencyAccessGranted(
        recordId,
        msg.sender,
        block.timestamp
    );
}
```

### 3. Transparency for Patient

```solidity
// Patient can check if emergency access was used
function wasEmergencyAccessUsed(uint256 recordId)
    external
    view
    returns (bool)
{
    return emergencyAccessLog[recordId];
}
```

## Security Considerations

### ✅ What This Approach Provides

1. **Authorization Requirement** - Emergency access still requires doctor to be system-authorized
2. **Audit Trail** - Immutable on-chain record of who accessed when
3. **Transparency** - Patient can query if emergency access was used
4. **Accountability** - Doctor identity is permanently recorded
5. **Time Stamp** - Exact time of access is logged

### ⚠️ What This Doesn't Provide

- **Prevention of abuse** - Doctor can still claim "emergency"
- **Automatic review** - Requires human review of logs
- **Revocation** - Cannot undo emergency access grant
- **Patient notification** - Requires off-chain notification system

## Best Practices

### 1. Restrict Emergency Access

```solidity
// Only allow emergency access during actual business hours
// (to prevent late-night unauthorized access)
modifier onlyDuringBusinessHours() {
    uint256 hour = (block.timestamp / 3600) % 24;
    require(hour >= 6 && hour <= 22, "Outside business hours");
    _;
}

function emergencyAccess(uint256 recordId)
    external
    onlyAuthorizedDoctor
    onlyDuringBusinessHours  // Restrict to business hours
{
    // Grant emergency access
}
```

### 2. Log Additional Context

```solidity
// Store additional emergency context
mapping(uint256 => EmergencyAccess) public emergencyAccessDetails;

struct EmergencyAccess {
    address accessor;
    uint256 timestamp;
    string reason;  // "cardiac arrest", "severe trauma", etc.
    uint256 blockNumber;
}

function emergencyAccess(uint256 recordId, string calldata reason)
    external
    onlyAuthorizedDoctor
{
    emergencyAccessDetails[recordId] = EmergencyAccess({
        accessor: msg.sender,
        timestamp: block.timestamp,
        reason: reason,
        blockNumber: block.number
    });

    emit EmergencyAccessGranted(recordId, msg.sender, block.timestamp);
}
```

### 3. Emergency Access Review

```solidity
// Track which emergency accesses were legitimate
mapping(uint256 => bool) public emergencyAccessReviewed;
mapping(uint256 => bool) public emergencyAccessApproved;

// Off-chain process:
// 1. Admin reviews emergency access logs
// 2. Determines if it was legitimate
// 3. Calls approveEmergencyAccess or flagEmergencyAbuse

function approveEmergencyAccess(uint256 recordId)
    external
    onlyAdmin
{
    emergencyAccessReviewed[recordId] = true;
    emergencyAccessApproved[recordId] = true;
}

function flagEmergencyAbuse(uint256 recordId)
    external
    onlyAdmin
{
    emergencyAccessReviewed[recordId] = true;
    emergencyAccessApproved[recordId] = false;

    emit EmergencyAccessFlagged(recordId);
}
```

## Testing Emergency Access

```typescript
describe("Emergency Access", function () {
    it("should grant emergency access to authorized doctor", async () => {
        const { contract, doctor, patient } = await setup();

        // Authorize doctor
        await contract.authorizeDoctor(doctor.address);

        // Grant emergency access (bypasses patient consent)
        const tx = await contract
            .connect(doctor)
            .emergencyAccess(recordId);

        await expect(tx).to.emit(contract, "EmergencyAccessGranted");

        // Verify access was granted
        const hasAccess = await contract.hasEmergencyAccess(recordId);
        expect(hasAccess).to.be.true;
    });

    it("should deny unauthorized doctor emergency access", async () => {
        const { contract, unauthorized } = await setup();

        // Unauthorized doctor cannot request emergency access
        await expect(
            contract.connect(unauthorized).emergencyAccess(recordId)
        ).to.be.revertedWith("Not authorized");
    });

    it("should create immutable audit log", async () => {
        const { contract, doctor } = await setup();

        const tx = await contract
            .connect(doctor)
            .emergencyAccess(recordId);

        const receipt = await tx.wait();

        // Check event was emitted
        const event = receipt.events.find(
            e => e.event === "EmergencyAccessGranted"
        );
        expect(event).to.not.be.undefined;
        expect(event.args.accessor).to.equal(doctor.address);
    });
});
```

## Regulatory Considerations

### HIPAA Compliance

- Emergency access must be authorized by system
- Must maintain audit trail
- Must notify patient (off-chain)
- Must document the emergency justification

### GDPR Compliance

- Emergency access is justified by Article 6(1)(e) (public task)
- Must maintain access logs
- Data subject can access logs under Article 15
- Must document purpose of emergency access

## Real-World Scenario

```solidity
// Patient arrives at ER unconscious
// Doctor needs access to medication history

function emergencyAccessWithContext(
    uint256 recordId,
    string calldata emergencyReason
) external onlyAuthorizedDoctor {
    RecordMetadata storage metadata = recordMetadata[recordId];

    // Verify patient exists
    require(metadata.createdAt != 0, "Patient not found");

    // Grant emergency access
    emergencyAccessLog[recordId] = true;

    // Store emergency context for audit
    emergencyContext[recordId] = emergencyReason;

    // Emit detailed audit event
    emit EmergencyAccessGranted(
        recordId,
        msg.sender,
        block.timestamp
    );

    // Off-chain: Send notification to patient
    // (via SMS, email, in-app notification)
    _notifyPatientOfEmergencyAccess(
        recordId,
        msg.sender,
        emergencyReason
    );
}
```

## Anti-Patterns to Avoid

### ❌ No Authorization Check

```solidity
// WRONG: Anyone can claim emergency
function emergencyAccess(uint256 recordId) external {
    emergencyAccessLog[recordId] = true;
    // No onlyAuthorizedDoctor check!
}
```

### ❌ No Audit Trail

```solidity
// WRONG: No way to track who accessed
function emergencyAccess(uint256 recordId) external onlyAuthorizedDoctor {
    // Silently grant access
    grantAccess(recordId, msg.sender);
    // No event emitted!
}
```

### ❌ Revocable Emergency Access

```solidity
// WRONG: Can deny emergency access was granted
function revokeEmergencyAccess(uint256 recordId) external {
    emergencyAccessLog[recordId] = false; // Can be revoked!
}
```

## Best Practices Summary

1. ✅ Always require system authorization
2. ✅ Emit immutable events for every emergency access
3. ✅ Store access context and reasoning
4. ✅ Make audit logs queryable by patient
5. ✅ Document regulatory justification
6. ✅ Consider time-based restrictions
7. ✅ Implement review process for audit
8. ✅ Notify patient of emergency access
9. ✅ Never allow revocation of audit logs
10. ✅ Test emergency scenarios thoroughly

## Related Concepts

- [Access Control](access-control.md) - Normal authorization
- [Encryption](encryption.md) - Data protection
- [Audit Trails](audit-trails.md) - Logging and transparency

## Learn More

- [HIPAA Emergency Access Requirements](https://www.hhs.gov/hipaa)
- [GDPR Article 6 - Lawfulness of Processing](https://gdpr.eu/)
- [Healthcare Data Security](https://www.healthit.gov/topic/privacy-security-and-hipaa)
