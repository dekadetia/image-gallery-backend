const dotenv = require('dotenv');
const { initializeApp } = require("firebase/app");
const { getStorage } = require("@firebase/storage");

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const firebase_app = initializeApp(firebaseConfig);
const firebase_app_storage = getStorage(firebase_app);

module.exports = {
    firebase_app,
    firebase_app_storage,
}