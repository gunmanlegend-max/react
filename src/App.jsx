/* Fixed copy of the uploaded Gunnarz AI OS component. */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, MessageSquare, Mic, Image as ImageIcon, Settings, Send,
  Play, Volume2, PanelLeftOpen,
  Sparkles, BrainCircuit, Trash2, Plus, Edit3, Check, X,
  FileText, Camera, Activity,
  Copy, CheckCheck, LayoutTemplate, Paperclip, Scan, Maximize, Minimize,
  RotateCcw, MonitorPlay, Star, Key,
  Download, Languages, Database, Upload, Palette, RefreshCw
} from 'lucide-react';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const APP_FULL = "Gunnarz AI OS V30 SINGULARITY";

const THEME_PRESETS = {
  cyber: {
    bg: "bg-[#03030b] text-[#cbd5e1]",
    sidebar: "bg-[#070714] border-[#1e1b4b]/50",
    header: "bg-[#060614]/90 border-[#1e1b4b]/40",
    card: "bg-[#151532]/40 border-[#3a3a60]/50",
    accent: "text-[#00ffcc]",
    button: "bg-gradient-to-r from-[#00ccaa] to-[#00ffcc] text-[#03030b]",
    // FIX #17: per-theme values for renderFormattedMessage
    accentHex: "#00ffcc",
    codeBlockBg: "bg-[#0a0a1a]", codeBlockBorder: "border-[#1e1b4b]",
    codeHeaderBg: "bg-[#151532]", codeText: "text-[#00ffcc]",
    msgUserBg: "bg-[#151532]/40 border-[#3a3a60]/50 text-white",
    msgAiBg: "bg-[#090919] border-[#1c1c3a] text-gray-200",
    inputBg: "bg-[#0d0d23] border-[#1e1b4b]",
    footerBg: "bg-[#060614]"
  },
  light: {
    bg: "bg-[#f8fafc] text-[#334155]",
    sidebar: "bg-[#ffffff] border-[#e2e8f0]",
    header: "bg-[#ffffff]/90 border-[#e2e8f0]",
    card: "bg-[#ffffff] border-[#cbd5e1] shadow-sm",
    accent: "text-[#0088ff]",
    button: "bg-gradient-to-r from-[#0088ff] to-[#3b82f6] text-white",
    accentHex: "#0088ff",
    codeBlockBg: "bg-gray-100", codeBlockBorder: "border-gray-300",
    codeHeaderBg: "bg-gray-200", codeText: "text-blue-600",
    msgUserBg: "bg-blue-50 border-blue-200 text-slate-800",
    msgAiBg: "bg-white border-gray-200 text-slate-700 shadow-sm",
    inputBg: "bg-white border-gray-300",
    footerBg: "bg-gray-50"
  },
  minimal: {
    bg: "bg-[#000000] text-[#f3f4f6]",
    sidebar: "bg-[#000000] border-neutral-800",
    header: "bg-[#000000]/95 border-neutral-800",
    card: "bg-[#0a0a0a] border-neutral-800",
    accent: "text-white",
    button: "bg-white text-black font-semibold",
    accentHex: "#ffffff",
    codeBlockBg: "bg-[#111]", codeBlockBorder: "border-neutral-800",
    codeHeaderBg: "bg-[#1a1a1a]", codeText: "text-white",
    msgUserBg: "bg-[#111] border-neutral-800 text-white",
    msgAiBg: "bg-[#0a0a0a] border-neutral-900 text-gray-300",
    inputBg: "bg-[#111] border-neutral-800",
    footerBg: "bg-black"
  },
  neon: {
    bg: "bg-[#0c001a] text-[#f3e8ff]",
    sidebar: "bg-[#120029] border-[#d946ef]/30",
    header: "bg-[#120029]/95 border-[#d946ef]/30",
    card: "bg-[#1e003a]/50 border-[#d946ef]/40",
    accent: "text-[#d946ef]",
    button: "bg-gradient-to-r from-[#a21caf] to-[#d946ef] text-white",
    accentHex: "#d946ef",
    codeBlockBg: "bg-[#0a0015]", codeBlockBorder: "border-[#d946ef]/30",
    codeHeaderBg: "bg-[#1a0030]", codeText: "text-[#d946ef]",
    msgUserBg: "bg-[#1e003a]/60 border-[#d946ef]/30 text-white",
    msgAiBg: "bg-[#120029] border-[#d946ef]/20 text-purple-100",
    inputBg: "bg-[#1e003a] border-[#d946ef]/30",
    footerBg: "bg-[#0c001a]"
  }
};

const MODEL_MODES = {
  "gunnarz-singularity": { name: "Singularity Engine",       model: "llama-3.3-70b-versatile",        color: "#00ffcc", costPer1k: 0.00015 },
  "vision-pro":          { name: "Vision Analytics",         model: "llama-3.2-90b-vision-preview",    color: "#ff3b30", costPer1k: 0.0002  },
  "gpt-plus":            { name: "ChatGPT Plus (GPT-4o)",    model: "llama-3.3-70b-versatile",        color: "#10a37f", costPer1k: 0.00015 },
  "gemini-pro":          { name: "Gemini Pro 1.5",           model: "llama-3.3-70b-versatile",        color: "#1a73e8", costPer1k: 0.00015 },
  "claude-max":          { name: "Claude 3.5 Sonnet",        model: "llama-3.3-70b-versatile",        color: "#d97706", costPer1k: 0.00015 },
  "perplexity-max":      { name: "Perplexity Deep",          model: "llama-3.1-8b-instant",           color: "#00a3c4", costPer1k: 0.0001  },
  "open-router":         { name: "OpenRouter Suite",         model: "openrouter",                     color: "#bf5af2", costPer1k: 0.0002  }
};

