import { expect } from "chai";
import { ethers } from "hardhat";
import { Roles } from "../typechain-types/contracts/Roles"; // Update the path if necessary
import { Signer } from "ethers";

describe("Roles", function () {
  // We define a fixture to reuse the same setup in every test.

  let roles: Roles;
  let owner: any; // Use a more specific type like ethers.Signer if available in your environment
  let signers: Signer[];

  beforeEach(async () => {
    signers = await ethers.getSigners();
    [owner] = await ethers.getSigners();
    const rolesFactory = await ethers.getContractFactory("Roles");
    roles = await rolesFactory.deploy(owner);
    await roles.waitForDeployment(); // Use deployed() instead of waitForDeployment()
  });
  describe("Role Granting", function () {
    it("Grants Moderator role to a new address by Admin", async () => {
      const newModerator = signers[1]; // Use the second signer

      expect(await roles.isModerator(newModerator)).to.be.false; // Check initial state

      await roles.connect(owner).grantModeratorRole(newModerator);

      expect(await roles.isModerator(newModerator)).to.be.true;
      expect(await roles.isAdminOrModerator(newModerator)).to.be.true; // Verify moderator can be staff
    });

    it("Grants CS role to a new address by Admin", async () => {
      const newCS = signers[2]; // Use the third signer
      const moderator = signers[3]; // Use the third signer

      expect(await roles.isCS(newCS)).to.be.false;

      await roles.connect(owner).grantModeratorRole(moderator);
      await roles.connect(moderator).grantCSRole(newCS);

      expect(await roles.isCS(newCS)).to.be.true;
      expect(await roles.isStaff(newCS)).to.be.true;
    });

    it("Reverts granting a role with insufficient privileges", async () => {
      const randomUser = signers[4]; // Use the fifth signer

      const grantModeratorPromise = roles.connect(randomUser).grantModeratorRole(randomUser);
      const grantCSPromise = roles.connect(randomUser).grantCSRole(randomUser);

      await expect(grantModeratorPromise).to.be.revertedWith("Caller is not an admin");
      await expect(grantCSPromise).to.be.revertedWith("Caller is not admin or moderator");
    });

    it("Reverts granting an existing role", async () => {
      const newModerator = signers[1]; // Use the second signer

      await roles.connect(owner).grantModeratorRole(newModerator);

      const grantModeratorAgainPromise = roles.connect(owner).grantModeratorRole(newModerator);
      await expect(grantModeratorAgainPromise).to.be.revertedWith("User is already a moderator");
    });
  });

  describe("Role Revoking", function () {
    it("Revokes Moderator role from an address by Admin", async () => {
      const newModerator = signers[1]; // Use the second signer

      await roles.connect(owner).grantModeratorRole(newModerator);
      expect(await roles.isModerator(newModerator)).to.be.true;

      await roles.connect(owner).revokeModeratorRole(newModerator);

      expect(await roles.isModerator(newModerator)).to.be.false;
      expect(await roles.isAdminOrModerator(newModerator)).to.be.false; // No longer staff
    });

    it("Revokes CS role from an address by Admin or Moderator", async () => {
      const newCS = signers[2]; // Use the third signer
      const moderator = signers[1]; // Use the second signer (moderator)

      await roles.connect(owner).grantModeratorRole(moderator);

      expect(await roles.isCS(newCS)).to.be.false;

      await roles.connect(moderator).grantCSRole(newCS);
      expect(await roles.isCS(newCS)).to.be.true; // Assuming an `isCS` function exists

      // Revoke by Moderator
      await roles.connect(moderator).revokeCSRole(newCS); // Should still work
      expect(await roles.isCS(newCS)).to.be.false;
    });

    // ... other role revoking tests (similarly update for CS and Fan roles)
  });

  describe("View Functions", function () {
    it("isAdminOrModerator returns true for Admin and Moderator roles", async () => {
      const moderator = signers[1]; // Use the second signer
      const user = signers[2]; // Use the second signer

      expect(await roles.isAdminOrModerator(moderator)).to.be.false;

      await roles.connect(owner).grantModeratorRole(moderator);

      expect(await roles.isAdminOrModerator(owner)).to.be.true;
      expect(await roles.isAdminOrModerator(moderator)).to.be.true;
      expect(await roles.isAdminOrModerator(user)).to.be.false;
    });

    it("isStaff returns true for Admin, Moderator, and CS roles", async () => {
      const moderator = signers[1]; // Use the second signer
      const newCS = signers[2]; // Use the third signer
      const user = signers[3]; // Use the third signer

      await roles.connect(owner).grantModeratorRole(moderator);
      await roles.connect(moderator).grantCSRole(newCS);

      expect(await roles.isStaff(owner)).to.be.true;
      expect(await roles.isStaff(moderator)).to.be.true;
      expect(await roles.isStaff(newCS)).to.be.true;
      expect(await roles.isStaff(user)).to.be.false;
    });

    // Add similar tests for isCS and isAdmin functions (if applicable)
  });
});
