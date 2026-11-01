import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Shield, LogOut, PlusCircle, CheckCircle, Lock, QrCode, AlertTriangle, Edit3, Trash2, Copy, Image as ImageIcon, Eye, Code, ExternalLink, Users, RefreshCw, Sparkles, Layers, Check } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { hashPassword } from './cryptoUtils';
import { DEFAULT_COMPANION_CONFIG } from './Companion';
import './index.css';

// The authorized email addresses that are allowed to access the admin panel
const ALLOWED_ADMIN_EMAILS = [
  'backman480@gmail.com'
];

// Utility to extract base64 images, upload them to Firebase Storage, and replace the src with the URL
const uploadHtmlImagesToStorage = async (html, setSuccessMsg) => {
  if (!html.includes('data:image/')) return html;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img[src^="data:image/"]');
  
  for (let img of images) {
    const src = img.src;
    // Extract base64 format (data:image/png;base64,iVBORw0K...)
    try {
      setSuccessMsg('Uploading pasted images to Firebase Storage... Please wait.');
      const storageRef = ref(storage, `writeups/${Date.now()}_${Math.floor(Math.random()*10000)}`);
      await uploadString(storageRef, src, 'data_url');
      const url = await getDownloadURL(storageRef);
      img.src = url; // Replace base64 with live URL
    } catch (e) {
      console.error("Storage upload error:", e);
      throw new Error("Failed to upload image to Storage. Make sure Firebase Storage is enabled and Security Rules allow writing.");
    }
  }
  return doc.body.innerHTML;
};

// Clean full HTML documents that may have been escaped or wrapped in pre/table
const getCleanHtml = (raw) => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html/i.test(trimmed)) {
    return trimmed;
  }
  if (raw.includes('&lt;!DOCTYPE') || raw.includes('&lt;html') || raw.includes('<!DOCTYPE') || raw.includes('<html')) {
    let clean = raw
      .replace(/<tr[^>]*>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&amp;', '&')
      .replaceAll('&nbsp;', ' ')
      .trim();

    const docMatch = clean.match(/<!DOCTYPE\s+html[\s\S]*<\/html>/i) || clean.match(/<html[\s\S]*<\/html>/i);
    if (docMatch) return docMatch[0];
  }
  return raw;
};

