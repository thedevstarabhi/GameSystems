---

# 🔌 KazarCoin – API Reference

Solidity contract name: `KazarCoin`
Base: [`ERC20`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20), [`Ownable`](https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable), [`ReentrancyGuard`](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)

---

## Table of Contents

1. [Custom Errors](#custom-errors)
2. [Events](#events)
3. [View Functions](#view-functions)
4. [Minter System](#minter-system)
5. [Freeze System](#freeze-system)
6. [Balance Adjustment](#balance-adjustment)
7. [Gameplay / Analytics](#gameplay--analytics)
8. [Treasury & Withdrawals](#treasury--withdrawals)
9. [Standard ERC20 Interface](#standard-erc20-interface)
10. [Ownership](#ownership)

---

## Custom Errors

```solidity
error NotMinter();
error TransferFailed();
error FrozenWallet(address user);
error SweepFailed();
error InsufficientTreasury();
error TopupFailed(address to, uint256 amount);
```

Used instead of revert strings for gas efficiency.

---

## Events

```solidity
event MinterAdded(address indexed account);
event MinterRemoved(address indexed account);
event WalletFrozen(address indexed user);
event WalletUnfrozen(address indexed user);
event BalanceAdjusted(address indexed user, int256 amount);
event CheckIn(address indexed player, string message);
```

* `CheckIn` is the primary gameplay / analytics event.
* All admin/minting actions emit corresponding events.

---

## View Functions

> Inherited ERC20 views are listed later; these are the custom mappings.

```solidity
mapping(address => bool) public minter;
mapping(address => bool) public frozen;
```

### `minter(address account) → bool`

Returns `true` if `account` currently has the MINTER role.

### `frozen(address account) → bool`

Returns `true` if `account` is frozen and cannot send/receive tokens.

---

## Minter System

### `addMinter(address account)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`

Grants MINTER role to `account`.

* **Emits:** `MinterAdded(account)`

---

### `removeMinter(address account)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`

Revokes MINTER role from `account`.

* **Reverts:** `NotMinter()` if `account` is not currently a minter
* **Emits:** `MinterRemoved(account)`

---

### `mint(address to, uint256 amount)`

**Visibility:** `external`

Mints `amount` tokens to `to`.

* **Requirements:**

  * `minter[msg.sender] == true`
* **Reverts:** `NotMinter()` if caller is not a minter
* **Effects:** Increases `totalSupply` and `balanceOf(to)`
* **Emits:** Standard `Transfer(address(0), to, amount)`

---

### `mintBatch(address[] calldata addresses, uint256[] calldata amounts)`

**Visibility:** `external`

Batch version of `mint` for efficient airdrops.

* **Requirements:**

  * Caller is a minter
  * `addresses.length == amounts.length`
* **Reverts:**

  * `NotMinter()` if caller is not a minter
  * `require` with `"Length mismatch"` if arrays differ in length
* **Effects:** Mints each `amounts[i]` to `addresses[i]`
* **Emits:** Multiple `Transfer` events

---

## Freeze System

### `freezeWallet(address user)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`

Marks `user` as frozen.
Frozen accounts cannot send or receive tokens.

* **Emits:** `WalletFrozen(user)`

---

### `unfreezeWallet(address user)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`

Unfreezes `user`.

* **Emits:** `WalletUnfrozen(user)`

---

### Internal: `_beforeTokenTransfer(address from, address to, uint256 amount)`

**Visibility:** `internal` (override)

Hook called by ERC20 before every transfer / mint / burn.

* **Reverts:** `FrozenWallet(from)` or `FrozenWallet(to)` if either address is frozen.

> This automatically protects `transfer`, `transferFrom`, `mint`, `adjustBalance` burns, etc.

---

## Balance Adjustment

### `adjustBalance(address user, int256 amount)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`

Admin-level function to modify a user’s balance directly.

* **Parameters:**

  * `user` – Target wallet
  * `amount` – Signed integer

    * `> 0` → mint `amount` tokens to `user`
    * `< 0` → burn `-amount` tokens from `user`
* **Reverts:**

  * Standard ERC20 underflow if trying to burn more than balance
* **Emits:**

  * `BalanceAdjusted(user, amount)`
  * Standard `Transfer` events for mint / burn

---

## Gameplay / Analytics

### `checkIn(string calldata message)`

**Visibility:** `external`

Public function for logging gameplay events.

* **Parameters:**

  * `message` – Arbitrary string, e.g. `"Level 3 cleared"`, `"Daily login"`.
* **Requirements:**

  * `bytes(message).length > 0`
* **Reverts:**

  * `require(message.length > 0, "Message required")`
* **Emits:**

  * `CheckIn(msg.sender, message)`

> No token transfer or mint is involved. Purely on-chain analytics.

---

## Treasury & Withdrawals

### `withdrawERC20(address token, address to, uint256 amount)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`, `nonReentrant`

Withdraws `amount` of an arbitrary ERC20 token from the contract to `to`.

* **Reverts:** `TransferFailed()` if `IERC20(token).transfer(to, amount)` returns `false`.

---

### `withdrawAllERC20(address token, address to)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`, `nonReentrant`

Withdraws the full ERC20 balance of `token` to `to`.

* **Reverts:** `TransferFailed()` if transfer fails.

---

### `withdrawSelfTokens(address to, uint256 amount)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`, `nonReentrant`

Transfers `amount` of KAZAR tokens from the contract’s own balance to `to`.

* **Uses:** Internal `_transfer(address(this), to, amount)`

---

### `sweep(address payable to, uint256 value)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`, `nonReentrant`

Withdraws native chain currency (ETH/MATIC/etc.) from the contract.

* **Parameters:**

  * `to` – Recipient
  * `value` – Amount in wei
* **Reverts:** `SweepFailed()` if low-level call returns `false`.

---

### `distributeIfBelowFromTreasury(address payable[] calldata recipients, uint256 amount, uint256 threshold)`

**Visibility:** `external`
**Modifiers:** `onlyOwner`, `nonReentrant`

Automated top-up system from treasury.

1. Computes how much ETH is needed to top up each wallet below `threshold` by `amount`.
2. Ensures contract has at least that much balance.
3. Sends `amount` of ETH to each recipient whose balance is `< threshold`.

* **Parameters:**

  * `recipients` – List of users to check
  * `amount` – Top-up amount in wei per user
  * `threshold` – Only wallets with balance `< threshold` receive top-up
* **Reverts:**

  * `InsufficientTreasury()` if `address(this).balance < need`
  * `TopupFailed(to, amount)` if any individual transfer fails.

---

## Standard ERC20 Interface

Inherited from OpenZeppelin `ERC20`:

### Read Functions

```solidity
function name() public view returns (string memory);
function symbol() public view returns (string memory);
function decimals() public view returns (uint8);
function totalSupply() public view returns (uint256);
function balanceOf(address account) public view returns (uint256);
function allowance(address owner, address spender) public view returns (uint256);
```

### State-Changing Functions

```solidity
function transfer(address to, uint256 amount) public returns (bool);
function approve(address spender, uint256 amount) public returns (bool);
function transferFrom(address from, address to, uint256 amount) public returns (bool);
```

* All of these are subject to the freeze logic in `_beforeTokenTransfer`.

---

## Ownership

Inherited from `Ownable`:

```solidity
function owner() public view returns (address);
function transferOwnership(address newOwner) public onlyOwner;
function renounceOwnership() public onlyOwner;
```

* **`owner()`** – Current admin address.
* **`transferOwnership()`** – Passes admin role to another address.
* **⚠ `renounceOwnership()`** – Leaves the contract without an owner:

  * All `onlyOwner` functions become permanently unusable.
  * Should only be used if you want a fully decentralized, ownerless token.

---
