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
      const newModerator = signers[1];

      expect(await roles.isModerator(newModerator)).to.be.false;

      await roles.connect(owner).grantModeratorRole(newModerator);

      expect(await roles.isModerator(newModerator)).to.be.true;
      expect(await roles.isAdminOrModerator(newModerator)).to.be.true;
    });

    it("Grants CS role to a new address by Admin", async () => {
      const newCS = signers[2];
      const moderator = signers[3];

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
      const newModerator = signers[1];

      await roles.connect(owner).grantModeratorRole(newModerator);

      const grantModeratorAgainPromise = roles.connect(owner).grantModeratorRole(newModerator);
      await expect(grantModeratorAgainPromise).to.be.revertedWith("User is already a moderator");
    });
  });

  describe("Role Revoking", function () {
    it("Revokes Moderator role from an address by Admin", async () => {
      const newModerator = signers[1];
      const newAdmin = signers[2];

      expect(await roles.isAdmin(newAdmin)).to.be.false;
      await roles.connect(owner).grantAdminRole(newAdmin);
      expect(await roles.isAdmin(newAdmin)).to.be.true;

      await roles.connect(newAdmin).grantModeratorRole(newModerator);
      expect(await roles.isModerator(newModerator)).to.be.true;

      await roles.connect(newAdmin).revokeModeratorRole(newModerator);

      expect(await roles.isModerator(newModerator)).to.be.false;
      expect(await roles.isAdminOrModerator(newModerator)).to.be.false;

      await roles.connect(owner).revokeAdminRole(newAdmin);
      expect(await roles.isAdmin(newAdmin)).to.be.false;
    });

    it("Revokes CS role from an address by Admin or Moderator", async () => {
      const newCS = signers[2];
      const moderator = signers[1];

      await roles.connect(owner).grantModeratorRole(moderator);

      expect(await roles.isCS(newCS)).to.be.false;

      await roles.connect(moderator).grantCSRole(newCS);
      expect(await roles.isCS(newCS)).to.be.true; // Assuming an `isCS` function exists

      // Revoke by Moderator
      await roles.connect(moderator).revokeCSRole(newCS); // Should still work
      expect(await roles.isCS(newCS)).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("isAdminOrModerator returns true for Admin and Moderator roles", async () => {
      const moderator = signers[1];
      const user = signers[2];
      const admin = signers[3];

      expect(await roles.isAdminOrModerator(moderator)).to.be.false;
      expect(await roles.isAdminOrModerator(admin)).to.be.false;

      await roles.connect(owner).grantModeratorRole(moderator);
      await roles.connect(owner).grantAdminRole(admin);

      expect(await roles.isAdminOrModerator(owner)).to.be.true;
      expect(await roles.isAdminOrModerator(moderator)).to.be.true;
      expect(await roles.isAdminOrModerator(admin)).to.be.true;
      expect(await roles.isAdminOrModerator(user)).to.be.false;
    });

    it("isStaff returns true for Admin, Moderator, and CS roles", async () => {
      const moderator = signers[1];
      const newCS = signers[2];
      const user = signers[3];
      const admin = signers[4];

      await roles.connect(owner).grantAdminRole(admin);
      await roles.connect(admin).grantModeratorRole(moderator);
      await roles.connect(moderator).grantCSRole(newCS);

      expect(await roles.isStaff(owner)).to.be.true;
      expect(await roles.isStaff(moderator)).to.be.true;
      expect(await roles.isStaff(newCS)).to.be.true;
      expect(await roles.isStaff(admin)).to.be.true;
      expect(await roles.isStaff(user)).to.be.false;
    });
  });
});
