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
  console.log("[*] Seeding Principal (Moshii Platform) walkthrough into Firestore...");
  const lab = BUILTIN_MACHINES.find(m => m.id === "principal");
  if (!lab) {
    console.error("[-] Principal machine not found in builtinMachines.js");
    process.exit(1);
  }

  try {
    const docRef = await addDoc(collection(db, "machines"), {
      name: lab.name,
      os: lab.os,
      diff: lab.diff,
      secret: lab.secret || "",
      imageUrl: lab.imageUrl,
      writeup: lab.writeup,
      createdAt: serverTimestamp()
    });
    console.log(`[+] Successfully added Principal to Firestore! Doc ID: ${docRef.id}`);
    process.exit(0);
  } catch (error) {
    console.error("[-] Error seeding into Firestore (requires admin auth in firestore.rules):", error.message);
    process.exit(1);
  }
}

seed();
