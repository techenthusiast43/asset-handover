const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetHandover Smart Contract", function () {
  let AssetHandover, contract;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    AssetHandover = await ethers.getContractFactory("AssetHandover");
    contract = await AssetHandover.deploy();
    await contract.waitForDeployment();
  });

  describe("1. Asset Registration", function () {
    it("should allow a user to register a physical asset and emit AssetRegistered event", async function () {
      const tx = await contract.connect(user1).registerAsset(
        "MacBook Pro M3 Max",
        "SN-MBP-98842",
        "16-inch 64GB Silver laptop assigned to engineering",
        "IT Equipment"
      );
      const receipt = await tx.wait();

      // Check event
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");

      expect(event).to.not.be.undefined;
      const assetId = event.args.assetId;
      expect(event.args.name).to.equal("MacBook Pro M3 Max");
      expect(event.args.assetRef).to.equal("SN-MBP-98842");
      expect(event.args.originalOwner).to.equal(user1.address);

      // Verify asset state
      const asset = await contract.getAsset(assetId);
      expect(asset.name).to.equal("MacBook Pro M3 Max");
      expect(asset.assetRef).to.equal("SN-MBP-98842");
      expect(asset.originalOwner).to.equal(user1.address);
      expect(asset.currentCustodian).to.equal(user1.address);
      expect(asset.exists).to.be.true;
    });

    it("should prevent duplicate asset reference registration", async function () {
      await contract.connect(user1).registerAsset(
        "Excavator X1",
        "SN-CAT-5001",
        "Heavy hydraulic machinery",
        "Machinery"
      );

      await expect(
        contract.connect(user2).registerAsset(
          "Duplicate Excavator",
          "SN-CAT-5001",
          "Trying to register same serial number",
          "Machinery"
        )
      ).to.be.revertedWithCustomError(contract, "AssetAlreadyExists");
    });

    it("should reject registration with empty name or asset reference", async function () {
      await expect(
        contract.connect(user1).registerAsset("", "REF-001", "desc", "cat")
      ).to.be.revertedWithCustomError(contract, "EmptyName");

      await expect(
        contract.connect(user1).registerAsset("Name", "", "desc", "cat")
      ).to.be.revertedWithCustomError(contract, "EmptyAssetRef");
    });
  });

  describe("2. Handover Initiation", function () {
    let assetId;

    beforeEach(async function () {
      const tx = await contract.connect(user1).registerAsset(
        "Dell Precision 7780",
        "TAG-DELL-8890",
        "Workstation laptop",
        "Hardware"
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");
      assetId = event.args.assetId;
    });

    it("should allow current custodian to initiate handover", async function () {
      const tx = await contract.connect(user1).initiateHandover(
        assetId,
        user2.address,
        "Mint Condition, complete with charger",
        "Transferring for Q4 project deployment"
      );
      await expect(tx)
        .to.emit(contract, "HandoverInitiated")
        .withArgs(
          assetId,
          user1.address,
          user2.address,
          "Mint Condition, complete with charger",
          "Transferring for Q4 project deployment",
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      const pending = await contract.getActiveHandover(assetId);
      expect(pending.fromCustodian).to.equal(user1.address);
      expect(pending.toRecipient).to.equal(user2.address);
      expect(pending.status).to.equal(1); // Pending
    });

    it("should revert if non-custodian tries to initiate handover", async function () {
      await expect(
        contract.connect(user2).initiateHandover(
          assetId,
          user3.address,
          "Good",
          "Unauthorized transfer"
        )
      ).to.be.revertedWithCustomError(contract, "NotCurrentCustodian");
    });

    it("should prevent initiating handover to oneself", async function () {
      await expect(
        contract.connect(user1).initiateHandover(
          assetId,
          user1.address,
          "Good",
          "Self transfer"
        )
      ).to.be.revertedWithCustomError(contract, "CannotHandoverToSelf");
    });

    it("should prevent multiple simultaneous pending handovers for the same asset", async function () {
      await contract.connect(user1).initiateHandover(
        assetId,
        user2.address,
        "Good",
        "First request"
      );

      await expect(
        contract.connect(user1).initiateHandover(
          assetId,
          user3.address,
          "Good",
          "Second request"
        )
      ).to.be.revertedWithCustomError(contract, "ActiveHandoverAlreadyExists");
    });
  });

  describe("3. Handover Acceptance", function () {
    let assetId;

    beforeEach(async function () {
      const tx = await contract.connect(user1).registerAsset(
        "Tesla Model 3 Keycard",
        "VIN-5YJ3E1EA-9912",
        "Company fleet vehicle keycard",
        "Fleet Vehicle"
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");
      assetId = event.args.assetId;

      await contract.connect(user1).initiateHandover(
        assetId,
        user2.address,
        "No scratches, verified battery 95%",
        "Monthly maintenance handover"
      );
    });

    it("should allow only the designated recipient to accept the handover", async function () {
      await expect(
        contract.connect(user3).acceptHandover(assetId)
      ).to.be.revertedWithCustomError(contract, "NotDesignatedRecipient");

      const tx = await contract.connect(user2).acceptHandover(assetId);
      await expect(tx)
        .to.emit(contract, "HandoverAccepted")
        .withArgs(
          assetId,
          user1.address,
          user2.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      // Verify custodian updated
      const asset = await contract.getAsset(assetId);
      expect(asset.currentCustodian).to.equal(user2.address);
      // Verify original owner remains intact
      expect(asset.originalOwner).to.equal(user1.address);

      // Verify active handover status updated
      const active = await contract.getActiveHandover(assetId);
      expect(active.status).to.equal(2); // Accepted

      // Verify history contains this record
      const history = await contract.getHandoverHistory(assetId);
      expect(history.length).to.equal(1);
      expect(history[0].fromCustodian).to.equal(user1.address);
      expect(history[0].toRecipient).to.equal(user2.address);
      expect(history[0].status).to.equal(2); // Accepted
    });
  });

  describe("4. Handover Rejection", function () {
    let assetId;

    beforeEach(async function () {
      const tx = await contract.connect(user1).registerAsset(
        "Server Rack Switch",
        "TAG-SW-48P-99",
        "48-port Cisco Gigabit switch",
        "Networking"
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");
      assetId = event.args.assetId;

      await contract.connect(user1).initiateHandover(
        assetId,
        user2.address,
        "Used",
        "Relocating to Datacenter B"
      );
    });

    it("should allow recipient to reject handover and keep original custodian", async function () {
      await expect(
        contract.connect(user3).rejectHandover(assetId, "Not for me")
      ).to.be.revertedWithCustomError(contract, "NotDesignatedRecipient");

      const tx = await contract.connect(user2).rejectHandover(assetId, "Damaged port 14");
      await expect(tx)
        .to.emit(contract, "HandoverRejected")
        .withArgs(
          assetId,
          user1.address,
          user2.address,
          "Damaged port 14",
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      // Custodian must remain user1
      const asset = await contract.getAsset(assetId);
      expect(asset.currentCustodian).to.equal(user1.address);

      // Verify status is Rejected
      const active = await contract.getActiveHandover(assetId);
      expect(active.status).to.equal(3); // Rejected

      // Custodian can now initiate a new handover because previous is no longer Pending
      await expect(
        contract.connect(user1).initiateHandover(
          assetId,
          user3.address,
          "Repaired",
          "Retrying transfer"
        )
      ).to.not.be.reverted;
    });
  });

  describe("5. Handover Cancellation", function () {
    let assetId;

    beforeEach(async function () {
      const tx = await contract.connect(user1).registerAsset(
        "Oscilloscope Rig",
        "LAB-OSC-440",
        "Digital storage oscilloscope",
        "Lab Equipment"
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");
      assetId = event.args.assetId;

      await contract.connect(user1).initiateHandover(
        assetId,
        user2.address,
        "Calibrated",
        "Testing session handover"
      );
    });

    it("should allow sender to cancel pending handover", async function () {
      await expect(
        contract.connect(user2).cancelHandover(assetId)
      ).to.be.revertedWithCustomError(contract, "NotHandoverInitiator");

      const tx = await contract.connect(user1).cancelHandover(assetId);
      await expect(tx)
        .to.emit(contract, "HandoverCancelled")
        .withArgs(
          assetId,
          user1.address,
          user2.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      const active = await contract.getActiveHandover(assetId);
      expect(active.status).to.equal(4); // Cancelled

      // Custodian remains user1
      const asset = await contract.getAsset(assetId);
      expect(asset.currentCustodian).to.equal(user1.address);
    });
  });

  describe("6. Multi-hop Handover History & Views", function () {
    it("should trace complete chain of custody across multiple handovers", async function () {
      // 1. user1 registers
      const tx = await contract.connect(user1).registerAsset(
        "Projector 4K",
        "PJ-4K-001",
        "Conference room projector",
        "AV Equipment"
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AssetRegistered");
      const assetId = event.args.assetId;

      // 2. user1 -> user2
      await contract.connect(user1).initiateHandover(assetId, user2.address, "New", "Meeting Room 1");
      await contract.connect(user2).acceptHandover(assetId);

      // 3. user2 -> user3
      await contract.connect(user2).initiateHandover(assetId, user3.address, "Good", "Meeting Room 2");
      await contract.connect(user3).acceptHandover(assetId);

      const asset = await contract.getAsset(assetId);
      expect(asset.originalOwner).to.equal(user1.address);
      expect(asset.currentCustodian).to.equal(user3.address);

      const history = await contract.getHandoverHistory(assetId);
      expect(history.length).to.equal(2);
      expect(history[0].fromCustodian).to.equal(user1.address);
      expect(history[0].toRecipient).to.equal(user2.address);
      expect(history[1].fromCustodian).to.equal(user2.address);
      expect(history[1].toRecipient).to.equal(user3.address);

      // Verify filtered views
      const user3Assets = await contract.getAssetsByCustodian(user3.address);
      expect(user3Assets.length).to.equal(1);
      expect(user3Assets[0].name).to.equal("Projector 4K");

      const user1Created = await contract.getAssetsByOriginalOwner(user1.address);
      expect(user1Created.length).to.equal(1);
    });
  });
});

