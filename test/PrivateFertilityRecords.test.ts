/**
 * @title Private Fertility Records Test Suite
 * @description Comprehensive test suite demonstrating FHEVM concepts for confidential healthcare data management
 * @chapter access-control
 * @chapter encryption
 * @chapter user-decryption
 * @category healthcare
 * @category privacy
 *
 * This test suite demonstrates:
 * - Encryption of sensitive medical data using FHEVM
 * - Access control patterns for healthcare providers and patients
 * - Secure data updates with encrypted values
 * - Emergency access mechanisms
 * - Role-based permissions
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialFertilityRecords } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PrivateFertilityRecords", function () {
  /**
   * @dev Test fixtures and global variables
   * These will be initialized before each test
   */
  let fertilityRecords: ConfidentialFertilityRecords;
  let owner: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let doctor1: SignerWithAddress;
  let doctor2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  /**
   * @section Setup and Deployment
   * @description Deploy the contract and set up test accounts before each test
   *
   * **Key Concept:** Contract deployment and initialization
   * - Deploy the ConfidentialFertilityRecords contract
   * - Set up multiple test accounts representing different roles
   * - Initialize the testing environment
   */
  beforeEach(async function () {
    // Get test signers
    [owner, patient1, patient2, doctor1, doctor2, unauthorized] = await ethers.getSigners();

    /**
     * @step Deploy the ConfidentialFertilityRecords contract
     * @description The contract is deployed with the owner account
     */
    const FertilityRecordsFactory = await ethers.getContractFactory("ConfidentialFertilityRecords");
    fertilityRecords = await FertilityRecordsFactory.deploy();
    await fertilityRecords.waitForDeployment();

    console.log(`\n  📋 Contract deployed at: ${await fertilityRecords.getAddress()}`);
  });

  /**
   * @section Contract Deployment Tests
   * @description Verify correct contract initialization
   */
  describe("Deployment", function () {
    /**
     * @test Should set the correct owner
     * @description Verifies that the contract owner is properly set during deployment
     *
     * **FHEVM Concept:** Contract initialization
     * - The owner has special privileges for authorizing healthcare providers
     */
    it("Should set the correct owner", async function () {
      expect(await fertilityRecords.owner()).to.equal(owner.address);
    });

    /**
     * @test Should initialize with zero records
     * @description Verifies the initial state of the contract
     */
    it("Should initialize with zero records", async function () {
      expect(await fertilityRecords.totalRecords()).to.equal(0);
    });
  });

  /**
   * @section Healthcare Provider Authorization
   * @description Tests for doctor authorization mechanisms
   * @chapter access-control
   *
   * **FHEVM Concept:** Access Control Layer
   * - Only authorized healthcare providers can create and access records
   * - Multi-level authorization: system-level and patient-level
   */
  describe("Healthcare Provider Authorization", function () {
    /**
     * @test Should allow owner to authorize healthcare providers
     * @description System administrator can grant healthcare provider privileges
     *
     * **Access Pattern:** System-level authorization
     * - Owner/admin authorizes healthcare providers
     * - Required before providers can create records
     */
    it("Should allow owner to authorize healthcare providers", async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      expect(await fertilityRecords.isDoctorAuthorized(doctor1.address)).to.be.true;
    });

    /**
     * @test Should prevent unauthorized doctor from being marked as authorized
     * @description Verifies the initial state before authorization
     */
    it("Should prevent unauthorized doctor from being marked as authorized", async function () {
      expect(await fertilityRecords.isDoctorAuthorized(doctor2.address)).to.be.false;
    });

    /**
     * @test Should allow multiple doctors to be authorized
     * @description Multiple healthcare providers can be authorized independently
     */
    it("Should allow multiple doctors to be authorized", async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(owner).authorizeDoctor(doctor2.address);

      expect(await fertilityRecords.isDoctorAuthorized(doctor1.address)).to.be.true;
      expect(await fertilityRecords.isDoctorAuthorized(doctor2.address)).to.be.true;
    });
  });

  /**
   * @section Record Creation with Encryption
   * @description Tests for creating encrypted medical records
   * @chapter encryption
   * @chapter input-proof
   *
   * **FHEVM Core Concept:** Data Encryption
   * - All sensitive medical data is encrypted using FHE.asEuint*
   * - Data remains encrypted on-chain
   * - Encryption happens at the contract level
   */
  describe("Encrypted Record Creation", function () {
    beforeEach(async function () {
      // Authorize doctor1 for these tests
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
    });

    /**
     * @test Should create an encrypted medical record with valid data
     * @description Demonstrates the complete flow of creating an encrypted fertility record
     *
     * **FHEVM Operations Demonstrated:**
     * 1. FHE.asEuint8() - Encrypts 8-bit values (age, counts, scores)
     * 2. FHE.asEuint16() - Encrypts 16-bit values (cycle length)
     * 3. FHE.asEuint32() - Encrypts 32-bit values (dates/timestamps)
     * 4. FHE.asEbool() - Encrypts boolean values
     * 5. FHE.allowThis() - Grants contract permission to use encrypted values
     *
     * **Privacy Guarantee:** All medical data is encrypted before storage
     */
    it("Should create an encrypted medical record with valid data", async function () {
      const tx = await fertilityRecords.connect(doctor1).createRecord(
        28,        // age
        2,         // pregnancy count
        1,         // live birth count
        1,         // miscarriage count
        28,        // cycle length (days)
        75,        // fertility score
        1704067200, // last period date (timestamp)
        true,      // is under treatment
        false,     // has complications
        120,       // hormone levels
        "QmTest123" // IPFS hash for additional documents
      );

      await tx.wait();

      /**
       * @verify Check that the record was created successfully
       */
      expect(await fertilityRecords.totalRecords()).to.equal(1);

      /**
       * @verify Verify the RecordCreated event was emitted
       * @event RecordCreated - Logs when a new medical record is created
       */
      await expect(tx)
        .to.emit(fertilityRecords, "RecordCreated")
        .withArgs(1, owner.address, doctor1.address);
    });

    /**
     * @test Should reject record creation with invalid age
     * @description Demonstrates input validation for medical data
     *
     * **Anti-Pattern:** Invalid data should be rejected before encryption
     * - Validate data before expensive encryption operations
     * - Prevents waste of gas and invalid encrypted data
     */
    it("Should reject record creation with invalid age", async function () {
      await expect(
        fertilityRecords.connect(doctor1).createRecord(
          0,         // ❌ Invalid age (too low)
          2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
        )
      ).to.be.revertedWith("Invalid age");

      await expect(
        fertilityRecords.connect(doctor1).createRecord(
          150,       // ❌ Invalid age (too high)
          2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
        )
      ).to.be.revertedWith("Invalid age");
    });

    /**
     * @test Should reject record creation with invalid fertility score
     * @description Fertility scores must be within 0-100 range
     */
    it("Should reject record creation with invalid fertility score", async function () {
      await expect(
        fertilityRecords.connect(doctor1).createRecord(
          28, 2, 1, 1, 28,
          150,       // ❌ Invalid score (exceeds 100)
          1704067200, true, false, 120, ""
        )
      ).to.be.revertedWith("Invalid fertility score");
    });

    /**
     * @test Should prevent unauthorized users from creating records
     * @description Only authorized healthcare providers can create records
     *
     * **Access Control Pattern:** Two-level authorization required
     * 1. Must be an authorized healthcare provider (system-level)
     * 2. Must be called by an authorized doctor
     */
    it("Should prevent unauthorized users from creating records", async function () {
      await expect(
        fertilityRecords.connect(unauthorized).createRecord(
          28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
        )
      ).to.be.revertedWith("Not an authorized doctor");
    });

    /**
     * @test Should store record metadata correctly
     * @description Verifies that non-encrypted metadata is stored properly
     *
     * **Design Pattern:** Separation of encrypted and public data
     * - Encrypted: Medical details (age, counts, scores, etc.)
     * - Public: Metadata (addresses, timestamps, IPFS hashes)
     */
    it("Should store record metadata correctly", async function () {
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, "QmTest456"
      );

      const metadata = await fertilityRecords.getRecordMetadata(1);

      expect(metadata[0]).to.equal(owner.address);           // patient address
      expect(metadata[1]).to.equal(doctor1.address);         // authorized doctor
      expect(metadata[4]).to.be.false;                       // emergency access flag
      expect(metadata[5]).to.equal("QmTest456");             // IPFS hash
    });

    /**
     * @test Should increment totalRecords counter
     * @description Each new record increments the global counter
     */
    it("Should increment totalRecords counter", async function () {
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      expect(await fertilityRecords.totalRecords()).to.equal(1);

      await fertilityRecords.connect(doctor1).createRecord(
        30, 0, 0, 0, 30, 85, 1704067200, false, false, 110, ""
      );
      expect(await fertilityRecords.totalRecords()).to.equal(2);
    });
  });

  /**
   * @section Patient Access Control
   * @description Tests for patient-level access control mechanisms
   * @chapter access-control
   *
   * **FHEVM Access Pattern:** Granular access control
   * - Patients can grant/revoke access to specific healthcare providers
   * - Separate from system-level authorization
   */
  describe("Patient Access Control", function () {
    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(owner).authorizeDoctor(doctor2.address);
    });

    /**
     * @test Should allow patient to grant healthcare provider access
     * @description Patients control who can access their medical records
     *
     * **Access Control Flow:**
     * 1. Healthcare provider must be system-authorized
     * 2. Patient grants access to specific provider
     * 3. Provider can now access patient's records
     */
    it("Should allow patient to grant healthcare provider access", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const hasAccess = await fertilityRecords.hasDoctorAccess(patient1.address, doctor1.address);
      expect(hasAccess).to.be.true;
    });

    /**
     * @test Should emit DoctorAuthorized event when access is granted
     * @description Events provide an audit trail for access grants
     */
    it("Should emit DoctorAuthorized event when access is granted", async function () {
      await expect(fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address))
        .to.emit(fertilityRecords, "DoctorAuthorized")
        .withArgs(doctor1.address, patient1.address);
    });

    /**
     * @test Should allow patient to revoke healthcare provider access
     * @description Patients can revoke access at any time
     *
     * **Privacy Control:** Patient maintains full control
     */
    it("Should allow patient to revoke healthcare provider access", async function () {
      // Grant access first
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);
      expect(await fertilityRecords.hasDoctorAccess(patient1.address, doctor1.address)).to.be.true;

      // Then revoke it
      await fertilityRecords.connect(patient1).revokeDoctorAccess(doctor1.address);
      expect(await fertilityRecords.hasDoctorAccess(patient1.address, doctor1.address)).to.be.false;
    });

    /**
     * @test Should emit DoctorRevoked event when access is revoked
     */
    it("Should emit DoctorRevoked event when access is revoked", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      await expect(fertilityRecords.connect(patient1).revokeDoctorAccess(doctor1.address))
        .to.emit(fertilityRecords, "DoctorRevoked")
        .withArgs(doctor1.address, patient1.address);
    });

    /**
     * @test Should prevent granting access to non-authorized healthcare providers
     * @description System-level authorization is required first
     *
     * **Security Pattern:** Multi-level authorization
     * - Prevents patients from granting access to unvetted providers
     */
    it("Should prevent granting access to non-authorized healthcare providers", async function () {
      await expect(
        fertilityRecords.connect(patient1).grantDoctorAccess(unauthorized.address)
      ).to.be.revertedWith("Doctor not authorized by system");
    });
  });

  /**
   * @section Encrypted Data Updates
   * @description Tests for updating encrypted medical records
   * @chapter encryption
   * @chapter access-control
   *
   * **FHEVM Pattern:** Updating encrypted values
   * - Updates maintain encryption
   * - Access control is enforced on updates
   */
  describe("Encrypted Data Updates", function () {
    let recordId: number;

    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);

      // Create a test record
      const tx = await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      await tx.wait();
      recordId = 1;
    });

    /**
     * @test Should allow authorized healthcare provider to update treatment status
     * @description Healthcare providers can update treatment information
     *
     * **FHEVM Operation:** Updating encrypted boolean
     * - Uses FHE.asEbool() to encrypt the new value
     * - Previous encrypted value is replaced
     */
    it("Should allow authorized healthcare provider to update treatment status", async function () {
      // Grant doctor access
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const tx = await fertilityRecords.connect(doctor1).updateTreatmentStatus(recordId, false);
      await tx.wait();

      /**
       * @verify Event emission confirms update
       */
      await expect(tx)
        .to.emit(fertilityRecords, "TreatmentStatusUpdated")
        .withArgs(recordId, false);

      await expect(tx)
        .to.emit(fertilityRecords, "RecordUpdated")
        .withArgs(recordId, doctor1.address);
    });

    /**
     * @test Should allow authorized healthcare provider to update hormone levels
     * @description Demonstrates updating encrypted numeric values
     *
     * **FHEVM Operation:** Updating encrypted uint8
     * - Uses FHE.asEuint8() for encryption
     * - Access control enforced via modifier
     */
    it("Should allow authorized healthcare provider to update hormone levels", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const tx = await fertilityRecords.connect(doctor1).updateHormoneLevels(recordId, 150);
      await tx.wait();

      await expect(tx)
        .to.emit(fertilityRecords, "RecordUpdated")
        .withArgs(recordId, doctor1.address);
    });

    /**
     * @test Should prevent unauthorized users from updating records
     * @description Access control prevents unauthorized updates
     *
     * **Security:** onlyPatientOrDoctor modifier
     * - Checks patient ownership
     * - Checks doctor access grant
     * - Checks if caller is the original authorized doctor
     */
    it("Should prevent unauthorized users from updating records", async function () {
      await expect(
        fertilityRecords.connect(unauthorized).updateTreatmentStatus(recordId, false)
      ).to.be.revertedWith("Access denied");

      await expect(
        fertilityRecords.connect(unauthorized).updateHormoneLevels(recordId, 150)
      ).to.be.revertedWith("Access denied");
    });

    /**
     * @test Should prevent non-doctors from updating hormone levels
     * @description Only healthcare providers can update medical measurements
     *
     * **Role-Based Access:** Different operations for different roles
     * - Patients: Can update treatment status
     * - Healthcare providers: Can update all medical data
     */
    it("Should prevent non-doctors from updating hormone levels", async function () {
      await expect(
        fertilityRecords.connect(patient1).updateHormoneLevels(recordId, 150)
      ).to.be.revertedWith("Only doctors can update hormone levels");
    });

    /**
     * @test Should update the lastUpdated timestamp
     * @description Metadata tracks when records were last modified
     */
    it("Should update the lastUpdated timestamp", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const metadataBefore = await fertilityRecords.getRecordMetadata(recordId);
      const timestampBefore = metadataBefore[3];

      // Wait a bit to ensure timestamp changes
      await time.increase(2);

      await fertilityRecords.connect(doctor1).updateTreatmentStatus(recordId, false);

      const metadataAfter = await fertilityRecords.getRecordMetadata(recordId);
      const timestampAfter = metadataAfter[3];

      expect(timestampAfter).to.be.gt(timestampBefore);
    });
  });

  /**
   * @section Emergency Access
   * @description Tests for emergency access mechanisms
   * @chapter access-control
   *
   * **Healthcare Pattern:** Emergency override
   * - Allows immediate access in critical situations
   * - Creates audit trail
   * - Still requires healthcare provider authorization
   */
  describe("Emergency Access", function () {
    let recordId: number;

    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      recordId = 1;
    });

    /**
     * @test Should allow authorized healthcare provider to request emergency access
     * @description Emergency situations may require immediate access
     *
     * **Emergency Pattern:**
     * - Bypasses patient consent requirement
     * - Logs the access for audit purposes
     * - Sets emergency flag on record metadata
     */
    it("Should allow authorized healthcare provider to request emergency access", async function () {
      const tx = await fertilityRecords.connect(doctor1).emergencyAccess(recordId);
      await tx.wait();

      await expect(tx)
        .to.emit(fertilityRecords, "EmergencyAccessGranted")
        .withArgs(recordId, doctor1.address);

      // Verify emergency access flag is set
      const metadata = await fertilityRecords.getRecordMetadata(recordId);
      expect(metadata[4]).to.be.true; // emergencyAccess flag
    });

    /**
     * @test Should prevent unauthorized users from emergency access
     * @description Even emergency access requires healthcare provider authorization
     *
     * **Security Balance:** Emergency vs Authorization
     * - Allows quick access in emergencies
     * - But only for verified healthcare providers
     */
    it("Should prevent unauthorized users from emergency access", async function () {
      await expect(
        fertilityRecords.connect(unauthorized).emergencyAccess(recordId)
      ).to.be.revertedWith("Not an authorized doctor");
    });

    /**
     * @test Should log emergency access separately
     * @description Emergency accesses are tracked in a separate log
     */
    it("Should log emergency access separately", async function () {
      await fertilityRecords.connect(doctor1).emergencyAccess(recordId);

      // The emergency access log is stored on-chain
      expect(await fertilityRecords.emergencyAccessLog(recordId)).to.be.true;
    });
  });

  /**
   * @section Record Retrieval
   * @description Tests for retrieving encrypted record data
   * @chapter user-decryption
   * @chapter access-control
   *
   * **FHEVM Concept:** Accessing encrypted data
   * - Encrypted data can be retrieved as bytes32 handles
   * - Actual decryption requires proper permissions and keys
   * - Access control applies to reads as well as writes
   */
  describe("Encrypted Record Retrieval", function () {
    let recordId: number;

    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      recordId = 1;
    });

    /**
     * @test Should allow authorized users to retrieve encrypted record
     * @description Demonstrates retrieving encrypted values as handles
     *
     * **FHEVM Handles:**
     * - FHE.toBytes32() converts encrypted values to bytes32
     * - Returns handles, not plaintext
     * - Client-side decryption requires proper keys
     *
     * **Access Pattern:** View function with access control
     * - onlyPatientOrDoctor modifier enforces permissions
     * - Returns encrypted handles for client-side processing
     */
    it("Should allow authorized users to retrieve encrypted record", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const encryptedData = await fertilityRecords.connect(doctor1).getEncryptedRecord(recordId);

      /**
       * @verify Each field is returned as bytes32 encrypted handle
       */
      expect(encryptedData.age).to.be.properHex(64);           // bytes32
      expect(encryptedData.pregnancyCount).to.be.properHex(64);
      expect(encryptedData.livebirthCount).to.be.properHex(64);
      expect(encryptedData.cycleLength).to.be.properHex(64);
      expect(encryptedData.fertilityScore).to.be.properHex(64);
      expect(encryptedData.isUnderTreatment).to.be.properHex(64);
    });

    /**
     * @test Should prevent unauthorized users from retrieving records
     * @description Access control applies to read operations
     *
     * **Privacy Enforcement:** No read access without authorization
     */
    it("Should prevent unauthorized users from retrieving records", async function () {
      await expect(
        fertilityRecords.connect(unauthorized).getEncryptedRecord(recordId)
      ).to.be.revertedWith("Access denied");
    });

    /**
     * @test Should allow patient to retrieve their own records
     * @description Patients always have access to their own data
     */
    it("Should allow patient to retrieve their own records", async function () {
      // Patient (owner in this case) should be able to access
      const encryptedData = await fertilityRecords.connect(owner).getEncryptedRecord(recordId);
      expect(encryptedData.age).to.be.properHex(64);
    });

    /**
     * @test Should retrieve complications status as encrypted value
     * @description Demonstrates retrieving specific encrypted boolean field
     */
    it("Should retrieve complications status as encrypted value", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const encryptedComplications = await fertilityRecords
        .connect(doctor1)
        .hasComplicationsEncrypted(recordId);

      expect(encryptedComplications).to.be.properHex(64);
    });

    /**
     * @test Should retrieve patient record IDs
     * @description Patients can list all their record IDs
     *
     * **Pattern:** Public identifiers, private data
     * - Record IDs are public
     * - Actual medical data is encrypted
     */
    it("Should retrieve patient record IDs", async function () {
      // Create another record
      await fertilityRecords.connect(doctor1).createRecord(
        30, 0, 0, 0, 30, 85, 1704067200, false, false, 110, ""
      );

      const recordIds = await fertilityRecords.getPatientRecordIds(owner.address);
      expect(recordIds.length).to.equal(2);
      expect(recordIds[0]).to.equal(1);
      expect(recordIds[1]).to.equal(2);
    });
  });

  /**
   * @section Record Deactivation
   * @description Tests for soft-deleting medical records
   * @chapter access-control
   *
   * **Pattern:** Soft delete vs hard delete
   * - Records are deactivated, not deleted
   * - Maintains data integrity and audit trail
   * - Only patients can deactivate their own records
   */
  describe("Record Deactivation", function () {
    let recordId: number;

    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      recordId = 1;
    });

    /**
     * @test Should allow patient to deactivate their own record
     * @description Patients control their data lifecycle
     *
     * **Privacy Right:** Right to remove access
     * - Patient can deactivate records
     * - Prevents further access
     * - Data remains on-chain (immutable blockchain)
     */
    it("Should allow patient to deactivate their own record", async function () {
      await fertilityRecords.connect(owner).deactivateRecord(recordId);

      // Verify the record is deactivated by trying to access it
      await expect(
        fertilityRecords.connect(owner).getEncryptedRecord(recordId)
      ).to.be.revertedWith("Record not found");
    });

    /**
     * @test Should prevent non-patients from deactivating records
     * @description Only the patient can deactivate their records
     *
     * **Access Control:** Patient-only operation
     */
    it("Should prevent non-patients from deactivating records", async function () {
      await expect(
        fertilityRecords.connect(doctor1).deactivateRecord(recordId)
      ).to.be.revertedWith("Only patient can deactivate");

      await expect(
        fertilityRecords.connect(unauthorized).deactivateRecord(recordId)
      ).to.be.revertedWith("Only patient can deactivate");
    });

    /**
     * @test Should prevent operations on deactivated records
     * @description Deactivated records cannot be updated or accessed
     */
    it("Should prevent operations on deactivated records", async function () {
      await fertilityRecords.connect(owner).deactivateRecord(recordId);

      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      await expect(
        fertilityRecords.connect(doctor1).updateTreatmentStatus(recordId, false)
      ).to.be.revertedWith("Record not found");

      await expect(
        fertilityRecords.connect(doctor1).updateHormoneLevels(recordId, 150)
      ).to.be.revertedWith("Record not found");
    });
  });

  /**
   * @section Multi-Patient Scenarios
   * @description Tests for multiple patients and healthcare providers
   * @chapter access-control
   *
   * **Scalability Pattern:** Multi-tenancy
   * - Multiple patients can use the same contract
   * - Each patient's data is isolated
   * - Access control prevents cross-patient access
   */
  describe("Multi-Patient Scenarios", function () {
    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
      await fertilityRecords.connect(owner).authorizeDoctor(doctor2.address);
    });

    /**
     * @test Should maintain separate records for different patients
     * @description Each patient has isolated record storage
     *
     * **Data Isolation:** Patient separation
     * - Records are linked to patient addresses
     * - No cross-patient data leakage
     */
    it("Should maintain separate records for different patients", async function () {
      // Patient1 creates a record through doctor1
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );

      // Patient2 creates a record through doctor2
      await fertilityRecords.connect(doctor2).createRecord(
        30, 0, 0, 0, 30, 85, 1704067200, false, false, 110, ""
      );

      // Verify separate record ownership
      const patient1Records = await fertilityRecords.getPatientRecordIds(owner.address);
      const patient2Records = await fertilityRecords.getPatientRecordIds(patient2.address);

      expect(patient1Records.length).to.equal(1);
      expect(patient2Records.length).to.equal(1);
      expect(patient1Records[0]).to.not.equal(patient2Records[0]);
    });

    /**
     * @test Should prevent cross-patient data access
     * @description Healthcare providers cannot access other patients' records without permission
     *
     * **Security:** Patient-specific access control
     */
    it("Should prevent cross-patient data access", async function () {
      // Patient1's record
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );

      // Doctor2 should not be able to access patient1's record without permission
      await expect(
        fertilityRecords.connect(doctor2).getEncryptedRecord(1)
      ).to.be.revertedWith("Access denied");
    });

    /**
     * @test Should allow patient to grant access to multiple healthcare providers
     * @description Patients can share their records with multiple providers
     */
    it("Should allow patient to grant access to multiple healthcare providers", async function () {
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);
      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor2.address);

      expect(await fertilityRecords.hasDoctorAccess(patient1.address, doctor1.address)).to.be.true;
      expect(await fertilityRecords.hasDoctorAccess(patient1.address, doctor2.address)).to.be.true;
    });
  });

  /**
   * @section Gas Optimization Tests
   * @description Tests to verify gas efficiency
   * @chapter best-practices
   *
   * **Performance:** Gas optimization
   * - FHEVM operations are expensive
   * - Optimize data structures and access patterns
   */
  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await fertilityRecords.connect(owner).authorizeDoctor(doctor1.address);
    });

    /**
     * @test Should measure gas cost for record creation
     * @description Benchmark gas usage for encrypted record creation
     *
     * **Optimization Note:** FHE operations are gas-intensive
     * - Each FHE.asEuint*() call costs gas
     * - Batch operations when possible
     */
    it("Should measure gas cost for record creation", async function () {
      const tx = await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );
      const receipt = await tx.wait();

      console.log(`  ⛽ Gas used for record creation: ${receipt?.gasUsed.toString()}`);

      // Just verify it completes successfully
      expect(receipt?.status).to.equal(1);
    });

    /**
     * @test Should measure gas cost for updates
     * @description Compare gas costs of different update operations
     */
    it("Should measure gas cost for updates", async function () {
      await fertilityRecords.connect(doctor1).createRecord(
        28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
      );

      await fertilityRecords.connect(patient1).grantDoctorAccess(doctor1.address);

      const tx = await fertilityRecords.connect(doctor1).updateTreatmentStatus(1, false);
      const receipt = await tx.wait();

      console.log(`  ⛽ Gas used for treatment status update: ${receipt?.gasUsed.toString()}`);
      expect(receipt?.status).to.equal(1);
    });
  });
});
