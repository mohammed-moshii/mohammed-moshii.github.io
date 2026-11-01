import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Shield, Sparkles, ExternalLink, X, ChevronUp, ChevronDown } from 'lucide-react';

export const DEFAULT_COMPANION_CONFIG = {
  enabled: true,
  activeCreatureId: 'koi',
  creatures: [
    {
      id: 'koi',
      name: 'Git-Koi',
      badge: 'Live GitHub Activity',
      url: 'koi/koi.gif',
      type: 'git-koi',
      description: 'Living pixel-art koi drawn from mohammed-moshii GitHub activity.'
    },
    {
      id: 'shark',
      name: 'Cyber Shark',
      badge: 'Predator Mode',
      url: 'creatures/shark.gif',
      type: 'custom',
      description: 'Apex cybernetic predator prowling the mainframe.'
    }
  ]
};

const Companion = () => {
  const [config, setConfig] = useState(DEFAULT_COMPANION_CONFIG);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Subscribe to real-time companion settings in Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_settings', 'companion'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig({
          enabled: data.enabled !== undefined ? data.enabled : DEFAULT_COMPANION_CONFIG.enabled,
          activeCreatureId: data.activeCreatureId || DEFAULT_COMPANION_CONFIG.activeCreatureId,
          creatures: data.creatures && data.creatures.length > 0 ? data.creatures : DEFAULT_COMPANION_CONFIG.creatures
        });
      }
    }, (err) => {
      console.warn("Companion settings read error, using defaults:", err);
    });

    return () => unsub();
  }, []);

  if (!config.enabled) return null;

  const activeCreature = config.creatures?.find(c => c.id === config.activeCreatureId) || config.creatures?.[0] || DEFAULT_COMPANION_CONFIG.creatures[0];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }}>
      {/* Speech Bubble / Info Card */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              pointerEvents: 'auto',
              marginBottom: '12px',
              padding: '16px',
              maxWidth: '280px',
              background: 'rgba(5, 10, 15, 0.92)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--accent-green)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> {activeCreature.badge || 'Cyber Companion'}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            </div>

            <h4 style={{ margin: '0 0 6px 0', color: 'var(--accent-cyan)', fontSize: '1rem', letterSpacing: '0.5px' }}>
              {activeCreature.name}
            </h4>

            <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4 }}>
              {activeCreature.description || 'Patrolling the digital perimeter.'}
            </p>

            {activeCreature.type === 'git-koi' && (
              <a
                href="https://github.com/mohammed-moshii"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-green)',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0, 255, 65, 0.08)'
                }}
              >
                mohammed-moshii <ExternalLink size={11} />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creature Avatar & Float Pod */}
      <motion.div
        animate={isMinimized ? { y: 0 } : { y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={`${activeCreature.name} (Click for info)`}
      >
        <div style={{
          position: 'relative',
          padding: '6px',
          background: 'rgba(5, 8, 16, 0.85)',
          border: '1px solid var(--accent-green)',
          borderRadius: '50px',
          boxShadow: '0 0 16px rgba(0, 255, 65, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.25s ease'
        }}>
          {/* Animated Graphic */}
          <div style={{
            width: isMinimized ? '32px' : '64px',
            height: isMinimized ? '32px' : '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(0,255,65,0.15) 0%, rgba(0,0,0,0.6) 80%)',
            transition: 'all 0.2s'
          }}>
            <img 
              src={activeCreature.url} 
              alt={activeCreature.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
              onError={(e) => {
                // Fallback to koi if custom URL fails to load
                if (e.target.src !== 'koi/koi.gif') {
                  e.target.src = 'koi/koi.gif';
                }
              }}
            />
          </div>

          {!isMinimized && (
            <div style={{ paddingRight: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                {activeCreature.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-green)', fontFamily: 'monospace' }}>
                // ONLINE
              </div>
            </div>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Companion;
