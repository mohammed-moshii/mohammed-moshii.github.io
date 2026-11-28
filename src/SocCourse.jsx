import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { SOC_MODULES } from './data/socModulesData';
import './cybersoc.css';

// Visual theme and cyber vector artwork configuration for all 8 square modules
const getModuleCoverConfig = (num) => {
  switch (num) {
    case '01':
      return {
        gradient: 'from-[#0b2347] via-[#07162e] to-[#040a17]',
        accent: '#4cd7f6',
        glow: 'rgba(76, 215, 246, 0.45)',
        icon: 'security',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <circle cx="160" cy="105" r="95" stroke="#4cd7f6" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="160" cy="105" r="65" stroke="#4cd7f6" strokeWidth="1.5" />
            <circle cx="160" cy="105" r="35" fill="#4cd7f6" fillOpacity="0.08" stroke="#4cd7f6" strokeWidth="1" />
            <line x1="20" y1="105" x2="300" y2="105" stroke="#4cd7f6" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="160" y1="10" x2="160" y2="210" stroke="#4cd7f6" strokeWidth="0.75" strokeDasharray="3 3" />
            <rect x="70" y="30" width="180" height="150" rx="12" stroke="#4cd7f6" strokeWidth="1" strokeOpacity="0.35" />
          </svg>
        )
      };
    case '02':
      return {
        gradient: 'from-[#3d0f18] via-[#26080f] to-[#0f0306]',
        accent: '#f87171',
        glow: 'rgba(248, 113, 113, 0.45)',
        icon: 'crisis_alert',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <polygon points="160,20 285,190 35,190" stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
            <polygon points="160,55 245,175 75,175" stroke="#f87171" strokeWidth="1" />
            <circle cx="160" cy="105" r="42" stroke="#f87171" strokeWidth="1.5" fill="#f87171" fillOpacity="0.06" />
            <line x1="105" y1="105" x2="215" y2="105" stroke="#f87171" strokeWidth="1.5" />
            <line x1="160" y1="50" x2="160" y2="160" stroke="#f87171" strokeWidth="1.5" />
          </svg>
        )
      };
    case '03':
      return {
        gradient: 'from-[#092e1f] via-[#051d13] to-[#020d09]',
        accent: '#4edea3',
        glow: 'rgba(78, 222, 163, 0.45)',
        icon: 'receipt_long',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <path d="M25 45 H295 M25 75 H260 M25 105 H280 M25 135 H240 M25 165 H290" stroke="#4edea3" strokeWidth="1.2" strokeDasharray="8 6" />
            <rect x="45" y="25" width="90" height="160" rx="8" stroke="#4edea3" strokeWidth="1" strokeOpacity="0.45" />
            <circle cx="215" cy="105" r="52" stroke="#4edea3" strokeWidth="1.5" fill="#4edea3" fillOpacity="0.06" />
            <circle cx="215" cy="105" r="24" stroke="#4edea3" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        )
      };
    case '04':
      return {
        gradient: 'from-[#092642] via-[#05182b] to-[#020b14]',
        accent: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.45)',
        icon: 'travel_explore',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <circle cx="160" cy="105" r="85" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="160" cy="105" r="56" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="160" cy="105" r="28" stroke="#38bdf8" strokeWidth="1" />
            <path d="M160 105 L228 38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="228" cy="38" r="5" fill="#38bdf8" />
            <circle cx="105" cy="68" r="3.5" fill="#38bdf8" />
            <circle cx="205" cy="148" r="3.5" fill="#38bdf8" />
          </svg>
        )
      };
    case '05':
      return {
        gradient: 'from-[#281242] via-[#170a28] to-[#0a0412]',
        accent: '#c084fc',
        glow: 'rgba(192, 132, 252, 0.45)',
        icon: 'manage_search',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <circle cx="160" cy="105" r="68" stroke="#c084fc" strokeWidth="1.5" />
            <path d="M70 105 H135 M185 105 H250 M160 30 V80 M160 130 V180" stroke="#c084fc" strokeWidth="2" />
            <rect x="115" y="60" width="90" height="90" rx="10" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="160" cy="105" r="95" stroke="#c084fc" strokeWidth="0.75" strokeDasharray="2 6" />
          </svg>
        )
      };
    case '06':
      return {
        gradient: 'from-[#3d1c06] via-[#261003] to-[#0f0601]',
        accent: '#fb923c',
        glow: 'rgba(251, 146, 60, 0.45)',
        icon: 'emergency',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <polygon points="160,25 232,65 232,145 160,185 88,145 88,65" stroke="#fb923c" strokeWidth="1.8" />
            <polygon points="160,52 208,79 208,131 160,158 112,131 112,79" stroke="#fb923c" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="105" x2="280" y2="105" stroke="#fb923c" strokeWidth="1" strokeDasharray="6 6" />
          </svg>
        )
      };
    case '07':
      return {
        gradient: 'from-[#360e38] via-[#200822] to-[#0c020d]',
        accent: '#f472b6',
        glow: 'rgba(244, 114, 182, 0.45)',
        icon: 'biotech',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <rect x="75" y="35" width="170" height="140" rx="12" stroke="#f472b6" strokeWidth="1.5" />
            <circle cx="120" cy="80" r="18" stroke="#f472b6" strokeWidth="1" />
            <circle cx="200" cy="80" r="18" stroke="#f472b6" strokeWidth="1" />
            <circle cx="160" cy="135" r="22" stroke="#f472b6" strokeWidth="1.5" fill="#f472b6" fillOpacity="0.1" />
            <line x1="120" y1="98" x2="148" y2="118" stroke="#f472b6" strokeWidth="1.2" />
            <line x1="200" y1="98" x2="172" y2="118" stroke="#f472b6" strokeWidth="1.2" />
          </svg>
        )
      };
    case '08':
    default:
      return {
        gradient: 'from-[#0d2d4a] via-[#081b2e] to-[#020b12]',
        accent: '#60a5fa',
        glow: 'rgba(96, 165, 250, 0.45)',
        icon: 'cloud_done',
        pattern: (
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" fill="none">
            <ellipse cx="160" cy="105" rx="100" ry="48" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="98" cy="95" r="28" stroke="#60a5fa" strokeWidth="1.2" />
            <circle cx="160" cy="78" r="38" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="222" cy="98" r="30" stroke="#60a5fa" strokeWidth="1.2" />
            <circle cx="60" cy="105" r="4.5" fill="#60a5fa" />
            <circle cx="260" cy="105" r="4.5" fill="#60a5fa" />
          </svg>
        )
      };
  }
};

