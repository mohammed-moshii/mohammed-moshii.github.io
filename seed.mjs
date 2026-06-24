import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const machinesToSeed = [
  {
    name: "Lame",
    os: "Linux",
    diff: "Easy",
    secret: "rootflag123",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    writeup: "<h2>Gaining Initial Foothold</h2><p>Used a backdoor in vsftpd 2.3.4 to gain a root shell directly. The script was straightforward.</p>"
  },
  {
    name: "Optimum",
    os: "Windows",
    diff: "Easy",
    secret: "winroot456",
    imageUrl: "https://images.unsplash.com/photo-1614064641913-6b71a2ec01bb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    writeup: "<h2>Exploitation</h2><p>Found HttpFileServer 2.3. Used the known RCE exploit to get a reverse shell.</p><h2>Privilege Escalation</h2><p>System was vulnerable to MS16-032. Compiled the exploit and ran it to get SYSTEM.</p>"
  },
  {
    name: "Brainfuck",
    os: "Linux",
    diff: "Insane",
    secret: "brainroot999",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    writeup: "<h2>Cryptography Bypass</h2><p>This box required extensive knowledge of RSA encryption. We had to factorize the public key using a known weakness...</p>"
  },
  {
    name: "Active",
    os: "Windows",
    diff: "Easy",
    secret: "activedirectory",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    writeup: "<h2>Active Directory</h2><p>Found a readable SMB share containing Groups.xml with a decryptable password. Used it to get a shell.</p>"
  }
];

async function seed() {
  console.log("Seeding started...");
  try {
    for (const m of machinesToSeed) {
      await addDoc(collection(db, 'machines'), {
        ...m,
        createdAt: serverTimestamp()
      });
      console.log(`Added machine: ${m.name}`);
    }
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