const isFullHtmlDoc = (content) => {
  if (!content) return false;
  const trimmed = content.trim();
  return /^<!DOCTYPE\s+html/i.test(trimmed) || /^<html/i.test(trimmed);
};

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // MFA States
  const [mfaStatus, setMfaStatus] = useState('checking'); // checking, setup, verify, passed
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaInput, setMfaInput] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Dashboard Data
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [visitorCount, setVisitorCount] = useState(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Tabs & Companion State
  const [activeTab, setActiveTab] = useState('machines'); // 'machines' | 'companion'
  const [companionConfig, setCompanionConfig] = useState(DEFAULT_COMPANION_CONFIG);
  const [savingCompanion, setSavingCompanion] = useState(false);
  const [companionSuccessMsg, setCompanionSuccessMsg] = useState('');

  // New creature form state
  const [newCreatureName, setNewCreatureName] = useState('');
  const [newCreatureBadge, setNewCreatureBadge] = useState('');
  const [newCreatureUrl, setNewCreatureUrl] = useState('');
  const [newCreatureDesc, setNewCreatureDesc] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [os, setOs] = useState('Linux');
  const [diff, setDiff] = useState('Easy');
  const [secret, setSecret] = useState('');
  const [labFlag, setLabFlag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [writeup, setWriteup] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editorMode, setEditorMode] = useState('quill'); // 'quill' | 'html' | 'preview'

  // 1. Authentication & MFA Effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce Email Allowlist
        if (!ALLOWED_ADMIN_EMAILS.includes(currentUser.email)) {
          alert(`UNAUTHORIZED ACCESS: Email ${currentUser.email} is not an administrator.`);
          await signOut(auth);
          setUser(null);
          setMfaStatus('checking');
          setLoading(false);
          return;
        }

        setUser(currentUser);
        localStorage.setItem('m_is_admin', 'true');
        sessionStorage.setItem('m_visited_session', 'admin');
        try {
          const secretDoc = await getDoc(doc(db, 'admin_secrets', currentUser.uid));
          if (secretDoc.exists()) {
            setMfaSecret(secretDoc.data().secret);
            setMfaStatus('verify');
          } else {
            setupNewMfa(currentUser.email);
          }
        } catch (error) {
          console.error("Error fetching MFA secret:", error);
          setMfaError("Failed to access security settings.");
          setMfaStatus('error');
        }
      } else {
        setMfaStatus('checking');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Machines & subscribe to Live Real-Time Stats when MFA passed
  useEffect(() => {
    if (mfaStatus === 'passed') {
      fetchMachines();
      fetchCompanionConfig();

      // Real-time listener: instantly updates counter without page refresh
      const unsubscribeStats = onSnapshot(
        doc(db, 'site_stats', 'traffic'),
        (docSnap) => {
          if (docSnap.exists()) {
            setVisitorCount(docSnap.data().count || 0);
          } else {
            setVisitorCount(0);
          }
        },
        (err) => {
          console.error("Real-time visitor stats listener error:", err);
        }
      );

      return () => unsubscribeStats();
    }
  }, [mfaStatus]);

  const fetchCompanionConfig = async () => {
    try {
      const snap = await getDoc(doc(db, 'site_settings', 'companion'));
      if (snap.exists()) {
        const data = snap.data();
        setCompanionConfig({
          enabled: data.enabled !== undefined ? data.enabled : DEFAULT_COMPANION_CONFIG.enabled,
          activeCreatureId: data.activeCreatureId || DEFAULT_COMPANION_CONFIG.activeCreatureId,
          creatures: data.creatures && data.creatures.length > 0 ? data.creatures : DEFAULT_COMPANION_CONFIG.creatures
        });
      }
    } catch (err) {
      console.error("Error fetching companion settings:", err);
    }
  };

  const handleSelectActiveCreature = async (creatureId) => {
    const updated = {
      ...companionConfig,
      activeCreatureId: creatureId
    };
    setCompanionConfig(updated);
    try {
      await setDoc(doc(db, 'site_settings', 'companion'), updated);
      const cName = updated.creatures.find(c => c.id === creatureId)?.name || creatureId;
      setCompanionSuccessMsg(`Active companion switched to: "${cName}"!`);
      setTimeout(() => setCompanionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Failed to update active companion:", err);
      alert("Error updating active creature: " + err.message);
    }
  };

  const handleToggleCompanion = async () => {
    const updated = {
      ...companionConfig,
      enabled: !companionConfig.enabled
    };
    setCompanionConfig(updated);
    try {
      await setDoc(doc(db, 'site_settings', 'companion'), updated);
      setCompanionSuccessMsg(`Companion visibility on Home: ${updated.enabled ? 'ENABLED' : 'DISABLED'}`);
      setTimeout(() => setCompanionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Failed to toggle companion:", err);
      alert("Error toggling companion: " + err.message);
    }
  };

  const handleAddCreature = async (e) => {
    e.preventDefault();
    if (!newCreatureName.trim() || !newCreatureUrl.trim()) return;

    const newId = 'custom_' + Date.now();
    const newCreature = {
      id: newId,
      name: newCreatureName.trim(),
      badge: newCreatureBadge.trim() || 'Custom Mascot',
      url: newCreatureUrl.trim(),
      type: 'custom',
      description: newCreatureDesc.trim() || 'Custom Cyber Companion'
    };

    const updated = {
      ...companionConfig,
      creatures: [...companionConfig.creatures, newCreature]
    };

    setSavingCompanion(true);
    try {
      await setDoc(doc(db, 'site_settings', 'companion'), updated);
      setCompanionConfig(updated);
      setNewCreatureName('');
      setNewCreatureBadge('');
      setNewCreatureUrl('');
      setNewCreatureDesc('');
      setCompanionSuccessMsg(`Deployed new creature: "${newCreature.name}"!`);
      setTimeout(() => setCompanionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error adding creature:", err);
      alert("Failed to save new creature: " + err.message);
    } finally {
      setSavingCompanion(false);
    }
  };

  const handleDeleteCreature = async (creatureId) => {
    if (creatureId === 'koi' || creatureId === 'shark') {
      alert("Default creatures (Git-Koi & Cyber Shark) cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this creature?")) return;

    const remaining = companionConfig.creatures.filter(c => c.id !== creatureId);
    const newActive = companionConfig.activeCreatureId === creatureId ? 'koi' : companionConfig.activeCreatureId;
    const updated = {
      ...companionConfig,
      activeCreatureId: newActive,
      creatures: remaining
    };

    setCompanionConfig(updated);
    try {
      await setDoc(doc(db, 'site_settings', 'companion'), updated);
      setCompanionSuccessMsg("Creature removed successfully.");
      setTimeout(() => setCompanionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Failed to delete creature:", err);
      alert("Error deleting creature: " + err.message);
    }
  };

  const fetchVisitorStatsManual = async () => {
    setIsRefreshingStats(true);
    try {
      const statsDoc = await getDoc(doc(db, 'site_stats', 'traffic'));
      if (statsDoc.exists()) {
        setVisitorCount(statsDoc.data().count || 0);
      }
    } catch (err) {
      console.error("Manual refresh stats error:", err);
    } finally {
      setTimeout(() => setIsRefreshingStats(false), 500);
    }
  };

  const fetchMachines = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "machines"));
      const machinesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMachines(machinesData);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  // --- MFA Logic ---
  const setupNewMfa = async (email) => {
    const newSecret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: 'Moshii Portfolio', label: email, algorithm: 'SHA1', digits: 6, period: 30, secret: newSecret
    });
    try {
      const url = await QRCode.toDataURL(totp.toString());
      setQrCodeUrl(url);
      setMfaSecret(newSecret.base32);
      setMfaStatus('setup');
    } catch (err) {
      console.error("QR Generation failed", err);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setMfaError('');
    const totp = new OTPAuth.TOTP({
      issuer: 'Moshii Portfolio', label: user.email, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(mfaSecret)
    });
    const delta = totp.validate({ token: mfaInput, window: 1 });
    if (delta !== null) {
      if (mfaStatus === 'setup') {
        try {
          await setDoc(doc(db, 'admin_secrets', user.uid), { secret: mfaSecret });
          setMfaStatus('passed');
        } catch (err) {
          setMfaError("Failed to save MFA setup to database.");
        }
      } else {
        setMfaStatus('passed');
      }
    } else {
      setMfaError('Invalid code. Please try again.');
    }
  };

  const handleLogin = async () => {
    try { 
      await signInWithPopup(auth, new GoogleAuthProvider()); 
    } catch (error) { 
      if (error.code === 'auth/popup-closed-by-user') {
        // User just closed the login window, no need to alert an error
        return;
      }
      alert("Authentication failed. Or say (moshii) three times."); 
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMfaStatus('checking');
    setMfaInput('');
    setMfaSecret('');
  };

  // --- Dashboard Logic ---
  const clearForm = () => {
    setSelectedMachineId(null);
    setName('');
    setOs('Linux');
    setDiff('Easy');
    setSecret('');
    setLabFlag('');
    setImageUrl('');
    setWriteup('');
    setEditorMode('quill');
    setSuccessMsg('');
  };

  const loadMachine = (m) => {
    setSelectedMachineId(m.id);
    setName(m.name || '');
    setOs(m.os || 'Linux');
    setDiff(m.diff || 'Easy');
    setSecret(m.secret || '');
    setLabFlag(m.labFlag || '');
    setImageUrl(m.imageUrl || '');
    
    const cleaned = getCleanHtml(m.writeup || '');
    setWriteup(cleaned);
    if (isFullHtmlDoc(cleaned)) {
      setEditorMode('preview');
    } else {
      setEditorMode('quill');
    }
    setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !writeup) {
      alert("Please fill in Name and Writeup content.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg('');

    try {
      let finalWriteup = getCleanHtml(writeup);
      if (finalWriteup.includes('data:image/')) {
        finalWriteup = await uploadHtmlImagesToStorage(finalWriteup, setSuccessMsg);
      }

      if (finalWriteup.length > 1000000) {
        alert("Error: The writeup text itself is STILL too large (>1MB) after extracting images. Please split the writeup.");
        setSubmitting(false);
        setSuccessMsg('');
        return;
      }

      const nameTrimmed = (name || '').trim();
      const secretTrimmed = (secret || '').trim();
      const secretHash = secretTrimmed ? await hashPassword(secretTrimmed) : '';
      const labFlagTrimmed = (labFlag || '').trim();

      let xorKey = '';
      let encryptedFlag = '';
      if (labFlagTrimmed) {
        xorKey = 'm0sh11_x0r_' + Math.floor(Math.random() * 8999 + 1000);
        const encChars = labFlagTrimmed.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ xorKey.charCodeAt(i % xorKey.length)));
        encryptedFlag = btoa(encChars.join(''));
      }

      const machineData = {
        name: nameTrimmed, 
        os, diff, 
        secret: secretTrimmed,
        secretHash: secretHash,
        isProtected: !!secretTrimmed,
        labFlag: labFlagTrimmed,
        xorKey: xorKey,
        encryptedFlag: encryptedFlag,
        imageUrl: imageUrl,
        writeup: finalWriteup,
        updatedAt: serverTimestamp()
      };

      if (selectedMachineId) {
        // Update Existing
        await updateDoc(doc(db, 'machines', selectedMachineId), machineData);
        setWriteup(finalWriteup); // Update editor state with live Firebase URLs to prevent re-uploading
        setSuccessMsg('Machine updated successfully!');
      } else {
        // Create New
        machineData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'machines'), machineData);
        setSuccessMsg('New machine deployed successfully!');
        clearForm(); // Only clear if creating new, keep if editing
      }
      fetchMachines();
    } catch (error) {
      alert("Failed to save machine: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!name) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      console.log("Starting duplicate...");
      let finalWriteup = writeup;
      if (writeup.includes('data:image/')) {
        finalWriteup = await uploadHtmlImagesToStorage(writeup, setSuccessMsg);
      }

      if (finalWriteup.length > 1000000) {
        alert("Error: The writeup text itself is STILL too large (>1MB) after extracting images. Please split the writeup.");
        setSubmitting(false);
        setSuccessMsg('');
        return;
      }

      const machineData = {
        name: name + " (Copy)",
        os, diff, secret,
        imageUrl: imageUrl,
        writeup: finalWriteup,
        createdAt: serverTimestamp()
      };
      console.log("Adding doc to Firestore...");
      await addDoc(collection(db, 'machines'), machineData);
      console.log("Doc added!");
      setSuccessMsg('Machine saved as new successfully!');
      fetchMachines();
    } catch (error) {
      console.error("Duplicate Error:", error);
      alert("Failed to duplicate: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMachineId) return;
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'machines', selectedMachineId));
        fetchMachines();
        clearForm();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  // --- Render ---
  if (loading) return <div className="page-container"><p>[ Verifying credentials... ]</p></div>;

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', maxWidth: '400px' }}>
          <Shield size={48} color="var(--accent-red)" style={{ marginBottom: '16px' }} />
          <h2 className="text-glow-red" style={{ color: 'var(--accent-red)' }}>RESTRICTED AREA</h2>
          <p style={{ marginBottom: '24px' }}>Admin access required. Please authenticate.</p>
          <button className="hack-btn" onClick={handleLogin} style={{ width: '100%' }}>Sign in with Google</button>
        </div>
      </div>
    );
  }

  if (mfaStatus === 'setup' || mfaStatus === 'verify') {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', maxWidth: '450px', width: '100%' }}>
          <Lock size={48} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
          <h2 className="text-glow-cyan">TWO-FACTOR AUTHENTICATION</h2>
          {mfaStatus === 'setup' ? (
            <div style={{ margin: '24px 0' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Scan this QR code with the Google Authenticator app on your phone to link your account.</p>
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ border: '4px solid white', borderRadius: '8px', margin: '16px 0', width: '200px' }} />}
            </div>
          ) : (
            <p style={{ margin: '24px 0', color: 'var(--text-secondary)' }}>Enter the 6-digit code from your Google Authenticator app.</p>
          )}
          <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="000000" value={mfaInput} onChange={(e) => setMfaInput(e.target.value)} className="admin-input" style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }} maxLength={6} autoFocus />
            {mfaError && <p style={{ color: 'var(--accent-red)', margin: 0, fontSize: '0.9rem' }}><AlertTriangle size={14} className="inline-icon"/> {mfaError}</p>}
            <button type="submit" className="hack-btn" style={{ width: '100%' }}>Verify Code</button>
          </form>
        </div>
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }, { 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
      ['link', 'image', 'video', 'clean']
    ],
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <h2 className="text-glow-purple" style={{ margin: 0 }}>Admin_Dashboard.exe</h2>
          {visitorCount !== null && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(0, 255, 65, 0.08)',
              border: '1px solid rgba(0, 255, 65, 0.35)',
              borderRadius: '20px',
              fontSize: '0.82rem',
              color: 'var(--accent-green)',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.15)'
            }}>
              <span className="pulse-dot" style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                display: 'inline-block'
              }}></span>
              <Users size={15} />
              <span>VISITORS: <strong style={{ color: '#fff' }}>{visitorCount.toLocaleString()}</strong> <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>(LIVE)</span></span>
              <button 
                onClick={fetchVisitorStatsManual}
                title="Force refresh counter from database"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-green)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  marginLeft: '4px'
                }}
              >
                <RefreshCw size={13} className={isRefreshingStats ? "spin-icon" : ""} />
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>{user.email} (Verified)</span>
          <button className="hack-btn" onClick={handleLogout} style={{ border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}><LogOut size={16} /> Logout</button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('machines')}
          className="hack-btn"
          style={{
            background: activeTab === 'machines' ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 0, 0, 0.5)',
            borderColor: activeTab === 'machines' ? 'var(--accent-green)' : 'var(--glass-border)',
            color: activeTab === 'machines' ? 'var(--accent-green)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={16} /> Target Machines
        </button>
        <button
          onClick={() => setActiveTab('companion')}
          className="hack-btn"
          style={{
            background: activeTab === 'companion' ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.5)',
            borderColor: activeTab === 'companion' ? 'var(--accent-cyan)' : 'var(--glass-border)',
            color: activeTab === 'companion' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} /> Cyber Companion (Home Mascot)
        </button>
      </div>

      {activeTab === 'machines' && (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side: Machine List */}
        <div className="glass-panel" style={{ padding: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
          <button onClick={clearForm} className="hack-btn" style={{ width: '100%', marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <PlusCircle size={18}/> New Machine
          </button>
          
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Database</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {machines.map(m => (
              <div 
                key={m.id} 
                onClick={() => loadMachine(m)}
                style={{ 
                  padding: '12px', background: selectedMachineId === m.id ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0,0,0,0.5)', 
                  border: selectedMachineId === m.id ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                  borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: selectedMachineId === m.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{m.name}</strong>
                  <Edit3 size={14} color="var(--text-secondary)" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{m.os} - {m.diff}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectedMachineId ? <><Edit3 /> Editing: {name}</> : <><PlusCircle /> Deploying New Target</>}
          </h3>

          {successMsg && (
            <div style={{ padding: '16px', background: 'rgba(0,255,65,0.1)', border: '1px solid var(--accent-green)', borderRadius: '4px', marginBottom: '24px', color: 'var(--accent-green)' }}>
              <CheckCircle className="inline-icon" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label>Machine Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="admin-input" placeholder="e.g. Lame" />
              </div>
              <div>
                <label>Page Lock Password (Optional)</label>
                <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="admin-input" placeholder="Password to unlock writeup" />
              </div>
            </div>

            <div>
              <label>Lab Challenge Flag / Session Key (Optional - for interactive labs)</label>
              <input 
                type="text" 
                value={labFlag} 
                onChange={e => setLabFlag(e.target.value)} 
                className="admin-input" 
                placeholder="e.g. flag{W3lc0me-Ev3ry0ne-T0-AI-S3ss1on-W1th-M0sh11}" 
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                🔐 Automatically encrypted using a dynamic XOR cipher in Firestore. The lab fetches and decrypts it at runtime.
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label>Operating System</label>
                <select value={os} onChange={e => setOs(e.target.value)} className="admin-input">
                  <option>Linux</option>
                  <option>Windows</option>
                  <option>Android</option>
                  <option>AI &amp; LLM</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label>Difficulty</label>
                <select value={diff} onChange={e => setDiff(e.target.value)} className="admin-input">
                  <option>Easy</option><option>Medium</option><option>Hard</option><option>Insane</option>
                </select>
              </div>
            </div>

            <div>
              <label>Cover Image URL (Optional)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                {imageUrl && <img src={imageUrl} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-cyan)' }} />}
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                    className="admin-input" 
                    placeholder="https://example.com/image.png" 
                    style={{ marginTop: 0 }}
                  />
                  <small style={{ color: 'var(--text-secondary)' }}>Paste a direct link to an image (Imgur, Unsplash, etc.)</small>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ margin: 0 }}>Writeup Content *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: editorMode === 'preview' ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                      background: editorMode === 'preview' ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
                      color: editorMode === 'preview' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Eye size={14} /> Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('quill')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: editorMode === 'quill' ? '1px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                      background: editorMode === 'quill' ? 'rgba(181, 55, 242, 0.2)' : 'transparent',
                      color: editorMode === 'quill' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Edit3 size={14} /> Rich Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('html')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: editorMode === 'html' ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                      background: editorMode === 'html' ? 'rgba(0, 255, 65, 0.2)' : 'transparent',
                      color: editorMode === 'html' ? 'var(--accent-green)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Code size={14} /> HTML Source (&lt;/&gt;)
                  </button>
                </div>
              </div>

              {editorMode === 'preview' && (
                <div style={{ marginTop: '8px', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: '#161b22', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={14} /> Live Interactive Preview (What visitors will see)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([getCleanHtml(writeup)], { type: 'text/html;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      }}
                      style={{
                        background: 'rgba(0, 255, 255, 0.1)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '4px'
                      }}
                    >
                      <ExternalLink size={14} /> Open in new window
                    </button>
                  </div>
                  <iframe
                    srcDoc={getCleanHtml(writeup)}
                    title="Live Preview"
                    style={{
                      width: '100%',
                      height: '550px',
                      border: 'none',
                      backgroundColor: isFullHtmlDoc(writeup) ? '#090d16' : '#ffffff'
                    }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              )}

              {editorMode === 'quill' && (
                <div style={{ background: '#fff', color: '#000', borderRadius: '4px', marginTop: '8px' }}>
                  {isFullHtmlDoc(writeup) && (
                    <div style={{ background: '#fff3cd', color: '#856404', padding: '10px 14px', borderBottom: '1px solid #ffeeba', fontSize: '0.85rem' }}>
                      ⚠️ <strong>Full HTML App Detected:</strong> This writeup is a full standalone HTML application. Use <strong>Live Preview</strong> above to interact with the visual page, or <strong>HTML Source</strong> to edit its code.
                    </div>
                  )}
                  <ReactQuill theme="snow" value={writeup} onChange={setWriteup} modules={modules} style={{ height: '400px', marginBottom: '60px' }} />
                </div>
              )}

              {editorMode === 'html' && (
                <div style={{ marginTop: '8px' }}>
                  <textarea
                    value={writeup}
                    onChange={(e) => setWriteup(e.target.value)}
                    placeholder="Paste your raw HTML code here (e.g. <!DOCTYPE html>, <h2>Title</h2>, <p>text</p>)..."
                    className="admin-input"
                    style={{
                      width: '100%',
                      height: '460px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      padding: '16px',
                      backgroundColor: '#0d1117',
                      color: '#00ff41',
                      border: '1px solid var(--accent-green)',
                      borderRadius: '4px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      whiteSpace: 'pre',
                      overflowX: 'auto'
                    }}
                  />
                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                    💡 Tip: Paste your raw HTML here. Click "Live Preview" above anytime to see and test the interactive page!
                  </small>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              <button type="submit" className="hack-btn" disabled={submitting}>
                {submitting ? 'Processing...' : selectedMachineId ? 'Update Machine' : 'Deploy New Machine'}
              </button>
              
              {selectedMachineId && (
                <>
                  <button type="button" className="hack-btn" onClick={handleDuplicate} disabled={submitting} style={{ background: 'rgba(0, 255, 255, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
                    <Copy size={16} className="inline-icon"/> Save as New (Duplicate)
                  </button>
                  <div style={{ flex: 1 }}></div>
                  <button type="button" className="hack-btn" onClick={handleDelete} disabled={submitting} style={{ background: 'rgba(255, 0, 60, 0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}>
                    <Trash2 size={16} className="inline-icon"/> Delete
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Cyber Companion Manager */}
      {activeTab === 'companion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {companionSuccessMsg && (
            <div style={{ padding: '16px', background: 'rgba(0,255,65,0.1)', border: '1px solid var(--accent-green)', borderRadius: '4px', color: 'var(--accent-green)' }}>
              <CheckCircle className="inline-icon" /> {companionSuccessMsg}
            </div>
          )}

          {/* Top Controls: Status Toggle */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} /> Home Page Cyber Companion
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Manage the animated companion mascot displayed on your Home page. Switch between Git-Koi, Cyber Shark, or add any custom creature anytime.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: companionConfig.enabled ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                {companionConfig.enabled ? '● ACTIVE ON HOME' : '○ DISABLED'}
              </span>
              <button
                type="button"
                onClick={handleToggleCompanion}
                className="hack-btn"
                style={{
                  borderColor: companionConfig.enabled ? 'var(--accent-red)' : 'var(--accent-green)',
                  color: companionConfig.enabled ? 'var(--accent-red)' : 'var(--accent-green)'
                }}
              >
                {companionConfig.enabled ? 'Disable Companion' : 'Enable Companion'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
            {/* Left: Available Creatures Fleet */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                Companion Fleet ({companionConfig.creatures?.length || 0})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
                {companionConfig.creatures?.map(c => {
                  const isActive = companionConfig.activeCreatureId === c.id;
                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '16px',
                        background: isActive ? 'rgba(0, 255, 65, 0.08)' : 'rgba(0, 0, 0, 0.5)',
                        border: isActive ? '2px solid var(--accent-green)' : '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 0 16px rgba(0, 255, 65, 0.2)' : 'none'
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'var(--accent-green)',
                          color: '#000',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          textTransform: 'uppercase'
                        }}>
                          Active
                        </div>
                      )}

                      <div style={{
                        width: '88px',
                        height: '88px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, rgba(0,0,0,0.6) 80%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <img 
                          src={c.url} 
                          alt={c.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                          onError={(e) => { e.target.src = 'koi/koi.gif'; }}
                        />
                      </div>

                      <strong style={{ color: isActive ? 'var(--accent-green)' : 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>
                        {c.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', background: 'rgba(0,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                        {c.badge || 'Companion'}
                      </span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.35, minHeight: '36px' }}>
                        {c.description}
                      </p>

                      <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => handleSelectActiveCreature(c.id)}
                            className="hack-btn"
                            style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                          >
                            Set Active
                          </button>
                        ) : (
                          <div style={{ flex: 1, padding: '6px', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                            ✓ Live on Home
                          </div>
                        )}

                        {c.id !== 'koi' && c.id !== 'shark' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCreature(c.id)}
                            style={{
                              background: 'rgba(255, 0, 85, 0.1)',
                              border: '1px solid var(--accent-red)',
                              color: 'var(--accent-red)',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              cursor: 'pointer'
                            }}
                            title="Remove Creature"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Deploy New Creature Form */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <PlusCircle size={18} /> Deploy New Creature
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Add any animated GIF, pixel-art sprite, or character URL to your companion fleet.
              </p>

              <form onSubmit={handleAddCreature} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', marginBottom: '4px', display: 'block' }}>Creature Name *</label>
                  <input
                    type="text"
                    value={newCreatureName}
                    onChange={(e) => setNewCreatureName(e.target.value)}
                    required
                    placeholder="e.g. Cyber Dragon"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', marginBottom: '4px', display: 'block' }}>Badge / Tag</label>
                  <input
                    type="text"
                    value={newCreatureBadge}
                    onChange={(e) => setNewCreatureBadge(e.target.value)}
                    placeholder="e.g. Glitch Mode"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', marginBottom: '4px', display: 'block' }}>Image / GIF URL *</label>
                  <input
                    type="text"
                    value={newCreatureUrl}
                    onChange={(e) => setNewCreatureUrl(e.target.value)}
                    required
                    placeholder="e.g. https://.../dragon.gif or /creatures/my-art.gif"
                    className="admin-input"
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    Supports any direct GIF link (GitHub, Giphy, Imgur, etc.)
                  </small>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', marginBottom: '4px', display: 'block' }}>Description</label>
                  <textarea
                    value={newCreatureDesc}
                    onChange={(e) => setNewCreatureDesc(e.target.value)}
                    rows={2}
                    placeholder="Brief lore or description..."
                    className="admin-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {newCreatureUrl && (
                  <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Live URL Preview</div>
                    <img
                      src={newCreatureUrl}
                      alt="Preview"
                      style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingCompanion}
                  className="hack-btn"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {savingCompanion ? 'Saving...' : '+ Add Creature to Fleet'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
