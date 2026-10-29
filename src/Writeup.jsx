import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Server, Calendar, Lock, AlertTriangle, ExternalLink, Maximize2 } from 'lucide-react';
import './index.css';

const resolveContent = (raw) => {
  if (!raw) return { isFullDoc: false, html: '' };

  const trimmed = raw.trim();

  // 1. Clean standalone HTML document
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html/i.test(trimmed)) {
    return { isFullDoc: true, html: trimmed };
  }

  // 2. Escaped / wrapped in pre or table
  if (
    raw.includes('&lt;!DOCTYPE') || 
    raw.includes('&lt;html') || 
    raw.includes('<!DOCTYPE') || 
    raw.includes('<html')
  ) {
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
    if (docMatch) {
      return { isFullDoc: true, html: docMatch[0] };
    }
  }

  return { isFullDoc: false, html: raw };
};

const Writeup = () => {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMachineId, setCurrentMachineId] = useState(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'machines'));
        let foundMachine = null;
        let foundMachineId = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const docSlug = data.name.toLowerCase().replace(/\s+/g, '-');
          if (docSlug === id) {
            foundMachine = data;
            foundMachineId = doc.id;
          }
        });

        if (foundMachine) {
          setMachine(foundMachine);
          setCurrentMachineId(foundMachineId);
          if (!foundMachine.secret || foundMachine.secret.trim() === '') {
            setIsUnlocked(true);
          } else if (sessionStorage.getItem(`unlocked_${foundMachineId}`) === 'true') {
            setIsUnlocked(true);
          }
        } else {
          setError("Machine not found in database.");
        }
      } catch (err) {
        console.error("Error fetching machine:", err);
        setError("Error connecting to mainframe.");
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [id]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === machine.secret) {
      sessionStorage.setItem(`unlocked_${currentMachineId}`, 'true');
      setIsUnlocked(true);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  if (loading) {
    return <div className="page-container"><p className="text-glow-cyan" style={{ marginTop: '40px' }}>[ Decrypting blocks... ]</p></div>;
  }

  if (error || !machine) {
    return <div className="page-container"><p className="text-glow-red" style={{ marginTop: '40px' }}>[ ERROR: {error} ]</p></div>;
  }

  // Format date if exists
  let dateString = "Unknown Date";
  if (machine.createdAt) {
    dateString = new Date(machine.createdAt.seconds * 1000).toLocaleDateString();
  }

  const resolved = resolveContent(machine.writeup);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="light-theme-page"
      style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f5f7', padding: '40px 16px' }}
    >
      <div className="writeup-page-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '32px' }}>
      <div className="writeup-header-banner">
        <Link to="/htb" className="back-btn-banner">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {machine.imageUrl && (
            <img src={machine.imageUrl} alt={`${machine.name} cover`} className="banner-avatar" />
          )}
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: '#fff', textShadow: 'none', textTransform: 'none' }}>
              {machine.name}
            </h1>
            <p style={{ margin: 0, color: '#a0aabf', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>
              {machine.diff || 'Unknown'} &middot; {machine.os || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Render the rich text HTML content OR the lock screen */}
      {!isUnlocked ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.8)', borderRadius: '8px', color: '#fff', border: '1px solid var(--glass-border)' }}>
          <Lock size={48} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
          <h2 className="text-glow-cyan">Encrypted Writeup</h2>
          <p style={{ marginBottom: '24px', color: '#aaa' }}>This writeup requires a password to view. Please enter the flag.</p>
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter flag..."
              autoFocus
              className={passwordError ? 'shake' : ''}
              style={{
                background: 'rgba(255,255,255,0.1)', border: passwordError ? '1px solid var(--accent-red)' : '1px solid var(--accent-cyan)',
                color: '#fff', padding: '12px', fontFamily: 'var(--font-mono)',
                outline: 'none', borderRadius: '4px', textAlign: 'center'
              }}
            />
            {passwordError && <p style={{ color: 'var(--accent-red)', margin: 0, fontSize: '0.9rem' }}><AlertTriangle size={14} className="inline-icon"/> ACCESS DENIED. INCORRECT FLAG.</p>}
            <button type="submit" className="hack-btn" style={{ background: 'rgba(0, 255, 65, 0.2)' }}>
              Decrypt Content
            </button>
          </form>
        </div>
      ) : resolved.isFullDoc ? (
        <div style={{ width: '100%', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button 
              type="button"
              onClick={() => {
                const blob = new Blob([resolved.html], { type: 'text/html;charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
              }}
              className="hack-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                background: 'rgba(0, 255, 255, 0.15)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={16} /> Open Fullscreen / New Tab
            </button>
          </div>
          <iframe
            srcDoc={resolved.html}
            title={machine.name}
            style={{
              width: '100%',
              minHeight: '85vh',
              height: '950px',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              backgroundColor: '#0d1117'
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      ) : (
        <div 
          className="writeup-content responsive-glass-padding" 
          style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
          dangerouslySetInnerHTML={{ __html: resolved.html }} 
        />
      )}
      
      {/* We need some CSS specifically for the quill output, but standard tags will render mostly fine */}
      </div>
    </motion.div>
  );
};

export default Writeup;
