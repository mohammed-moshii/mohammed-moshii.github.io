import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Responsive window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time Firestore sync
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

  const isMobile = windowWidth < 768;
  const creatureSize = isMobile ? 180 : 260;
  const halfSize = creatureSize / 2;

  // Orbit radius adapted to screen width
  const rx = isMobile ? 150 : 380;
  const ry = isMobile ? 160 : 185;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${creatureSize}px`,
        height: `${creatureSize}px`,
        marginLeft: `-${halfSize}px`,
        marginTop: `-${halfSize}px`,
        pointerEvents: 'none',
        zIndex: 20, // Swimming in front of / around the hero title
        userSelect: 'none'
      }}
      animate={{
        // Smooth continuous trajectory circling around MOHAMMED MOSHII
        x: [
          -rx,       -rx * 0.5,  0,        rx * 0.5,  rx,
          rx * 1.15, rx,
          rx * 0.5,  0,         -rx * 0.5, -rx,
          -rx * 1.15, -rx
        ],
        y: [
          -ry * 0.85, -ry * 0.95, -ry,     -ry * 0.9, -ry * 0.7,
          0,          ry * 0.7,
          ry * 0.9,   ry,        ry * 0.9,  ry * 0.75,
          0,          -ry * 0.85
        ],
        scaleX: [
          1,  1,  1,  1,  1,
          1,  -1,
          -1, -1, -1, -1,
          -1, 1
        ],
        rotate: [
          -4, 5, -3, 8, 22,
          45, -28,
          -10, 4, -6, 12,
          -45, -4
        ]
      }}
      transition={{
        duration: isMobile ? 13 : 17,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <img
        src={activeCreature.url}
        alt={activeCreature.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.45)) drop-shadow(0 0 45px rgba(0, 255, 255, 0.25))',
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        title={`${activeCreature.name} // Swimming around Mohammed Moshii`}
        onError={(e) => {
          if (e.target.src !== 'koi/koi.gif') {
            e.target.src = 'koi/koi.gif';
          }
        }}
      />
    </motion.div>
  );
};

export default Companion;
