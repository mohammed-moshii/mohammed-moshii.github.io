// Client-side obfuscation codec & anti-copy guard for Firestore-backed SIEM Telemetry simulator

export const SIEM_DOC_ID = 'siem-telemetry-elastic-simulator';
const CODEC_KEY = 'm0sh11_eL@st1c_S1EM_k3y_2026!';

/**
 * Encodes UTF-8 HTML into an XOR-obfuscated Base64 string safe for Firestore document storage.
 * Processes binary conversion in chunks to avoid stack overflow on large documents.
 */
export const encodeSiemHtml = (rawHtml) => {
  const bytes = new TextEncoder().encode(rawHtml);
  const keyBytes = new TextEncoder().encode(CODEC_KEY);
  const transformed = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    transformed[i] = bytes[i] ^ keyBytes[i % keyBytes.length] ^ (i & 0xff);
  }

  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < transformed.length; i += chunkSize) {
    const slice = transformed.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, slice);
  }
  return btoa(binary);
};

/**
 * Decodes an XOR-obfuscated Base64 payload back into UTF-8 HTML.
 */
export const decodeSiemHtml = (encodedPayload) => {
  const binary = atob(encodedPayload);
  const bytes = new Uint8Array(binary.length);
  const keyBytes = new TextEncoder().encode(CODEC_KEY);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length] ^ (i & 0xff);
  }

  return new TextDecoder().decode(bytes);
};

/**
 * Injects anti-copy, right-click block, and source-inspection shortcut blockers into rendered HTML
 * while keeping text inputs/textareas usable for interactive KQL search and log analysis.
 */
export const injectAntiCopyGuard = (rawHtml) => {
  if (!rawHtml) return '';

  const guardCss = `<style id="moshii-copy-guard-css">
html, body, body * {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  user-select: none !important;
  -webkit-touch-callout: none !important;
}
input, textarea, [contenteditable="true"] {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  user-select: text !important;
}
</style>`;

  const guardScript = `<script id="moshii-copy-guard-js">
(function() {
  var isEditable = function(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || !!el.isContentEditable;
  };
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
  document.addEventListener('dragstart', function(e) { e.preventDefault(); }, true);
  document.addEventListener('selectstart', function(e) {
    if (!isEditable(e.target)) e.preventDefault();
  }, true);
  document.addEventListener('copy', function(e) {
    if (!isEditable(e.target)) e.preventDefault();
  }, true);
  document.addEventListener('cut', function(e) {
    if (!isEditable(e.target)) e.preventDefault();
  }, true);
  document.addEventListener('keydown', function(e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if (k === 'f12') { e.preventDefault(); return; }
    if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) { e.preventDefault(); return; }
    if (mod && (k === 'u' || k === 's' || k === 'p')) { e.preventDefault(); return; }
    if (mod && (k === 'c' || k === 'x' || k === 'a') && !isEditable(e.target)) { e.preventDefault(); }
  }, true);
})();
</script>`;

  let protectedHtml = rawHtml;
  if (/<\/head>/i.test(protectedHtml)) {
    protectedHtml = protectedHtml.replace(/<\/head>/i, `${guardCss}\n</head>`);
  } else {
    protectedHtml = guardCss + protectedHtml;
  }

  if (/<\/body>/i.test(protectedHtml)) {
    protectedHtml = protectedHtml.replace(/<\/body>/i, `${guardScript}\n</body>`);
  } else {
    protectedHtml = protectedHtml + guardScript;
  }

  return protectedHtml;
};
