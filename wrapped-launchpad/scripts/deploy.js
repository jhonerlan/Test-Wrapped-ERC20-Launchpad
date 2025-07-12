const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando con la cuenta:", deployer.address);

  // 1.
  const Impl = await hre.ethers.getContractFactory("ERC20Wrapped");
  const impl = await Impl.deploy();
  await impl.waitForDeployment(); 
  console.log("Impl deployed:", await impl.getAddress());

  // 2. 
  const WrapperFactory = await hre.ethers.getContractFactory("WrapperFactory");
  const feeReceiver = deployer.address;
  const feeBps = 100; // 1%

  const factory = await hre.upgrades.deployProxy(
    WrapperFactory,
    [feeReceiver, feeBps, await impl.getAddress()],
    { initializer: "initialize" }
  );
  await factory.waitForDeployment(); 

  console.log("Factory deployed at:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
