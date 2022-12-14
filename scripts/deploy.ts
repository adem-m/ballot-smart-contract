import { ethers } from "hardhat";

async function main() {
  const VotingSystem = await ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();

  await votingSystem.deployed();
  console.log(`Voting system deployed to ${votingSystem.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
