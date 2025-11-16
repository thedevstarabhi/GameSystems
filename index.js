const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const crypto = require("crypto");

// ---- Firebase Admin init ----
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kazar-games-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(express.json());

// ---- Simple health check ----
app.get("/", (req, res) => {
  res.send("Kazar wallet API up");
});

// ---- Shared secret (same as Unity) ----
const SECRET_KEY = "supersecret123";

// ---- Helper: decrypt userId (AES-256-CBC, base64) ----
function decryptUserId(encrypted) {
  const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
  const iv = Buffer.alloc(16, 0);

  try {
    const encBytes = Buffer.from(encrypted, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encBytes, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    return encrypted;
  }
}

// ---- Wallet generator ----
function generateWallet() {
  const privateKey = crypto.randomBytes(32).toString("hex");
  const address = "0x" + crypto.randomBytes(20).toString("hex");

  return {
    privateKey,
    address,
    createdAt: Date.now()
  };
}

// ---- MAIN API: POST /wallet ----
app.post("/wallet", async (req, res) => {
  const { encryptedUserId, gameName, score } = req.body;

  if (!encryptedUserId) {
    return res.status(400).json({ error: "missing encryptedUserId" });
  }

  const userId = decryptUserId(encryptedUserId);
  if (!userId) {
    return res.status(400).json({ error: "invalid userId" });
  }

  try {
    const userRef = db.ref("wallets/" + userId);
    const snapshot = await userRef.get();

    let wallet;

    if (snapshot.exists()) {
      wallet = snapshot.val();
    } else {
      wallet = generateWallet();
      await userRef.set(wallet);
    }

    // Game logging
    if (gameName && typeof gameName === "string" && gameName.length > 0) {
      const gameRef = db.ref(`wallets/${userId}/games/${gameName}`);
      const gameSnap = await gameRef.get();

      let gameData = {
        sessionsPlayed: 0,
        lastPlayedAt: 0,
        lastScore: 0,
        bestScore: 0
      };

      if (gameSnap.exists()) {
        gameData = gameSnap.val();
      }

      gameData.sessionsPlayed += 1;
      gameData.lastPlayedAt = Date.now();

      if (typeof score === "number") {
        gameData.lastScore = score;
        if (!gameData.bestScore || score > gameData.bestScore) {
          gameData.bestScore = score;
        }
      }

      await gameRef.set(gameData);
    }

    return res.json({
      status: snapshot.exists() ? "existing-wallet" : "new-wallet-created",
      userId,
      wallet
    });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "server-error" });
  }
});

// ---- Start server (use host/port from platform) ----
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log("API running on http://" + HOST + ":" + PORT);
});