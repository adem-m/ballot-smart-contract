import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Voting system", () => {
  const votingSessions = [
    { description: "A tale of three idiots", proposals: ["Paul", "Paolo", "Adem"] },
    { description: "Best chain ?", proposals: ["Ethereum", "Binance", "Polygon", "Avalanche", "Solana"] }
  ];

  async function deployContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2] = await ethers.getSigners();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const contract = await VotingSystem.deploy();

    return { contract, owner, account1, account2 };
  }

  describe("initVotingSession", () => {
    it("should create a new voting session", async () => {
      const { contract, account1 } = await loadFixture(deployContractFixture);
      const _contract = contract.connect(account1);

      await expect(contract.votingSessions(0)).to.be.reverted;
      await expect(_contract.initVotingSession(
        votingSessions[0].description,
        votingSessions[0].proposals
      )).to.be.fulfilled;
      await expect(contract.votingSessions(0)).to.be.fulfilled;
    });

    it("should emit a 'VotingSessionCreated' event", async () => {
      const { contract, account1 } = await loadFixture(deployContractFixture);
      const _contract = contract.connect(account1);
      await expect(_contract.initVotingSession(
        votingSessions[0].description,
        votingSessions[0].proposals
      )).to
        .emit(_contract, "VotingSessionCreated")
        .withArgs(0, account1.address);
    });

    it("should revert when the description is empty", async () => {
      const { contract, account1 } = await loadFixture(deployContractFixture);
      const _contract = contract.connect(account1);
      await expect(_contract.initVotingSession(
        "",
        votingSessions[0].proposals
      )).to.be.revertedWith("You must provide a description for the voting session.");
    });
  });
});