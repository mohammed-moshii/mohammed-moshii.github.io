import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SOC_MODULES } from './data/socModulesData';
import './cybersoc.css';

const SocCourse = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Search & Filter state
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'syllabus'
  const [activeSidebarTrack, setActiveSidebarTrack] = useState('modules');

  // Selected module for modal/drawer study workspace
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' | 'theory' | 'lab' | 'challenge'
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Persistence of completed challenges
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('moshii_soc_completed');
      if (saved) return JSON.parse(saved);
      // Default initial progress matching the user template:
      // Mod 1, 2, 3 completed, Mod 4 active
      return {
        'soc-mod-01': true,
        'soc-mod-02': true,
        'soc-mod-03': true
      };
    } catch {
      return {
        'soc-mod-01': true,
        'soc-mod-02': true,
        'soc-mod-03': true
      };
    }
  });

  // Challenge input state
  const [flagInput, setFlagInput] = useState('');
  const [challengeStatus, setChallengeStatus] = useState(null); // 'success' | 'error' | null
  const [showHint, setShowHint] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('Mohammed Moshii');

  // Lab Simulators State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [b64Decoded, setB64Decoded] = useState('');
  const [packetFilter, setPacketFilter] = useState('ALL');
  const [splunkQuery, setSplunkQuery] = useState('index=botsv3 sourcetype="stream:http" http_method="POST"');
  const [splunkResults, setSplunkResults] = useState(null);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('moshii_soc_completed', JSON.stringify(completedChallenges));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [completedChallenges]);

  // Open module from URL params if present
  useEffect(() => {
    if (moduleId) {
      const found = SOC_MODULES.find(m => m.slug === moduleId || m.id === moduleId);
      if (found) {
        setSelectedModule(found);
      }
    }
  }, [moduleId]);

  // Reset slide index & challenge state on module change
  useEffect(() => {
    if (selectedModule) {
      setCurrentSlideIndex(0);
      setFlagInput('');
      setChallengeStatus(null);
      setShowHint(false);
      setSelectedAlert(null);
      setB64Decoded('');
      setSplunkResults(null);
    }
  }, [selectedModule?.id]);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl+K search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('module-search')?.focus();
      }
      if (!selectedModule || activeTab !== 'slides') return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModule, activeTab, currentSlideIndex]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Slide controls
  const totalSlides = selectedModule?.slides?.length || 0;
  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) setCurrentSlideIndex(prev => prev + 1);
  };
  const prevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(prev => prev - 1);
  };

  // Flag submission
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!selectedModule) return;
    const clean = flagInput.trim();
    if (clean === selectedModule.challenge.flag || clean === selectedModule.challenge.targetKey) {
      setChallengeStatus('success');
      setCompletedChallenges(prev => ({
        ...prev,
        [selectedModule.id]: true
      }));
    } else {
      setChallengeStatus('error');
      setTimeout(() => setChallengeStatus(null), 2500);
    }
  };

  // Stats calculation
  const totalModules = SOC_MODULES.length;
  const completedCount = Object.keys(completedChallenges).filter(k => completedChallenges[k]).length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);
  const totalXP = 3500 + completedCount * 150;

  // Filter modules
  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SOC_MODULES.filter(m => {
      let matchesCategory = true;
      if (currentFilter === 'core') matchesCategory = m.category === 'core';
      else if (currentFilter === 'siem') matchesCategory = m.category === 'siem';
      else if (currentFilter === 'ir') matchesCategory = m.category === 'ir';
      else if (currentFilter === 'completed') matchesCategory = !!completedChallenges[m.id];
      else if (currentFilter === 'active') matchesCategory = !completedChallenges[m.id] && m.status === 'active';

      const matchesSearch = !q ||
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [currentFilter, searchQuery, completedChallenges]);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      
      {/* 1. FIXED TOP HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.3)] border-b border-outline-variant/30">
        <div className="h-16 w-full px-margin-lg flex items-center justify-between gap-space-md">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-space-lg">
            <Link to="/soc" className="flex items-center gap-space-sm hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(76,215,246,0.3)]">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm text-on-surface tracking-tight leading-none font-bold">
                  SOC ANALYST COURSE
                </span>
                <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
                  Tier 1 &amp; 2 Analyst
                </span>
              </div>
            </Link>

            <div className="h-6 w-px bg-outline-variant/40 hidden md:block"></div>

            {/* Top Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://www.linkedin.com/in/mohammed-m0shii/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm group"
                title="Open Mohammed Moshii's LinkedIn Profile"
              >
                <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8V10.9M7.86 6.78a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
                </svg>
                <span className="hidden sm:inline font-medium">LinkedIn Profile</span>
                <span className="material-symbols-outlined text-xs text-outline group-hover:text-primary leading-none hidden sm:inline">open_in_new</span>
              </a>

              <a
                href="https://www.youtube.com/@moshii0x00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm group"
                title="Open Mohammed Moshii's YouTube Channel"
              >
                <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="hidden sm:inline font-medium">YouTube Channel</span>
                <span className="material-symbols-outlined text-xs text-outline group-hover:text-primary leading-none hidden sm:inline">open_in_new</span>
              </a>

              <a
                href="https://tryhackme.com/p/Moshii"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm group"
                title="Open Mohammed Moshii's TryHackMe Profile"
              >
                <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="#EA2A42">
                  <path d="M10.705 0C7.54 0 4.902 2.285 4.349 5.291a4.525 4.525 0 0 0-4.107 4.5 4.525 4.525 0 0 0 4.52 4.52h6.761a.625.625 0 1 0 0-1.25H4.761a3.273 3.273 0 0 1-3.27-3.27A3.273 3.273 0 0 1 6.59 7.08a.625.625 0 0 0 .7-1.035 4.488 4.488 0 0 0-1.68-.69 5.223 5.223 0 0 1 5.096-4.104 5.221 5.221 0 0 1 5.174 4.57 4.489 4.489 0 0 0-.488.305.625.625 0 1 0 .731 1.013 3.245 3.245 0 0 1 1.912-.616 3.278 3.278 0 0 1 3.203 2.61.625.625 0 0 0 1.225-.251 4.533 4.533 0 0 0-4.428-3.61 4.54 4.54 0 0 0-.958.105C16.556 2.328 13.9 0 10.705 0zm5.192 10.64a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.054.514c0 .181.018.353.054.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .309-.296c.08-.124.137-.267.173-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.309-.291.917.917 0 0 0-.46-.108zm6.486 0a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.053.514c0 .181.017.353.053.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .31-.296c.078-.124.136-.267.172-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.308-.291.916.916 0 0 0-.461-.108zm-8.537.068l-.84.618.313.43.476-.368v1.877h.603v-2.557zm6.486 0l-.841.618.314.43.477-.368v1.877h.603v-2.557zm-4.435.445c.08 0 .143.028.193.084.05.057.087.127.114.21.026.083.044.173.054.269a2.541 2.541 0 0 1 0 .533c-.01.097-.028.187-.054.27a.584.584 0 0 1-.114.21.243.243 0 0 1-.193.085.248.248 0 0 1-.195-.086.584.584 0 0 1-.118-.209 1.245 1.245 0 0 1-.056-.27 2.645 2.645 0 0 1 0-.533c.01-.096.029-.186.056-.27a.583.583 0 0 1 .118-.209.25.25 0 0 1 .195-.084zm6.486 0c.08 0 .144.028.193.084.05.057.087.127.114.21.027.083.044.173.054.269a2.541 2.541 0 0 1 0 .533c-.01.097-.027.187-.054.27a.584.584 0 0 1-.114.21.243.243 0 0 1-.193.085.249.249 0 0 1-.195-.086.581.581 0 0 1-.117-.209 1.245 1.245 0 0 1-.056-.27 2.642 2.642 0 0 1 0-.533c.01-.096.028-.186.056-.27a.58 58 0 0 1 .117-.209.25.25 0 0 1 .195-.084zm-2.191 3.51a.93.93 0 0 0-.463.109.908.908 0 0 0-.312.291c-.08.122-.139.263-.175.426a2.383 2.383 0 0 0-.054.514c0 .18.018.353.054.516.036.164.094.308.175.432a.91.91 0 0 0 .312.296.92.92 0 0 0 .463.11c.18 0 .333-.037.46-.11a.892.892 0 0 0 .308-.296 1.32 1.32 0 0 0 .174-.432c.036-.163.054-.335.054-.516 0-.18-.018-.352-.054-.514a1.274 1.274 0 0 0-.174-.426.89.89 0 0 0-.309-.291.918.918 0 0 0-.46-.108zm-6.402.07l-.841.617.314.43.476-.369v1.878h.604v-2.557zm2.125 0l-.841.617.314.43.477-.369v1.878h.603v-2.557zm2.116 0l-.84.617.313.43.477-.369v1.878h.603v-2.557zm2.16.443c.08 0 .144.028.194.085a.605.605 0 0 1 .114.21c.026.083.044.172.053.269a2.639 2.639 0 0 1 0 .532 1.28 1.28 0 0 1-.053.27.585.585 0 0 1-.114.21.244.244 0 0 1-.193.085.25.25 0 0 1-.196-.085.589.589 0 0 1-.117-.21 1.245 1.245 0 0 1-.056-.27 2.597 2.597 0 0 1 0-.532c.01-.097.028-.186.056-.27a.589.589 0 0 1 .117-.209.249.249 0 0 1 .196-.085zm-6.729 3.073a.676.676 0 0 0-.335.078.661.661 0 0 0-.227.211.91.91 0 0 0-.127.31c-.027.118-.04.242-.04.373s.013.256.04.375a.93.93 0 0 0 .127.313.65.65 0 0 0 .227.215c.092.053.204.08.335.08a.655.655 0 0 0 .334-.08.65.65 0 0 0 .225-.215c.057-.09.1-.194.125-.313a1.75 1.75 0 0 0 .04-.375c0-.13-.014-.255-.04-.373a.931.931 0 0 0-.125-.31.658.658 0 0 0-.225-.21.667.667 0 0 0-.334-.08zm3.086 0a.675.675 0 0 0-.336.078.661.661 0 0 0-.226.211.907.907 0 0 0-.127.31 1.69 1.69 0 0 0-.04.373c0 .131.013.256.04.375a.928.928 0 0 0 .127.313c.058.09.134.162.226.215.093.053.205.08.336.08a.655.655 0 0 0 .334-.08.65.65 0 0 0 .224-.215c.058-.09.1-.194.126-.313a1.752 1.752 0 0 0 0-.748.94.94 0 0 0-.126-.31.657.657 0 0 0-.224-.21.667.667 0 0 0-.334-.08zm5.108 0a.675.675 0 0 0-.336.078.661.661 0 0 0-.226.211.91.91 0 0 0-.127.31c-.027.118-.04.242-.04.373s.013.256.04.375a.931.931 0 0 0 .127.313c.058.09.134.162.226.215.093.053.205.08.336.08.13 0 .243-.027.334-.08a.65.65 0 0 0 .224-.215c.058-.09.1-.194.126-.313a1.75 1.75 0 0 0 .04-.375c0-.13-.014-.255-.04-.373a.943.943 0 0 0-.126-.31.657.657 0 0 0-.224-.21.668.668 0 0 0-.334-.08zm-6.658.05l-.61.448.227.311.346-.266v1.362h.438v-1.856zm3.068 0l-.61.448.227.311.346-.266v1.362h.438v-1.856zm5.108 0l-.611.448.228.311.346-.266v1.362h.438v-1.856zm-9.712.322c.058 0 .105.02.14.062a.421.421 0 0 1 .083.151.96.96 0 0 1 .04.196 1.932 1.932 0 0 1 0 .386.954.954 0 0 1-.04.197.421.421 0 0 1-.083.152.176.176 0 0 1-.14.061.18.18 0 0 1-.141-.06.427.427 0 0 1-.085-.153.887.887 0 0 1-.041-.197 1.96 1.96 0 0 1 0-.386.893.893 0 0 1 .04-.196.42.42 0 0 1 .086-.151.181.181 0 0 1 .141-.062zm3.086 0c.058 0 .104.02.14.062a.421.421 0 0 1 .082.151.94.94 0 0 1 .04.196 1.906 1.906 0 0 1 0 .386.93.93 0 0 1-.04.197.421.421 0 0 1-.082.152.176.176 0 0 1-.14.061.18.18 0 0 1-.141-.06.42.42 0 0 1-.086-.153.846.846 0 0 1-.04-.197 1.965 1.965 0 0 1-.011-.195c0-.057.004-.121.01-.191a.849.849 0 0 1 .041-.196.42.42 0 0 1 .086-.151.182.182 0 0 1 .141-.062zm5.108 0c.058 0 .104.02.14.062a.421.421 0 0 1 .082.151.92.92 0 0 1 .04.196 1.963 1.963 0 0 1 0 .386.943.943 0 0 1-.04.197.421.421 0 0 1-.082.152.177.177 0 0 1-.14.061.18.18 0 0 1-.142-.06.437.437 0 0 1-.085-.153.95.95 0 0 1-.04-.197 1.965 1.965 0 0 1-.011-.195c0-.057.004-.121.01-.191a.959.959 0 0 1 .04-.196.47.47 0 0 1 .086-.151.181.181 0 0 1 .142-.062zm-1.684 1.814a.675.675 0 0 0-.336.079.66.66 0 0 0-.227.21.91.91 0 0 0-.127.31 1.731 1.731 0 0 0 0 .748.939.939 0 0 0 .127.314c.059.09.134.162.227.215.093.053.205.08.336.08a.66.66 0 0 0 .334-.08.648.648 0 0 0 .224-.215c.058-.09.1-.195.126-.314a1.737 1.737 0 0 0-.001-.747.928.928 0 0 0-.125-.31.65.65 0 0 0-.224-.211.668.668 0 0 0-.334-.079zm3.063 0a.676.676 0 0 0-.336.079.664.664 0 0 0-.227.21.906.906 0 0 0-.127.31 1.74 1.74 0 0 0 0 .748.936.936 0 0 0 .127.314.66.66 0 0 0 .227.215c.092.053.204.08.336.08a.654.654 0 0 0 .334-.08.648.648 0 0 0 .223-.215c.058-.09.1-.195.126-.314a1.74 1.74 0 0 0 0-.747.928.928 0 0 0-.126-.31.65.65 0 0 0-.223-.211.666.666 0 0 0-.334-.079zm-1.545.05l-.611.448.228.312.346-.267v1.363h.438v-1.856zm-1.518.323c.057 0 .104.02.14.061a.42.42 0 0 1 .082.152.91.91 0 0 1 .04.195 1.966 1.966 0 0 1 0 .387.951.951 0 0 1-.04.197.421.421 0 0 1-.082.152.177.177 0 0 1-.14.06.18.18 0 0 1-.142-.06.428.428 0 0 1-.085-.152.914.914 0 0 1-.04-.197 1.96 1.96 0 0 1-.011-.195c0-.058.003-.122.01-.192a.923.923 0 0 1 .041-.195c.02-.06.048-.11.085-.152a.181.181 0 0 1 .142-.061zm3.063 0c.057 0 .104.02.14.061a.42.42 0 0 1 .082.152.94.94 0 0 1 .04.195 1.91 1.91 0 0 1 0 .387.93.93 0 0 1-.04.197.422.422 0 0 1-.083.152.175.175 0 0 1-.14.06.18.18 0 0 1-.141-.06.423.423 0 0 1-.085-.152.907.907 0 0 1-.04-.197 1.95 1.95 0 0 1 0-.387.915.915 0 0 1 .04-.195c.02-.06.048-.11.085-.152a.182.182 0 0 1 .142-.061zm-9.713.185a.465.465 0 0 0-.232.055.456.456 0 0 0-.157.146.627.627 0 0 0-.089.215 1.168 1.168 0 0 0-.027.259c0 .09.009.177.027.26a.648.648 0 0 0 .089.216c.04.063.093.112.157.149a.459.459 0 0 0 .232.056c.09 0 .168-.02.231-.056a.45.45 0 0 0 .156-.149.67.67 0 0 0 .087-.217 1.218 1.218 0 0 0 0-.518.647.647 0 0 0-.087-.215.448.448 0 0 0-.156-.146.458.458 0 0 0-.23-.055zm1.052.035l-.423.31.158.217.24-.185v.944h.303v-1.286zm-1.052.224c.04 0 .073.014.097.042a.284.284 0 0 1 .057.105.69.69 0 0 1 .028.136c.004.049.007.092.007.133 0 .04-.003.086-.007.135a.684.684 0 0 1-.028.136.285.285 0 0 1-.057.105.123.123 0 0 1-.097.043.125.125 0 0 1-.098-.043.298.298 0 0 1-.059-.105.612.612 0 0 1-.028-.136 1.39 1.39 0 0 1 0-.268.62.62 0 0 1 .028-.136.297.297 0 0 1 .06-.105.125.125 0 0 1 .097-.042zm3.775 1.394a.463.463 0 0 0-.232.054.452.452 0 0 0-.157.146.621.621 0 0 0-.088.214 1.19 1.19 0 0 0 0 .519.641.641 0 0 0 .088.217.46.46 0 0 0 .157.15.458.458 0 0 0 .232.054.454.454 0 0 0 .232-.055.45.45 0 0 0 .155-.149.664.664 0 0 0 .087-.217 1.189 1.189 0 0 0 0-.519.642.642 0 0 0-.087-.214.446.446 0 0 0-.155-.146.459.459 0 0 0-.232-.054zm1.052.034l-.423.31.158.216.24-.185v.945h.303V22.68zm-1.052.223c.04 0 .073.014.098.043a.3.3 0 0 1 .057.105.643.643 0 0 1 .027.135 1.31 1.31 0 0 1 0 .268.654.654 0 0 1-.027.137.307.307 0 0 1-.057.105.124.124 0 0 1-.098.042.125.125 0 0 1-.098-.042.293.293 0 0 1-.059-.105.618.618 0 0 1-.028-.137 1.364 1.364 0 0 1 0-.268.612.612 0 0 1 .028-.135.287.287 0 0 1 .06-.105.123.123 0 0 1 .097-.043z"/>
                </svg>
                <span className="hidden sm:inline font-medium">TryHackMe Account</span>
                <span className="material-symbols-outlined text-xs text-outline group-hover:text-primary leading-none hidden sm:inline">open_in_new</span>
              </a>

              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors font-body-sm text-body-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">home</span>
                <span className="hidden md:inline">Portfolio Home</span>
              </Link>
            </nav>
          </div>

          {/* Right Profile */}
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold font-code-sm text-code-sm">
              MM
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
                Mohammed Moshii
              </span>
              <span className="font-label-sm text-label-sm text-primary leading-tight">
                CyberSecurity Instructor
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FIXED LEFT SIDEBAR */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col justify-between p-space-md border-r border-outline-variant/30">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between px-space-sm pt-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Training Tracks
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-code-sm text-code-sm border border-primary/20">
              SOC OPS
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveSidebarTrack('console'); setSelectedModule(SOC_MODULES[3]); setActiveTab('lab'); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'console'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">terminal</span>
              <span>Analyst Console</span>
            </button>

            <button
              onClick={() => { setActiveSidebarTrack('modules'); setSelectedModule(null); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'modules' && !selectedModule
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <span>Modules &amp; Curriculum</span>
            </button>

            <button
              onClick={() => { setActiveSidebarTrack('range'); setSelectedModule(SOC_MODULES[1]); setActiveTab('lab'); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'range'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">radar</span>
              <span>Cyber Range Labs</span>
            </button>

            <button
              onClick={() => { setActiveSidebarTrack('siem'); setSelectedModule(SOC_MODULES[3]); setActiveTab('lab'); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'siem'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">data_object</span>
              <span>SIEM Telemetry</span>
            </button>

            <button
              onClick={() => { setActiveSidebarTrack('mitre'); setSelectedModule(SOC_MODULES[4]); setActiveTab('theory'); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'mitre'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
              <span>MITRE Navigator</span>
            </button>

            <button
              onClick={() => { setActiveSidebarTrack('drills'); setSelectedModule(SOC_MODULES[6]); setActiveTab('lab'); }}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'drills'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">crisis_alert</span>
              <span>Incident Drills</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Progress Widget */}
        <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Tier 2 Progress
            </span>
            <span className="font-code-sm text-code-sm text-secondary font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
            <span>{completedCount} / {totalModules} Modules</span>
            <span className="text-primary font-semibold">
              {progressPercent >= 75 ? 'Exam Ready' : 'In Training'}
            </span>
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE CANVAS */}
      <div className="pl-64">
        <main className="relative pt-16 w-full min-h-screen bg-surface">
          <div className="flex flex-col w-full">
            <div className="w-full px-space-md lg:px-margin-lg py-space-lg flex flex-col gap-space-xl">
              
              {/* HERO / COURSE MASTER OVERVIEW BANNER - 1:1 MATCH TO NEW DESIGN */}
              <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#0c162d] via-[#091124] to-[#060b17] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl border border-outline-variant/30">
                {/* Ambient Cyber Glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col justify-between">
                  {/* Left: Identifier, Title, Description, and Badges */}
                  <div className="flex flex-col gap-4 max-w-3xl">
                    {/* Shield Icon + Title */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high/60 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(76,215,246,0.3)] shrink-0 border border-primary/40 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          shield
                        </span>
                      </div>
                      <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider text-white uppercase font-sans">
                        SOC ANALYST COURSE
                      </h1>
                    </div>

                    {/* Description */}
                    <p className="font-body-md text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                      Comprehensive practitioner curriculum spanning telemetry ingest, packet forensics, SIEM detection engineering, and full-spectrum Incident response.
                    </p>

                    {/* 4 Feature Badges exactly as in image */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 font-code-sm text-code-sm">
                      <span className="flex items-center gap-2 text-white font-medium">
                        <span className="material-symbols-outlined text-primary text-base">view_carousel</span>
                        <span>8 Modules</span>
                      </span>

                      <span className="flex items-center gap-2 text-slate-300 font-medium">
                        <span className="material-symbols-outlined text-outline text-base">slideshow</span>
                        <span>Interactive Slides</span>
                      </span>

                      <span className="flex items-center gap-2 text-slate-300 font-medium">
                        <span className="material-symbols-outlined text-secondary text-base">terminal</span>
                        <span>Live Fire Cyber Labs</span>
                      </span>

                      <span className="flex items-center gap-2 text-slate-300 font-medium">
                        <span className="material-symbols-outlined text-tertiary text-base">military_tech</span>
                        <span>Capstone Drills</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Golden Cursive Signature "moshii" */}
                  <div className="sm:absolute bottom-6 right-8 lg:bottom-8 lg:right-12 mt-8 sm:mt-0 flex items-end justify-end select-none pointer-events-none">
                    <span
                      className="text-4xl sm:text-5xl lg:text-6xl text-[#ffdf7e] tracking-wide"
                      style={{
                        fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                        textShadow: "0 0 15px rgba(255, 223, 126, 0.75), 0 0 35px rgba(255, 190, 50, 0.45)",
                        transform: "rotate(-3deg)",
                        display: "inline-block",
                      }}
                    >
                      moshii
                    </span>
                  </div>
                </div>
              </div>

              {/* Mastery Progress Bar & Telemetry Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                <div className="lg:col-span-5 p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between gap-space-sm border border-outline-variant/30 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Mastery Pipeline
                    </span>
                    <span className="font-code-md text-code-md text-primary font-bold">
                      {progressPercent}% Completed
                    </span>
                  </div>

                  <div className="relative w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary via-primary to-primary-container rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                    <span>{completedCount} of 8 Modules Mastered</span>
                    <span className="text-secondary font-semibold">
                      {8 - completedCount} Remaining
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const nextMod = SOC_MODULES.find(m => !completedChallenges[m.id]) || SOC_MODULES[3];
                      setSelectedModule(nextMod);
                      setActiveTab('lab');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-body-sm transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Resume Active Lab</span>
                  </button>
                </div>

                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                  <div className="flex flex-col justify-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-primary mb-1">
                      <span className="material-symbols-outlined text-lg">timer</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">Range Time</span>
                    </div>
                    <span className="font-code-md text-code-md font-bold text-on-surface">64.5 hrs</span>
                  </div>

                  <div className="flex flex-col justify-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-secondary mb-1">
                      <span className="material-symbols-outlined text-lg">fact_check</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">Labs Done</span>
                    </div>
                    <span className="font-code-md text-code-md font-bold text-on-surface">{completedCount * 4 + 6} / 36</span>
                  </div>

                  <div className="flex flex-col justify-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-tertiary mb-1">
                      <span className="material-symbols-outlined text-lg">target</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">IoC Accuracy</span>
                    </div>
                    <span className="font-code-md text-code-md font-bold text-on-surface">94.2%</span>
                  </div>

                  <div className="flex flex-col justify-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-secondary mb-1">
                      <span className="material-symbols-outlined text-lg">local_fire_department</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">Defense Streak</span>
                    </div>
                    <span className="font-code-md text-code-md font-bold text-on-surface">14 Days</span>
                  </div>
                </div>
              </div>

              {/* TELEMETRY RANGE BAR / VIRTUAL GATEWAY */}
              <div className="w-full p-space-md rounded-xl bg-surface-container flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-space-md w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                    <span className="font-title-sm text-title-sm text-on-surface">Cyber Range Lab Gateway</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface-variant font-code-sm text-code-sm border border-outline-variant/20">
                    <span className="text-secondary font-semibold">ONLINE</span>
                    <span>•</span>
                    <span>us-east-zone-4 (24ms)</span>
                    <span>•</span>
                    <span className="text-primary font-mono">10.240.12.8/24</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto justify-end">
                  <button
                    onClick={() => { setSelectedModule(SOC_MODULES[0]); setActiveTab('lab'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-code-sm transition-colors border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-primary text-base">terminal</span>
                    <span>Web Terminal</span>
                  </button>
                  <button
                    onClick={() => { setSelectedModule(SOC_MODULES[1]); setActiveTab('lab'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-code-sm transition-colors border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-secondary text-base">network_check</span>
                    <span>Wireshark Hub</span>
                  </button>
                  <button
                    onClick={() => { setSelectedModule(SOC_MODULES[3]); setActiveTab('lab'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-primary font-code-sm text-code-sm transition-colors border border-primary/30"
                  >
                    <span className="material-symbols-outlined text-base">database</span>
                    <span>Splunk Instance [Active]</span>
                  </button>
                </div>
              </div>

              {/* FILTER PILLS, SEARCH & VIEW CONTROLS */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
                <div className="flex flex-wrap items-center gap-2" id="filter-container">
                  {[
                    { key: 'all', label: 'All 8 Modules' },
                    { key: 'core', label: 'Core Fundamentals' },
                    { key: 'siem', label: 'SIEM & Telemetry' },
                    { key: 'ir', label: 'Incident Response' },
                    { key: 'completed', label: `Completed (${completedCount})` },
                    { key: 'active', label: 'In Progress (1)' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setCurrentFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition-colors ${
                        currentFilter === tab.key
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-space-sm w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg pointer-events-none">
                      filter_list
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search modules, MITRE..."
                      className="w-full pl-9 pr-3 py-1.5 bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                    />
                  </div>

                  <div className="flex items-center p-1 rounded-lg bg-surface-container-low border border-outline-variant/30">
                    <button
                      onClick={() => setViewLayout('grid')}
                      aria-label="Grid View"
                      className={`p-1.5 rounded transition-colors ${viewLayout === 'grid' ? 'bg-surface-container-highest text-primary' : 'text-outline hover:text-on-surface'}`}
                    >
                      <span className="material-symbols-outlined text-lg leading-none">grid_view</span>
                    </button>
                    <button
                      onClick={() => setViewLayout('syllabus')}
                      aria-label="Detailed View"
                      className={`p-1.5 rounded transition-colors ${viewLayout === 'syllabus' ? 'bg-surface-container-highest text-primary' : 'text-outline hover:text-on-surface'}`}
                    >
                      <span className="material-symbols-outlined text-lg leading-none">view_list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 8 MAIN COURSE MODULES CARDS GRID */}
              <div
                className={`grid gap-space-md ${
                  viewLayout === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {filteredModules.map((m) => {
                  const isCompleted = !!completedChallenges[m.id];
                  const isActive = !isCompleted && m.status === 'active';
                  const isCapstone = m.moduleNumber === '08';
                  const isLocked = !isCompleted && !isActive;

                  // Top indicator color
                  let stripClass = 'bg-outline-variant/30';
                  if (isCompleted) stripClass = 'bg-secondary';
                  else if (isActive) stripClass = 'bg-primary animate-pulse';
                  else if (isCapstone) stripClass = 'bg-tertiary';

                  return (
                    <div
                      key={m.id}
                      className={`group flex flex-col justify-between rounded-xl p-space-md transition-all duration-200 shadow-md relative overflow-hidden border border-outline-variant/30 ${
                        isActive
                          ? 'bg-surface-container shadow-primary/10 border-primary/40'
                          : isCompleted
                          ? 'bg-surface-container-low hover:bg-surface-container'
                          : 'bg-surface-container-low/70 hover:bg-surface-container-low'
                      }`}
                    >
                      {/* Top Status Indicator Strip */}
                      <div className={`absolute top-0 left-0 right-0 ${isActive || isCapstone ? 'h-1.5' : 'h-1'} ${stripClass}`}></div>

                      <div className="flex flex-col gap-space-sm">
                        {/* Header line */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-code-sm text-code-sm font-bold tracking-wider ${isActive ? 'text-primary' : isCapstone ? 'text-tertiary' : 'text-outline'}`}>
                              MODULE {m.moduleNumber}
                            </span>
                            {isActive && <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>}
                          </div>

                          {/* Status Pill */}
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Mastered (100%)
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-xs">pending</span>
                              In Progress (60%)
                            </span>
                          ) : isCapstone ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-bold">
                              <span className="material-symbols-outlined text-xs">military_tech</span>
                              Capstone Exam
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm">
                              <span className="material-symbols-outlined text-xs">lock</span>
                              Locked
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => setSelectedModule(m)}
                          className={`font-title-sm text-title-sm leading-snug cursor-pointer transition-colors ${
                            isActive ? 'text-primary font-bold' : 'text-on-surface group-hover:text-primary'
                          }`}
                        >
                          {m.title}
                        </h3>

                        {/* Summary */}
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {m.summary}
                        </p>

                        {/* Active Drill Callout for Module 04 */}
                        {isActive && (
                          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col gap-1 border border-primary/20">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-1 font-semibold">
                              <span className="material-symbols-outlined text-xs">flag</span> Next Active Drill
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                              Lab 4.2: Hunting APT29 C2 in Splunk
                            </span>
                          </div>
                        )}

                        {/* Progress bar for active */}
                        {isActive && (
                          <div className="flex flex-col gap-1.5 pt-space-xs text-on-surface-variant font-code-sm text-code-sm">
                            <div className="flex items-center justify-between">
                              <span>Progress: 3 / 6 Labs Completed</span>
                              <span className="text-primary font-bold">18/22 Slides</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        )}

                        {/* Specs info */}
                        {!isActive && (
                          <div className="flex flex-col gap-1.5 pt-space-xs text-on-surface-variant font-code-sm text-code-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-outline">slideshow</span>
                              <span>{m.slideCount} Comprehensive Slides</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-secondary' : isCapstone ? 'text-tertiary' : 'text-outline'}`}>
                              <span className="material-symbols-outlined text-sm">
                                {isCompleted ? 'science' : isCapstone ? 'flag_circle' : 'science'}
                              </span>
                              <span>{m.labCount}</span>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-space-xs">
                          {m.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                                isActive
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : isCapstone
                                  ? 'bg-surface-container text-tertiary'
                                  : 'bg-surface-container-highest text-on-surface-variant'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="pt-space-md flex items-center gap-space-xs">
                        {isCompleted ? (
                          <div className="w-full flex items-center justify-between gap-space-xs">
                            <button
                              onClick={() => { setSelectedModule(m); setActiveTab('slides'); }}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm text-center transition-colors border border-outline-variant/30"
                            >
                              Review Module
                            </button>
                            <button
                              onClick={() => setShowCertificate(true)}
                              className="p-1.5 rounded-lg bg-surface-container-high hover:bg-secondary/20 text-secondary transition-colors border border-secondary/30"
                              title="View Credential"
                            >
                              <span className="material-symbols-outlined text-lg leading-none">workspace_premium</span>
                            </button>
                          </div>
                        ) : isActive ? (
                          <button
                            onClick={() => { setSelectedModule(m); setActiveTab('lab'); }}
                            className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-sm text-body-md font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          >
                            Continue Module {m.moduleNumber}
                          </button>
                        ) : (
                          <div className="w-full flex flex-col gap-1.5">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">info</span> Requires: Previous Module
                            </span>
                            <button
                              onClick={() => setSelectedModule(m)}
                              className="w-full py-1.5 px-3 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high text-outline hover:text-on-surface font-body-sm text-body-sm text-center transition-colors border border-outline-variant/20"
                            >
                              Explore Syllabus &amp; Lab Preview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SYLLABUS & CERTIFICATION MILESTONE FOOTNOTE */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm border border-outline-variant/30">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
                  <span>
                    Complete all 8 modules to become a qualified <strong>SOC Analyst</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-space-md">
                  <button
                    disabled
                    aria-disabled="true"
                    className="text-outline/40 cursor-not-allowed font-medium flex items-center gap-1 select-none"
                    title="Certificate function is currently disabled"
                  >
                    <span>View / Claim Certificate</span>
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* 4. INTERACTIVE MODULE WORKSPACE MODAL / DRAWER */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center items-center p-3 md:p-6"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container rounded-xl border border-outline-variant/40 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Top Header */}
              <div className="px-space-md py-space-sm bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-sm text-code-sm font-bold border border-primary/20">
                    MODULE {selectedModule.moduleNumber}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface truncate">
                    {selectedModule.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-2xl leading-none">close</span>
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="px-space-md py-2 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'slides', label: '1. Presentation Slides', icon: 'slideshow', badge: `${selectedModule.slides?.length || 0} Slides` },
                  { id: 'theory', label: '2. Theory & Cheat Sheets', icon: 'menu_book' },
                  { id: 'lab', label: '3. Hands-On Lab', icon: 'terminal', badge: 'Interactive' },
                  { id: 'challenge', label: '4. CTF Challenge', icon: 'flag', badge: completedChallenges[selectedModule.id] ? 'Solved' : '+150 XP' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body-sm text-body-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-xs px-1.5 py-0.2 rounded font-code-sm ${activeTab === tab.id ? 'bg-on-primary text-primary font-bold' : 'bg-surface-container-high text-outline'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-space-md lg:p-space-lg overflow-y-auto flex-1">
                
                {/* TAB 1: PRESENTATION SLIDES */}
                {activeTab === 'slides' && selectedModule.slides && (
                  <div className="flex flex-col justify-between min-h-[460px]">
                    <div>
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
                        <span className="font-code-sm text-code-sm text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          SLIDE {currentSlideIndex + 1} OF {selectedModule.slides.length}
                        </span>
                        <div className="flex gap-1.5">
                          {selectedModule.slides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlideIndex(idx)}
                              className={`h-2 rounded-full transition-all ${idx === currentSlideIndex ? 'w-6 bg-primary' : 'w-2 bg-outline-variant/40'}`}
                            ></button>
                          ))}
                        </div>
                      </div>

                      <h3 className="font-headline-md text-headline-md text-primary mb-1">
                        {selectedModule.slides[currentSlideIndex]?.title}
                      </h3>
                      <h4 className="font-title-sm text-title-sm text-on-surface-variant mb-4 font-normal">
                        {selectedModule.slides[currentSlideIndex]?.subtitle}
                      </h4>

                      <div className="flex flex-col gap-3 mb-6">
                        {selectedModule.slides[currentSlideIndex]?.bullets?.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2.5">
                            <span className="text-secondary text-base leading-snug">▸</span>
                            <p className="font-body-md text-body-md text-on-surface leading-relaxed m-0">
                              {b}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Visual Diagram Box */}
                      {selectedModule.slides[currentSlideIndex]?.diagram && (
                        <pre className="p-4 rounded-lg bg-surface-container-lowest text-primary font-code-sm text-code-sm border border-outline-variant/30 overflow-x-auto whitespace-pre mb-4">
                          {selectedModule.slides[currentSlideIndex].diagram.trim()}
                        </pre>
                      )}

                      {/* Key Takeaway */}
                      {selectedModule.slides[currentSlideIndex]?.takeaway && (
                        <div className="p-3 rounded bg-secondary/10 border-l-4 border-secondary text-on-surface font-body-sm text-body-sm">
                          <strong className="text-secondary">KEY TAKEAWAY: </strong>
                          {selectedModule.slides[currentSlideIndex].takeaway}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-6">
                      <button
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                        Previous
                      </button>
                      <span className="font-code-sm text-code-sm text-outline">
                        Slide {currentSlideIndex + 1} / {selectedModule.slides.length}
                      </span>
                      <button
                        onClick={nextSlide}
                        disabled={currentSlideIndex === selectedModule.slides.length - 1}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                      >
                        Next
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: THEORY & CHEAT SHEETS */}
                {activeTab === 'theory' && selectedModule.theory && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">menu_book</span>
                        In-Depth Technical Guide &amp; Cheat Sheet
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        {selectedModule.theory.overview}
                      </p>
                    </div>

                    {selectedModule.theory.sections?.map((sec, sIdx) => (
                      <div key={sIdx} className="flex flex-col gap-3">
                        <h4 className="font-title-sm text-title-sm text-secondary border-b border-outline-variant/20 pb-1">
                          {sec.heading}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                          {sec.content}
                        </p>

                        {/* Steps */}
                        {sec.steps && (
                          <div className="flex flex-col gap-2">
                            {sec.steps.map((st, stIdx) => (
                              <div key={stIdx} className="p-2.5 rounded bg-surface-container-lowest border-l-2 border-primary text-on-surface font-body-sm text-body-sm">
                                {st}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Table */}
                        {sec.table && (
                          <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
                            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                              <thead>
                                <tr className="bg-surface-container-lowest text-primary border-b border-outline-variant/30">
                                  {sec.table.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2.5 font-semibold font-code-sm">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sec.table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50">
                                    {row.map((c, cIdx) => (
                                      <td key={cIdx} className="p-2.5 text-on-surface">{c}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Code Block with Copy */}
                        {sec.codeBlock && (
                          <div className="relative rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-lowest">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-high border-b border-outline-variant/20">
                              <span className="font-code-sm text-code-sm text-primary">COMMAND REFERENCE</span>
                              <button
                                onClick={() => handleCopy(sec.codeBlock, `code-${sIdx}`)}
                                className="text-outline hover:text-on-surface font-code-sm text-code-sm flex items-center gap-1"
                              >
                                {copiedCode === `code-${sIdx}` ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <pre className="p-3 text-on-surface font-code-sm text-code-sm overflow-x-auto m-0">
                              {sec.codeBlock}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: HANDS-ON LAB */}
                {activeTab === 'lab' && selectedModule.lab && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl">terminal</span>
                          {selectedModule.lab.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant pt-1">
                          <strong>MISSION:</strong> {selectedModule.lab.scenario}
                        </p>
                      </div>
                    </div>

                    {/* LAB TYPE 1: ALERT TRIAGE SIM */}
                    {selectedModule.lab.type === 'alert-triage-sim' && (
                      <div className="flex flex-col gap-4">
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          SIEM ALERT QUEUE: Click alert to inspect
                        </span>
                        <div className="grid gap-2">
                          {selectedModule.lab.alerts.map(al => (
                            <div
                              key={al.id}
                              onClick={() => setSelectedAlert(al)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                selectedAlert?.id === al.id
                                  ? 'bg-primary/10 border-primary'
                                  : 'bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded font-code-sm text-code-sm font-bold ${
                                  al.severity === 'CRITICAL' ? 'bg-error-container text-error' : al.severity === 'HIGH' ? 'bg-tertiary-container text-tertiary' : 'bg-secondary/20 text-secondary'
                                }`}>
                                  {al.severity}
                                </span>
                                <span className="font-body-sm text-body-sm font-semibold text-on-surface">{al.rule}</span>
                              </div>
                              <span className="font-code-sm text-code-sm text-outline">{al.host}</span>
                            </div>
                          ))}
                        </div>

                        {selectedAlert && (
                          <div className="p-4 rounded-lg bg-surface-container-lowest border border-primary/40 flex flex-col gap-2">
                            <span className="font-title-sm text-title-sm text-primary font-semibold">Incident Details: {selectedAlert.id}</span>
                            <p className="font-code-sm text-code-sm text-on-surface-variant break-all m-0">
                              {selectedAlert.details}
                            </p>
                            <button
                              onClick={() => {
                                const b64 = "SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkANQAuADIAMAAxAC4AMQAwAC4AMQA0ADoAOAAwADgAMAAvAG0AYQB0AHIAaQB4AC4AcABzADEAIgApAA==";
                                const binary = atob(b64);
                                let res = '';
                                for (let i = 0; i < binary.length; i += 2) res += binary[i];
                                setB64Decoded(res);
                              }}
                              className="mt-2 w-fit px-3 py-1.5 rounded bg-primary text-on-primary font-code-sm text-code-sm font-semibold"
                            >
                              Auto-Decode Base64 UTF-16LE Payload
                            </button>
                            {b64Decoded && (
                              <pre className="p-2.5 rounded bg-surface-container-high text-secondary font-code-sm text-code-sm m-0">
                                {b64Decoded}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* LAB TYPE 2: NETWORK PACKET SIM */}
                    {selectedModule.lab.type === 'network-packet-sim' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-outline">FILTER:</span>
                          {['ALL', 'DNS', 'ARP'].map(flt => (
                            <button
                              key={flt}
                              onClick={() => setPacketFilter(flt)}
                              className={`px-2.5 py-1 rounded font-code-sm text-code-sm ${packetFilter === flt ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-lowest text-outline'}`}
                            >
                              {flt}
                            </button>
                          ))}
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
                          <table className="w-full text-left font-code-sm text-code-sm border-collapse bg-surface-container-lowest">
                            <thead>
                              <tr className="bg-surface-container-high text-primary border-b border-outline-variant/30">
                                <th className="p-2">No.</th>
                                <th className="p-2">Time</th>
                                <th className="p-2">Source</th>
                                <th className="p-2">Destination</th>
                                <th className="p-2">Protocol</th>
                                <th className="p-2">Info</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedModule.lab.packets
                                .filter(p => packetFilter === 'ALL' || p.proto === packetFilter)
                                .map(p => (
                                  <tr key={p.no} className="border-b border-outline-variant/10 text-on-surface">
                                    <td className="p-2">{p.no}</td>
                                    <td className="p-2">{p.time}</td>
                                    <td className="p-2">{p.src}</td>
                                    <td className="p-2">{p.dst}</td>
                                    <td className="p-2 font-bold text-secondary">{p.proto}</td>
                                    <td className="p-2 font-mono break-all">{p.info}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* LAB TYPE 3: SYSMON EVENT SIM */}
                    {selectedModule.lab.type === 'sysmon-event-sim' && (
                      <div className="flex flex-col gap-3">
                        {selectedModule.lab.events.map((ev, i) => (
                          <div key={i} className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm">
                            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20 mb-2">
                              <span className="text-secondary font-bold">EVENT ID {ev.eventId} ({ev.task})</span>
                              <span className="text-outline">{ev.time}</span>
                            </div>
                            <p className="text-on-surface m-0 whitespace-pre-wrap break-all">{ev.data}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAB TYPE 4: SPLUNK QUERY SIM */}
                    {selectedModule.lab.type === 'splunk-query-sim' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={splunkQuery}
                            onChange={(e) => setSplunkQuery(e.target.value)}
                            className="flex-1 px-3 py-2 rounded bg-surface-container-lowest border border-primary text-on-surface font-code-sm text-code-sm focus:outline-none"
                          />
                          <button
                            onClick={() => setSplunkResults(selectedModule.lab.dataset)}
                            className="px-4 py-2 rounded bg-primary text-on-primary font-code-sm text-code-sm font-semibold"
                          >
                            Run SPL
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
                          <table className="w-full text-left font-code-sm text-code-sm border-collapse">
                            <thead>
                              <tr className="bg-surface-container-high text-primary border-b border-outline-variant/30">
                                <th className="p-2">_time</th>
                                <th className="p-2">EventCode</th>
                                <th className="p-2">User</th>
                                <th className="p-2">Src_IP</th>
                                <th className="p-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedModule.lab.dataset.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-outline-variant/10 text-on-surface">
                                  <td className="p-2">{row._time}</td>
                                  <td className="p-2 font-bold">{row.eventCode}</td>
                                  <td className="p-2 font-semibold text-primary">{row.user}</td>
                                  <td className="p-2">{row.src_ip}</td>
                                  <td className={`p-2 font-bold ${row.action.includes('Success') ? 'text-secondary' : 'text-outline'}`}>{row.action}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* LAB TYPE 5: YARA VALIDATOR */}
                    {selectedModule.lab.type === 'yara-validator-sim' && (
                      <div className="flex flex-col gap-2">
                        <span className="font-label-sm text-label-sm text-outline">EXTRACTED MEMORY STRINGS:</span>
                        <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-on-surface flex flex-col gap-1">
                          {selectedModule.lab.memoryDumpStrings.map((s, idx) => (
                            <div key={idx} className="flex gap-3">
                              <span className="text-outline">[{idx.toString().padStart(2, '0')}]</span>
                              <span className={s.includes('pipe') ? 'text-error font-bold' : ''}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LAB TYPE 6: SANDBOX DETONATION */}
                    {selectedModule.lab.type === 'sandbox-sim' && (
                      <div className="flex flex-col gap-3">
                        <span className="font-label-sm text-label-sm text-outline">VOLATILITY 3 MALFIND OUTPUT:</span>
                        <pre className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-primary overflow-x-auto whitespace-pre m-0">
                          {selectedModule.lab.malfindOutput}
                        </pre>
                      </div>
                    )}

                    {/* LAB TYPE 7: EMAIL HEADERS */}
                    {selectedModule.lab.type === 'email-header-sim' && (
                      <div className="flex flex-col gap-2">
                        <span className="font-label-sm text-label-sm text-outline">RFC 5322 RAW HEADERS:</span>
                        <pre className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-secondary overflow-x-auto whitespace-pre m-0">
                          {selectedModule.lab.rawHeaders}
                        </pre>
                      </div>
                    )}

                    {/* LAB TYPE 8: CLOUD AUDIT SIMULATOR */}
                    {selectedModule.lab.type === 'cloud-sim' && (
                      <div className="flex flex-col gap-2">
                        <span className="font-label-sm text-label-sm text-outline">AWS CLOUDTRAIL JSON SECURITY AUDIT LOG:</span>
                        <pre className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-primary overflow-x-auto whitespace-pre m-0">
                          {selectedModule.lab.cloudTrailEvent}
                        </pre>
                      </div>
                    )}

                    {/* LAB TYPE 8: ACTIVE DIRECTORY CAPSTONE */}
                    {selectedModule.lab.type === 'ad-defense-sim' && (
                      <div className="flex flex-col gap-3">
                        <span className="font-label-sm text-label-sm text-outline">DOMAIN CONTROLLER SECURITY EVENT LOGS:</span>
                        <div className="overflow-x-auto rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
                          <table className="w-full text-left font-code-sm text-code-sm border-collapse">
                            <thead>
                              <tr className="bg-surface-container-high text-tertiary border-b border-outline-variant/30">
                                <th className="p-2">Time</th>
                                <th className="p-2">Event ID</th>
                                <th className="p-2">Account</th>
                                <th className="p-2">Target / Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedModule.lab.logs.map((l, i) => (
                                <tr key={i} className="border-b border-outline-variant/10 text-on-surface">
                                  <td className="p-2">{l.time}</td>
                                  <td className="p-2 font-bold text-tertiary">{l.id}</td>
                                  <td className="p-2 font-bold text-primary">{l.account}</td>
                                  <td className="p-2 font-mono text-outline">{l.note || l.object || l.service}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Lab Instructions Footer */}
                    <div className="p-3 rounded-lg bg-surface-container-high border-l-4 border-primary font-body-sm text-body-sm text-on-surface">
                      <strong className="text-primary">TASK INSTRUCTIONS:</strong>
                      <p className="m-0 whitespace-pre-line pt-1 text-on-surface-variant font-code-sm text-code-sm">
                        {selectedModule.lab.taskInstructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: CTF CHALLENGE */}
                {activeTab === 'challenge' && selectedModule.challenge && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                      <h3 className="font-headline-md text-headline-md text-secondary flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">flag</span>
                        Module CTF Challenge &amp; Flag Submission
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-code-sm text-code-sm font-bold border border-secondary/20">
                        REWARD: +{selectedModule.challenge.points} XP
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-surface-container-lowest border-l-4 border-secondary flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        OBJECTIVE / QUESTION:
                      </span>
                      <p className="font-title-sm text-title-sm text-on-surface font-semibold m-0 leading-relaxed">
                        {selectedModule.challenge.question}
                      </p>
                    </div>

                    {/* Challenge Status banner */}
                    {challengeStatus === 'success' && (
                      <div className="p-4 rounded-lg bg-secondary/15 border border-secondary text-secondary flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                        <div>
                          <strong className="font-title-sm text-title-sm">FLAG VERIFIED! CHALLENGE SOLVED! (+{selectedModule.challenge.points} XP)</strong>
                          <p className="m-0 font-body-sm text-body-sm">Your defense telemetry analysis is correct. Progress has been saved.</p>
                        </div>
                      </div>
                    )}

                    {challengeStatus === 'error' && (
                      <div className="p-3 rounded-lg bg-error-container/20 border border-error text-error flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">error</span>
                        <span className="font-body-sm text-body-sm font-semibold">INCORRECT FLAG OR TARGET KEY. Review the lab findings and try again!</span>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleFlagSubmit} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        disabled={completedChallenges[selectedModule.id]}
                        placeholder="Enter flag format: flag{...} or target keyword"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-code-md text-code-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={completedChallenges[selectedModule.id]}
                        className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-title-sm text-body-md font-bold transition-all disabled:opacity-50 shadow-sm"
                      >
                        {completedChallenges[selectedModule.id] ? 'Challenge Solved' : 'Submit Flag'}
                      </button>
                    </form>

                    {/* Hint */}
                    <div className="border-t border-outline-variant/20 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-primary hover:underline font-code-sm text-code-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">help</span>
                        {showHint ? 'Hide Hint' : 'Need a Hint?'}
                      </button>
                      {showHint && (
                        <div className="mt-2 p-3 rounded bg-primary/10 border border-primary/30 text-on-surface font-body-sm text-body-sm">
                          💡 <strong>HINT:</strong> {selectedModule.challenge.hint}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CERTIFICATE OF COMPLETION MODAL */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex justify-center items-center p-4"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container rounded-2xl border-2 border-primary/60 p-6 md:p-10 max-w-2xl w-full text-center relative shadow-[0_0_50px_rgba(76,215,246,0.25)]"
            >
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </div>

              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                MOSHII CYBERSOC ACADEMY
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1 mb-2">
                Certificate of Completion
              </h2>
              <p className="font-body-sm text-body-sm text-secondary mb-6 font-semibold">
                Certified SOC Analyst (CSA Tier 2) Practical Cyber Defense
              </p>

              <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                This credential is officially conferred upon:
              </p>

              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="font-headline-md text-headline-md text-center text-primary bg-transparent border-b-2 border-primary/40 focus:border-primary focus:outline-none w-full max-w-sm mx-auto mb-6 py-1"
              />

              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed mb-8">
                For demonstrating end-to-end operational proficiency in SIEM Alert Triage, Deep Packet Forensics, Sysmon Threat Hunting, SPL Detection Engineering, and Incident Response Containment.
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-outline-variant/30 pt-6 font-code-sm text-code-sm text-outline">
                <div>
                  <span className="block text-xs uppercase text-on-surface-variant">INSTRUCTOR</span>
                  <strong className="text-on-surface">Mohammed Moshii</strong>
                  <span className="block text-xs text-secondary">CyberSecurity Instructor</span>
                </div>
                <div>
                  <span className="block text-xs uppercase text-on-surface-variant">CURRICULUM</span>
                  <strong className="text-on-surface">8 Enterprise Modules</strong>
                  <span className="block text-xs text-primary">24 CEUs Accredited</span>
                </div>
                <div>
                  <span className="block text-xs uppercase text-on-surface-variant">VERIFICATION</span>
                  <strong className="text-on-surface font-mono">SOC-CSA-2026</strong>
                  <span className="block text-xs text-secondary">VERIFIED ON CHAIN</span>
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
