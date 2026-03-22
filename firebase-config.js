import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAH6GOOb20QOgMJ3Uv_S5Ppj-1u2Xe-UsI",
    authDomain: "bellacucina-8d2f6.firebaseapp.com",
    databaseURL: "https://bellacucina-8d2f6-default-rtdb.firebaseio.com",
    projectId: "bellacucina-8d2f6",
    storageBucket: "bellacucina-8d2f6.firebasestorage.app",
    messagingSenderId: "817680498309",
    appId: "1:817680498309:web:15049eeaa6ba5f46b8b3ec",
    measurementId: "G-BH1Q0C4RLT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, onValue };
