# Wrapped Launchpad

Sistema de lanzamiento (Launchpad) de tokens ERC20 envueltos con comisiones, desarrollado con Solidity, Hardhat y proxies.

---

## Descripción

Este proyecto implementa un sistema para crear tokens ERC20 envueltos (wrapped) a partir de tokens subyacentes existentes. Permite depósitos y retiros con una comisión configurable. Utiliza un contrato factory con proxies (`Clones`) para desplegar nuevas instancias y soporta `permit` (EIP-2612) para depósitos sin gas.

Incluye:

- Control de roles (`ADMIN_ROLE`, `OPERATOR_ROLE`, `TREASURER_ROLE`)
- Pruebas automatizadas
- Scripts de despliegue, uso y actualización

---

## Contratos principales

- **ERC20Wrapped.sol**: Token ERC20 envuelto con funciones `deposit`, `withdraw` y `depositWithPermit`.
- **WrapperFactory.sol**: Fábrica que despliega instancias de `ERC20Wrapped` mediante proxies clonados.

---

## Características

- Proxies ligeros (`Clones`) para ahorro de gas.
- Soporte para `permit` (EIP-2612) para depósitos gasless.
- Control de roles para gestión segura.
- Comisión configurable y dirección receptora de comisiones.
- Pruebas automatizadas con Hardhat (Mocha + Chai).
- Scripts para despliegue, uso y actualización en red local y testnet.

---

## Requisitos

- Node.js v16+
- Hardhat
- npm o yarn

---

## Instalación y uso

1. Clona el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd wrapped-launchpad
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Compila los contratos:

   ```bash
   npx hardhat compile
   ```

4. Inicia un nodo local:

   ```bash
   npx hardhat node
   ```

5. En otra terminal, despliega la Factory:

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

   Esto mostrará algo como:

   ```
   Factory deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   ```

6. **Actualiza las direcciones** en los scripts:

   - `scripts/use-wrapper.js`, línea 13
   - `scripts/upgrade.js`, línea 5

7. Ejecuta los scripts:

   ```bash
   # Usar el wrapper
   npx hardhat run scripts/use-wrapper.js --network localhost

   # Actualizar un contrato
   npx hardhat run scripts/upgrade.js --network localhost
   ```

8. Ejecuta las pruebas:

   ```bash
   npx hardhat test
   ```

   Salida esperada:

   ```
   ERC20Wrapped depositWithPermit
     ✔ should deposit tokens using depositWithPermit and charge fee (639ms)

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

   11 passing (2s)
   ```

---

## Estructura del proyecto

```
contracts/             # Contratos Solidity
contracts/mocks/       # Contratos mock para testing
scripts/               # Scripts de despliegue y uso
test/                  # Pruebas automatizadas
hardhat.config.js      # Configuración de Hardhat
package.json           # Configuración del proyecto
```

---

## Roles y permisos

- `ADMIN_ROLE`: Admin principal. Puede asignar roles y configurar parámetros.
- `OPERATOR_ROLE`: Encargado de funciones operativas.
- `TREASURER_ROLE`: Gestiona la dirección que recibe las comisiones.

---

## Contacto

- **Nombre:** Jhon Marca Sanchez  
- **Email:** erlansanchez544@gmail.com  
- **GitHub:** [@jhonerlan](https://github.com/jhonerlan)
