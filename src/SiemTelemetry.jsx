import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SIEM_DOC_ID, decodeSiemHtml, injectAntiCopyGuard } from './siemCodec';
import './cybersoc.css';

const SiemTelemetry = () => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'missing' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [reloadTick, setReloadTick] = useState(0);
  const revokedRef = useRef(null);

  const retryLoad = () => {
    setStatus('loading');
    setErrorMsg('');
    setReloadTick((t) => t + 1);
  };

  useEffect(() => {
    document.title = 'Elastic | MOSHII SIEM — Telemetry Lab';
    let active = true;

    const fetchSimulator = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'machines', SIEM_DOC_ID));
        if (!active) return;

        if (!docSnap.exists()) {
          setStatus('missing');
          return;
        }

        const data = docSnap.data();
        let html = '';

        if (data.encoding === 'moshii-xor-b64-v1' && data.payload) {
          html = decodeSiemHtml(data.payload);
        } else if (data.writeup) {
          html = data.writeup;
        }

        if (!html || !html.trim()) {
          setStatus('missing');
          return;
        }

        const protectedHtml = injectAntiCopyGuard(html);
        const blob = new Blob([protectedHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        if (revokedRef.current && revokedRef.current !== url) {
          URL.revokeObjectURL(revokedRef.current);
        }
        revokedRef.current = url;
        setBlobUrl(url);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        console.error('Error loading SIEM Telemetry simulator:', err);
        setErrorMsg(err?.message || 'Unable to fetch SIEM Telemetry simulator from database.');
        setStatus('error');
      }
    };

    fetchSimulator();

    return () => {
      active = false;
    };
  }, [reloadTick]);

  useEffect(() => {
    const blockContext = (e) => e.preventDefault();
    const blockDrag = (e) => e.preventDefault();
    const blockCopy = (e) => {
      const tag = (e.target?.tagName || '').toUpperCase();
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') e.preventDefault();
    };
    const blockShortcuts = (e) => {
      const k = (e.key || '').toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (k === 'f12') {
        e.preventDefault();
        return;
      }
      if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) {
        e.preventDefault();
        return;
      }
      if (mod && (k === 'u' || k === 's' || k === 'p')) {
        e.preventDefault();
        return;
      }
      if (mod && (k === 'c' || k === 'x' || k === 'a')) {
        const tag = (e.target?.tagName || '').toUpperCase();
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', blockContext, true);
    document.addEventListener('dragstart', blockDrag, true);
    document.addEventListener('copy', blockCopy, true);
    document.addEventListener('cut', blockCopy, true);
    document.addEventListener('keydown', blockShortcuts, true);

    return () => {
      document.removeEventListener('contextmenu', blockContext, true);
      document.removeEventListener('dragstart', blockDrag, true);
      document.removeEventListener('copy', blockCopy, true);
      document.removeEventListener('cut', blockCopy, true);
      document.removeEventListener('keydown', blockShortcuts, true);
      if (revokedRef.current) {
        URL.revokeObjectURL(revokedRef.current);
        revokedRef.current = null;
      }
    };
  }, []);

  const handleIframeLoad = () => {
    if (blobUrl) {
      const targetUrl = blobUrl;
      setTimeout(() => {
        URL.revokeObjectURL(targetUrl);
      }, 250);
    }
  };

  if (status === 'ready' && blobUrl) {
    return (
      <div
        className="fixed inset-0 w-screen h-screen bg-[#141519] overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={blobUrl}
          onLoad={handleIframeLoad}
          title="Elastic | MOSHII SIEM Simulator"
          className="w-full h-full border-0 block bg-[#141519]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
        />
      </div>
    );
  }

  return (
    <div className="bg-surface font-body-md text-on-surface fixed inset-0 w-screen h-screen flex flex-col items-center justify-center p-6 text-center select-none">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_24px_rgba(76,215,246,0.25)] animate-pulse">
            <span className="material-symbols-outlined text-4xl">data_object</span>
          </div>
          <h1 className="soc-clean-heading text-xl sm:text-2xl font-bold text-white">
            Loading Elastic SIEM Telemetry Lab...
          </h1>
          <p className="text-sm text-on-surface-variant m-0">
            Decrypting protected simulator workspace from database.
          </p>
        </div>
      )}

      {status === 'missing' && (
        <div className="flex flex-col items-center gap-5 max-w-lg bg-surface-container rounded-2xl border border-outline-variant/40 p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-primary/40 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl">cloud_upload</span>
          </div>
          <h1 className="soc-clean-heading text-2xl font-bold text-white">
            SIEM Simulator Not Synced to Database Yet
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed m-0">
            To keep the Elastic SIEM simulator protected out of the public repository, upload the simulator HTML file once in the Admin Dashboard. After uploading, this tab launches it directly from Firestore in full screen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/admin"
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              <span>Upload in Admin Panel</span>
            </Link>
            <button
              type="button"
              onClick={retryLoad}
              className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface border border-outline-variant/30 text-sm font-medium hover:border-primary/50 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/soc"
              className="px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/25 text-sm font-medium hover:text-white transition-colors"
            >
              Back to Course
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-5 max-w-lg bg-surface-container rounded-2xl border border-error/40 p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-error-container/20 border border-error/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-4xl">error_outline</span>
          </div>
          <h1 className="soc-clean-heading text-2xl font-bold text-white">
            Failed to Load SIEM Telemetry Lab
          </h1>
          <p className="text-sm text-error m-0">{errorMsg}</p>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={retryLoad}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm"
            >
              Retry
            </button>
            <Link
              to="/soc"
              className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface text-sm"
            >
              Back to Course
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiemTelemetry;
