import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Ballot", () => {
  const proposals = ["Paul", "Paolo", "Adem"];

  async function deployBallotFixture() {
    // Contracts are deployed using the first signer/account by default
    const [chairman, otherAccount] = await ethers.getSigners();

    const Ballot = await ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy(
      "A tale of three idiots",
      proposals
    );

    return { ballot, chairman, otherAccount, proposals };
  }

  describe("deploy", () => {
    it("should create all propositions", async () => {
      const { ballot, proposals } = await loadFixture(deployBallotFixture);

      expect(await ballot.proposalCount()).to.equal(proposals.length);
      expect((await ballot.getProposal(0)).content).to.equal(proposals[0]);
      expect((await ballot.getProposal(1)).content).to.equal(proposals[1]);
      expect((await ballot.getProposal(2)).content).to.equal(proposals[2]);
    })

    it("should assign a chairman", async () => {
      const { ballot, chairman } = await loadFixture(deployBallotFixture);

      expect(await ballot.chairman()).to.equal(chairman.address);
    })

    it("should fail when providing an empty description", async () => {
      const Ballot = await ethers.getContractFactory("Ballot");
      await expect(Ballot.deploy(
        "",
        proposals
      )).to.be.revertedWith("You must provide a description for the ballot.");
    })
  })

  describe("close", () => {
    it("should close properly", async () => {
      const { ballot } = await loadFixture(deployBallotFixture);

      expect(await ballot.isOpen()).to.equal(true);
      await expect(ballot.close()).to.be.fulfilled;
      expect(await ballot.isOpen()).to.equal(false);
    })

    it("should not close twice", async () => {
      const { ballot } = await loadFixture(deployBallotFixture);
      await ballot.close();

      await expect(ballot.close()).to.be.revertedWith("This ballot is already closed.");
    })

    it("should be closed but only by the chairman", async () => {
      const { ballot, otherAccount } = await loadFixture(deployBallotFixture);
      const failBallot = ballot.connect(otherAccount);

      await expect(failBallot.close()).to.be.revertedWith("Only the chairman can close the ballot.");
    })
  })
})