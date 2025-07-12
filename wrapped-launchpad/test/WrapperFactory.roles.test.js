const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrapperFactory Roles", function () {
  let admin, operator, treasurer, user;
  let factory, wrappedImpl;

  beforeEach(async function () {
    [admin, operator, treasurer, user] = await ethers.getSigners();

    const Wrapped = await ethers.getContractFactory("ERC20Wrapped");
    wrappedImpl = await Wrapped.deploy();
    await wrappedImpl.waitForDeployment();

    const Factory = await ethers.getContractFactory("WrapperFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();

    await factory.initialize(admin.address, 100, wrappedImpl.target);
  });

  it("admin can add and remove operator role", async function () {
    await expect(factory.connect(admin).addOperator(operator.address))
      .to.emit(factory, "RoleGranted")
      .withArgs(await factory.OPERATOR_ROLE(), operator.address, admin.address);

    expect(await factory.hasRole(await factory.OPERATOR_ROLE(), operator.address)).to.be.true;

    await expect(factory.connect(admin).removeOperator(operator.address))
      .to.emit(factory, "RoleRevoked")
      .withArgs(await factory.OPERATOR_ROLE(), operator.address, admin.address);

    expect(await factory.hasRole(await factory.OPERATOR_ROLE(), operator.address)).to.be.false;
  });

  it("non-admin cannot add operator role", async function () {
    await expect(factory.connect(user).addOperator(user.address)).to.be.reverted;
  });

  it("admin can add and remove treasurer role", async function () {
    await expect(factory.connect(admin).addTreasurer(treasurer.address))
      .to.emit(factory, "RoleGranted")
      .withArgs(await factory.TREASURER_ROLE(), treasurer.address, admin.address);

    expect(await factory.hasRole(await factory.TREASURER_ROLE(), treasurer.address)).to.be.true;

    await expect(factory.connect(admin).removeTreasurer(treasurer.address))
      .to.emit(factory, "RoleRevoked")
      .withArgs(await factory.TREASURER_ROLE(), treasurer.address, admin.address);

    expect(await factory.hasRole(await factory.TREASURER_ROLE(), treasurer.address)).to.be.false;
  });

  it("non-admin cannot add treasurer role", async function () {
    await expect(factory.connect(user).addTreasurer(user.address)).to.be.reverted;
  });

  it("only operator can set fee basis points", async function () {
    await factory.connect(admin).addOperator(operator.address);

    await expect(factory.connect(operator).setFeeBasisPoints(500))
      .to.emit(factory, "FeeChanged")
      .withArgs(500);

    await expect(factory.connect(user).setFeeBasisPoints(200)).to.be.reverted;
  });

  it("only treasurer can set fee receiver", async function () {
    await factory.connect(admin).addTreasurer(treasurer.address);

    await expect(factory.connect(treasurer).setFeeReceiver(user.address))
      .to.emit(factory, "FeeReceiverChanged")
      .withArgs(user.address);

    await expect(factory.connect(user).setFeeReceiver(user.address)).to.be.reverted;
  });
});
