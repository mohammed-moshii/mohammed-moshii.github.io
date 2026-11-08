import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BUILTIN_MACHINES } from "./src/data/builtinMachines.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRPMo7BmMgA7zO-nqs2cp7_N3hmpH5jMI",
  authDomain: "portfolio-bd6e8.firebaseapp.com",
  projectId: "portfolio-bd6e8",
  storageBucket: "portfolio-bd6e8.firebasestorage.app",
  messagingSenderId: "803992179795",
  appId: "1:803992179795:web:6c80f26a3d19617744a2a6",
  measurementId: "G-912V1ZVV2N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("[*] Seeding BufferOverFlow walkthrough into Firestore...");
  const bo = BUILTIN_MACHINES.find(m => m.name === "BufferOverFlow");
  if (!bo) {
    console.error("[-] BufferOverFlow machine not found in builtinMachines.js");
    process.exit(1);
  }

  try {
    const docRef = await addDoc(collection(db, "machines"), {
      name: bo.name,
      os: bo.os,
      diff: bo.diff,
      secret: bo.secret || "",
      imageUrl: bo.imageUrl,
      writeup: bo.writeup,
      createdAt: serverTimestamp()
    });
    console.log(`[+] Successfully added BufferOverFlow to Firestore! Doc ID: ${docRef.id}`);
    process.exit(0);
  } catch (error) {
    console.error("[-] Error seeding into Firestore (requires admin auth in firestore.rules):", error.message);
    process.exit(1);
  }
}

seed();
