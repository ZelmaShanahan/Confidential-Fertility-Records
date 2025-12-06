// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialFertilityRecords is SepoliaConfig {

    address public owner;
    uint256 public totalRecords;

    struct EncryptedRecord {
        euint8 age;                    // Patient age
        euint8 pregnancyCount;         // Number of pregnancies
        euint8 livebirthCount;         // Number of live births
        euint8 miscarriageCount;       // Number of miscarriages
        euint16 cycleLength;           // Menstrual cycle length in days
        euint8 fertilityScore;         // Fertility assessment score (0-100)
        euint32 lastPeriodDate;        // Last menstrual period (timestamp)
        ebool isUnderTreatment;        // Currently receiving fertility treatment
        ebool hasComplications;        // Has pregnancy complications history
        euint8 hormoneLevels;          // Hormone level indicator (0-255)
        uint256 timestamp;
        bool isActive;
    }

    struct RecordMetadata {
        address patient;
        address authorizedDoctor;
        uint256 createdAt;
        uint256 lastUpdated;
        bool emergencyAccess;
        string ipfsHash;               // For additional encrypted documents
    }

    mapping(uint256 => EncryptedRecord) private medicalRecords;
    mapping(uint256 => RecordMetadata) public recordMetadata;
    mapping(address => uint256[]) public patientRecords;
    mapping(address => mapping(address => bool)) public doctorAccess;
    mapping(address => bool) public authorizedDoctors;
    mapping(uint256 => bool) public emergencyAccessLog;

    event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed doctor);
    event RecordUpdated(uint256 indexed recordId, address indexed updatedBy);
    event DoctorAuthorized(address indexed doctor, address indexed patient);
    event DoctorRevoked(address indexed doctor, address indexed patient);
    event EmergencyAccessGranted(uint256 indexed recordId, address indexed accessor);
    event TreatmentStatusUpdated(uint256 indexed recordId, bool underTreatment);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyPatientOrDoctor(uint256 recordId) {
        RecordMetadata memory metadata = recordMetadata[recordId];
        require(
            msg.sender == metadata.patient ||
            doctorAccess[metadata.patient][msg.sender] ||
            msg.sender == metadata.authorizedDoctor,
            "Access denied"
        );
        _;
    }

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not an authorized doctor");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalRecords = 0;
    }

    // Authorize a doctor to access medical records
    function authorizeDoctor(address doctor) external {
        authorizedDoctors[doctor] = true;
    }

    // Grant doctor access to specific patient records
    function grantDoctorAccess(address doctor) external {
        require(authorizedDoctors[doctor], "Doctor not authorized by system");
        doctorAccess[msg.sender][doctor] = true;
        emit DoctorAuthorized(doctor, msg.sender);
    }

    // Revoke doctor access
    function revokeDoctorAccess(address doctor) external {
        doctorAccess[msg.sender][doctor] = false;
        emit DoctorRevoked(doctor, msg.sender);
    }

    // Create new confidential fertility record
    function createRecord(
        uint8 _age,
        uint8 _pregnancyCount,
        uint8 _livebirthCount,
        uint8 _miscarriageCount,
        uint16 _cycleLength,
        uint8 _fertilityScore,
        uint32 _lastPeriodDate,
        bool _isUnderTreatment,
        bool _hasComplications,
        uint8 _hormoneLevels,
        string memory _ipfsHash
    ) external onlyAuthorizedDoctor {
        require(_age > 0 && _age < 100, "Invalid age");
        require(_fertilityScore <= 100, "Invalid fertility score");

        totalRecords++;
        uint256 recordId = totalRecords;

        // Encrypt all sensitive data
        euint8 encAge = FHE.asEuint8(_age);
        euint8 encPregnancyCount = FHE.asEuint8(_pregnancyCount);
        euint8 encLivebirthCount = FHE.asEuint8(_livebirthCount);
        euint8 encMiscarriageCount = FHE.asEuint8(_miscarriageCount);
        euint16 encCycleLength = FHE.asEuint16(_cycleLength);
        euint8 encFertilityScore = FHE.asEuint8(_fertilityScore);
        euint32 encLastPeriodDate = FHE.asEuint32(_lastPeriodDate);
        ebool encIsUnderTreatment = FHE.asEbool(_isUnderTreatment);
        ebool encHasComplications = FHE.asEbool(_hasComplications);
        euint8 encHormoneLevels = FHE.asEuint8(_hormoneLevels);

        // Store encrypted record
        medicalRecords[recordId] = EncryptedRecord({
            age: encAge,
            pregnancyCount: encPregnancyCount,
            livebirthCount: encLivebirthCount,
            miscarriageCount: encMiscarriageCount,
            cycleLength: encCycleLength,
            fertilityScore: encFertilityScore,
            lastPeriodDate: encLastPeriodDate,
            isUnderTreatment: encIsUnderTreatment,
            hasComplications: encHasComplications,
            hormoneLevels: encHormoneLevels,
            timestamp: block.timestamp,
            isActive: true
        });

        // Store metadata
        recordMetadata[recordId] = RecordMetadata({
            patient: tx.origin, // The patient who initiated the transaction
            authorizedDoctor: msg.sender,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            emergencyAccess: false,
            ipfsHash: _ipfsHash
        });

        // Add to patient's record list
        patientRecords[tx.origin].push(recordId);

        // Set ACL permissions
        FHE.allowThis(encAge);
        FHE.allowThis(encPregnancyCount);
        FHE.allowThis(encLivebirthCount);
        FHE.allowThis(encMiscarriageCount);
        FHE.allowThis(encCycleLength);
        FHE.allowThis(encFertilityScore);
        FHE.allowThis(encLastPeriodDate);
        FHE.allowThis(encIsUnderTreatment);
        FHE.allowThis(encHasComplications);
        FHE.allowThis(encHormoneLevels);

        emit RecordCreated(recordId, tx.origin, msg.sender);
    }

    // Update treatment status
    function updateTreatmentStatus(uint256 recordId, bool _isUnderTreatment)
        external
        onlyPatientOrDoctor(recordId)
    {
        require(medicalRecords[recordId].isActive, "Record not found");

        medicalRecords[recordId].isUnderTreatment = FHE.asEbool(_isUnderTreatment);
        recordMetadata[recordId].lastUpdated = block.timestamp;

        FHE.allowThis(medicalRecords[recordId].isUnderTreatment);

        emit TreatmentStatusUpdated(recordId, _isUnderTreatment);
        emit RecordUpdated(recordId, msg.sender);
    }

    // Update hormone levels
    function updateHormoneLevels(uint256 recordId, uint8 _hormoneLevels)
        external
        onlyPatientOrDoctor(recordId)
    {
        require(medicalRecords[recordId].isActive, "Record not found");
        require(authorizedDoctors[msg.sender], "Only doctors can update hormone levels");

        medicalRecords[recordId].hormoneLevels = FHE.asEuint8(_hormoneLevels);
        recordMetadata[recordId].lastUpdated = block.timestamp;

        FHE.allowThis(medicalRecords[recordId].hormoneLevels);

        emit RecordUpdated(recordId, msg.sender);
    }

    // Emergency access function for critical situations
    function emergencyAccess(uint256 recordId) external onlyAuthorizedDoctor {
        require(medicalRecords[recordId].isActive, "Record not found");

        recordMetadata[recordId].emergencyAccess = true;
        emergencyAccessLog[recordId] = true;

        emit EmergencyAccessGranted(recordId, msg.sender);
    }

    // Get encrypted record (only for authorized users)
    function getEncryptedRecord(uint256 recordId)
        external
        view
        onlyPatientOrDoctor(recordId)
        returns (
            bytes32 age,
            bytes32 pregnancyCount,
            bytes32 livebirthCount,
            bytes32 cycleLength,
            bytes32 fertilityScore,
            bytes32 isUnderTreatment
        )
    {
        require(medicalRecords[recordId].isActive, "Record not found");

        EncryptedRecord memory record = medicalRecords[recordId];

        return (
            FHE.toBytes32(record.age),
            FHE.toBytes32(record.pregnancyCount),
            FHE.toBytes32(record.livebirthCount),
            FHE.toBytes32(record.cycleLength),
            FHE.toBytes32(record.fertilityScore),
            FHE.toBytes32(record.isUnderTreatment)
        );
    }

    // Get patient's record IDs
    function getPatientRecordIds(address patient)
        external
        view
        returns (uint256[] memory)
    {
        require(
            msg.sender == patient ||
            doctorAccess[patient][msg.sender] ||
            authorizedDoctors[msg.sender],
            "Access denied"
        );

        return patientRecords[patient];
    }

    // Check if patient has any fertility complications
    function hasComplicationsEncrypted(uint256 recordId)
        external
        view
        onlyPatientOrDoctor(recordId)
        returns (bytes32)
    {
        require(medicalRecords[recordId].isActive, "Record not found");
        return FHE.toBytes32(medicalRecords[recordId].hasComplications);
    }

    // Get record metadata (non-sensitive information)
    function getRecordMetadata(uint256 recordId)
        external
        view
        onlyPatientOrDoctor(recordId)
        returns (
            address patient,
            address authorizedDoctor,
            uint256 createdAt,
            uint256 lastUpdated,
            bool emergencyAccess,
            string memory ipfsHash
        )
    {
        RecordMetadata memory metadata = recordMetadata[recordId];
        return (
            metadata.patient,
            metadata.authorizedDoctor,
            metadata.createdAt,
            metadata.lastUpdated,
            metadata.emergencyAccess,
            metadata.ipfsHash
        );
    }

    // Deactivate record (soft delete)
    function deactivateRecord(uint256 recordId) external {
        RecordMetadata memory metadata = recordMetadata[recordId];
        require(msg.sender == metadata.patient, "Only patient can deactivate");

        medicalRecords[recordId].isActive = false;
        recordMetadata[recordId].lastUpdated = block.timestamp;
    }

    // Statistical analysis without revealing individual data
    function getAgeGroupStatistics() external view onlyOwner returns (uint256[5] memory) {
        // Returns count of patients in age groups: [18-25], [26-30], [31-35], [36-40], [40+]
        // This would require FHE computations to maintain privacy
        uint256[5] memory ageGroups;
        // Implementation would use FHE operations to count without decryption
        return ageGroups;
    }

    // Check doctor authorization status
    function isDoctorAuthorized(address doctor) external view returns (bool) {
        return authorizedDoctors[doctor];
    }

    // Check if doctor has access to patient
    function hasDoctorAccess(address patient, address doctor) external view returns (bool) {
        return doctorAccess[patient][doctor];
    }
}