const OPENROUTER_FALLBACK_MODELS = [
  { slug: "openrouter/free", name: "OpenRouter Free Router", provider: "OpenRouter", category: "router", costHint: "Free router" },
  { slug: "openai/gpt-4.1", name: "GPT-4.1", provider: "OpenAI", category: "general", costHint: "High quality" },
  { slug: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "multimodal", costHint: "Fast multimodal" },
  { slug: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", category: "reasoning", costHint: "Balanced reasoning" },
  { slug: "anthropic/claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", category: "reasoning", costHint: "Top tier" },
  { slug: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "reasoning", costHint: "Long context" },
  { slug: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", category: "fast", costHint: "Fast and efficient" },
  { slug: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", provider: "Meta", category: "general", costHint: "Strong open model" },
  { slug: "meta-llama/llama-4-scout", name: "Llama 4 Scout", provider: "Meta", category: "fast", costHint: "Compact and quick" },
  { slug: "qwen/qwen3-max", name: "Qwen3 Max", provider: "Qwen", category: "coding", costHint: "Coding and agents" },
  { slug: "qwen/qwen3-coder", name: "Qwen3 Coder", provider: "Qwen", category: "coding", costHint: "Coding focused" },
  { slug: "mistralai/mistral-small-3.2", name: "Mistral Small 3.2", provider: "Mistral", category: "fast", costHint: "Fast general model" }
];

const PROMPT_TEMPLATES = [
  { label: "👶 Explain Like I'm 5",  prompt: "Explain the following concept like I am a 5 year old using simple analogies:\n" },
  { label: "🐛 Debug Code Block",     prompt: "Inspect the following code for bugs, errors, or performance issues and explain the fix cleanly:\n" },
  { label: "📝 Summarize Article",   prompt: "Provide a concise bulleted summary of this text highlighting key takeaways:\n" },
  { label: "🎓 Write Study Guide",   prompt: "Create a structured study guide with quick quiz questions for this topic:\n" }
];

const TRANSLATION_LANGUAGES = [
  "Spanish","French","German","Italian","Portuguese",
  "Russian","Japanese","Korean","Mandarin Chinese","Hindi","Arabic"
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in private / restricted modes.
  }
}

function safeRemoveItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in private / restricted modes.
  }
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {

  // ──────────────────────────────────────────
  // 1. STATE
  // ──────────────────────────────────────────
  const [sidebarOpen,      setSidebarOpen]      = useState(true);
  const [chatSessions,     setChatSessions]     = useState([]);
  const [activeSessionId,  setActiveSessionId]  = useState(null);
  const [keys,             setKeys]             = useState({ groq: '', hf: '', openrouter: '', gemini: '' });
  const [customORModel,    setCustomORModel]    = useState("google/gemini-2.5-flash");
  const [selectedModel,    setSelectedModel]    = useState("gunnarz-singularity");
  const [modelLibraryOpen, setModelLibraryOpen] = useState(false);
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [openRouterStatus, setOpenRouterStatus] = useState("loading");
  const [openRouterSearch, setOpenRouterSearch] = useState("");

  // FIX #10 — dedicated settings state, no longer hijacking selectedModel
  const [showSettings,     setShowSettings]     = useState(false);

  const [deepThinking,     setDeepThinking]     = useState(true);
  const [thinkingSteps,    setThinkingSteps]    = useState([]);
  const [activeTheme,      setActiveTheme]      = useState('cyber');
  const [fontSize,         setFontSize]         = useState("text-sm");
  const [targetLang,       setTargetLang]       = useState("Spanish");

  const [prefMemory, setPrefMemory] = useState({
    userName: 'Developer', projectNotes: 'Building Gunnarz Premium OS', longTermFacts: []
  });
  const [showMemoryPanel, setShowMemoryPanel]  = useState(false);
  const [newFactInput,    setNewFactInput]     = useState('');

  // FIX #14 — toast notification system, replaces all alert() calls
  const [toasts, setToasts] = useState([]);

  // FIX #20 — mic level for voice bar visualizer
  const [micLevel, setMicLevel] = useState(0);

  const [isIncognito, setIsIncognito] = useState(false);
  const [appLocked,   setAppLocked]   = useState(false);
  const [appPin,      setAppPin]      = useState('');
  const [pinInput,    setPinInput]    = useState('');

  const [chatInput,        setChatInput]        = useState('');
  const [isTyping,         setIsTyping]         = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleInput,   setEditTitleInput]   = useState('');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [starredMessages,  setStarredMessages]  = useState([]);

  const [useLiveSearchGrounding, setUseLiveSearchGrounding] = useState(false);
  const [toolRoutingActive,      setToolRouterActive]       = useState(true);

  const [comparisonActive,  setComparisonActive]  = useState(false);
  const [comparisonReplies, setComparisonReplies] = useState({ modelA: '', modelB: '' });
  const [comparisonModels,  setComparisonModels]  = useState({ modelA: 'gpt-plus', modelB: 'claude-max' });

  const [tokenCostMeter, setTokenCostMeter] = useState({ totalTokens: 0, totalCost: 0 });

  const [calcInput,  setCalcInput]  = useState('');
  const [calcResult, setCalcResult] = useState('');

  const [attachments,     setAttachments]     = useState([]);
  const [persistentDocs,  setPersistentDocs]  = useState([]);
  const [isProcessingFile,setIsProcessingFile]= useState(false);

  const [canvasTabs, setCanvasTabStates] = useState([{
    id: 'tab1', name: 'App Workspace',
    html: '<h1>Interactive Singularity Workspace</h1><p>Edit the panes below to compile instantly.</p><div id="test-node">Pending…</div>',
    css:  'body{font-family:sans-serif;text-align:center;padding-top:15%;background:#070711;color:#cbd5e1;}h1{color:#bf5af2;text-shadow:0 0 10px rgba(191,90,242,.3);}',
    js:   'document.getElementById("test-node").innerText="JS Engine: Loaded!";console.log("Sandbox compiled.");'
  }]);
  const [activeCanvasTab,   setActiveCanvasTab]   = useState('tab1');
  const [artifactOpen,      setArtifactOpen]      = useState(false);
  const [artifactFullscreen,setArtifactFullscreen]= useState(false);
  const [canvasSplitMode,   setCanvasSplitMode]   = useState('preview');
  const [sandboxLogs,       setSandboxLogs]       = useState([]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const [timeLeft,       setTimeLeft]       = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [voiceStatus,       setVoiceStatus]       = useState('idle');
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const [ttsSpeed,          setTtsSpeed]          = useState(1.0);
  const mediaRecorderRef       = useRef(null);
  const audioChunksRef         = useRef([]);
  const isContinuousVoiceRef   = useRef(false);
  const audioContextRef        = useRef(null);
  const voiceDetectionLoopRef  = useRef(null);

  const chatEndRef  = useRef(null);
  const [copiedTextId, setCopiedTextId] = useState(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // FIX #7 — always-current sessionId ref for stale async closures
  const activeSessionIdRef = useRef(activeSessionId);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  const themeStyles = THEME_PRESETS[activeTheme] || THEME_PRESETS['cyber'];

  const currentModelMeta = useMemo(() => {
    if (selectedModel === 'open-router') {
      return {
        id: customORModel,
        name: customORModel,
        model: customORModel,
        color: "#bf5af2",
        costPer1k: 0.0002
      };
    }
    return MODEL_MODES[selectedModel] || MODEL_MODES['gunnarz-singularity'];
  }, [selectedModel, customORModel]);

  // ──────────────────────────────────────────
  // 2. DERIVED STATE  (FIX #19 — useMemo)
  // ──────────────────────────────────────────
  const currentSession = useMemo(
    () => chatSessions.find(s => s.id === activeSessionId) || chatSessions[0] || { id: 'fallback', title: 'Default', messages: [] },
    [chatSessions, activeSessionId]
  );

  const filteredMessages = useMemo(() => {
    const msgs = currentSession?.messages || [];
    if (!searchQuery.trim()) return msgs;
    return msgs.filter(msg => getMessageSearchableText(msg.content).toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentSession, searchQuery]);

  const visibleOpenRouterModels = useMemo(() => {
    const base = openRouterModels.length > 0 ? openRouterModels : OPENROUTER_FALLBACK_MODELS;
    const q = openRouterSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(m => {
      const hay = `${m.slug || ''} ${m.name || ''} ${m.provider || ''} ${m.category || ''} ${m.costHint || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [openRouterModels, openRouterSearch]);

  // ──────────────────────────────────────────
  // 3. TOAST SYSTEM  (FIX #14)
  // ──────────────────────────────────────────
  function addToast(type, message) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }

  // ──────────────────────────────────────────
  // 4. DRAG & DROP  (FIX #1)
  // ──────────────────────────────────────────
  function handleDragEnter(e) {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }
  function handleDragOver(e) { e.preventDefault(); }
  function handleDragLeave(e) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) { dragCounter.current = 0; setIsDragging(false); }
  }
  async function handleDrop(e) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) await processUploadedFile(file);
  }

  // ──────────────────────────────────────────
  // 5. SESSION HELPERS
  // ──────────────────────────────────────────

  // FIX #8 — updateSessions accepts value OR updater fn → always uses functional setState
  function updateSessions(sessionsOrUpdater) {
    setChatSessions(prev => {
      const next = typeof sessionsOrUpdater === 'function' ? sessionsOrUpdater(prev) : sessionsOrUpdater;
      if (!isIncognito) safeSetItem('gunnarz_premium_sessions_v4', JSON.stringify(next));
      return next;
    });
  }

  function setupDefaultSession() {
    const id = 'session_' + Date.now();
    const session = {
      id, title: "⚡ Welcome to Singularity",
      messages: [{ role: 'assistant', content:
        `Greetings! I am **${APP_FULL}**, an elite intelligence hub by **Gunnarz**.\n\n### Premium Modules Online:\n* 👁️ **Vision Pro** — live camera or image uploads.\n* 📂 **Document OCR/PDF** — upload files for deep analysis.\n* 💻 **Workspace** — edit HTML, CSS, and JS live.\n* 🗣️ **Voice Loop** — hands-free conversation.\n* 🌍 **Translator** — translate any reply instantly.\n\n*Plug in your Groq API key in Settings to start.*`
      }]
    };
    setChatSessions([session]);
    setActiveSessionId(id);
    if (!isIncognito) safeSetItem('gunnarz_premium_sessions_v4', JSON.stringify([session]));
  }

  function handleNewSession() {
    const id = 'session_' + Date.now();
    updateSessions(prev => {
      const next = [{ id, title: `Session ${prev.length + 1}`, messages: [] }, ...prev];
      return next;
    });
    setActiveSessionId(id);
  }

  // FIX #16 — close sidebar on mobile after selecting session
  function handleSessionSelect(id) {
    setActiveSessionId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleDeleteSession(id, e) {
    e.stopPropagation();
    updateSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const rid = 'session_' + Date.now();
        const reset = [{ id: rid, title: "New Session", messages: [] }];
        setActiveSessionId(rid);
        return reset;
      }
      if (activeSessionId === id) setActiveSessionId(filtered[0].id);
      return filtered;
    });
  }

  function startEditTitle(session, e) {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
  }

  function saveSessionTitle(id) {
    updateSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitleInput.trim() || s.title } : s));
    setEditingSessionId(null);
  }

  function saveKeys(newKeys) {
    setKeys(newKeys);
    safeSetItem('gunnarz_premium_keys_v4', JSON.stringify(newKeys));
  }

  function saveOpenRouterChoice(modelSlug) {
    setCustomORModel(modelSlug);
    safeSetItem('gunnarz_openrouter_model_v4', modelSlug);
  }

  async function loadOpenRouterModels() {
    setOpenRouterStatus("loading");
    try {
      const headers = keys.openrouter ? { Authorization: `Bearer ${keys.openrouter}` } : {};
      const res = await fetch('https://openrouter.ai/api/v1/models?output_modalities=text&sort=most-popular', { headers });
      const data = await res.json();
      const models = Array.isArray(data?.data)
        ? data.data.map(m => ({
            slug: m.id || m.canonical_slug || '',
            name: m.name || m.id || m.canonical_slug || 'Unknown model',
            provider: m.top_provider?.name || m.provider || (m.id || '').split('/')[0] || 'OpenRouter',
            category: (m.architecture?.modality || m.description || 'text').toString().slice(0, 40),
            costHint: m.pricing ? `$${m.pricing.prompt || 0}/M in` : 'Available'
          })).filter(m => m.slug)
        : [];
      setOpenRouterModels(models);
      setOpenRouterStatus(models.length ? `Loaded ${models.length} models` : "No models returned");
    } catch {
      setOpenRouterModels(OPENROUTER_FALLBACK_MODELS);
      setOpenRouterStatus("Using offline model list");
    }
  }

  function chooseModel(modelKey) {
    if (modelKey === 'open-router') {
      setSelectedModel('open-router');
      setModelLibraryOpen(true);
      if (!customORModel && OPENROUTER_FALLBACK_MODELS[0]) {
        saveOpenRouterChoice(OPENROUTER_FALLBACK_MODELS[0].slug);
      }
      return;
    }
    setSelectedModel(modelKey);
    safeSetItem('gunnarz_selected_model_v4', modelKey);
  }

  // ──────────────────────────────────────────
  // 6. OCR, PDF & FILE ENGINE
  // ──────────────────────────────────────────
  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/tesseract.js@v5.1.0/dist/tesseract.min.js';
      s.onload = () => resolve(window.Tesseract);
      s.onerror = () => reject(new Error("Could not load Tesseract."));
      document.head.appendChild(s);
    });
  }

  function loadPdfJS() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      s.onerror = () => reject(new Error("Could not load PDF.js."));
      document.head.appendChild(s);
    });
  }

  async function processOCR(imageSrc, fileName) {
    setIsProcessingFile(true);
    try {
      const Tesseract = await loadTesseract();
      const result    = await Tesseract.recognize(imageSrc, 'eng');
      const payload   = { type: 'document', name: `OCR_${fileName}.txt`, data: `[Extracted Text]:\n${result.data.text}` };
      setAttachments(prev  => [...prev, payload]);
      setPersistentDocs(prev => [...prev, payload]);
    } catch (err) {
      addToast('error', `OCR failed: ${err.message}`);
    } finally { setIsProcessingFile(false); }
  }

  async function processPDF(file) {
    setIsProcessingFile(true);
    try {
      const pdfjsLib = await loadPdfJS();
      const reader   = new FileReader();
      reader.onload  = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf        = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText     = "";
          for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            const page    = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += `--- Page ${i} ---\n${content.items.map(it => it.str).join(" ")}\n\n`;
          }
          const payload = { type: 'document', name: file.name, data: `[PDF Content]:\n${fullText}` };
          setAttachments(prev  => [...prev, payload]);
          setPersistentDocs(prev => [...prev, payload]);
        } catch (err) {
          addToast('error', `PDF parse error: ${err.message}`);
        } finally { setIsProcessingFile(false); }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      addToast('error', 'PDF load failed.'); setIsProcessingFile(false);
    }
  }

  async function processUploadedFile(file) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, { type: 'image', name: file.name, data: ev.target.result }]);
        processOCR(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
      setSelectedModel('vision-pro');
      return;
    }
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return processPDF(file);
    if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
      setIsProcessingFile(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3');
        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST', headers: { Authorization: `Bearer ${keys.groq}` }, body: formData
        });
        const d = await res.json();
        if (d.text) {
          setAttachments(prev => [...prev, { type: 'document', name: `Audio_${file.name}.txt`, data: `[Audio Transcript]:\n${d.text}` }]);
          addToast('success', 'Audio transcribed.');
        }
      } catch (err) {
        addToast('error', 'Audio transcription failed.');
      } finally { setIsProcessingFile(false); }
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const payload = { type: 'document', name: file.name, data: ev.target.result };
      setAttachments(prev  => [...prev, payload]);
      setPersistentDocs(prev => [...prev, payload]);
    };
    reader.readAsText(file);
  }

  // FIX #11 — reset value so same file can be re-uploaded
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) await processUploadedFile(file);
    e.target.value = '';
  }

  function removeAttachment(index) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  // ──────────────────────────────────────────
  // 7. API & CHAT CORE
  // ──────────────────────────────────────────
  async function compressContextIfNecessary(messages) {
    if (messages.length <= 10) return messages;
    const half       = Math.floor(messages.length / 2);
    const toCompress = messages.slice(0, half);
    const remainder  = messages.slice(half);
    setThinkingSteps(prev => [...prev, "Auto-summarizing old turns to preserve context window…"]);
    try {
      const summaryMsgs = [
        { role: "system", content: "Summarize the critical facts of this discussion in 3 dense sentences." },
        ...toCompress.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }))
      ];
      const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: summaryMsgs })
      });
      const data    = await res.json();
      const summary = data.choices[0].message.content;
      return [{ role: 'system', content: `Retained context summary: ${summary}` }, ...remainder];
    } catch { return messages; }
  }

  async function executeGeminiGroundingCall(promptQuery, onChunk) {
    if (!keys.gemini) throw new Error("Gemini API key is required for live web search grounding.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${keys.gemini}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Realtime search query: ${promptQuery}` }] }],
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: "You are Gunnarz AI OS V30. Cite search results clearly." }] }
      })
    });
    if (!response.ok) throw new Error("Gemini grounding fetch failed.");
    const data      = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No grounded response returned.";
    onChunk(replyText);
    return replyText;
  }

  // FIX #8 — memory injected into system prompt
  async function handleGroqCallStream(messages, onChunk, overrideModel) {
    if (!keys.groq && selectedModel !== 'open-router') throw new Error("Missing Groq API Key.");

    const memoryContext = [
      prefMemory.userName      ? `User's name: ${prefMemory.userName}.` : '',
      prefMemory.projectNotes  ? `Active project: ${prefMemory.projectNotes}.` : '',
      prefMemory.longTermFacts.length > 0
        ? `Key facts:\n${prefMemory.longTermFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
        : ''
    ].filter(Boolean).join('\n');

    const systemMsg = {
      role: 'system',
      content: [
        `You are Gunnarz AI OS V30 Singularity, an elite AI assistant exclusively built by Gunnarz.`,
        memoryContext,
        `Format beautifully with markdown. Put executable HTML/CSS/JS code inside \`\`\`html blocks so users can hit Run immediately.`
      ].filter(Boolean).join('\n')
    };

    let url     = 'https://api.groq.com/openai/v1/chat/completions';
    let headers = { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' };
    let model   = overrideModel || MODEL_MODES[selectedModel]?.model || 'llama-3.3-70b-versatile';

    if (selectedModel === 'open-router') {
      if (!keys.openrouter) throw new Error("Missing OpenRouter API key.");
      url     = 'https://openrouter.ai/api/v1/chat/completions';
      headers = { Authorization: `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://gunnarz-ai.netlify.app', 'X-Title': 'Gunnarz AI OS' };
      model   = customORModel;
    }

    const safeMsgs = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({ model, messages: [systemMsg, ...safeMsgs], max_tokens: 3000, temperature: 0.7, stream: true })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || "API connection error.");
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let full      = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunks = decoder.decode(value, { stream: true }).split("\n");
      for (const chunk of chunks) {
        if (chunk.trim().startsWith("data: ") && !chunk.includes("[DONE]")) {
          try {
            const data = JSON.parse(chunk.replace(/^data: /, ""));
            const delta = data.choices[0]?.delta?.content;
            if (delta) { full += delta; onChunk(full); }
          } catch { /* skip malformed SSE frames */ }
        }
      }
    }
    return full;
  }

  function routeToolByPrompt(prompt) {
    const l = prompt.toLowerCase();
    if (l.includes("draw") || l.includes("paint") || l.includes("generate artwork")) return "hf-art";
    if (l.includes("html") || l.includes("sandbox") || l.includes("website") || l.includes("canvas")) return "canvas";
    if (l.includes("search") || l.includes("current info") || l.includes("today") || l.includes("weather") || l.includes("news")) return "gemini-search";
    if (l.includes("ocr") || l.includes("read text") || l.includes("screenshot")) return "ocr";
    return "chat";
  }

  async function generateSilentSessionTitle(sessionId, firstMsg) {
    if (!keys.groq) return;
    try {
      const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "Create a 2-3 word title for this prompt. Return ONLY the title with no quotes." },
            { role: "user", content: firstMsg }
          ]
        })
      });
      const data  = await res.json();
      const title = data.choices?.[0]?.message?.content?.trim();
      if (title) {
        updateSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title } : s));
      }
    } catch { /* silent */ }
  }

  // FIX #6 regeneration + FIX #8 stale closure
  async function handleChatSubmit(e, textOverride = null, isRegeneration = false) {
    if (e) e.preventDefault();
    if (isTyping) return;

    // Capture session synchronously before any awaits
    const sess = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];
    if (!sess) return;

    // FIX #6 — for regeneration, extract last user message instead of using empty input
    let activeText;
    if (isRegeneration) {
      const lastUserMsg = [...(sess.messages || [])].reverse().find(m => m.role === 'user');
      if (!lastUserMsg) return;
      activeText = getMessageSearchableText(lastUserMsg.content);
    } else {
      activeText = textOverride !== null ? String(textOverride) : chatInput;
      if (!activeText.trim() && attachments.length === 0) return;
      setChatInput('');
    }

    setIsTyping(true);
    setStreamedResponse('');

    const routedAction = (toolRoutingActive && !isRegeneration) ? routeToolByPrompt(activeText) : "chat";
    if (toolRoutingActive && !isRegeneration) {
      setThinkingSteps(prev => [...prev, `Tool Router: [${routedAction}]`]);
    }
    if (deepThinking) {
      setThinkingSteps(prev => [...prev, "Analyzing syntax…", "Injecting Gunnarz directives…", "Formulating response…"]);
      await new Promise(r => setTimeout(r, 900));
    }

    // Build payload content
    const hasImages = attachments.some(a => a.type === 'image');
    let payloadContent = activeText;
    if (hasImages) {
      payloadContent = [{ type: "text", text: activeText }];
      attachments.filter(a => a.type !== 'image').forEach(d => (payloadContent[0].text += `\n[${d.name}]:\n${d.data}`));
      attachments.filter(a => a.type === 'image').forEach(img => payloadContent.push({ type: "image_url", image_url: { url: img.data } }));
    } else if (attachments.length || persistentDocs.length) {
      const all = [...attachments, ...persistentDocs];
      payloadContent += all.map(d => `\n\n--- [${d.name}] ---\n${d.data}`).join('');
    }

    const payloadMsg = { role: 'user', content: payloadContent };
    const uiMsg      = { role: 'user', content: activeText, attachments: [...attachments] };
    const isFirst    = sess.messages.length === 0;

    // Determine context messages for API
    let updatedMessages = [];
    if (isRegeneration) {
      const msgs         = sess.messages;
      const lastAsstIdx  = [...msgs].map(m => m.role).lastIndexOf('assistant');
      updatedMessages    = lastAsstIdx >= 0 ? msgs.slice(0, lastAsstIdx) : msgs;
    } else {
      updatedMessages = [...sess.messages, payloadMsg];
      // FIX #8 — functional update avoids stale closure
      updateSessions(prev => prev.map(s =>
        s.id === activeSessionIdRef.current ? { ...s, messages: [...s.messages, uiMsg] } : s
      ));
    }

    const compressedMsgs = await compressContextIfNecessary(updatedMessages);
    setThinkingSteps([]);
    setAttachments([]);

    try {
      let reply = "";
      if (useLiveSearchGrounding || routedAction === "gemini-search") {
        reply = await executeGeminiGroundingCall(activeText, setStreamedResponse);
      } else {
        reply = await handleGroqCallStream(compressedMsgs, setStreamedResponse, hasImages ? MODEL_MODES['vision-pro'].model : null);
      }

      // Auto-open workspace if HTML is in reply
      const htmlMatch = reply.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlMatch?.[1]) {
        const code        = htmlMatch[1];
        const styleMatch  = code.match(/<style>([\s\S]*?)<\/style>/);
        const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
        const tabId       = 'tab_' + Date.now();
        setCanvasTabStates(prev => [...prev, {
          id:   tabId,
          name: `Module_${prev.length + 1}`,
          html: code.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script>[\s\S]*?<\/script>/, ''),
          css:  styleMatch?.[1]  || '',
          js:   scriptMatch?.[1] || ''
        }]);
        setActiveCanvasTab(tabId);
        setSandboxLogs([]);
        setArtifactOpen(true);
      }

      // Token cost estimate
      const tokens = Math.ceil(reply.length / 4) + Math.ceil(activeText.length / 4);
      setTokenCostMeter(prev => ({
        totalTokens: prev.totalTokens + tokens,
        totalCost:   prev.totalCost + (tokens / 1000) * (currentModelMeta?.costPer1k || 0.00015)
      }));

      // FIX #8 — functional update to avoid stale sessions
      if (isRegeneration) {
        updateSessions(prev => prev.map(s => {
          if (s.id !== activeSessionIdRef.current) return s;
          const msgs        = [...s.messages];
          const lastAsstIdx = [...msgs].map(m => m.role).lastIndexOf('assistant');
          if (lastAsstIdx >= 0) msgs[lastAsstIdx] = { role: 'assistant', content: reply };
          else msgs.push({ role: 'assistant', content: reply });
          return { ...s, messages: msgs };
        }));
      } else {
        updateSessions(prev => prev.map(s =>
          s.id === activeSessionIdRef.current
            ? { ...s, messages: [...s.messages, { role: 'assistant', content: reply }] }
            : s
        ));
        if (isFirst) generateSilentSessionTitle(activeSessionIdRef.current, activeText);
      }
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setStreamedResponse('');
      setIsTyping(false);
    }
  }

  // ──────────────────────────────────────────
  // 8. IMAGE GEN & VOICE
  // ──────────────────────────────────────────
  async function handleImageGeneration(e) {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    if (!keys.hf) { addToast('error', "Hugging Face token needed in Settings."); return; }
    const prompt = chatInput;
    setChatInput('');
    setIsTyping(true);
    if (deepThinking) { setThinkingSteps(["Accessing FLUX.1…", "Generating latent vectors…"]); await new Promise(r => setTimeout(r, 800)); }
    try {
      const res = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST", headers: { Authorization: `Bearer ${keys.hf}` }, body: JSON.stringify({ inputs: prompt })
      });
      if (!res.ok) throw new Error("Image generation failed. Check HF token.");
      const imgUrl = URL.createObjectURL(await res.blob());
      updateSessions(prev => prev.map(s =>
        s.id === activeSessionIdRef.current
          ? { ...s, messages: [...s.messages,
              { role: 'user',      content: `🎨 Draw: "${prompt}"` },
              { role: 'assistant', content: `![Generated Art](${imgUrl})` }
            ]}
          : s
      ));
    } catch (err) { addToast('error', err.message); }
    setThinkingSteps([]);
    setIsTyping(false);
  }

  // FIX #3 + FIX #20 — voice with mic level visualizer
  async function startRecordingSequence() {
    try {
      const stream    = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder  = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current   = [];

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const actx     = new AudioCtx();
      audioContextRef.current = actx;
      const source  = actx.createMediaStreamSource(stream);
      const analyser= actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let silenceStart = Date.now();
      let hasSpoken    = false;

      const checkSilence = () => {
        if (recorder.state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        // FIX #20 — update mic level for visualizer
        setMicLevel(Math.min(100, Math.round(avg * 2)));
        if (avg > 10) { hasSpoken = true; silenceStart = Date.now(); }
        else if (hasSpoken && Date.now() - silenceStart > 1800) { recorder.stop(); return; }
        else if (!hasSpoken && Date.now() - silenceStart > 10000) { recorder.stop(); return; }
        voiceDetectionLoopRef.current = requestAnimationFrame(checkSilence);
      };

      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        cancelAnimationFrame(voiceDetectionLoopRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        setMicLevel(0);
        setVoiceStatus('thinking');
        try {
          const fd = new FormData();
          fd.append('file', new Blob(audioChunksRef.current, { type: 'audio/webm' }), 'voice.webm');
          fd.append('model', 'whisper-large-v3');
          const tRes  = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST', headers: { Authorization: `Bearer ${keys.groq}` }, body: fd
          });
          const tData = await tRes.json();
          if (!tData.text?.trim()) throw new Error("Empty audio captured.");

          const sysMsgVoice = { role: 'system', content: `You are Gunnarz AI OS. Reply naturally and briefly (1-2 sentences).` };
          const cRes  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST', headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [sysMsgVoice, { role: 'user', content: tData.text }], max_tokens: 250 })
          });
          const reply = (await cRes.json()).choices[0].message.content;
          // FIX #8 — functional update
          updateSessions(prev => prev.map(s =>
            s.id === activeSessionIdRef.current
              ? { ...s, messages: [...s.messages, { role: 'user', content: tData.text }, { role: 'assistant', content: reply }] }
              : s
          ));
          setVoiceStatus('speaking');
          const utt  = new SpeechSynthesisUtterance(reply);
          utt.rate   = ttsSpeed;
          utt.onend  = () => {
            if (isContinuousVoiceRef.current) { setVoiceStatus('listening'); setTimeout(startRecordingSequence, 500); }
            else setVoiceStatus('idle');
          };
          window.speechSynthesis.speak(utt);
        } catch {
          if (isContinuousVoiceRef.current) { setVoiceStatus('listening'); setTimeout(startRecordingSequence, 500); }
          else setVoiceStatus('idle');
        }
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setVoiceStatus('listening');
      checkSilence();
    } catch (err) { addToast('error', `Mic error: ${err.message}`); setVoiceStatus('idle'); }
  }

  async function handleVoiceToggle() {
    if (!keys.groq) { addToast('error', "Groq key needed for voice."); return; }
    if (voiceStatus === 'idle') startRecordingSequence();
    else if (voiceStatus === 'listening' && mediaRecorderRef.current) mediaRecorderRef.current.stop();
    else if (voiceStatus === 'speaking') { window.speechSynthesis.cancel(); setVoiceStatus('idle'); }
  }

  async function summarizeCurrentChatSession() {
    const sess = currentSession;
    if (!sess?.messages?.length) return;
    setIsTyping(true);
    setThinkingSteps(["Condensing session…"]);
    const summaryPrompt = sess.messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }));
    // Prepend a concise summary instruction without conflicting with the main system msg
    summaryPrompt.unshift({ role: 'user', content: 'Summarize ALL the key decisions, solutions, and code discussed in this session as a bulleted recap.' });
    try {
      const reply = await handleGroqCallStream(summaryPrompt, setStreamedResponse, "llama-3.1-8b-instant");
      updateSessions(prev => prev.map(s =>
        s.id === activeSessionIdRef.current
          ? { ...s, messages: [...s.messages, { role: 'assistant', content: `📝 **Session Recap:**\n\n${reply}` }] }
          : s
      ));
    } catch (err) { addToast('error', `Recap failed: ${err.message}`); }
    finally { setIsTyping(false); setThinkingSteps([]); setStreamedResponse(''); }
  }

  async function executeModelComparison() {
    if (!chatInput.trim() || isTyping) return;
    const prompt = chatInput; setChatInput(''); setIsTyping(true);
    setComparisonActive(true);
    setComparisonReplies({ modelA: 'Generating…', modelB: 'Generating…' });
    const msgs = [{ role: 'user', content: prompt }];
    try {
      await Promise.all([
        handleGroqCallStream(msgs, chunk => setComparisonReplies(p => ({ ...p, modelA: chunk })), MODEL_MODES[comparisonModels.modelA].model),
        handleGroqCallStream(msgs, chunk => setComparisonReplies(p => ({ ...p, modelB: chunk })), MODEL_MODES[comparisonModels.modelB].model)
      ]);
    } catch (err) { addToast('error', `Comparison failed: ${err.message}`); }
    finally { setIsTyping(false); }
  }

  // ──────────────────────────────────────────
  // 9. CANVAS & UTILITIES
  // ──────────────────────────────────────────
  async function toggleCamera() {
    if (isCameraActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setIsCameraActive(false); streamRef.current = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      } catch { addToast('error', "Camera access denied."); }
    }
  }

  function takeSnapshot() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg');
    setAttachments(prev => [...prev, { type: 'image', name: 'Snapshot.jpg', data: b64 }]);
    setSelectedModel('vision-pro');
    processOCR(b64, 'Snapshot.jpg');
  }

  function handleWorkspaceChange(field, text) {
    setCanvasTabStates(prev => prev.map(t => t.id === activeCanvasTab ? { ...t, [field]: text } : t));
  }

  function getActiveTabState() {
    return canvasTabs.find(t => t.id === activeCanvasTab) || canvasTabs[0];
  }

  function compileSandboxFrame() {
    const { css, html, js } = getActiveTabState();
    return `<!DOCTYPE html><html><head><style>${css || ''}</style></head><body>${html || ''}
<script>
  const _log=console.log, _err=console.error;
  console.log=(...a)=>{_log(...a);window.parent.postMessage({type:'CONSOLE_LOG',data:a.join(' ')},'*');};
  console.error=(...a)=>{_err(...a);window.parent.postMessage({type:'CONSOLE_ERROR',data:a.join(' ')},'*');};
  try{${js || ''}}catch(e){console.error(e.message);}
<\/script></body></html>`;
  }

  function downloadSandboxCode() {
    const blob = new Blob([compileSandboxFrame()], { type: "text/html" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "gunnarz_compiled_app.html";
    a.click();
  }

  function runMiniCalculator() {
    try {
      const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, '');
      // eslint-disable-next-line no-new-func
      setCalcResult(String(Function(`"use strict"; return (${sanitized})`)()));
    } catch { setCalcResult("Math Error"); }
  }

  function getMessageSearchableText(content) {
    if (typeof content === 'string')   return content;
    if (Array.isArray(content))        return content.map(i => (typeof i === 'string' ? i : i.text || '')).join(' ');
    return '';
  }

  function toggleIncognitoMode() {
    const next = !isIncognito;
    setIsIncognito(next);
    addToast('info', next ? "Incognito: sessions won't be saved." : "Standard memory mode restored.");
  }

  function handlePinSubmit() {
    if (pinInput === appPin) setAppLocked(false);
    else { addToast('error', "Invalid PIN. Access denied."); setPinInput(''); }
  }

  function setupNewPin() {
    if (pinInput.length === 4) {
      safeSetItem('gunnarz_app_pin', pinInput);
      setAppPin(pinInput);
      setAppLocked(false);
      setPinInput('');
      addToast('success', "PIN saved.");
    } else { addToast('error', "PIN must be 4 digits."); }
  }

  function getSessionStats() {
    const msgs     = currentSession?.messages || [];
    const charCount= msgs.reduce((a, m) => a + (typeof m.content === 'string' ? m.content.length : JSON.stringify(m.content).length), 0);
    return { count: msgs.length, estimatedTokens: Math.ceil(charCount / 4) };
  }

  function toggleStarMessage(content) {
    const text    = getMessageSearchableText(content);
    const isStarred = starredMessages.includes(text);
    const updated = isStarred ? starredMessages.filter(m => m !== text) : [...starredMessages, text];
    setStarredMessages(updated);
    safeSetItem('gunnarz_starred', JSON.stringify(updated));
  }

  function handleAddMemoryFact() {
    if (!newFactInput.trim()) return;
    const updatedFacts  = [...prefMemory.longTermFacts, newFactInput.trim()];
    const updatedMemory = { ...prefMemory, longTermFacts: updatedFacts };
    setPrefMemory(updatedMemory);
    safeSetItem('gunnarz_pref_memory', JSON.stringify(updatedMemory));
    setNewFactInput('');
  }

  function handleClearMemoryFact(idx) {
    const updatedFacts  = prefMemory.longTermFacts.filter((_, i) => i !== idx);
    const updatedMemory = { ...prefMemory, longTermFacts: updatedFacts };
    setPrefMemory(updatedMemory);
    safeSetItem('gunnarz_pref_memory', JSON.stringify(updatedMemory));
  }

  // FIX #9 — save all memory fields, not just facts
  function saveMemoryPanel() {
    safeSetItem('gunnarz_pref_memory', JSON.stringify(prefMemory));
    addToast('success', "Memory saved.");
  }

  function exportChatSessionAsJSON() {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSession, null, 2));
    const a    = document.createElement('a');
    a.href     = data;
    a.download = `GunnarzSession_${currentSession.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function importChatSessionFromJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const sess = JSON.parse(ev.target.result);
        if (sess.id && sess.title && Array.isArray(sess.messages)) {
          const newId = 'imported_' + Date.now();
          sess.id = newId;
          updateSessions(prev => [sess, ...prev]);
          setActiveSessionId(newId);
          addToast('success', "Session imported!");
        } else { addToast('error', "Invalid session JSON format."); }
      } catch { addToast('error', "Parse error. Check file integrity."); }
    };
    reader.readAsText(file);
  }

  function playMessageAloud(text) {
    window.speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate   = ttsSpeed;
    window.speechSynthesis.speak(utt);
  }

  // ──────────────────────────────────────────
  // 10. EFFECTS
  // ──────────────────────────────────────────

  // FIX #2 — Focus timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timeLeft === 0) { setIsTimerRunning(false); addToast('success', '🎯 Focus session complete!'); return; }
    const id = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) { setIsTimerRunning(false); return 0; }
      return prev - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX #3 — Sync continuous voice ref
  useEffect(() => { isContinuousVoiceRef.current = isContinuousVoice; }, [isContinuousVoice]);

  // FIX #4 — Sandbox console message listener
  useEffect(() => {
    const handler = (ev) => {
      if (ev.data?.type === 'CONSOLE_LOG')   setSandboxLogs(p => [...p.slice(-50), { type: 'log',   text: String(ev.data.data) }]);
      if (ev.data?.type === 'CONSOLE_ERROR') setSandboxLogs(p => [...p.slice(-50), { type: 'error', text: String(ev.data.data) }]);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // FIX #5 — Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, streamedResponse]);

  // FIX #6 — Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); document.getElementById('side-search-bar')?.focus(); }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleNewSession(); }
      if (e.key === 'Escape') { setShowSettings(false); setShowMemoryPanel(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mount: load persisted state
  useEffect(() => {
    let envGroq = '', envHf = '';
    try {
      if (typeof process !== 'undefined') {
        envGroq = process.env?.VITE_GROQ_API_KEY || '';
        envHf = process.env?.VITE_HF_TOKEN || '';
      }
    } catch { /* no env */ }

    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }

    const savedKeys = safeGetItem('gunnarz_premium_keys_v4');
    let finalKeys   = { groq: envGroq, hf: envHf, openrouter: '', gemini: '' };
    if (savedKeys) { try { const p = JSON.parse(savedKeys); finalKeys = { ...finalKeys, ...p }; } catch { /* ignore */ } }
    setKeys(finalKeys);

    const savedModel = safeGetItem('gunnarz_selected_model_v4');
    if (savedModel && MODEL_MODES[savedModel]) setSelectedModel(savedModel);

    const savedORModel = safeGetItem('gunnarz_openrouter_model_v4');
    if (savedORModel) setCustomORModel(savedORModel);

    const savedPin = safeGetItem('gunnarz_app_pin');
    if (savedPin) { setAppLocked(true); setAppPin(savedPin); }

    const savedTheme = safeGetItem('gunnarz_app_theme');
    if (savedTheme && THEME_PRESETS[savedTheme]) setActiveTheme(savedTheme);

    const savedMem = safeGetItem('gunnarz_pref_memory');
    if (savedMem) { try { setPrefMemory(JSON.parse(savedMem)); } catch { /* ignore */ } }

    const savedStars = safeGetItem('gunnarz_starred');
    if (savedStars) { try { setStarredMessages(JSON.parse(savedStars)); } catch { /* ignore */ } }

    const savedSessions = safeGetItem('gunnarz_premium_sessions_v4');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const cleansed = parsed.map(s => ({
          ...s,
          title: String(s.title || "Session"),
          messages: (s.messages || []).map(m => ({
            ...m,
            content: (typeof m.content === 'object' && !Array.isArray(m.content) && m.content !== null)
              ? JSON.stringify(m.content)
              : m.content,
            attachments: Array.isArray(m.attachments) ? m.attachments : []
          }))
        }));
        setChatSessions(cleansed);
        if (cleansed.length > 0) setActiveSessionId(cleansed[0].id);
      } catch { setupDefaultSession(); }
    } else { setupDefaultSession(); }

    loadOpenRouterModels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    safeSetItem('gunnarz_selected_model_v4', selectedModel);
    if (selectedModel === 'open-router') {
      safeSetItem('gunnarz_openrouter_model_v4', customORModel);
    }
  }, [selectedModel, customORModel]);

  // ──────────────────────────────────────────
  // 11. RENDER HELPERS
  // ──────────────────────────────────────────

  // FIX #17 — theme-aware code blocks and headings
  function renderFormattedMessage(content, msgId) {
    if (!content) return null;
    const { accentHex, codeBlockBg, codeBlockBorder, codeHeaderBg, codeText } = themeStyles;

    if (Array.isArray(content)) {
      return content.map((item, idx) => {
        if (typeof item === 'string')   return <span key={idx}>{renderFormattedMessage(item, `${msgId}-${idx}`)}</span>;
        if (item.type === 'text')       return <span key={idx}>{renderFormattedMessage(item.text, `${msgId}-${idx}`)}</span>;
        if (item.type === 'image_url')  return (
          <div key={idx} className="mt-3 rounded-lg overflow-hidden border border-white/20 max-h-72">
            <img src={item.image_url.url} alt="Vision context" className="max-h-72 object-contain" />
          </div>
        );
        return null;
      });
    }

    if (typeof content === 'object') {
      return <pre className="text-xs text-red-400 overflow-auto bg-black p-2 rounded">{JSON.stringify(content, null, 2)}</pre>;
    }

    return content.split(/(```[\s\S]*?```)/g).map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match    = part.match(/```([\w-]*)\n?([\s\S]*?)```/);
        const code     = match ? match[2] : part.slice(3, -3);
        const language = match ? match[1].toLowerCase() : '';
        const isHTML   = language === 'html' || code.includes('<html>') || code.includes('<style>');
        const blockId  = `${msgId}-code-${idx}`;

        return (
          <div key={idx} className={`my-3 rounded-lg overflow-hidden border ${codeBlockBg} ${codeBlockBorder}`}>
            <div className={`flex justify-between items-center px-3 py-1.5 text-xs text-gray-400 ${codeHeaderBg}`}>
              <span className={`uppercase font-bold text-[11px] ${codeText}`}>{language || 'CODE'}</span>
              <div className="flex gap-2 items-center">
                <button onClick={() => { navigator.clipboard.writeText(code); setCopiedTextId(blockId); setTimeout(() => setCopiedTextId(null), 2000); }}
                  className="hover:text-white flex items-center gap-1">
                  {copiedTextId === blockId ? <CheckCheck size={13} className={codeText}/> : <Copy size={13}/>}
                </button>
                {isHTML && (
                  <button onClick={() => { handleWorkspaceChange('html', code); setArtifactOpen(true); }}
                    className={`font-bold ml-1 flex items-center gap-1 hover:opacity-75 ${codeText}`}>
                    <Play size={13}/> Run
                  </button>
                )}
              </div>
            </div>
            <pre className={`p-3 overflow-x-auto text-xs text-gray-300 font-mono ${codeBlockBg}`}><code>{code}</code></pre>
          </div>
        );
      }

      let html = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*?)$/gm, `<h3 style="color:${accentHex}" class="text-sm font-bold mt-3 mb-1">$1</h3>`)
        .replace(/^## (.*?)$/gm,  `<h2 style="color:${accentHex}" class="text-base font-bold mt-4 mb-2">$1</h2>`)
        .replace(/^- (.*?)$/gm,   `<li class="ml-4 list-disc">$1</li>`)
        .replace(/\[ \]/g, `<input type="checkbox" disabled class="mr-1 accent-[${accentHex}]" />`)
        .replace(/\[x\]/g, `<input type="checkbox" checked disabled class="mr-1 accent-[${accentHex}]" />`);

      // Table detection
      if (html.includes('|')) {
        const rows = html.split('\n').filter(r => r.trim().startsWith('|'));
        if (rows.length > 1) {
          const table = `<div class="overflow-x-auto my-3"><table class="min-w-full text-xs border border-gray-700 rounded">` +
            rows.map((row, rIdx) => {
              if (row.includes('---')) return '';
              const cols     = row.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);
              const tag      = rIdx === 0 ? 'th' : 'td';
              const rowClass = rIdx === 0 ? 'bg-gray-900 font-bold' : rIdx % 2 ? 'bg-black/10' : '';
              return `<tr class="${rowClass}">${cols.map(c => `<${tag} class="p-2 border border-gray-700">${c.trim()}</${tag}>`).join('')}</tr>`;
            }).join('') + `</table></div>`;
          html = html.replace(rows.join('\n'), table);
        }
      }

      // Inline image detection
      if (html.includes("![Generated Art]")) {
        const imgUrl = html.match(/\((.*?)\)/)?.[1] || "";
        return (
          <div key={idx}>
            <div dangerouslySetInnerHTML={{ __html: html.replace(/!\[Generated Art\]\(.*?\)/g, '') }} />
            {imgUrl && <img src={imgUrl} alt="Generated Art" className="mt-3 rounded-lg border border-white/20 max-h-80" />}
          </div>
        );
      }
      return <div key={idx} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  // ──────────────────────────────────────────
  // 12. LOCK SCREEN
  // ──────────────────────────────────────────
  if (appLocked) {
    return (
      <div className="min-h-screen bg-[#03030b] flex items-center justify-center p-4 text-center font-sans">
        <div className="bg-[#0c0c1f] border border-[#00ffcc]/30 p-8 rounded-3xl w-full max-w-sm shadow-2xl space-y-6">
          <Key className="text-[#00ffcc] animate-pulse mx-auto" size={48}/>
          <h2 className="text-[#00ffcc] font-black text-xl uppercase tracking-widest">{APP_FULL}</h2>
          <p className="text-xs text-gray-400">Enter your 4-digit PIN to unlock this workspace.</p>
          <input type="password" maxLength={4} value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            placeholder="PIN Code"
            className="w-full bg-[#050511] border border-[#1e1b4b] rounded-xl p-3 text-center text-white tracking-widest font-black outline-none focus:border-[#00ffcc]"/>
          <button onClick={handlePinSubmit} className="w-full bg-[#00ffcc] text-black font-bold py-3 rounded-xl">Unlock</button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // 13. MAIN RENDER
  // ──────────────────────────────────────────
  return (
    // FIX #1 — drag events on root div
    <div
      className={`flex h-screen overflow-hidden font-sans transition-colors ${themeStyles.bg}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {/* FIX #14 — Toast container */}
      <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl pointer-events-auto flex items-center gap-2 border ${
            t.type === 'error'   ? 'bg-red-900/90 border-red-500 text-red-200' :
            t.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' :
            'bg-[#151532] border-[#3a3a60] text-gray-200'
          }`}>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="opacity-50 hover:opacity-100"><X size={12}/></button>
          </div>
        ))}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-[#00ffcc]/10 backdrop-blur border-4 border-[#00ffcc] border-dashed z-50 flex flex-col items-center justify-center text-center pointer-events-none">
          <Paperclip size={64} className="text-[#00ffcc] animate-bounce mb-3"/>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Drop Your File Here</h2>
          <p className="text-xs text-gray-300 mt-1">PDFs, Images, TXT, CSV, JSON, Audio</p>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`border-r flex flex-col transition-all duration-300 z-30 shrink-0 ${sidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden'} ${themeStyles.sidebar}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className={themeStyles.accent}/>
            <span className="font-extrabold text-xs tracking-wider uppercase">Singularity OS</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleNewSession} className="p-1.5 rounded-lg bg-black/30 border border-white/10 hover:border-white/30 text-white" title="New Chat (Ctrl+N)"><Plus size={14}/></button>
            <button onClick={() => {
              const themes = Object.keys(THEME_PRESETS);
              const next   = themes[(themes.indexOf(activeTheme) + 1) % themes.length];
              setActiveTheme(next);
              safeSetItem('gunnarz_app_theme', next);
            }} className="p-1.5 rounded-lg bg-black/30 border border-white/10 hover:border-white/30 text-white" title="Cycle theme"><Palette size={14}/></button>
          </div>
        </div>

        {/* FIX #2 — Timer actually ticks now */}
        <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-black/30 to-black/10 border border-white/10 text-white">
          <div className={`flex items-center gap-2 mb-2 ${themeStyles.accent}`}><Activity size={14}/><span className="text-[10px] font-black uppercase">Focus Timer</span></div>
          <div className={`text-2xl font-mono text-center mb-3 ${timeLeft === 0 ? 'text-red-400' : ''}`}>{formatTime(timeLeft)}</div>
          <div className="flex gap-2">
            <button onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${isTimerRunning ? 'bg-red-500/20 text-red-400' : themeStyles.button}`}>
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}
              className="px-3 rounded-lg bg-black/30 text-gray-400 hover:text-white flex items-center justify-center">
              <RotateCcw size={14}/>
            </button>
          </div>
        </div>

        {/* Search — Ctrl+F shortcut hint */}
        <div className="px-3 mt-4 relative">
          <Search size={14} className="absolute left-6 top-3 text-gray-400"/>
          <input id="side-search-bar" type="text" placeholder="Search messages… (Ctrl+F)"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none border ${themeStyles.inputBg} focus:border-white/30`}/>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chatSessions.map(session => (
            <div key={session.id}
              onClick={() => handleSessionSelect(session.id)}
              className={`group relative p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                session.id === activeSessionId
                  ? `border-white/20 ${themeStyles.card} text-white`
                  : 'border-transparent hover:border-white/10 text-gray-400'
              }`}>
              <MessageSquare size={14} className={session.id === activeSessionId ? themeStyles.accent : ''}/>
              <div className="flex-1 truncate text-xs">
                {editingSessionId === session.id
                  ? <input type="text" value={editTitleInput} onChange={e => setEditTitleInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveSessionTitle(session.id)}
                      onClick={e => e.stopPropagation()}
                      className="bg-black text-white px-1 w-full outline-none border border-white/30" autoFocus/>
                  : <span>{String(session.title)}</span>
                }
              </div>
              <div className="hidden group-hover:flex items-center gap-1">
                {editingSessionId === session.id
                  ? <button onClick={e => { e.stopPropagation(); saveSessionTitle(session.id); }} className={themeStyles.accent}><Check size={12}/></button>
                  : <button onClick={(e) => startEditTitle(session, e)} className="hover:text-white"><Edit3 size={12}/></button>
                }
                <button onClick={(e) => handleDeleteSession(session.id, e)} className="text-red-400"><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Export / Import */}
        <div className="p-3 border-t border-white/10 flex gap-2">
          <button onClick={exportChatSessionAsJSON} className="flex-1 py-1.5 rounded bg-black/30 text-[10px] text-gray-400 font-bold uppercase hover:bg-black/50 flex items-center justify-center gap-1">
            <Download size={10}/> Export
          </button>
          <label className="flex-1 py-1.5 rounded bg-black/30 text-[10px] text-gray-400 font-bold uppercase hover:bg-black/50 flex items-center justify-center gap-1 cursor-pointer">
            <Upload size={10}/> Import
            <input type="file" accept=".json" onChange={importChatSessionFromJSON} className="hidden"/>
          </label>
        </div>

        {starredMessages.length > 0 && (
          <div className="p-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">⭐ Starred</span>
            <div className="max-h-24 overflow-y-auto space-y-1.5">
              {starredMessages.map((msg, i) => (
                <div key={i} onClick={() => { navigator.clipboard.writeText(msg); addToast('success', 'Copied!'); }}
                  className="p-2 rounded bg-black/40 border border-white/5 text-[10px] text-gray-400 truncate hover:text-white cursor-pointer">
                  {msg.slice(0, 50)}…
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden h-full relative">

        {/* Header */}
        <header className={`p-3 border-b flex justify-between items-center z-20 ${themeStyles.header}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 bg-black/30 rounded-lg ${themeStyles.accent}`}><PanelLeftOpen size={16}/></button>
            <span className={`font-black text-sm text-transparent bg-clip-text bg-gradient-to-r ${activeTheme === 'neon' ? 'from-[#d946ef] to-[#a21caf]' : 'from-[#00ffcc] to-[#bf5af2]'}`}>{APP_FULL}</span>
            <span className="hidden sm:inline-flex text-[9px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded font-black uppercase truncate max-w-[180px]">
              {selectedModel === 'open-router' ? `Open Suite • ${customORModel}` : MODEL_MODES[selectedModel]?.name}
            </span>
            {isIncognito && <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded font-black uppercase">Incognito</span>}
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={summarizeCurrentChatSession} className="p-1.5 bg-black/30 hover:text-white text-gray-400 rounded-lg text-xs font-bold hidden sm:block" title="Summarize session">Recap</button>
            <button onClick={() => setComparisonActive(!comparisonActive)}
              className={`p-1.5 rounded-lg text-xs font-bold border ${comparisonActive ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}>
              Compare
            </button>
            <button onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className={`p-1.5 rounded-lg text-xs font-bold border ${showMemoryPanel ? `border-white/30 ${themeStyles.accent}` : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}>
              <Database size={14}/>
            </button>
            <select value={selectedModel} onChange={e => chooseModel(e.target.value)}
              className="hidden sm:block bg-black/30 border border-white/10 text-xs text-white rounded-lg px-2 py-1.5 outline-none">
              {Object.keys(MODEL_MODES).map(k => <option key={k} value={k}>{MODEL_MODES[k].name}</option>)}
            </select>
            {selectedModel === 'open-router' && (
              <div className="hidden md:flex items-center gap-2">
                <input type="text" value={customORModel} onChange={e => saveOpenRouterChoice(e.target.value)} placeholder="model-slug"
                  className="bg-black text-[10px] text-white px-2 py-1.5 rounded-lg border border-white/10 w-44"/>
                <button onClick={() => setModelLibraryOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#bf5af2]/15 border border-[#bf5af2]/30 text-[#e9d5ff]">
                  Browse
                </button>
              </div>
            )}
            <button onClick={() => setArtifactOpen(!artifactOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${artifactOpen ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}>
              <LayoutTemplate size={14}/> Workspace
            </button>
            <button onClick={() => setModelLibraryOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 bg-black/30 border-white/10 text-gray-400 hover:text-white">
              <Search size={14}/> Models
            </button>
            {/* FIX #10 — settings uses dedicated state, not model slot */}
            <button onClick={() => setShowSettings(true)} className="p-1.5 bg-black/30 rounded-lg text-gray-400 hover:text-white"><Settings size={16}/></button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">

          {/* ── CHAT PANEL ── */}
          <div className={`flex-1 flex flex-col relative ${artifactFullscreen ? 'hidden' : 'flex'}`}>

            {/* Prompt templates */}
            <div className="p-2 border-b border-white/10 flex gap-1.5 overflow-x-auto bg-black/20">
              {PROMPT_TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setChatInput(t.prompt)}
                  className="px-2.5 py-1 bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-lg text-[10px] tracking-wide shrink-0">
                  {t.label}
                </button>
              ))}
            </div>

            {comparisonActive ? (
              /* ── Comparison view ── */
              <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-y-auto">
                {['modelA','modelB'].map(key => (
                  <div key={key} className="flex flex-col bg-black/40 rounded-2xl border border-white/10 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold ${key === 'modelA' ? themeStyles.accent : 'text-purple-400'}`}>Model {key === 'modelA' ? 'A' : 'B'}</span>
                      <select value={comparisonModels[key]} onChange={e => setComparisonModels(p => ({ ...p, [key]: e.target.value }))}
                        className="bg-transparent text-xs text-white outline-none">
                        {Object.keys(MODEL_MODES).map(k => <option key={k} value={k} className="bg-black">{MODEL_MODES[k].name}</option>)}
                      </select>
                    </div>
                    <div className={`flex-1 overflow-y-auto text-sm leading-relaxed ${fontSize}`}>
                      {renderFormattedMessage(comparisonReplies[key], `comp-${key}`)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Normal chat view ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {isCameraActive && (
                  <div className="relative rounded-xl overflow-hidden border border-red-500/50 bg-black">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover"/>
                    <button onClick={takeSnapshot} className="absolute bottom-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Scan size={14}/> Capture
                    </button>
                  </div>
                )}

                {/* FIX #15 — empty state for new sessions */}
                {filteredMessages.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center text-center py-16 space-y-5 opacity-80">
                    <Sparkles size={52} className={`${themeStyles.accent} opacity-40`}/>
                    <h2 className="font-black text-xl text-white">Singularity Ready</h2>
                    <p className="text-gray-500 text-sm max-w-xs">Ask anything, upload a file, generate art, or start a voice conversation. Plug in your Groq key in Settings to begin.</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {PROMPT_TEMPLATES.map((t, i) => (
                        <button key={i} onClick={() => setChatInput(t.prompt)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border bg-black/20 hover:bg-black/40 ${themeStyles.accent} border-white/10`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-4 border relative ${fontSize} ${msg.role === 'user' ? themeStyles.msgUserBg : themeStyles.msgAiBg}`}>
                      {msg.attachments?.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {msg.attachments.map((att, ai) => (
                            att.type === 'image'
                              ? <img key={ai} src={att.data} alt="Upload" className="h-12 w-12 object-cover rounded border border-white/20"/>
                              : <div key={ai} className="bg-black/50 text-xs px-2 py-1 rounded text-purple-300"><FileText size={12} className="inline mr-1"/>{att.name}</div>
                          ))}
                        </div>
                      )}

                      {renderFormattedMessage(msg.content, `msg-${i}`)}

                      {msg.role === 'assistant' && (
                        <div className="mt-3 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-2 items-center">
                            <button onClick={() => playMessageAloud(typeof msg.content === 'string' ? msg.content : getMessageSearchableText(msg.content))}
                              className="text-gray-400 hover:text-white" title="Read aloud"><Volume2 size={13}/></button>
                            <button onClick={() => toggleStarMessage(msg.content)}
                              className={`hover:text-amber-400 ${starredMessages.includes(getMessageSearchableText(msg.content)) ? 'text-amber-400' : 'text-gray-400'}`}><Star size={13}/></button>
                            <button onClick={() => handleChatSubmit(null, null, true)}
                              className="text-gray-400 hover:text-blue-400" title="Regenerate"><RefreshCw size={13}/></button>
                            <div className="flex items-center gap-1">
                              <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                                className="bg-black/50 border border-white/10 text-[9px] text-gray-400 rounded outline-none py-0.5 px-1">
                                {TRANSLATION_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                              <button onClick={() => handleChatSubmit(null, `Translate into ${targetLang}:\n\n${msg.content}`)}
                                className="text-gray-400 hover:text-purple-400"><Languages size={13}/></button>
                            </div>
                            <button onClick={() => handleChatSubmit(null, `Give me a simple ELI5 analogy of: ${msg.content}`)}
                              className="text-[10px] bg-black/40 text-gray-300 px-2 py-0.5 rounded hover:bg-white hover:text-black font-bold">ELI5</button>
                            <button onClick={() => handleChatSubmit(null, `Convert this answer into runnable HTML/CSS/JS: ${msg.content}`)}
                              className="text-[10px] bg-black/40 text-gray-300 px-2 py-0.5 rounded hover:bg-purple-500 hover:text-white font-bold">Run</button>
                          </div>
                          <span className="text-[9px] text-gray-600 uppercase tracking-widest hidden sm:block">GUNNARZ</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* FIX #13 — thinking steps actually rendered */}
                {isTyping && thinkingSteps.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-xl p-3 bg-black/40 border border-purple-500/30 space-y-1.5">
                      {thinkingSteps.map((step, si) => (
                        <div key={si} className="flex items-center gap-2 text-[10px] text-purple-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0"/>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && streamedResponse && (
                  <div className="flex justify-start">
                    <div className={`max-w-[85%] rounded-xl p-4 border ${themeStyles.msgAiBg} ${fontSize}`}>
                      {renderFormattedMessage(streamedResponse, 'stream')}
                    </div>
                  </div>
                )}

                {isTyping && !streamedResponse && thinkingSteps.length === 0 && (
                  <div className={`flex items-center gap-2 text-xs ${themeStyles.accent}`}>
                    <BrainCircuit size={14} className="animate-spin"/> Thinking…
                  </div>
                )}

                <div ref={chatEndRef}/>
              </div>
            )}

            {/* Persistent doc banner */}
            {persistentDocs.length > 0 && (
              <div className="px-4 py-1.5 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Knowledge attached: {persistentDocs.map(d => d.name).join(', ')}</span>
                <button onClick={() => setPersistentDocs([])} className="text-xs text-red-400 font-bold uppercase hover:text-red-300">Clear</button>
              </div>
            )}

            {/* Attachment tray */}
            {attachments.length > 0 && (
              <div className="p-2 bg-black/50 border-t border-white/10 flex gap-2 overflow-x-auto">
                {attachments.map((att, i) => (
                  <div key={i} className="relative bg-black/60 rounded p-1 shrink-0">
                    {att.type === 'image'
                      ? <img src={att.data} className="h-10 w-10 object-cover rounded" alt="attach"/>
                      : <div className="text-[10px] px-2 py-1 text-purple-300">{att.name.slice(0, 12)}</div>}
                    <button onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestion chips */}
            {!isTyping && filteredMessages.length > 0 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-black/10">
                {["Summarize the code", "Explain in more detail", "Write 3 quiz questions"].map((s, si) => (
                  <button key={si} onClick={() => handleChatSubmit(null, s)}
                    className={`px-3 py-1 bg-black/30 hover:bg-white/10 text-xs border border-white/10 rounded-full shrink-0 font-semibold ${themeStyles.accent}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className={`p-3 border-t border-white/10 ${themeStyles.footerBg}`}>
              <div className="flex gap-2 items-center">
                <button onClick={toggleCamera}
                  className={`p-3 rounded-xl border ${isCameraActive ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}>
                  <Camera size={18}/>
                </button>
                <label className="p-3 rounded-xl bg-black/30 border border-white/10 text-gray-400 hover:text-white cursor-pointer">
                  <input type="file" accept="image/*,.txt,.pdf,.mp3,.wav" onChange={handleFileUpload} className="hidden"/>
                  <Paperclip size={18}/>
                </label>
                <form onSubmit={comparisonActive ? executeModelComparison : handleChatSubmit} className="flex-1 relative">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    disabled={isProcessingFile}
                    placeholder={isProcessingFile ? "Extracting file…" : comparisonActive ? "Enter prompt to compare…" : "Ask Singularity… (Ctrl+Enter to send)"}
                    className={`w-full rounded-xl py-3 px-4 text-sm text-white outline-none border ${themeStyles.inputBg} focus:border-white/30`}/>
                  <button type="submit" disabled={isProcessingFile}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg ${themeStyles.accent} bg-white/10 hover:bg-white/20`}>
                    <Send size={16}/>
                  </button>
                </form>
                <button onClick={handleImageGeneration} className="p-3 rounded-xl bg-black/30 border border-white/10 text-gray-400 hover:text-purple-400" title="Generate Art">
                  <ImageIcon size={18}/>
                </button>
              </div>
            </div>
          </div>

          {/* ── WORKSPACE CANVAS ── */}
          {artifactOpen && (
            <div className={`${artifactFullscreen ? 'w-full' : 'w-full md:w-[45vw] absolute md:relative right-0'} flex flex-col bg-[#070716] border-l border-white/10 z-20`}>
              {/* Tab bar */}
              <div className="p-1 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex gap-1 overflow-x-auto">
                  {canvasTabs.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveCanvasTab(tab.id); setSandboxLogs([]); }}
                      className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${activeCanvasTab === tab.id ? `bg-white/10 ${themeStyles.accent}` : 'text-gray-500'}`}>
                      {tab.name}
                    </button>
                  ))}
                </div>
                <button onClick={() => {
                  const id = 'tab_' + Date.now();
                  setCanvasTabStates(prev => [...prev, { id, name: `Module_${prev.length + 1}`, html: '<h1>Empty</h1>', css: '', js: '' }]);
                }} className={`p-1 bg-black/40 rounded ${themeStyles.accent}`}><Plus size={12}/></button>
              </div>

              {/* Mode bar */}
              <div className="flex justify-between bg-black/60 p-2 border-b border-white/10">
                <div className="flex bg-black/40 rounded-lg p-1 gap-1">
                  {['preview','split','html','css','js'].map(mode => (
                    <button key={mode} onClick={() => setCanvasSplitMode(mode)}
                      className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${canvasSplitMode === mode ? `bg-white/10 ${themeStyles.accent}` : 'text-gray-500'}`}>
                      {mode === 'preview' ? <><MonitorPlay size={13}/> Preview</> : mode.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={downloadSandboxCode} className="text-gray-400 hover:text-white p-1"><Download size={14}/></button>
                  <button onClick={() => setArtifactFullscreen(!artifactFullscreen)} className="text-gray-400 hover:text-white p-1">{artifactFullscreen ? <Minimize size={14}/> : <Maximize size={14}/>}</button>
                  <button onClick={() => setArtifactOpen(false)} className="text-red-400 hover:bg-red-500/20 p-1 rounded"><X size={16}/></button>
                </div>
              </div>

              <div className="flex-1 flex flex-col relative overflow-hidden">
                {canvasSplitMode === 'preview' ? (
                  <iframe srcDoc={compileSandboxFrame()} sandbox="allow-scripts allow-modals allow-popups" className="w-full flex-1 border-none bg-white"/>
                ) : canvasSplitMode === 'split' ? (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
                    <div className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
                      <div className="px-3 py-2 bg-black/40 border-b border-white/10 text-[10px] font-black uppercase text-gray-400">HTML / CSS / JS</div>
                      <div className="grid grid-rows-3 flex-1 min-h-0 gap-0">
                        {['html','css','js'].map(field => (
                          <textarea key={field} value={getActiveTabState()[field] || ''}
                            onChange={e => handleWorkspaceChange(field, e.target.value)}
                            placeholder={field.toUpperCase()}
                            className="w-full min-h-0 bg-[#0a0a1a] text-gray-200 font-mono text-[12px] p-3 outline-none resize-none border-b border-white/10"
                            spellCheck="false"/>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col min-h-0">
                      <div className="px-3 py-2 bg-black/40 border-b border-white/10 text-[10px] font-black uppercase text-gray-400 flex items-center justify-between">
                        <span>Preview + Console</span>
                        <button onClick={downloadSandboxCode} className="text-gray-400 hover:text-white"><Download size={13}/></button>
                      </div>
                      <iframe srcDoc={compileSandboxFrame()} sandbox="allow-scripts allow-modals allow-popups" className="w-full flex-1 border-none bg-white"/>
                      <div className="h-28 bg-[#03030b] border-t border-white/10 p-2 overflow-y-auto font-mono text-[10px] text-gray-400">
                        <span className={`font-bold block mb-1 ${themeStyles.accent}`}>RUNTIME CONSOLE:</span>
                        {sandboxLogs.length === 0
                          ? <span className="text-gray-700">No output yet. Run some JS.</span>
                          : sandboxLogs.map((log, li) => (
                            <div key={li} className={log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>
                              [{log.type.toUpperCase()}] {log.text}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea value={getActiveTabState()[canvasSplitMode] || ''}
                    onChange={e => handleWorkspaceChange(canvasSplitMode, e.target.value)}
                    className="w-full flex-1 bg-[#0a0a1a] text-gray-300 font-mono text-sm p-4 outline-none resize-none"
                    spellCheck="false"/>
                )}

                {/* FIX #4 — Console log output actually captured now */}
                {canvasSplitMode !== 'split' && (
                  <div className="h-24 bg-[#03030b] border-t border-white/10 p-2 overflow-y-auto font-mono text-[10px] text-gray-400">
                    <span className={`font-bold block mb-1 ${themeStyles.accent}`}>RUNTIME CONSOLE:</span>
                    {sandboxLogs.length === 0
                      ? <span className="text-gray-700">No output yet. Run some JS.</span>
                      : sandboxLogs.map((log, li) => (
                        <div key={li} className={log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>
                          [{log.type.toUpperCase()}] {log.text}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile dock */}
        <div className="md:hidden fixed left-3 right-3 bottom-20 z-40">
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/80 backdrop-blur px-2 py-2 shadow-2xl flex items-center justify-between">
            {[
              { key: 'chat', label: 'Chat', icon: MessageSquare, action: () => { setArtifactOpen(false); setShowSettings(false); setModelLibraryOpen(false); setShowMemoryPanel(false); } },
              { key: 'canvas', label: 'Canvas', icon: LayoutTemplate, action: () => setArtifactOpen(true) },
              { key: 'models', label: 'Models', icon: Search, action: () => setModelLibraryOpen(true) },
              { key: 'settings', label: 'Settings', icon: Settings, action: () => setShowSettings(true) },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={item.action} className="flex-1 flex flex-col items-center gap-1 py-2 text-[10px] text-gray-400 hover:text-white">
                  <Icon size={15}/>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── VOICE BAR ── */}
        <div className={`p-3 border-t border-white/10 flex justify-between items-center z-30 ${themeStyles.footerBg}`}>
          <div className="flex items-center gap-3">
            <Volume2 size={16} className={themeStyles.accent}/>
            <span className="text-[10px] uppercase font-bold text-gray-400 hidden sm:block">Voice Loop</span>
            <button onClick={() => setIsContinuousVoice(!isContinuousVoice)}
              className={`relative h-5 w-9 rounded-full transition-colors ${isContinuousVoice ? 'bg-[#00ffcc]' : 'bg-gray-600'}`}>
              <span className={`block h-3.5 w-3.5 mt-0.5 rounded-full bg-white transition-transform ${isContinuousVoice ? 'translate-x-4' : 'translate-x-1'}`}/>
            </button>

            {/* FIX #20 — Mic level visualizer */}
            {voiceStatus === 'listening' && (
              <div className="flex gap-0.5 items-end h-4 ml-1">
                {[0,20,40,60,80].map(threshold => (
                  <div key={threshold}
                    className="w-1 rounded-full bg-red-400 transition-all duration-75"
                    style={{ height: `${Math.max(3, micLevel > threshold ? Math.min(16, micLevel - threshold + 3) : 3)}px` }}/>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleVoiceToggle}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${
              voiceStatus === 'listening' ? 'bg-red-500 text-white animate-pulse' : themeStyles.button
            }`}>
            <Mic size={14}/>
            {voiceStatus === 'listening' ? 'Stop' : voiceStatus === 'thinking' ? 'Thinking…' : voiceStatus === 'speaking' ? 'Speaking…' : 'Voice Sync'}
          </button>
        </div>

        {/* ── MODEL LIBRARY ── */}
        {modelLibraryOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-50 p-4">
            <div className="bg-[#0c0c1f] border border-white/20 p-5 rounded-2xl w-full max-w-4xl h-[88vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h2 className={`font-bold text-sm uppercase tracking-widest ${themeStyles.accent}`}>Model Library</h2>
                  <p className="text-[10px] text-gray-500 mt-1">{openRouterStatus}</p>
                </div>
                <button onClick={() => setModelLibraryOpen(false)} className="text-red-400"><X size={18}/></button>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={openRouterSearch}
                  onChange={e => setOpenRouterSearch(e.target.value)}
                  placeholder="Search OpenRouter models…"
                  className="flex-1 min-w-[220px] bg-[#050511] border border-white/10 p-3 rounded-xl text-white text-xs outline-none focus:border-white/30"
                />
                <button onClick={loadOpenRouterModels} className={`px-3 py-2 rounded-xl text-xs font-bold ${themeStyles.button}`}>
                  Refresh OpenRouter
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-0 flex-1">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Built-in Modes</div>
                  <div className="space-y-1.5">
                    {Object.keys(MODEL_MODES).map(k => (
                      <button key={k} onClick={() => chooseModel(k)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between ${selectedModel === k ? `border-white/20 ${themeStyles.card} text-white` : 'border-transparent hover:border-white/10 text-gray-400'}`}>
                        <span>{MODEL_MODES[k].name}</span>
                        <span className="text-[10px] opacity-70">{k === 'open-router' ? 'Suite' : 'Local'}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Open Suite Slug</div>
                  <input
                    type="text"
                    value={customORModel}
                    onChange={e => saveOpenRouterChoice(e.target.value)}
                    placeholder="openrouter/model-slug"
                    className="w-full bg-[#050511] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-white/30"
                  />
                  <button onClick={() => chooseModel('open-router')} className={`mt-2 w-full rounded-xl px-3 py-2 text-xs font-bold ${themeStyles.button}`}>
                    Use Open Suite
                  </button>
                </div>

                <div className="bg-black/25 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">All OpenRouter models</div>
                      <div className="text-[10px] text-gray-500">Tap one to load it into the Open Suite.</div>
                    </div>
                    <div className="text-[10px] text-gray-500">{visibleOpenRouterModels.length} results</div>
                  </div>
                  <div className="overflow-y-auto p-3 grid grid-cols-1 gap-2">
                    {visibleOpenRouterModels.map((m, idx) => (
                      <button
                        key={`${m.slug}-${idx}`}
                        onClick={() => {
                          chooseModel('open-router');
                          saveOpenRouterChoice(m.slug);
                          setSelectedModel('open-router');
                          setModelLibraryOpen(false);
                        }}
                        className={`text-left p-3 rounded-2xl border transition-all ${customORModel === m.slug ? `border-[#bf5af2]/50 bg-[#bf5af2]/10 text-white` : 'border-white/10 bg-black/30 text-gray-300 hover:border-white/20 hover:bg-black/40'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{m.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">{m.slug}</div>
                          </div>
                          <div className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">
                            {m.provider}
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between gap-2">
                          <span className="truncate">{m.category}</span>
                          <span>{m.costHint}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MEMORY PANEL ── */}
        {showMemoryPanel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-50 p-4">
            <div className="bg-[#0c0c1f] border border-white/20 p-6 rounded-2xl w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h2 className={`font-bold text-sm uppercase tracking-widest ${themeStyles.accent}`}>Active Memory</h2>
                <button onClick={() => setShowMemoryPanel(false)} className="text-red-400"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">User Name</label>
                  <input type="text" value={prefMemory.userName}
                    onChange={e => setPrefMemory(p => ({ ...p, userName: e.target.value }))}
                    className="w-full bg-[#050511] border border-white/10 p-2 rounded text-white text-xs outline-none focus:border-white/30"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Project Notes</label>
                  <textarea value={prefMemory.projectNotes}
                    onChange={e => setPrefMemory(p => ({ ...p, projectNotes: e.target.value }))}
                    className="w-full bg-[#050511] border border-white/10 p-2 rounded text-white text-xs h-16 resize-none outline-none focus:border-white/30"/>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <span className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Long-Term Facts</span>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newFactInput} onChange={e => setNewFactInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddMemoryFact()}
                      placeholder="Add a fact or constraint…"
                      className="flex-1 bg-black border border-white/10 text-xs p-2 rounded text-white outline-none focus:border-white/30"/>
                    <button onClick={handleAddMemoryFact} className={`px-3 rounded text-xs font-bold ${themeStyles.button}`}>Add</button>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1.5">
                    {prefMemory.longTermFacts.map((fact, fi) => (
                      <div key={fi} className="flex justify-between items-center bg-[#050511] p-1.5 rounded border border-white/5 text-xs text-gray-300">
                        <span className="truncate flex-1 pr-3">{String(fact)}</span>
                        <button onClick={() => handleClearMemoryFact(fi)} className="text-red-400 text-[10px] font-bold hover:text-red-300">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* FIX #9 — save button for userName and projectNotes */}
              <button onClick={saveMemoryPanel} className={`w-full py-2.5 rounded-xl text-sm font-bold ${themeStyles.button}`}>Save Memory</button>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── FIX #10: uses showSettings, not selectedModel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-50 p-4">
            <div className="bg-[#0c0c1f] border border-white/20 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h2 className={`font-bold text-sm uppercase tracking-widest ${themeStyles.accent}`}>Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-red-400"><X size={18}/></button>
              </div>

              {[
                { label: "Gemini API Key (live search grounding)", key: 'gemini', ph: "AIzaSy…" },
                { label: "Groq API Key (chat + voice)", key: 'groq', ph: "gsk_…" },
                { label: "OpenRouter API Key", key: 'openrouter', ph: "sk-or_…" },
                { label: "HuggingFace Token (image gen)", key: 'hf', ph: "hf_…" }
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">{label}</label>
                  <input type="password" value={keys[key] || ''} onChange={e => saveKeys({ ...keys, [key]: e.target.value })} placeholder={ph}
                    className="w-full bg-[#050511] border border-white/10 p-3 rounded-lg text-white outline-none text-xs focus:border-white/30"/>
                </div>
              ))}

              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Live Search Grounding</span>
                  <p className="text-[9px] text-gray-600">Requires Gemini key above</p>
                </div>
                <button onClick={() => setUseLiveSearchGrounding(!useLiveSearchGrounding)}
                  className={`px-3 py-1 rounded text-xs font-bold ${useLiveSearchGrounding ? `${themeStyles.accent} bg-white/10` : 'bg-black text-gray-500'}`}>
                  {useLiveSearchGrounding ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">PIN Security</span>
                <div className="flex gap-2">
                  <input type="password" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Set 4-digit PIN"
                    className="flex-1 bg-[#050511] border border-white/10 p-2 rounded-lg text-white text-xs outline-none focus:border-white/30"/>
                  <button onClick={setupNewPin} className={`px-3 py-2 text-xs font-bold rounded-lg uppercase ${themeStyles.button}`}>Save</button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">TTS Speed ({ttsSpeed}x)</span>
                <input type="range" min="0.5" max="2.0" step="0.1" value={ttsSpeed}
                  onChange={e => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full cursor-pointer h-1.5 rounded-lg bg-gray-700 accent-white"/>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Mini Calculator</span>
                <div className="flex gap-2">
                  <input type="text" value={calcInput} onChange={e => setCalcInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runMiniCalculator()}
                    placeholder="e.g. 2+2*5" className="flex-1 bg-black text-xs text-white p-2 rounded outline-none border border-white/10 focus:border-white/30"/>
                  <button onClick={runMiniCalculator} className={`px-3 rounded text-xs font-bold ${themeStyles.button}`}>Solve</button>
                </div>
                {calcResult && <div className={`mt-2 text-xs font-mono ${themeStyles.accent}`}>= {calcResult}</div>}
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Font Size</span>
                <div className="flex bg-black p-1 rounded-lg gap-1">
                  {['text-xs','text-sm','text-base'].map(f => (
                    <button key={f} onClick={() => setFontSize(f)}
                      className={`px-2 py-1 text-[10px] rounded uppercase font-bold ${fontSize === f ? `bg-white/10 ${themeStyles.accent}` : 'text-gray-500'}`}>
                      {f.split('-')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Incognito Mode</span>
                <button onClick={toggleIncognitoMode}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border ${isIncognito ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-black text-gray-500 border-transparent'}`}>
                  {isIncognito ? 'On' : 'Off'}
                </button>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="block text-[10px] font-black uppercase text-gray-400 mb-2">Session Stats</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold font-mono">
                  <div className="bg-black/40 p-2 rounded text-gray-400">Turns: {getSessionStats().count}</div>
                  <div className="bg-black/40 p-2 rounded text-gray-400">Tokens~: {getSessionStats().estimatedTokens}</div>
                </div>
                <div className={`mt-2 text-[9px] ${themeStyles.accent}`}>Session cost ~${tokenCostMeter.totalCost.toFixed(5)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
