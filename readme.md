---

# 📌 **Kazar API – README**

## 🚀 Overview

Kazar API is a lightweight Node.js backend used to:

* Generate/Store user wallets
* Save private key, address & game data
* Integrate with Firebase
* Provide a `/wallet` endpoint for Unity Web3 login
* Act as backend for Unity + EVM transaction system

API deploy hai:

```
https://user.kazar.space/
```

Main route:

```
POST /wallet
```

Unity is using this URL in:

```
walletApiUrl = "https://user.kazar.space/wallet"
```

---

# 🗂 Project Structure

```
/index.js                -> Main API server
/package.json            -> Dependencies
/serviceAccountKey.json  -> Firebase Admin credentials
```

---

# 🔧 Technology Stack

* **Node.js (Express)** – backend server
* **Firebase Admin SDK** – storing user data
* **crypto-js** – encryption
* **cors** – Cross-domain requests
* **ethers** – wallet generation utilities
* **Unity C#** – client side integration

---

# 📡 API Endpoints

### ### **POST /wallet**

Creates or returns an existing wallet for a username.

### **Request (JSON)**

```json
{
  "username": "some_user"
}
```

### **Response (JSON)**

```json
{
  "status": "success",
  "userId": "some_user",
  "wallet": {
    "address": "0x...",
    "privateKey": "0x..."
  }
}
```

Unity automatically receives the wallet and forwards it to `EvmTransactionManager`.

---

# 🔥 How Unity Uses This API

### **1. Unity sends username →**

```
POST https://user.kazar.space/wallet
```

### **2. API returns:**

* wallet address
* private key

### **3. Unity assigns them into:**

```csharp
evmManager.walletAddress = response.wallet.address;
evmManager.privateKey = response.wallet.privateKey;
```

### **4. Now Unity can:**

* send EVM transactions
* interact with contracts
* create users with wallets

---

# 🛠 Deploying on cPanel Node.js

Backend must be placed in:

```
public_html/user.kazar.space/
```

### Required dependencies (package.json)

```json
"dependencies": {
  "cors": "^2.8.5",
  "crypto-js": "^4.2.0",
  "express": "^4.18.2",
  "firebase-admin": "^13.6.0",
  "ethers": "^6.8.1"
}
```

### Turn on Node.js app with:

* **Application root:**
  `public_html/user.kazar.space`
* **Startup file:**
  `index.js`
* Run:
  `npm install`
* Restart Application

---

# ✔ Health Check

Hit in browser:

```
https://user.kazar.space/
```

You should see:

```
Kazar wallet API up
```

If this appears → API is live.

---

# 🔐 Security Notes

* `serviceAccountKey.json` must never be shared publicly
* Unity should store private keys in memory only
* Use HTTPS only
* Restrict Firebase rules if needed

---

# 💬 Support

For issues or improvements:
Ping your backend dev (ChatGPT babu 😎).

---
* Unity integration README
* API architecture diagram
* Simplified onboarding doc for teammates

Just tell me.

