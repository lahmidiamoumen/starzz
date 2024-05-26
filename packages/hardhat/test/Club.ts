import { expect } from "chai";
import { ethers } from "hardhat";
import { Club } from "../typechain-types/contracts/Club";
import { Roles } from "../typechain-types/contracts/Roles";
import { Signer } from "ethers";

describe("Club", function () {
  let club: Club;
  let roles: Roles;
  let owner: any;
  let moderator: any;
  let signers: Signer[];

  beforeEach(async () => {
    signers = await ethers.getSigners();
    moderator = signers[1];
    [owner] = await ethers.getSigners();
    const rolesFactory = await ethers.getContractFactory("Roles");
    roles = await rolesFactory.deploy(owner);
    await roles.waitForDeployment();

    // Deploy Club contract with Roles address
    const clubFactory = await ethers.getContractFactory("Club");
    club = await clubFactory.deploy(roles.getAddress());
    await club.waitForDeployment();
    await roles.connect(owner).grantModeratorRole(moderator);
  });

  describe("Club Creation", function () {
    it("Creates a club by an Admin or Moderator from Roles contract", async () => {
      const clubName = "My Awesome Club";

      await club.connect(moderator).createClub(clubName);

      const clubDetails = await club.getClubDetails(0);

      expect(clubDetails.name).to.equal(clubName);
      expect(clubDetails.creator).to.equal(moderator);
    });

    it("Reverts creating a club with non-Admin/Moderator roles", async () => {
      const clubName = "Another Club";
      const randomUser = signers[4];

      await expect(club.connect(randomUser).createClub(clubName)).to.be.revertedWith(
        "Roles: caller is not admin or moderator",
      );
    });
  });

  describe("Club Membership", function () {
    let clubId: number;

    beforeEach(async () => {
      const clubName = "Membership Club";
      await club.connect(owner).createClub(clubName);
      // await roles.connect(owner).grantCSRole(cs);
      clubId = 0;
    });

    it("Allows a user to join a club", async () => {
      const user = signers[1];
      expect(await club["hasRequestedMembership(address,uint256)"](user, clubId)).to.be.false;
      await club.connect(user).joinClub(clubId);
      expect(await club["hasRequestedMembership(address,uint256)"](user, clubId)).to.be.true;
    });

    it("Allows staff to approve a membership request", async () => {
      const user = signers[1];

      await club.connect(user).joinClub(clubId);
      expect(await club["hasRequestedMembership(address,uint256)"](user, clubId)).to.be.true;
      await club.connect(moderator).approveMembership(user, clubId);

      expect(await club.isMember(user, clubId)).to.be.true;
      expect(await club["hasRequestedMembership(address,uint256)"](user, clubId)).to.be.false;
    });

    it("Allows staff to reject a membership request", async () => {
      const user = signers[1];

      await club.connect(user).joinClub(clubId);
      await club.connect(signers[0]).rejectMembership(user, clubId);

      expect(await club["hasRequestedMembership(address,uint256)"](user, clubId)).to.be.false;
    });

    it("Reverts rejecting membership for a non-existent user", async () => {
      const nonExistentUser = "0x0000000000000000000000000000000000000000";

      await expect(club.connect(signers[0]).rejectMembership(nonExistentUser, clubId)).to.be.revertedWith(
        "User has not requested membership",
      );
    });

    it("Reverts rejecting membership for a user with no pending request", async () => {
      const user = signers[1];

      await club.connect(user).joinClub(clubId);
      await club.connect(signers[0]).approveMembership(user, clubId);

      await expect(club.connect(signers[0]).rejectMembership(user, clubId)).to.be.revertedWith(
        "User has not requested membership",
      );
    });

    it("Reverts rejecting membership with non-staff privileges", async () => {
      const user = signers[1];
      const randomUser = signers[3];

      await club.connect(user).joinClub(clubId);
      await expect(club.connect(randomUser).rejectMembership(user, clubId)).to.be.revertedWith(
        "Roles: caller is not admin or moderator",
      );
    });

    it("Allows a user to leave a club they are a member of", async () => {
      const user = signers[1];

      await club.connect(user).joinClub(clubId);
      await club.connect(moderator).approveMembership(user, clubId);
      expect(await club.isMember(user, clubId)).to.be.true;
      await club.connect(user).leaveClub(clubId);
      expect(await club.isMember(user, clubId)).to.be.false;
    });
  });
});
