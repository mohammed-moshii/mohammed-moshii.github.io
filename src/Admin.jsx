import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Shield, LogOut, PlusCircle, CheckCircle, Lock, QrCode, AlertTriangle, Edit3, Trash2, Copy, Image as ImageIcon, Eye, Code, ExternalLink, Users } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { hashPassword } from './cryptoUtils';
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
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                boxShadow: '0 0 8px var(--accent-green)',
                display: 'inline-block'
              }}></span>
              <Users size={15} />
              <span>VISITORS: <strong style={{ color: '#fff' }}>{visitorCount.toLocaleString()}</strong> <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>(LIVE)</span></span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>{user.email} (Verified)</span>
          <button className="hack-btn" onClick={handleLogout} style={{ border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}><LogOut size={16} /> Logout</button>
        </div>
      </div>

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
    </div>
  );
};

export default Admin;
