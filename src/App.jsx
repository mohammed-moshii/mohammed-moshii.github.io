import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Lock, Server, Unlock, AlertTriangle, Settings } from 'lucide-react';
import { collection, getDocs, doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import Admin from './Admin';
import Writeup from './Writeup';
import About from './About';
import Companion from './Companion';
import { verifySecret } from './cryptoUtils';
import './index.css';

// 3D Background Component
const CyberBackground = () => (
  <div className="canvas-container">
    <Canvas>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00ff41" />
      <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#b537f2" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sphere visible args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial 
          color="#0a0a0a" 
          attach="material" 
          distort={0.5} 
          speed={1.5} 
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  </div>
);

// --- Pages ---
const Home = () => (
  <div className="home-container">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="hero-text glass-panel"
      style={{ padding: '40px', background: 'rgba(5,5,5,0.7)', border: '1px solid #00ff41' }}
    >
      <motion.h1 
        className="text-glow-green"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        MOHAMMED MOSHII
      </motion.h1>
      <h2 className="text-glow-cyan" style={{ textAlign: 'center' }}>Cybersecurity Specialist and Trainer</h2>
      <p style={{ marginTop: '16px', maxWidth: '600px', lineHeight: '1.6', textAlign: 'center', margin: '16px auto 0' }}>
        Welcome to my terminal.
      </p>
    </motion.div>
  </div>
);


const HackTheBox = () => {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "machines"));
        const machinesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMachines(machinesData);
      } catch (err) {
        console.error("Error fetching machines from Firebase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const isValid = await verifySecret(passwordInput, selectedMachine);
    if (isValid) {
      sessionStorage.setItem(`unlocked_pwd_${selectedMachine.id}`, passwordInput);
      const slug = (selectedMachine.name || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-+$/, '');
      navigate(`/htb/${slug}`);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500); // Shake effect duration
    }
  };

  const handleMachineClick = async (m) => {
    const slug = (m.name || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-+$/, '');
    const isLocked = (m.secretHash && m.secretHash.trim() !== '') || (m.secret && m.secret.trim() !== '');
    if (!isLocked) {
      navigate(`/htb/${slug}`);
    } else {
      const savedPwd = sessionStorage.getItem(`unlocked_pwd_${m.id}`);
      const isValid = savedPwd ? await verifySecret(savedPwd, m) : false;
      if (isValid) {
        navigate(`/htb/${slug}`);
      } else {
        sessionStorage.removeItem(`unlocked_pwd_${m.id}`);
        sessionStorage.removeItem(`unlocked_${m.id}`);
        setSelectedMachine(m);
      }
    }
  };

  const closeMenu = () => {
    setSelectedMachine(null);
    setPasswordInput('');
    setError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="page-container"
    >
      <div className="glass-panel" style={{ marginBottom: '32px' }}>
        <h2 className="text-glow-green" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server /> HackTheBox Writeups
        </h2>
        <p>Select a machine to view the writeup. contact me to get a password</p>
      </div>
      
      <div className="machine-grid">
        {loading ? (
          <p style={{ color: 'var(--accent-cyan)' }}>[ Establishing secure connection to mainframe... ]</p>
        ) : machines.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>[ No target machines currently available in the database. Awaiting new deployments... ]</p>
        ) : (
          machines.map(m => (
            <div 
              key={m.id} 
              className="machine-card glass-panel" 
              onClick={() => handleMachineClick(m)}
              style={{
                aspectRatio: '1 / 1',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 0,
                border: '1px solid var(--glass-border)'
              }}
            >
              {m.imageUrl ? (
                <img 
                  src={m.imageUrl} 
                  alt={m.name} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.6 }} 
                />
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)', zIndex: 0 }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 1, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)', width: '100%', boxSizing: 'border-box' }}>
                <h3 className="text-glow-cyan" style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{m.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>OS: {m.os || 'Unknown'} | Difficulty: {m.diff || 'Unknown'}</p>
                <button className="hack-btn" style={{ width: '100%' }}>
                  {(m.secretHash || m.secret) ? <><Lock size={16} /> Decrypt</> : <><Unlock size={16} /> Read Writeup</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedMachine && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
            onClick={closeMenu}
          >
            <motion.div 
              className={`glass-panel modal-content ${error ? 'shake' : ''}`}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '90%', maxWidth: '600px', border: error ? '1px solid var(--accent-red)' : '1px solid var(--accent-green)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }} className="text-glow-green">
                  <Lock className="inline-icon"/> {selectedMachine.name}.txt
                </h2>
                <button onClick={closeMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px' }}>&times;</button>
              </div>

              <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p>Enter the password to decrypt the writeup contents.</p>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter flag..."
                  autoFocus
                  style={{
                    background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-cyan)',
                    color: 'var(--accent-cyan)', padding: '12px', fontFamily: 'var(--font-mono)',
                    outline: 'none', borderRadius: '4px'
                  }}
                />
                {error && <p style={{ color: 'var(--accent-red)', margin: 0, fontSize: '0.9rem' }}><AlertTriangle size={14} className="inline-icon"/> ACCESS DENIED. INCORRECT FLAG.</p>}
                <button type="submit" className="hack-btn" style={{ background: 'rgba(0, 255, 65, 0.2)' }}>
                  Submit Flag
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Navigation Wrapper ---
const AppContent = () => {
  const location = useLocation();

  // Track unique visitor sessions in Firestore (counted once per browsing session)
  useEffect(() => {
    // 1. NEVER count Admin visits
    if (location.pathname.startsWith('/admin') || localStorage.getItem('m_is_admin') === 'true') {
      sessionStorage.setItem('m_visited_session', 'admin');
      return;
    }

    // 2. Only count genuine visitors once per browsing session
    if (sessionStorage.getItem('m_visited_session')) {
      return;
    }

    const trackVisitor = async () => {
      try {
        const statRef = doc(db, 'site_stats', 'traffic');
        await setDoc(statRef, {
          count: increment(1),
          lastVisit: serverTimestamp()
        }, { merge: true });
        sessionStorage.setItem('m_visited_session', '1');
      } catch (err) {
        // Silently ignore if offline or blocked
      }
    };
    trackVisitor();
  }, [location.pathname]);

  return (
    <div className="app-wrapper">
      {location.pathname === '/' && <CyberBackground />}
      {location.pathname === '/' && <Companion />}
      <nav className="navbar" style={{ background: '#0a0a0a', borderBottom: '1px solid var(--accent-green)', zIndex: 9999 }}>
        <div className="logo text-glow-green"><Shield size={24} /> Moshii</div>
        <div className="nav-links">
          <Link to="/">[ Home ]</Link>
          <Link to="/about">[ About ]</Link>
          <Link to="/htb">[ HTB_Writeups ]</Link>
        </div>
      </nav>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/htb" element={<HackTheBox />} />
            <Route path="/htb/:id" element={<Writeup />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
