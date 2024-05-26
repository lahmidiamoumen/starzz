import { expect } from "chai";
import { ethers } from "hardhat";
import { Club } from "../typechain-types/contracts/Club";
import { Proposal } from "../typechain-types/contracts/Proposal";
import { Roles } from "../typechain-types/contracts/Roles";
import { Signer } from "ethers";

describe("Proposal", function () {
  let club: Club;
  let roles: Roles;
  let proposal: Proposal;
  let owner: any;
  let moderator: any;
  let signers: Signer[];

  beforeEach(async () => {
    signers = await ethers.getSigners();
    moderator = signers[1];
    [owner] = await ethers.getSigners();

    const rolesFactory = await ethers.getContractFactory("Roles");
    const clubFactory = await ethers.getContractFactory("Club");
    const proposalFactory = await ethers.getContractFactory("Proposal");

    roles = await rolesFactory.deploy(owner);
    await roles.waitForDeployment();

    club = await clubFactory.deploy(roles.getAddress());
    await club.waitForDeployment();

    proposal = await proposalFactory.deploy(roles.getAddress(), club.getAddress());
    await proposal.waitForDeployment();

    const clubName = "My Awesome Club";

    await roles.connect(owner).grantModeratorRole(moderator);
    await club.connect(moderator).createClub(clubName);
  });

  // describe("getPageCursor function", () => {
  //   it("Returns (0, 0) for empty proposals", async () => {
  //     const page = 1;
  //     const pageSize = 4;
  //     const clubId = 0;

  //     const [startIndex, endIndex] = await proposal.getPageCursor(page, pageSize, clubId);

  //     expect(startIndex).to.equal(0);
  //     expect(endIndex).to.equal(0);
  //   });

  //   it("Validates invalid page size", async () => {
  //     const clubId = 0;
  //     expect(async () => await proposal.getPageCursor(1, 0, clubId)).to.be.revertedWith("Invalid page size number!");
  //     expect(async () => await proposal.getPageCursor(1, 101, clubId)).to.be.revertedWith("Invalid page size number!");
  //   });

  //   it("Calculates indexes for single page (no overflow)", async () => {
  //     const page = 1;
  //     const pageSize = 4;
  //     const clubId = 0;

  //     const [startIndex, endIndex] = await proposal.getPageCursor(page, pageSize, clubId);

  //     expect(startIndex).to.equal(0);
  //     expect(endIndex).to.equal(2);
  //   });

  //   it("Calculates indexes for multiple pages (no overflow)", async () => {
  //     const page = 2;
  //     const pageSize = 2;
  //     const clubId = 0;

  //     const [startIndex, endIndex] = await proposal.getPageCursor(page, pageSize, clubId);

  //     expect(startIndex).to.equal(2);
  //     expect(endIndex).to.equal(3);
  //   });

  //   it("Calculates indexes for single page (with overflow)", async () => {
  //     const page = 1;
  //     const pageSize = 4;
  //     const clubId = 0;

  //     const [startIndex, endIndex] = await proposal.getPageCursor(page, pageSize, clubId);

  //     expect(startIndex).to.equal(0);
  //     expect(endIndex).to.equal(1);
  //   });

  //   it("Handles invalid page number (less than 1)", async () => {
  //     const page = 0;
  //     const pageSize = 2;
  //     const clubId = 0;

  //     expect(async () => await proposal.getPageCursor(page, pageSize, clubId)).to.be.revertedWith(
  //       "Invalid page number!",
  //     );
  //   });

  //   it("Handles invalid page number (greater than total pages)", async () => {
  //     const page = 3;
  //     const pageSize = 2;
  //     const clubId = 0;

  //     expect(async () => await proposal.getPageCursor(page, pageSize, clubId)).to.be.revertedWith(
  //       "Invalid page number!",
  //     );
  //   });
  // });

  describe("Proposal Creation", function () {
    it("Allows admins or moderators to create a proposal", async () => {
      const admin = signers[0];
      const clubId = 0;

      const tx = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
          "Choice 3",
        ]);

      await tx.wait();

      const proposalDetails = await proposal.getProposalDetails(0, clubId);

      expect(proposalDetails.creator).to.equal(admin);
      expect(proposalDetails.title).to.equal("Improve Documentation");
      expect(proposalDetails.description).to.equal("This proposal suggests creating more detailed tutorials.");
      expect(proposalDetails.status).to.equal(0);
      expect(proposalDetails.choices.length).to.equal(3);
    });

    it("Retrieves proposals for a specific page and page size", async () => {
      const clubId = 0;
      const admin = signers[0];
      const page = 1;
      const pageSize = 4;
      const retrievedProposals = await proposal.getProposals(clubId, page, pageSize);

      expect(retrievedProposals.length).to.equal(0);
      const tx = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);
      await tx.wait();

      const retrievedSndProposal = await proposal.getProposals(clubId, page, pageSize);
      expect(retrievedSndProposal.length).to.equal(1);

      const tx2 = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);
      await tx2.wait();
      const tx3 = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);
      await tx3.wait();

      const ds = await proposal.getProposals(clubId, page, pageSize);
      expect(ds.length).to.equal(3);
      const tx4 = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);
      await tx4.wait();
      const tx5 = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);
      await tx5.wait();

      const retrievedSProposal = await proposal.getProposals(clubId, page, pageSize);
      expect(retrievedSProposal.length).to.equal(4);
    });

    it("Reverts creating a proposal with invalid number of choices", async () => {
      const admin = signers[0];
      const clubId = 0;

      await expect(proposal.connect(admin).createProposal(clubId, "Title", "Description", [])).to.be.revertedWith(
        "Invalid number of choices",
      );

      await expect(
        proposal
          .connect(admin)
          .createProposal(clubId, "Title", "Description", [
            "Choice 1",
            "Choice 2",
            "Choice 3",
            "Choice 4",
            "Choice 5",
            "Choice 6",
            "Choice 7",
            "Choice 8",
            "Choice 9",
            "Choice 11",
            "Choice 12",
          ]),
      ).to.be.revertedWith("Invalid number of choices");
    });

    it("Reverts creating a proposal for non-existent club", async () => {
      const admin = signers[0];
      const invalidClubId = 99;

      await expect(
        proposal.connect(admin).createProposal(invalidClubId, "Title", "Description", ["Choice 1", "Choice 2"]),
      ).to.be.revertedWith("Invalid club ID");
    });
  });

  describe("Proposal Voting", function () {
    beforeEach(async () => {
      const admin = signers[0];
      const clubId = 0;

      const tx = await proposal
        .connect(admin)
        .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
          "Choice 1",
          "Choice 2",
        ]);

      await tx.wait();
    });

    it("Allows authorized users to start voting with positive duration", async () => {
      const admin = signers[0];
      const clubId = 0;
      const duration = 1000; // Assuming duration in seconds

      const tx = await proposal.connect(admin)["startVoting(uint256,uint256,uint256)"](0, clubId, duration);

      await tx.wait();

      const proposalDetails = await proposal.getProposalDetails(0, clubId);
      expect(proposalDetails.status).to.equal(1); // Assuming Active state is 1
      expect(proposalDetails.votingStartTime).to.be.gt(0);
    });

    describe("Proposal Voting (continued)", function () {
      beforeEach(async () => {
        const admin = signers[0];
        const clubId = 0;

        const tx = await proposal
          .connect(admin)
          .createProposal(clubId, "Improve Documentation", "This proposal suggests creating more detailed tutorials.", [
            "Choice 1",
            "Choice 2",
          ]);

        await tx.wait();
      });

      it("Allows authorized users to end voting on an active proposal", async () => {
        const admin = signers[0];
        const clubId = 0;

        const votingStartTime = Math.floor(Date.now() / 1000) + 60 * 60; // Start in 1 hour
        const votingEndTime = votingStartTime + 60 * 60 * 24; // End in 24 hours

        await proposal
          .connect(admin)
          ["startVoting(uint256,uint256,uint256,uint256)"](0, clubId, votingStartTime, votingEndTime);

        await ethers.provider.send("evm_increaseTime", [60 * 60 * 25]); // Simulate time passing (voting period ends)

        const tx = await proposal.connect(admin).endVoting(0, clubId);
        await tx.wait();

        const proposalDetails = await proposal.getProposalDetails(0, clubId);
        expect(proposalDetails.status).to.be.greaterThanOrEqual(2); // Assuming either Passed (2) or Rejected (3)
      });

      it("Reverts ending voting on a proposal with invalid ID", async () => {
        const admin = signers[0];
        const clubId = 0;

        await expect(proposal.connect(admin).endVoting(999, clubId)).to.be.revertedWith("Invalid proposal ID");
      });

      it("Reverts ending voting on a proposal that is not active", async () => {
        const admin = signers[0];
        const clubId = 0;

        await expect(proposal.connect(admin).endVoting(0, clubId)).to.be.revertedWith("Proposal not in voting state");
      });

      it("Reverts starting voting with invalid duration", async () => {
        const admin = signers[0];
        const invalidDuration = 499; // Less than minimum allowed duration
        const clubId = 0;

        await expect(
          proposal.connect(admin)["startVoting(uint256,uint256,uint256)"](0, clubId, invalidDuration),
        ).to.be.revertedWith("Duration must be positive");
      });

      it("Allows authorized users to start voting with specific start and end time", async () => {
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore?.timestamp || 0;

        const admin = signers[0];
        const votingStartTime = timestampBefore + 3600; // Start in 1 hour
        const votingEndTime = votingStartTime + 60 * 60 * 24; // End in 24 hours
        const clubId = 0;

        const tx = await proposal
          .connect(admin)
          ["startVoting(uint256,uint256,uint256,uint256)"](0, clubId, votingStartTime, votingEndTime);

        await tx.wait();

        const proposalDetails = await proposal.getProposalDetails(0, clubId);
        expect(proposalDetails.status).to.equal(1); // Assuming Active state is 1
        expect(proposalDetails.votingStartTime).to.equal(votingStartTime);
        expect(proposalDetails.votingEndTime).to.equal(votingEndTime);
      });

      it("Reverts starting voting with invalid time (start after end)", async () => {
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore?.timestamp || 0;
        const clubId = 0;

        const admin = signers[0];
        const votingStartTime = timestampBefore + 60 * 60; // Start in 1 hour
        const votingEndTime = votingStartTime - 60 * 60; // End before start

        await expect(
          proposal
            .connect(admin)
            ["startVoting(uint256,uint256,uint256,uint256)"](0, clubId, votingStartTime, votingEndTime),
        ).to.be.revertedWith("End time must be after start time");
      });

      it("Allows club members to vote on an active proposal", async () => {
        const clubMember = signers[2];
        const admin = signers[0];
        const clubId = 0;

        await club.connect(clubMember).joinClub(0);
        await club.connect(admin).approveMembership(clubMember, 0);
        const duration = 3600; // Assuming duration in seconds

        const tx1 = await proposal.connect(admin)["startVoting(uint256,uint256,uint256)"](0, clubId, duration);
        await tx1.wait();
        const tx = await proposal.connect(clubMember).vote(0, clubId, 0); // Vote for choice 0

        await tx.wait();

        const proposalDetails = await proposal.getProposalDetails(0, clubId);
        expect(proposalDetails.choices[0].votes).to.equal(1);
      });

      it("Reverts voting on a proposal with invalid ID", async () => {
        const clubMember = signers[2];
        const duration = 1000; // Assuming duration in seconds
        const clubId = 0;

        const tx1 = await proposal.connect(owner)["startVoting(uint256,uint256,uint256)"](0, clubId, duration);
        await tx1.wait();

        await expect(proposal.connect(clubMember).vote(999, clubId, 0)).to.be.revertedWith("Invalid proposal ID");
      });

      it("Reverts voting on a proposal that is not active", async () => {
        const clubMember = signers[2];
        const admin = signers[0];
        const clubId = 0;

        // Simulate joining the club (replace with your Club contract logic)
        await club.connect(clubMember).joinClub(0);
        await club.connect(admin).approveMembership(clubMember, 0);

        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore?.timestamp || 0;

        // Simulate starting voting with specific end time in the past
        const pastTime = timestampBefore - 3600; // 1 hour ago
        await expect(
          proposal.connect(admin)["startVoting(uint256,uint256,uint256,uint256)"](0, clubId, pastTime, pastTime + 9600),
        ).to.be.revertedWith("Start time must be in the future");

        await expect(proposal.connect(clubMember).vote(0, clubId, 0)).to.be.revertedWith(
          "Proposal not in voting state",
        );
      });

      it("Reverts voting on a proposal if user is not a club member", async () => {
        const randomUser = signers[2];
        const duration = 1000; // Assuming duration in seconds
        const clubId = 0;

        const tx1 = await proposal.connect(owner)["startVoting(uint256,uint256,uint256)"](0, clubId, duration);
        await tx1.wait();
        await expect(proposal.connect(randomUser).vote(0, clubId, 0)).to.be.revertedWith("Not a member of this club");
      });

      it("Reverts voting on a proposal twice by the same user", async () => {
        const clubMember = signers[2];
        const admin = signers[0];
        const clubId = 0;

        // Simulate joining the club (replace with your Club contract logic)
        await club.connect(clubMember).joinClub(0);
        await club.connect(admin).approveMembership(clubMember, 0);

        const duration = 1000; // Assuming duration in seconds

        const tx1 = await proposal.connect(admin)["startVoting(uint256,uint256,uint256)"](0, clubId, duration);
        await tx1.wait();

        const tx = await proposal.connect(clubMember).vote(0, clubId, 0); // Vote for choice 0
        await tx.wait();

        await expect(proposal.connect(clubMember).vote(0, clubId, 0)).to.be.revertedWith(
          "Already voted on this proposal",
        );
      });
    });
  });
});
