import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";


describe("Voting system", () => {
    const votingSessions = [
        {description: "A tale of three idiots", proposals: ["Paul", "Paolo", "Adem"]},
        {description: "Best chain ?", proposals: ["Ethereum", "Binance", "Polygon", "Avalanche", "Solana"]}
    ];

    async function deployContractFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, account1, account2] = await ethers.getSigners();

        const VotingSystem = await ethers.getContractFactory("VotingSystem");
        const contract = await VotingSystem.deploy();

        return {contract, owner, account1, account2};
    }

    async function createVotingSessionWithAccount1() {
        const {contract, owner, account1, account2} = await deployContractFixture();
        await contract.connect(account1).initVotingSession(
            votingSessions[0].description,
            votingSessions[0].proposals
        );

        return {contract, owner, account1, account2};
    }

    describe("initVotingSession", () => {
        it("should create a new voting session", async () => {
            const {contract, account1} = await loadFixture(deployContractFixture);
            const _contract = contract.connect(account1);

            await expect(contract.votingSessions(0)).to.be.reverted;
            await expect(_contract.initVotingSession(
                votingSessions[0].description,
                votingSessions[0].proposals
            )).to.be.fulfilled;
            await expect(contract.votingSessions(0)).to.be.fulfilled;
        });

        it("should emit a 'VotingSessionCreated' event", async () => {
            const {contract, account1} = await loadFixture(deployContractFixture);
            const _contract = contract.connect(account1);
            await expect(_contract.initVotingSession(
                votingSessions[0].description,
                votingSessions[0].proposals
            )).to
                .emit(_contract, "VotingSessionCreated")
                .withArgs(0, account1.address);
        });

        it("should revert when the description is empty", async () => {
            const {contract, account1} = await loadFixture(deployContractFixture);
            const _contract = contract.connect(account1);
            await expect(_contract.initVotingSession(
                "",
                votingSessions[0].proposals
            )).to.be.revertedWith("You must provide a description for the voting session.");
        });
    });

    describe("vote", () => {
        it("should update the scores of each proposal", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);

            expect((await contract.getProposals(0)).map(p => p.decidingVote)).to.deep.equal([0, 0, 0]);
            await expect(contract.connect(account2).vote(0, [1, 2, 3])).to.be.fulfilled;
            expect((await contract.getProposals(0)).map(p => p.decidingVote)).to.deep.equal([0, 0, 1]);
        });

        it("should emit a 'VoteRegistered' event", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);

            await expect(_contract.vote(0, [1, 2, 3]))
                .to
                .emit(_contract, "VoteRegistered")
                .withArgs(0, account2.address);
        });

        it("should revert when the voting session does not exist", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);

            await expect(_contract.vote(3, [1, 2, 3])).to.be.revertedWith("Voting session not found.");
        });

        it("should revert when voting more than once", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);
            await _contract.vote(0, [1, 2, 3]);

            await expect(_contract.vote(0, [1, 2, 3])).to.be.revertedWith("You have already voted.");
        });

        it("should revert when the voting session is already closed", async () => {
            const {contract, account1, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);
            await contract.connect(account1).close(0);

            await expect(_contract.vote(0, [1, 2, 3])).to.be.revertedWith("This voting session is already closed.");
        });

        it("should revert when providing too few choices", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);

            await expect(_contract.vote(0, [1, 2])).to.be.revertedWith("Incorrect number of choices.");
        });

        it("should revert when providing too many choices", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);

            await expect(_contract.vote(0, [1, 2, 3, 4])).to.be.revertedWith("Incorrect number of choices.");
        });
    });

    describe("close", () => {
        it("should close the voting session", async () => {
            const {contract, account1} = await loadFixture(createVotingSessionWithAccount1);

            await expect(contract.connect(account1).close(0)).to.be.fulfilled;
        });

        it("should emit a 'VotingSesionClosed' event", async () => {
            const {contract, account1} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account1);

            await expect(_contract.close(0))
                .to
                .emit(_contract, "VotingSessionClosed")
                .withArgs(0);
        });

        it("should revert when the voting session does not exist", async () => {
            const {contract, account1} = await loadFixture(createVotingSessionWithAccount1);

            await expect(contract.connect(account1).close(2)).to.be.revertedWith("Voting session not found.");
        });

        it("should revert when the the caller is not the chairman", async () => {
            const {contract, account2} = await loadFixture(createVotingSessionWithAccount1);

            await expect(contract.connect(account2).close(0)).to.be.revertedWith("You are not the chairman.");
        });

        it("should revert when the voting session is already closed", async () => {
            const {contract, account1} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account1);
            await _contract.close(0);

            await expect(_contract.close(0)).to.be.revertedWith("This voting session is already closed.");
        });
    });

    describe("winner", () => {
        it("should return the winning proposal", async () => {
            const {contract, account1, account2} = await loadFixture(createVotingSessionWithAccount1);
            const _contract = contract.connect(account2);
            await _contract.vote(0, [1, 2, 3]);
            await contract.connect(account1).close(0);
            const winningProposal = await contract.getWinningProposal(0);

            expect(winningProposal.decidingVote).to.equal(1);
        });
    });
});