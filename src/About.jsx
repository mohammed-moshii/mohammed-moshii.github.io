import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Cpu, Code, ExternalLink } from 'lucide-react';
import './index.css';

const About = () => {
  const socials = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mohammed-m0shii/', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', desc: 'Professional network' },
    { name: 'YouTube', url: 'https://www.youtube.com/@moshii0x00', icon: 'https://cdn.simpleicons.org/youtube/ff0000', desc: 'CTF walkthroughs & Threat Hunting' },
    { name: 'TryHackMe', url: 'https://tryhackme.com/p/Moshii', icon: 'https://cdn.simpleicons.org/tryhackme/white', desc: 'Top 1% Ranked' },
    { name: 'GitHub', url: 'https://github.com/G3t-Moshii', icon: 'https://cdn.simpleicons.org/github/white', desc: 'Security tools & research' }
  ];

  const hackedCompanies = [
    { name: 'LinkedIn', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
    { name: 'Cisco', icon: 'https://cdn.simpleicons.org/cisco/1ba0d7' },
    { name: 'HackTheBox', icon: 'https://cdn.simpleicons.org/hackthebox/9fef00' },
    { name: 'HackerOne', icon: 'https://cdn.simpleicons.org/hackerone/white' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="about-container"
    >
      {/* Animated Cyber Grid Background specific to About Page */}
      <div className="about-bg-grid"></div>

      <div className="about-content">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <Shield size={64} color="var(--accent-cyan)" style={{ margin: '0 auto 16px auto', filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.5))' }} />
          <h1 className="text-glow-cyan" style={{ fontSize: '3rem', margin: '0' }}>Mohammed Moshii</h1>
          <h3 style={{ color: 'var(--accent-purple)', letterSpacing: '2px', fontWeight: 'normal', margin: '8px 0' }}>// CYBERSECURITY SPECIALIST AND TRAINER</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '24px auto', lineHeight: '1.6' }}>
            Specializing in Penetration Testing, Web Application Security, Network Exploitation. I find the flaws before they do.
          </p>
        </motion.div>

        {/* Social Links as Interactive Cards */}
        <h2 className="text-glow-green" style={{ borderBottom: '1px solid rgba(0,255,65,0.2)', paddingBottom: '8px', marginBottom: '24px' }}>
          &gt; INITIAL_ACCESS
        </h2>
        <div className="social-grid">
          {socials.map((social, idx) => (
            <motion.a 
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="social-card glass-panel"
              key={social.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              whileHover={{ scale: 1.05, borderColor: 'var(--accent-cyan)', boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}
            >
              <img src={social.icon} alt={social.name} className="social-icon" style={{ marginBottom: '12px', width: '40px', height: '40px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{social.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{social.desc}</span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Companies Hacked Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '64px' }}
        >
          <h2 className="text-glow-red" style={{ borderBottom: '1px solid rgba(255,0,60,0.2)', paddingBottom: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target color="var(--accent-red)" /> &gt; TARGETS_COMPROMISED
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Vulnerabilities successfully identified and responsibly disclosed for the following organizations:
          </p>

          {/* Special NASA Hall of Fame */}
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', bounce: 0.5 }}
            whileHover={{ scale: 1.02, borderColor: '#e3000f', boxShadow: '0 0 40px rgba(227, 0, 15, 0.4)' }}
            style={{ 
              marginBottom: '24px', 
              padding: '40px', 
              textAlign: 'center', 
              background: 'linear-gradient(45deg, rgba(227, 0, 15, 0.05), rgba(11, 61, 145, 0.1))',
              border: '2px solid rgba(227, 0, 15, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, background: '#e3000f', color: '#fff', padding: '4px 24px', fontSize: '0.8rem', fontWeight: 'bold', transform: 'rotate(-45deg) translate(-25px, -15px)', letterSpacing: '2px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              HALL OF FAME
            </div>
            <img src="https://cdn.simpleicons.org/nasa/white" alt="NASA" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.5))' }} />
          </motion.div>
          
          <div className="hacked-grid">
            {hackedCompanies.map((comp, idx) => (
              <motion.div
                key={comp.name}
                className="hacked-card glass-panel"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + (idx * 0.1), type: 'spring' }}
                whileHover={{ y: -10, borderColor: 'var(--accent-red)', boxShadow: '0 10px 20px rgba(255,0,60,0.15)' }}
              >
                <img src={comp.icon} alt={comp.name} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'grayscale(50%) brightness(1.2)' }} className="hacked-icon" />
                <h4 style={{ margin: '16px 0 0 0', color: '#fff', letterSpacing: '1px' }}>{comp.name}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Training Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ marginTop: '64px', textAlign: 'center', padding: '48px 24px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '12px', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'var(--accent-cyan)', boxShadow: '0 0 20px var(--accent-cyan)' }}></div>
          
          <h2 className="text-glow-cyan" style={{ fontSize: '4.5rem', margin: '0 0 8px 0', letterSpacing: '4px' }}>+1,000</h2>
          <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 32px 0', fontWeight: 'normal', letterSpacing: '1px' }}>Employees Trained in Cyber Security Awareness</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            {['Phishing Detection', 'Social Engineering', 'Ethical Hacking', 'SOC Analyst', 'Penetration Testing'].map((topic, i) => (
              <span key={i} style={{ 
                padding: '8px 20px', 
                background: 'rgba(0, 255, 255, 0.05)', 
                border: '1px solid rgba(0, 255, 255, 0.3)', 
                borderRadius: '20px', 
                color: 'var(--accent-cyan)',
                fontSize: '0.95rem',
                letterSpacing: '1px',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
              }}>
                {topic}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default About;
