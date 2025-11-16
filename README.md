# GameSystems


Deployed On: 0xE26891895095E7f2D78c7a7a801cbBb86B4E6768

---

# **KAZAR Coin – Smart Contract Documentation**

`KAZAR Coin` is a custom-enhanced ERC20 token contract designed for gaming, treasury automation, role-based minting, wallet freezing, multi-reward distribution, and internal admin controls.

This README provides all details required to **deploy, test, integrate, and maintain** the token inside the Kazar ecosystem.

---

# 📌 **Contract Overview**

### **Name:** KAZAR COIN

### **Symbol:** KAZAR

### **Decimals:** 18

### **Standard:** ERC-20 + Admin Controls + Freezing + Custom Logic

### **Network Compatibility:** EVM Chains (Polygon, BNB, Base, Sei EVM, Soneium, Arbitrum, etc.)

---

# 🚀 **Core Features**

## **1. Standard ERC20 Functions**

The contract supports all standard ERC20 operations:

* `balanceOf(address)`
* `transfer(address to, uint256 amount)`
* `approve(address spender, uint256 amount)`
* `allowance(address owner, address spender)`
* `transferFrom(address from, address to, uint256 amount)`
* `totalSupply()`
* `decimals()`
* `name()`
* `symbol()`

---

# 🔥 **Gameplay Event System**

### **✔ checkIn(string message)**

Used by the gaming ecosystem to log events (e.g., daily login, reward actions).

* Anyone can call
* Emits an event with sender + message
* Costs ~35k gas only

---

# 👑 **Admin (Owner) Functions**

These functions can only be used by the **owner** (deployer, or new owner after transfer).

### **1. Role Management**

* `addMinter(address)` → Add a wallet as a minter
* `removeMinter(address)` → Remove minter privilege
* `owner()` → See current owner
* `transferOwnership(address)` → Transfer the admin role
* `renounceOwnership()` → ⚠️ Permanently removes ALL admin control (DANGEROUS)

---

# 🧊 **Wallet Freezing System**

Protects ecosystem, prevents bots, abuse, cheating.

### **freezeWallet(address user)**

Freezes a wallet → cannot transfer tokens.

### **unfreezeWallet(address user)**

Unfreezes it.

### **frozen(address user)**

View freeze status.

> Transfer fails with revert error if user or receiver is frozen.

---

# 💎 **Minter Functions (Role-Based)**

Accounts with MINTER role can mint tokens.

### **mint(address to, uint256 amount)**

Mints new tokens to a wallet.

### **mintBatch(address[] recipients, uint256[] amounts)**

Gas-efficient multi-airdrop mint.

---

# 💼 **Balance Adjustment (Admin Custom Mint/Burn)**

### **adjustBalance(address user, int256 amount)**

Admin can modify wallet balance:

* Positive → Mint
* Negative → Burn
* Internal low-level balance update
* Cannot reduce below zero

---

# 🪙 **Treasury & Withdrawals**

### **withdrawERC20(token, to, amount)**

Withdraw stuck ERC20 tokens.

### **withdrawAllERC20(token, to)**

Withdraws full balance of a token.

### **withdrawSelfTokens(to, amount)**

Withdraws self-minted KAZAR from contract.

### **sweep(address payable, uint256 value)**

Withdraw ETH or native coin.

---

# 📤 **Automated Reward Distribution**

### **distributeIfBelowFromTreasury(address[] recipients, uint256 amount, uint256 threshold)**

Auto-distributes tokens from treasury **only if a wallet has less than `threshold`**.

Used for:

* Daily rewards
* Community airdrops
* Faucet-like automated balance top-ups

---

# 🧪 **Testing Guide (Remix)**

## ✔ 1. Mint Tokens

**Function:** `mint(address to, uint256 amount)`

* Make your wallet a minter using `addMinter()`
* Then mint in 18 decimals format
  Example:

  * 1 token = `1000000000000000000`
  * 1000 tokens = `1000 * 1e18`

---

## ✔ 2. Freeze / Unfreeze Wallet

**freezeWallet(address)**
**unfreezeWallet(address)**
Try transferring tokens from that address → it will revert if frozen.

---

## ✔ 3. AdjustBalance

**adjustBalance(address, int256 amount)**
Examples:

* Add: `5000 * 1e18`
* Subtract: `-2000 * 1e18`

---

## ✔ 4. checkIn(String msg)

Call:

```
checkIn("login")
checkIn("completed level")
checkIn("game event")
```

Event logs will appear in Remix / block explorer.

---

# 🧱 **Security Features**

* Owner-only admin controls
* Minters restricted
* Anti-bot freeze system
* Underflow & overflow protected
* Events emitted for every critical action
* No dangerous external calls
* Protected withdrawals
* SafeMint and SafeTransfer patterns

---

# 🔧 **Integration (Unity / Backend)**

You can call contract functions from:

### ✔ Unity WebGL

### ✔ Unity Android APK

### ✔ Node.js backend

### ✔ Cloudflare Workers

### ✔ Vercel serverless functions

### ✔ Hardhat / Ethers.js / Wagmi / Viem

Basic ABI example for integration (your ABI will be on chain):

```json
{
  "name": "mint",
  "type": "function",
  "stateMutability": "nonpayable",
  "inputs": [
    { "name": "to", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ]
}
```

---

# 🔗 **Recommended Flow for Unity Web3**

1. Connect wallet
2. Call `balanceOf()`
3. Trigger mint on backend
4. Transfer tokens on in-game actions
5. Use `checkIn()` to log gameplay events
6. Freeze suspicious wallets
7. Use adjustBalance for manual corrections

I can generate full integration if needed.

---

# 📄 **Deployment Notes**

* Works on any EVM chain
* Gas optimized
* No constructor arguments
* Safe to verify on Etherscan-type explorers
* Owner must assign minters before gameplay minting

---

# 🏁 **Conclusion**

KAZAR COIN is a **production-ready, gaming-optimized ERC20 token** with complete admin control, minting system, freeze system, and automated reward infrastructure. It is built for long-term scalability across all Kazar Games.

---

Just tell me.
