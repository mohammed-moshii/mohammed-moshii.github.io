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

const templateWriteup = `
<h1>[Template] Ultimate HTB Writeup Example</h1>
<blockquote>This is a perfect template for your new machines. You can click "Save as New (Duplicate)" on this machine in the Admin dashboard to use it as a base. Ensure you keep the formatting!</blockquote>

<h2>1. Reconnaissance</h2>
<p>We start by running an aggressive Nmap scan against the target IP to identify open ports and running services.</p>
<pre>nmap -sC -sV -p- -T4 --min-rate 1000 10.10.11.10</pre>

<p>The scan results reveal two interesting ports:</p>
<ul>
  <li><code>Port 22</code> - SSH (OpenSSH 8.2p1)</li>
  <li><code>Port 80</code> - HTTP (Apache httpd 2.4.41)</li>
</ul>

<h2>2. Web Enumeration</h2>
<p>Visiting the web application on Port 80 reveals a simple login page. Running a directory brute-force with Gobuster uncovered a hidden endpoint.</p>
<pre>gobuster dir -u http://10.10.11.10 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt</pre>

<img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800" alt="Terminal Output" />

<h2>3. Initial Foothold</h2>
<p>The hidden endpoint <code>/admin_backup</code> contained an old database dump. Analyzing it revealed a hardcoded set of credentials. We use these credentials to SSH into the machine.</p>
<pre>ssh user@10.10.11.10
user@htb:~$ id
uid=1000(user) gid=1000(user) groups=1000(user)</pre>

<h2>4. Privilege Escalation</h2>
<p>After running <code>sudo -l</code>, we discovered that our user can run a specific python script as root without a password.</p>
<pre>sudo -u root /usr/bin/python3 /opt/maintenance.py</pre>
<p>By exploiting a known Library Hijacking vulnerability in Python, we created a fake library in the same directory, granting us a root shell!</p>
`;

async function seed() {
  console.log("Pushing template machine to database...");
  try {
    await addDoc(collection(db, 'machines'), {
      name: "Writeup Template",
      os: "Linux",
      diff: "Easy",
      secret: "templateflag",
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      writeup: templateWriteup,
      createdAt: serverTimestamp()
    });
    console.log("Template Machine added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error pushing template:", error);
    process.exit(1);
  }
}

seed();