const SocCourse = () => {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab');
  const validInitialTab = tabParam === 'lab' || tabParam === 'labs' || tabParam === 'challenge' ? 'lab' : 'slides';

  // Search & Filter state
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'syllabus'
  const [activeSidebarTrack, setActiveSidebarTrack] = useState('modules');

  // Module workspace state (full-screen tab when moduleId is present)
  const [activeTab, setActiveTab] = useState(validInitialTab); // 'slides' | 'lab'
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Lab Simulators State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [b64Decoded, setB64Decoded] = useState('');
  const [packetFilter, setPacketFilter] = useState('ALL');
  const [splunkQuery, setSplunkQuery] = useState('index=botsv3 sourcetype="stream:http" http_method="POST"');
  const [splunkResults, setSplunkResults] = useState(null);

  // Reset workspace state during render when navigating to a different module or tab query
  const currentRouteKey = `${moduleId || ''}:${tabParam || ''}`;
  const [trackedRouteKey, setTrackedRouteKey] = useState(currentRouteKey);
  if (currentRouteKey !== trackedRouteKey) {
    setTrackedRouteKey(currentRouteKey);
    setActiveTab(validInitialTab);
    setCurrentSectionIndex(0);
    setCurrentSlideIndex(0);
    setFlagInput('');
    setChallengeStatus(null);
    setShowHint(false);
    setSelectedAlert(null);
    setB64Decoded('');
    setSplunkResults(null);
    setIsWorkspaceSidebarOpen(false);
  }

  // Resolve full-screen route module from URL parameter
  const routeModule = useMemo(() => {
    if (!moduleId) return null;
    return SOC_MODULES.find(m => m.slug === moduleId || m.id === moduleId) || null;
  }, [moduleId]);

  const routeModuleIndex = useMemo(() => {
    if (!routeModule) return -1;
    return SOC_MODULES.findIndex(m => m.id === routeModule.id);
  }, [routeModule]);

  const slideSections = useMemo(() => {
    if (!routeModule) return [];
    return Array.isArray(routeModule.slideSections) ? routeModule.slideSections : [];
  }, [routeModule]);

  const activeSection = useMemo(() => {
    if (slideSections.length === 0) return null;
    return slideSections[currentSectionIndex] || slideSections[0];
  }, [slideSections, currentSectionIndex]);

  const activeSlides = useMemo(() => {
    if (slideSections.length > 0) return activeSection?.slides || [];
    return routeModule?.slides || [];
  }, [slideSections, activeSection, routeModule]);

  const totalModuleSlides = useMemo(() => {
    if (slideSections.length > 0) {
      return slideSections.reduce((sum, sec) => sum + (sec.slides?.length || 0), 0);
    }
    return routeModule?.slides?.length || 0;
  }, [slideSections, routeModule]);

  const selectSection = useCallback((idx) => {
    setCurrentSectionIndex(idx);
    setCurrentSlideIndex(0);
    setActiveTab('slides');
    setIsWorkspaceSidebarOpen(false);
  }, []);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('moshii_soc_completed', JSON.stringify(completedChallenges));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [completedChallenges]);

  // Sync browser tab title
  useEffect(() => {
    if (routeModule) {
      document.title = `Module ${routeModule.moduleNumber}: ${routeModule.title} | SOC Analyst Course`;
    } else {
      document.title = 'SOC Analyst Course | Mohammed Moshii';
    }
  }, [routeModule]);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser policy prevented native fullscreen toggle
    }
  };

  // Slide controls (declared before keyboard listener)
  const totalSlides = activeSlides.length;
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl+K search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('module-search')?.focus();
      }
      if (!routeModule || (routeModule.lab ? activeTab : 'slides') !== 'slides') return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [routeModule, activeTab, nextSlide, prevSlide]);

  // Flag submission
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!routeModule) return;
    const clean = flagInput.trim();
    if (clean === routeModule.challenge.flag || clean === routeModule.challenge.targetKey) {
      setChallengeStatus('success');
      setCompletedChallenges(prev => ({
        ...prev,
        [routeModule.id]: true
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

  // FULL-SCREEN MODULE WORKSPACE VIEW (Opened in New Tab via /soc/:moduleId)
  if (moduleId) {
    if (!routeModule) {
      return (
        <div className="bg-surface font-body-md text-on-surface min-h-screen w-full flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-error/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-4xl">error_outline</span>
          </div>
          <h1 className="soc-clean-heading text-2xl font-bold text-white">Module Not Found</h1>
          <p className="text-on-surface-variant max-w-md m-0">
            The requested SOC module could not be found. Return to the main curriculum to browse all 8 modules.
          </p>
          <Link
            to="/soc"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Back to SOC Analyst Course</span>
          </Link>
        </div>
      );
    }

    const cfg = getModuleCoverConfig(routeModule.moduleNumber);
    const prevModule = routeModuleIndex > 0 ? SOC_MODULES[routeModuleIndex - 1] : null;
    const nextModule = routeModuleIndex < SOC_MODULES.length - 1 ? SOC_MODULES[routeModuleIndex + 1] : null;
    const isChallengeSolved = !!completedChallenges[routeModule.id];
    const currentSlide = activeSlides?.[currentSlideIndex];
    const currentTab = routeModule.lab ? activeTab : 'slides';

    return (
      <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen lg:h-screen w-full flex flex-col lg:overflow-hidden">
        {/* TOP FULL-SCREEN HEADER */}
        <header className="h-16 shrink-0 bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/30 px-4 lg:px-6 flex items-center justify-between gap-3 z-40">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsWorkspaceSidebarOpen(!isWorkspaceSidebarOpen)}
              aria-label="Toggle Slides and Labs Sidebar"
              className="lg:hidden p-2 rounded-lg bg-surface-container-high text-on-surface hover:text-primary border border-outline-variant/30 transition-colors"
            >
              <span className="material-symbols-outlined text-xl leading-none">
                {isWorkspaceSidebarOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Back to Course */}
            <Link
              to="/soc"
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant border border-outline-variant/30 flex items-center gap-1.5 text-xs font-medium shrink-0 transition-colors group"
              title="Back to SOC Analyst Course Overview"
            >
              <span className="material-symbols-outlined text-base text-primary group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              <span className="hidden sm:inline text-slate-200">All Modules</span>
            </Link>

            <div className="h-5 w-px bg-outline-variant/40 hidden sm:block shrink-0"></div>

            {/* Module Title & Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="hidden sm:flex w-8 h-8 rounded-lg bg-[#060e20] border items-center justify-center shrink-0"
                style={{ borderColor: `${cfg.accent}55`, color: cfg.accent }}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {cfg.icon}
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded font-mono text-[11px] font-bold tracking-wider uppercase shrink-0 border"
                style={{
                  backgroundColor: `${cfg.accent}15`,
                  borderColor: `${cfg.accent}40`,
                  color: cfg.accent,
                }}
              >
                MODULE {routeModule.moduleNumber}
              </span>
              <h1 className="soc-clean-heading text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                {routeModule.title}
              </h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Prev / Next Module Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
              <button
                type="button"
                disabled={!prevModule}
                onClick={() => prevModule && navigate(`/soc/${prevModule.slug}`)}
                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 text-on-surface-variant hover:text-white hover:bg-surface-container-high disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title={prevModule ? `Previous: Module ${prevModule.moduleNumber}` : 'First Module'}
              >
                <span className="material-symbols-outlined text-base leading-none">chevron_left</span>
                <span className="hidden xl:inline">Prev</span>
              </button>
              <span className="text-[11px] font-mono text-outline px-1.5">
                {routeModule.moduleNumber} / {SOC_MODULES.length.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                disabled={!nextModule}
                onClick={() => nextModule && navigate(`/soc/${nextModule.slug}`)}
                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 text-on-surface-variant hover:text-white hover:bg-surface-container-high disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title={nextModule ? `Next: Module ${nextModule.moduleNumber}` : 'Last Module'}
              >
                <span className="hidden xl:inline">Next</span>
                <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
              </button>
            </div>

            {isChallengeSolved && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[11px] font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Completed</span>
              </span>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface hover:text-primary border border-outline-variant/30 transition-colors"
            >
              <span className="material-symbols-outlined text-xl leading-none">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </header>

        {/* FULL-SCREEN BODY: SIMPLE SIDEBAR ("SLIDES" & "LABS") + MAIN STAGE */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Mobile Overlay Backdrop */}
          {isWorkspaceSidebarOpen && (
            <div
              className="fixed inset-0 top-16 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsWorkspaceSidebarOpen(false)}
            ></div>
          )}

          {/* SIMPLE LEFT SIDEBAR: ONLY SLIDES AND LABS */}
          <aside
            className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-60 lg:w-64 shrink-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col justify-start overflow-y-auto transition-transform duration-300 ${
              isWorkspaceSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <nav className="p-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('slides');
                  setIsWorkspaceSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all border ${
                  currentTab === 'slides'
                    ? 'bg-primary/15 border-primary/50 text-white shadow-sm'
                    : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <span className={`material-symbols-outlined text-xl ${currentTab === 'slides' ? 'text-primary' : 'text-outline'}`}>
                    slideshow
                  </span>
                  <span>Slides</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                    currentTab === 'slides' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                  }`}
                >
                  {totalModuleSlides}
                </span>
              </button>

              {slideSections.length > 0 && (
                <div className="pl-3 flex flex-col gap-1 border-l border-outline-variant/25 ml-4">
                  {slideSections.map((sec, sIdx) => {
                    const isActiveSection = currentTab === 'slides' && sIdx === currentSectionIndex;
                    return (
                      <button
                        key={sec.id || sIdx}
                        type="button"
                        onClick={() => selectSection(sIdx)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-xs font-medium transition-all border ${
                          isActiveSection
                            ? 'bg-primary/10 border-primary/40 text-white'
                            : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container hover:text-white'
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                            isActiveSection ? 'bg-primary/25 text-primary' : 'bg-surface-container-high text-outline'
                          }`}
                        >
                          {sec.slides?.length || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {routeModule.lab && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('lab');
                    setIsWorkspaceSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all border ${
                    currentTab === 'lab'
                      ? 'bg-secondary/15 border-secondary/50 text-white shadow-sm'
                      : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <span className={`material-symbols-outlined text-xl ${currentTab === 'lab' ? 'text-secondary' : 'text-outline'}`}>
                      terminal
                    </span>
                    <span>Labs</span>
                  </span>
                </button>
              )}
            </nav>
          </aside>

          {/* MAIN FULL-SCREEN CONTENT WORKSPACE */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface">
            <div className="max-w-6xl mx-auto w-full">

              {/* VIEW 1: SLIDES */}
              {currentTab === 'slides' && activeSlides.length > 0 && (
                <div className="flex flex-col justify-between bg-surface-container rounded-2xl border border-outline-variant/30 p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
                  {slideSections.length > 0 && activeSection && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-outline-variant/25">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">folder_open</span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
                          Section {currentSectionIndex + 1} / {slideSections.length}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                          {activeSection.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {slideSections.map((sec, sIdx) => (
                          <button
                            key={sec.id || sIdx}
                            type="button"
                            onClick={() => selectSection(sIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                              sIdx === currentSectionIndex
                                ? 'bg-primary text-on-primary border-primary shadow-sm'
                                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/25 hover:text-white hover:border-outline'
                            }`}
                          >
                            <span>{sec.title}</span>
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                sIdx === currentSectionIndex
                                  ? 'bg-black/20 text-on-primary'
                                  : 'bg-surface-container-high text-outline'
                              }`}
                            >
                              {sec.slides?.length || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Header: Counter + Numbered Slide Stepper */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/25 pb-4 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded border shrink-0"
                        style={{
                          backgroundColor: `${cfg.accent}15`,
                          borderColor: `${cfg.accent}40`,
                          color: cfg.accent,
                        }}
                      >
                        SLIDE {currentSlideIndex + 1} / {activeSlides.length}
                      </span>
                      {currentSlide?.title && (
                        <span className="text-sm sm:text-base font-semibold text-white truncate">
                          {currentSlide.title}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`min-w-7 h-7 px-2 rounded-md font-mono text-xs font-semibold transition-all border ${
                            idx === currentSlideIndex
                              ? 'bg-primary text-on-primary border-primary shadow-sm'
                              : 'bg-surface-container-low text-outline border-outline-variant/25 hover:text-white hover:border-outline'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IMAGE SLIDE DISPLAY (e.g., Module 01 Slides 1–11) */}
                  {currentSlide?.image ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-outline-variant/30 shadow-xl">
                      <img
                        src={currentSlide.image}
                        alt={`Slide ${currentSlideIndex + 1}: ${currentSlide.title || routeModule.title}`}
                        className="w-full h-full object-contain select-none"
                      />
                    </div>
                  ) : (
                    /* FALLBACK STRUCTURED SLIDE DISPLAY (Modules 02–08) */
                    <div className="py-2">
                      <h2 className="soc-clean-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                        {currentSlide?.title}
                      </h2>
                      <p className="text-sm sm:text-base text-primary font-medium mb-6 mt-0">
                        {currentSlide?.subtitle}
                      </p>

                      <div className="flex flex-col gap-3.5 mb-7">
                        {currentSlide?.bullets?.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/20">
                            <span className="text-secondary text-lg leading-snug shrink-0">▸</span>
                            <p className="font-body-md text-body-md text-on-surface leading-relaxed m-0">
                              {b}
                            </p>
                          </div>
                        ))}
                      </div>

                      {currentSlide?.diagram && (
                        <pre className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest text-primary font-code-sm text-code-sm border border-outline-variant/30 overflow-x-auto whitespace-pre mb-6 shadow-inner">
                          {currentSlide.diagram.trim()}
                        </pre>
                      )}

                      {currentSlide?.takeaway && (
                        <div className="p-4 rounded-xl bg-secondary/10 border-l-4 border-secondary text-on-surface font-body-sm text-body-sm">
                          <strong className="text-secondary">KEY TAKEAWAY: </strong>
                          {currentSlide.takeaway}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-outline-variant/25 mt-6">
                    <button
                      type="button"
                      onClick={prevSlide}
                      disabled={currentSlideIndex === 0}
                      className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-outline-variant/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                      Previous
                    </button>
                    <span className="font-code-sm text-code-sm text-outline hidden sm:inline">
                      ← / → Keys • Slide {currentSlideIndex + 1} of {activeSlides.length}
                    </span>
                    {currentSlideIndex < activeSlides.length - 1 ? (
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        Next
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    ) : currentSectionIndex < slideSections.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => selectSection(currentSectionIndex + 1)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        Next Section: {slideSections[currentSectionIndex + 1]?.title}
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    ) : routeModule.lab ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('lab')}
                        className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-body-sm text-body-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        Go to Labs
                        <span className="material-symbols-outlined text-base">terminal</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm opacity-40 cursor-not-allowed flex items-center gap-1.5 border border-outline-variant/30"
                      >
                        End of Deck
                        <span className="material-symbols-outlined text-base">check</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: LABS */}
              {currentTab === 'lab' && routeModule.lab && (
                <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col gap-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/25 pb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono text-[11px] font-bold mb-2">
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        HANDS-ON LAB WORKSPACE
                      </span>
                      <h2 className="soc-clean-heading text-2xl font-bold text-white">
                        {routeModule.lab.title}
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant pt-2 m-0">
                        <strong className="text-primary">MISSION:</strong> {routeModule.lab.scenario}
                      </p>
                    </div>
                  </div>

                  {/* LAB TYPE 1: ALERT TRIAGE SIM */}
                  {routeModule.lab.type === 'alert-triage-sim' && (
                    <div className="flex flex-col gap-4">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        SIEM ALERT QUEUE: Click alert to inspect
                      </span>
                      <div className="grid gap-2.5">
                        {routeModule.lab.alerts.map(al => (
                          <div
                            key={al.id}
                            onClick={() => setSelectedAlert(al)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              selectedAlert?.id === al.id
                                ? 'bg-primary/10 border-primary'
                                : 'bg-surface-container-lowest border-outline-variant/25 hover:border-outline-variant'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 rounded font-code-sm text-code-sm font-bold ${
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
                        <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/40 flex flex-col gap-2">
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
                            className="mt-2 w-fit px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-code-sm text-code-sm font-semibold"
                          >
                            Auto-Decode Base64 UTF-16LE Payload
                          </button>
                          {b64Decoded && (
                            <pre className="p-3 rounded-lg bg-surface-container-high text-secondary font-code-sm text-code-sm m-0">
                              {b64Decoded}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LAB TYPE 2: NETWORK PACKET SIM */}
                  {routeModule.lab.type === 'network-packet-sim' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-label-sm text-label-sm text-outline">FILTER:</span>
                        {['ALL', 'DNS', 'ARP'].map(flt => (
                          <button
                            key={flt}
                            onClick={() => setPacketFilter(flt)}
                            className={`px-3 py-1 rounded-lg font-code-sm text-code-sm ${packetFilter === flt ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-lowest text-outline'}`}
                          >
                            {flt}
                          </button>
                        ))}
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                        <table className="w-full text-left font-code-sm text-code-sm border-collapse bg-surface-container-lowest">
                          <thead>
                            <tr className="bg-surface-container-high text-primary border-b border-outline-variant/30">
                              <th className="p-2.5">No.</th>
                              <th className="p-2.5">Time</th>
                              <th className="p-2.5">Source</th>
                              <th className="p-2.5">Destination</th>
                              <th className="p-2.5">Protocol</th>
                              <th className="p-2.5">Info</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routeModule.lab.packets
                              .filter(p => packetFilter === 'ALL' || p.proto === packetFilter)
                              .map(p => (
                                <tr key={p.no} className="border-b border-outline-variant/10 text-on-surface">
                                  <td className="p-2.5">{p.no}</td>
                                  <td className="p-2.5">{p.time}</td>
                                  <td className="p-2.5">{p.src}</td>
                                  <td className="p-2.5">{p.dst}</td>
                                  <td className="p-2.5 font-bold text-secondary">{p.proto}</td>
                                  <td className="p-2.5 font-mono break-all">{p.info}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* LAB TYPE 3: SYSMON EVENT SIM */}
                  {routeModule.lab.type === 'sysmon-event-sim' && (
                    <div className="flex flex-col gap-3">
                      {routeModule.lab.events.map((ev, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm">
                          <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20 mb-2">
                            <span className="text-secondary font-bold">EVENT ID {ev.eventId} ({ev.task})</span>
                            <span className="text-outline">{ev.time}</span>
                          </div>
                          <p className="text-on-surface m-0 whitespace-pre-wrap break-all">{ev.data}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LAB TYPE 4: SPLUNK QUERY SIM */}
                  {routeModule.lab.type === 'splunk-query-sim' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={splunkQuery}
                          onChange={(e) => setSplunkQuery(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-primary text-on-surface font-code-sm text-code-sm focus:outline-none"
                        />
                        <button
                          onClick={() => setSplunkResults(routeModule.lab.dataset)}
                          className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-code-sm text-code-sm font-semibold"
                        >
                          Run SPL
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                        <table className="w-full text-left font-code-sm text-code-sm border-collapse">
                          <thead>
                            <tr className="bg-surface-container-high text-primary border-b border-outline-variant/30">
                              <th className="p-2.5">_time</th>
                              <th className="p-2.5">EventCode</th>
                              <th className="p-2.5">User</th>
                              <th className="p-2.5">Src_IP</th>
                              <th className="p-2.5">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(splunkResults || routeModule.lab.dataset).map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-outline-variant/10 text-on-surface">
                                <td className="p-2.5">{row._time}</td>
                                <td className="p-2.5 font-bold">{row.eventCode}</td>
                                <td className="p-2.5 font-semibold text-primary">{row.user}</td>
                                <td className="p-2.5">{row.src_ip}</td>
                                <td className={`p-2.5 font-bold ${row.action.includes('Success') ? 'text-secondary' : 'text-outline'}`}>{row.action}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* LAB TYPE 5: YARA VALIDATOR */}
                  {routeModule.lab.type === 'yara-validator-sim' && (
                    <div className="flex flex-col gap-2">
                      <span className="font-label-sm text-label-sm text-outline">EXTRACTED MEMORY STRINGS:</span>
                      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-on-surface flex flex-col gap-1.5">
                        {routeModule.lab.memoryDumpStrings.map((s, idx) => (
                          <div key={idx} className="flex gap-3">
                            <span className="text-outline">[{idx.toString().padStart(2, '0')}]</span>
                            <span className={s.includes('pipe') ? 'text-error font-bold' : ''}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LAB TYPE 6: SANDBOX DETONATION */}
                  {routeModule.lab.type === 'sandbox-sim' && (
                    <div className="flex flex-col gap-3">
                      <span className="font-label-sm text-label-sm text-outline">VOLATILITY 3 MALFIND OUTPUT:</span>
                      <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-primary overflow-x-auto whitespace-pre m-0">
                        {routeModule.lab.malfindOutput}
                      </pre>
                    </div>
                  )}

                  {/* LAB TYPE 7: EMAIL HEADERS */}
                  {routeModule.lab.type === 'email-header-sim' && (
                    <div className="flex flex-col gap-2">
                      <span className="font-label-sm text-label-sm text-outline">RFC 5322 RAW HEADERS:</span>
                      <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-secondary overflow-x-auto whitespace-pre m-0">
                        {routeModule.lab.rawHeaders}
                      </pre>
                    </div>
                  )}

                  {/* LAB TYPE 8: CLOUD AUDIT SIMULATOR */}
                  {routeModule.lab.type === 'cloud-sim' && (
                    <div className="flex flex-col gap-2">
                      <span className="font-label-sm text-label-sm text-outline">AWS CLOUDTRAIL JSON SECURITY AUDIT LOG:</span>
                      <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-code-sm text-code-sm text-primary overflow-x-auto whitespace-pre m-0">
                        {routeModule.lab.cloudTrailEvent}
                      </pre>
                    </div>
                  )}

                  {/* LAB TYPE 9: ACTIVE DIRECTORY CAPSTONE */}
                  {routeModule.lab.type === 'ad-defense-sim' && (
                    <div className="flex flex-col gap-3">
                      <span className="font-label-sm text-label-sm text-outline">DOMAIN CONTROLLER SECURITY EVENT LOGS:</span>
                      <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                        <table className="w-full text-left font-code-sm text-code-sm border-collapse">
                          <thead>
                            <tr className="bg-surface-container-high text-tertiary border-b border-outline-variant/30">
                              <th className="p-2.5">Time</th>
                              <th className="p-2.5">Event ID</th>
                              <th className="p-2.5">Account</th>
                              <th className="p-2.5">Target / Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routeModule.lab.logs.map((l, i) => (
                              <tr key={i} className="border-b border-outline-variant/10 text-on-surface">
                                <td className="p-2.5">{l.time}</td>
                                <td className="p-2.5 font-bold text-tertiary">{l.id}</td>
                                <td className="p-2.5 font-bold text-primary">{l.account}</td>
                                <td className="p-2.5 font-mono text-outline">{l.note || l.object || l.service}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Lab Instructions Footer */}
                  <div className="p-4 rounded-xl bg-surface-container-high border-l-4 border-primary font-body-sm text-body-sm text-on-surface">
                    <strong className="text-primary">TASK INSTRUCTIONS:</strong>
                    <p className="m-0 whitespace-pre-line pt-1 text-on-surface-variant font-code-sm text-code-sm">
                      {routeModule.lab.taskInstructions}
                    </p>
                  </div>

                  {/* Lab Flag Verification Block */}
                  {routeModule.challenge && (
                    <div className="pt-4 border-t border-outline-variant/25 flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="soc-clean-heading text-lg font-bold text-secondary flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl">flag</span>
                          Lab Flag Verification
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-code-sm text-code-sm font-bold border border-secondary/25">
                          +{routeModule.challenge.points} XP
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-lowest border-l-4 border-secondary flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          OBJECTIVE:
                        </span>
                        <p className="font-title-sm text-title-sm text-on-surface font-semibold m-0 leading-relaxed">
                          {routeModule.challenge.question}
                        </p>
                      </div>

                      {challengeStatus === 'success' && (
                        <div className="p-4 rounded-xl bg-secondary/15 border border-secondary text-secondary flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl">check_circle</span>
                          <div>
                            <strong className="font-title-sm text-title-sm">FLAG VERIFIED! CHALLENGE SOLVED! (+{routeModule.challenge.points} XP)</strong>
                            <p className="m-0 font-body-sm text-body-sm">Your defense telemetry analysis is correct. Progress has been saved.</p>
                          </div>
                        </div>
                      )}

                      {challengeStatus === 'error' && (
                        <div className="p-3.5 rounded-xl bg-error-container/20 border border-error text-error flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl">error</span>
                          <span className="font-body-sm text-body-sm font-semibold">INCORRECT FLAG OR TARGET KEY. Review the lab findings and try again!</span>
                        </div>
                      )}

                      <form onSubmit={handleFlagSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={flagInput}
                          onChange={(e) => setFlagInput(e.target.value)}
                          disabled={isChallengeSolved}
                          placeholder="Enter flag format: flag{...} or target keyword"
                          className="flex-1 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-code-md text-code-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={isChallengeSolved}
                          className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-title-sm text-body-md font-bold transition-all disabled:opacity-50 shadow-sm"
                        >
                          {isChallengeSolved ? 'Challenge Solved' : 'Submit Flag'}
                        </button>
                      </form>

                      <div>
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="text-primary hover:underline font-code-sm text-code-sm flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">help</span>
                          {showHint ? 'Hide Hint' : 'Need a Hint?'}
                        </button>
                        {showHint && (
                          <div className="mt-2.5 p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-on-surface font-body-sm text-body-sm">
                            💡 <strong>HINT:</strong> {routeModule.challenge.hint}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    );
  }

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
            <a
              href={`#/soc/${SOC_MODULES[3].slug}?tab=lab`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSidebarTrack('console')}
              className={`soc-module-card flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left no-underline ${
                activeSidebarTrack === 'console'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">terminal</span>
              <span>Analyst Console</span>
            </a>

            <button
              onClick={() => setActiveSidebarTrack('modules')}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left ${
                activeSidebarTrack === 'modules'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <span>Modules &amp; Curriculum</span>
            </button>

            <a
              href={`#/soc/${SOC_MODULES[1].slug}?tab=lab`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSidebarTrack('range')}
              className={`soc-module-card flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left no-underline ${
                activeSidebarTrack === 'range'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">radar</span>
              <span>Cyber Range Labs</span>
            </a>

            <a
              href="#/soc/siem-telemetry"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSidebarTrack('siem')}
              className={`soc-module-card flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left no-underline ${
                activeSidebarTrack === 'siem'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">data_object</span>
              <span>SIEM Telemetry</span>
            </a>

            <a
              href={`#/soc/${SOC_MODULES[4].slug}?tab=slides`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSidebarTrack('mitre')}
              className={`soc-module-card flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left no-underline ${
                activeSidebarTrack === 'mitre'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
              <span>MITRE Navigator</span>
            </a>

            <a
              href={`#/soc/${SOC_MODULES[5].slug}?tab=lab`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSidebarTrack('drills')}
              className={`soc-module-card flex items-center gap-space-sm px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm w-full text-left no-underline ${
                activeSidebarTrack === 'drills'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">crisis_alert</span>
              <span>Incident Drills</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Bottom Progress Widget */}
        <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Tier 1 Progress
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
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}
              >
                {filteredModules.map((m) => {
                  const cfg = getModuleCoverConfig(m.moduleNumber);
                  const skillsList = m.skills || m.tags || [];

                  if (viewLayout === 'syllabus') {
                    return (
                      <a
                        key={m.id}
                        href={`#/soc/${m.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="soc-module-card group flex flex-row rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1 border border-outline-variant/30 hover:border-primary/50 bg-surface-container cursor-pointer relative no-underline"
                      >
                        {/* SQUARE COVER */}
                        <div className={`relative w-36 sm:w-44 aspect-square shrink-0 overflow-hidden bg-gradient-to-br ${cfg.gradient} flex items-center justify-center border-r border-outline-variant/30`}>
                          <div
                            className="absolute w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125"
                            style={{ backgroundColor: cfg.glow }}
                          ></div>
                          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                            {cfg.pattern}
                          </div>
                          <div
                            className="relative z-10 w-12 h-12 rounded-2xl bg-[#060e20]/80 backdrop-blur-md flex items-center justify-center border shadow-xl transition-all duration-300 group-hover:scale-110"
                            style={{
                              borderColor: `${cfg.accent}60`,
                              color: cfg.accent,
                              boxShadow: `0 0 24px ${cfg.glow}`,
                            }}
                          >
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {cfg.icon}
                            </span>
                          </div>
                        </div>

                        {/* BODY: ONLY MODULE NAME & SKILLS */}
                        <div className="p-4 flex flex-col justify-between gap-3 flex-1 bg-surface-container min-w-0">
                          <h3
                            style={{ fontFamily: "'Inter', sans-serif", textTransform: 'none', letterSpacing: '-0.01em', margin: 0 }}
                            className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors leading-snug"
                          >
                            Module {m.moduleNumber}: {m.title}
                          </h3>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.accent }}></span>
                              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-outline leading-none">
                                Skills
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {skillsList.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-surface-container-highest/60 text-slate-300 font-sans text-[11px] font-medium border border-outline-variant/30 group-hover:border-primary/30 group-hover:text-white transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <a
                      key={m.id}
                      href={`#/soc/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="soc-module-card group relative aspect-square w-full overflow-hidden rounded-xl flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 border border-outline-variant/35 hover:border-primary/60 cursor-pointer no-underline"
                    >
                      {/* FULL-SQUARE IMPRESSIVE CYBER COVER BACKGROUND */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} pointer-events-none`}>
                        {/* Ambient Neon Glow */}
                        <div
                          className="absolute -top-8 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125"
                          style={{ backgroundColor: cfg.glow }}
                        ></div>

                        {/* Cyber Vector Overlay Artwork */}
                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                          {cfg.pattern}
                        </div>

                        {/* Bottom Gradient Scrim for Sharp Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-[#050b16]/85 via-50% to-transparent"></div>
                      </div>

                      {/* SQUARE FOREGROUND: COVER EMBLEM + ONLY MODULE NAME & SKILLS */}
                      <div className="relative z-10 flex-1 min-h-0 w-full p-3.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
                        {/* Upper Cover Focal Emblem */}
                        <div className="flex-1 min-h-[52px] flex items-center justify-center">
                          <div
                            className="w-11 h-11 2xl:w-14 2xl:h-14 rounded-2xl bg-[#060e20]/80 backdrop-blur-md flex items-center justify-center border shadow-xl transition-all duration-300 group-hover:scale-110"
                            style={{
                              borderColor: `${cfg.accent}60`,
                              color: cfg.accent,
                              boxShadow: `0 0 24px ${cfg.glow}`,
                            }}
                          >
                            <span className="material-symbols-outlined text-2xl 2xl:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {cfg.icon}
                            </span>
                          </div>
                        </div>

                        {/* Lower Content: ONLY Module Name & Skills */}
                        <div className="flex flex-col gap-2 2xl:gap-2.5">
                          <h3
                            style={{ fontFamily: "'Inter', sans-serif", textTransform: 'none', letterSpacing: '-0.01em', margin: 0 }}
                            className="text-[13.5px] xl:text-[13.5px] 2xl:text-[15px] font-bold text-white group-hover:text-primary transition-colors leading-snug"
                          >
                            Module {m.moduleNumber}: {m.title}
                          </h3>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.accent }}></span>
                              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 leading-none">
                                Skills
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 2xl:gap-1.5">
                              {skillsList.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.5 2xl:px-2 2xl:py-0.5 rounded bg-white/5 text-slate-200 font-sans text-[10px] 2xl:text-[11px] font-medium leading-tight border border-white/10 group-hover:border-primary/35 group-hover:text-white transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
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

    </div>
  );
};

export default SocCourse;
