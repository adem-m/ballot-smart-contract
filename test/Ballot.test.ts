import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

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

        return {ballot, chairman, otherAccount, proposals};
    }

    describe("deploy", () => {
        it("should create all propositions", async () => {
            const {ballot, proposals} = await loadFixture(deployBallotFixture);

            expect(await ballot.proposalCount()).to.equal(proposals.length);
            expect((await ballot.getProposal(0)).content).to.equal(proposals[0]);
            expect((await ballot.getProposal(1)).content).to.equal(proposals[1]);
            expect((await ballot.getProposal(2)).content).to.equal(proposals[2]);
        })

        it("should assign a chairman", async () => {
            const {ballot, chairman} = await loadFixture(deployBallotFixture);

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
            const {ballot} = await loadFixture(deployBallotFixture);

            expect(await ballot.isOpen()).to.equal(true);
            await expect(ballot.close()).to.be.fulfilled;
            expect(await ballot.isOpen()).to.equal(false);
        })

        it("should not close twice", async () => {
            const {ballot} = await loadFixture(deployBallotFixture);
            await ballot.close();

            await expect(ballot.close()).to.be.revertedWith("This ballot is already closed.");
        })

        it("should be closed but only by the chairman", async () => {
            const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
            const failBallot = ballot.connect(otherAccount);

            await expect(failBallot.close()).to.be.revertedWith("Only the chairman can close the ballot.");
        })
    })

    describe("vote", () => {
        it("should update the proposals' deciding votes", async () => {
            const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
            const _ballot = ballot.connect(otherAccount);

            await expect(_ballot.vote([1, 2, 3])).to.be.fulfilled;
            expect((await _ballot.getProposal(0)).decidingVote).to.equal(0);
            expect((await _ballot.getProposal(1)).decidingVote).to.equal(0);
            expect((await _ballot.getProposal(2)).decidingVote).to.equal(1);
        })

        it("should only work once per voter", async () => {
            const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
            const _ballot = ballot.connect(otherAccount);
            await _ballot.vote([1, 2, 3]);

            await expect(_ballot.vote([1, 2, 3])).to.be.revertedWith("You have already voted.");
        })

        it("should fail when passing not enough scores", async () => {
            const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
            const _ballot = ballot.connect(otherAccount);

            await expect(_ballot.vote([1, 2])).to.be.revertedWith("The number of choices does not match the number of proposals.");
        })

        it("should fail when passing too many scores", async () => {
            const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
            const _ballot = ballot.connect(otherAccount);

            await expect(_ballot.vote([1, 2, 3, 4])).to.be.revertedWith("The number of choices does not match the number of proposals.");
        })

        it("should fail when the ballot is already closed", async () => {
            it("should fail when passing not enough scores", async () => {
                const {ballot, otherAccount} = await loadFixture(deployBallotFixture);
                await ballot.close();
                const _ballot = ballot.connect(otherAccount);

                await expect(_ballot.vote([1, 2, 3])).to.be.revertedWith("This ballot is already closed.");
            })
        })

        it("should return the winning proposal", async () => {
            const {ballot, otherAccount, proposals} = await loadFixture(deployBallotFixture);
            const _ballot = ballot.connect(otherAccount);
            await _ballot.vote([1, 2, 3]);

            await ballot.close();
            const winningProposal = await _ballot.getWinningProposal()
            expect(winningProposal.content).to.equal(proposals[2]);
        })
    })
})