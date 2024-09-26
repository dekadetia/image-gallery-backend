const { initializeApp } = require("firebase/app");
const { getStorage } = require("@firebase/storage");
const express = require("express");
const dotenv = require('dotenv');
const firebase_routes = require("./routes/firebase");
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebase_app = initializeApp(firebaseConfig);
const firebase_app_storage = getStorage(firebase_app);

app.get("/", (req, res) => {
  res.json("server running");
});

app.use('/firebase', firebase_routes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = {
  firebase_app_storage,
}
