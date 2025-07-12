const hre = require("hardhat");

async function main() {
  const [user] = await hre.ethers.getSigners();

  // 1. 
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mock = await MockERC20.deploy("TestToken", "TT", hre.ethers.parseEther("1000"));
  await mock.waitForDeployment();
  console.log("Mock token deployed at:", mock.target);

  // 2. 
  const factoryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";// address of the deployed WrapperFactory
  const WrapperFactory = await hre.ethers.getContractFactory("WrapperFactory");
  const factory = WrapperFactory.attach(factoryAddress);

  // 3. 
  const feeReceiver = await factory.feeReceiver();
  console.log("Fee Receiver:", feeReceiver);

  // 4. 
  let wrappedBefore = await factory.wrappedTokens(mock.target);
  console.log("Wrapped token before deploy:", wrappedBefore);

  // 5.
  const tx = await factory.deployWrapped(mock.target);
  await tx.wait();
  console.log("Wrapped token deployed for mock token");

  // 
  let wrappedAfter = await factory.wrappedTokens(mock.target);
  console.log("Wrapped token after deploy:", wrappedAfter);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
