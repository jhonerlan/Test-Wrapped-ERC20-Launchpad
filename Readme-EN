# Wrapped Launchpad

A launchpad system for wrapped ERC20 tokens with deposit fees, developed using Solidity, Hardhat, and proxy patterns.

---

## Description

This project implements a system that enables the creation of wrapped ERC20 tokens based on existing underlying tokens. It supports deposits and withdrawals with a configurable fee. A factory contract deploys these wrapped tokens using proxy clones, and supports `permit` (EIP-2612) for gasless deposits.

Includes:

- Role-based access control (`ADMIN_ROLE`, `OPERATOR_ROLE`, `TREASURER_ROLE`)
- Full test coverage using Hardhat
- Scripts for deployment, usage, and upgrade

---

## Main Contracts

- **ERC20Wrapped.sol**: Handles deposit, withdrawal, and `depositWithPermit`.
- **WrapperFactory.sol**: Factory that deploys `ERC20Wrapped` instances using proxy clones.

---

## Features

- Lightweight proxies (`Clones`) to reduce deployment gas costs.
- `permit` (EIP-2612) support for gasless deposits.
- Role-based access control (`AccessControl`) for secure administration.
- Configurable fee and central fee receiver.
- Automated testing with Hardhat (Mocha + Chai).
- Deployment and usage scripts for local and test networks.

---

## Requirements

- Node.js v16+  
- Hardhat  
- npm or yarn  

---

## Installation & Usage

1. Clone the repository:

   ```bash
   git clone <REPOSITORY_URL>
   cd wrapped-launchpad
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile contracts:

   ```bash
   npx hardhat compile
   ```

4. Start a local node:

   ```bash
   npx hardhat node
   ```

5. In another terminal, deploy the factory:

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

   Example output:

   ```
   Factory deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   ```

6. **Update the factory address** in the following files:

   - `scripts/use-wrapper.js` (line 13)
   - `scripts/upgrade.js` (line 5)

7. Run the wrapper usage script:

   ```bash
   npx hardhat run scripts/use-wrapper.js --network localhost
   ```

8. Run the upgrade script:

   ```bash
   npx hardhat run scripts/upgrade.js --network localhost
   ```

9. Run the test suite:

   ```bash
   npx hardhat test
   ```

   You should see:

   ```
   ERC20Wrapped depositWithPermit
     ✔ should deposit tokens using depositWithPermit and charge fee

   Wrapped Launchpad
     ✔ should deploy a wrapped token for a mock ERC20
     ✔ should allow deposit and mint wrapped tokens
     ✔ should allow withdrawal of the underlying token
     ✔ should prevent duplicate wrapped token deployment

   WrapperFactory Roles
     ✔ admin can add and remove operator role
     ✔ non-admin cannot add operator role
     ✔ admin can add and remove treasurer role
     ✔ non-admin cannot add treasurer role
     ✔ only operator can set fee basis points
     ✔ only treasurer can set fee receiver

   11 passing
   ```

---

## Project Structure

```
contracts/             # Solidity contracts
contracts/mocks/       # Mock contracts for testing
scripts/               # Deployment, usage, and upgrade scripts
test/                  # Unit tests
hardhat.config.js      # Hardhat configuration
package.json           # Project configuration
```

---

## Roles & Permissions

- `ADMIN_ROLE`: Main administrator; can assign and remove roles.
- `OPERATOR_ROLE`: Can update operational parameters (e.g. deposit fee).
- `TREASURER_ROLE`: Manages the fee receiver address.

---

## Contact

- **Name:** Jhon Marca Sanchez  
- **Email:** erlansanchez544@gmail.com  
- **GitHub:** [@jhonerlan](https://github.com/jhonerlan)
