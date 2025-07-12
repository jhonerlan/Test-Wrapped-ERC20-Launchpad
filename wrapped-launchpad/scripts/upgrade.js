const hre = require("hardhat");

async function main() {
  //address proxy
  const proxyAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  console.log("Actualizando WrapperFactory en proxy:", proxyAddress);

  const WrapperFactory = await hre.ethers.getContractFactory("WrapperFactory");

  const upgraded = await hre.upgrades.upgradeProxy(proxyAddress, WrapperFactory);

  await upgraded.waitForDeployment(); 
  console.log("Contrato actualizado con éxito en:", await upgraded.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
