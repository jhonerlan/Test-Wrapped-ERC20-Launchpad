const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando con la cuenta:", deployer.address);

  // 1. 
  const Impl = await hre.ethers.getContractFactory("ERC20Wrapped");
  const impl = await Impl.deploy();
  await impl.waitForDeployment();
  const implAddress = impl.target;
  console.log("Impl deployed:", implAddress);

  // 2. 
  const WrapperFactory = await hre.ethers.getContractFactory("WrapperFactory");
  const factory = await WrapperFactory.deploy();
  await factory.waitForDeployment();
  console.log("Factory deployed at:", factory.target);

  // 3.
  const feeReceiver = deployer.address;
  const feeBps = 100; // 1%
  const tx = await factory.initialize(feeReceiver, feeBps, implAddress);
  await tx.wait();
  console.log("Factory initialized");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
