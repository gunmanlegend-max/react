
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  Search,
  Send,
  Plus,
  Settings,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  LayoutTemplate,
  MonitorPlay,
  Upload,
  Download,
  Trash2,
  Edit3,
  Check,
  CheckCheck,
  Copy,
  Paperclip,
  Mic,
  Globe,
  BrainCircuit,
  Star,
  ChevronDown,
  RefreshCcw,
  SlidersHorizontal,
  Wand2,
  Layers3,
  Play,
  Camera,
  FileText,
  Grid3X3,
  Maximize2,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";

const APP_NAME = "Gunnarz AI OS";
const STORAGE = {
  sessions: "gunnarz.sessions.v1",
  activeSession: "gunnarz.activeSession.v1",
  keys: "gunnarz.keys.v1",
  ui: "gunnarz.ui.v1",
  memory: "gunnarz.memory.v1",
  stars: "gunnarz.stars.v1",
  canvas: "gunnarz.canvas.v1",
  image: "gunnarz.image.v1",
};

const THEME_PRESETS = {
  cyber: {
    root: "bg-[#04040a] text-slate-200",
    panel: "bg-[#0b0b16] border-white/10",
    panel2: "bg-[#101020] border-white/10",
    muted: "text-slate-400",
    accent: "text-[#00ffd0]",
    accentBg: "bg-[#00ffd0] text-black",
    chip: "bg-white/5 border-white/10 text-slate-200",
  },
  light: {
    root: "bg-slate-50 text-slate-800",
    panel: "bg-white border-slate-200",
    panel2: "bg-slate-100 border-slate-200",
    muted: "text-slate-500",
    accent: "text-blue-600",
    accentBg: "bg-blue-600 text-white",
    chip: "bg-white border-slate-200 text-slate-700",
  },
  neon: {
    root: "bg-[#070015] text-fuchsia-100",
    panel: "bg-[#110021] border-fuchsia-500/20",
    panel2: "bg-[#19002f] border-fuchsia-500/20",
    muted: "text-fuchsia-200/70",
    accent: "text-fuchsia-400",
    accentBg: "bg-fuchsia-500 text-white",
    chip: "bg-fuchsia-500/10 border-fuchsia-400/20 text-fuchsia-100",
  },
};

const SYSTEM_PRESETS = [
  { id: "balanced", label: "Balanced", hint: "Clear, direct answers" },
  { id: "chatgpt", label: "ChatGPT-like", hint: "Polished and helpful" },
  { id: "claude", label: "Claude-like", hint: "Deep, thoughtful, structured" },
  { id: "gemini", label: "Gemini-like", hint: "Fast, broad, practical" },
  { id: "perplexity", label: "Perplexity-like", hint: "Search-first, concise, grounded" },
  { id: "canvas", label: "Canvas mode", hint: "Code, build, preview" },
];

const QUICK_PROMPTS = [
  "Explain this simply",
  "Debug the code",
  "Summarize in bullets",
  "Write a study guide",
  "Generate an image",
  "Improve this design",
];

const TONES = {
  balanced: "You are a brilliant assistant. Be clear, concise, and practical.",
  chatgpt: "You are a polished helpful assistant. Answer naturally, neatly, and with strong structure.",
  claude: "You are a thoughtful assistant. Give deep analysis, careful reasoning, and excellent structure.",
  gemini: "You are a fast practical assistant. Keep it crisp, useful, and broad.",
  perplexity: "You are a search-focused assistant. Prefer grounded, direct, source-style answers and concise summaries.",
  canvas: "You are a code builder. Prioritize working code, clean structure, and editable artifacts.",
};

const FALLBACK_TEXT_MODELS = [
  { slug: "openrouter/auto", label: "OpenRouter Auto", provider: "OpenRouter", kind: "router" },
  { slug: "openai/gpt-5.2", label: "GPT-5.2", provider: "OpenAI", kind: "general" },
  { slug: "openai/gpt-5-chat-latest", label: "GPT Chat Latest", provider: "OpenAI", kind: "general" },
  { slug: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", provider: "Anthropic", kind: "reasoning" },
  { slug: "anthropic/claude-opus-4", label: "Claude Opus 4", provider: "Anthropic", kind: "reasoning" },
  { slug: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google", kind: "reasoning" },
  { slug: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", kind: "fast" },
  { slug: "perplexity/sonar-pro", label: "Perplexity Sonar Pro", provider: "Perplexity", kind: "search" },
  { slug: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick", provider: "Meta", kind: "open" },
  { slug: "qwen/qwen3-coder", label: "Qwen3 Coder", provider: "Qwen", kind: "coding" },
];

const FALLBACK_IMAGE_MODELS = [
  { slug: "openai/gpt-5-image", label: "GPT-5 Image", provider: "OpenAI", kind: "image" },
  { slug: "google/gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", provider: "Google", kind: "image" },
  { slug: "google/gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash Image", provider: "Google", kind: "image" },
  { slug: "black-forest-labs/flux.2-pro", label: "Flux 2 Pro", provider: "Black Forest Labs", kind: "image" },
  { slug: "black-forest-labs/flux.2-flex", label: "Flux 2 Flex", provider: "Black Forest Labs", kind: "image" },
  { slug: "sourceful/riverflow-v2-fast", label: "Riverflow V2 Fast", provider: "Sourceful", kind: "image" },
];

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmtTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function toPlainText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text") return part.text || "";
        return "";
      })
      .join(" ");
  }
  return "";
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function ModelBadge({ label, onClick, tone = "chip" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${tone}`}
    >
      {label} <ChevronDown size={14} />
    </button>
  );
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-slate-400">
        {Icon ? <Icon size={14} /> : null}
        <span>{title}</span>
      </div>
      {action}
    </div>
  );
}

function renderRichText(text, copyKey, onCopy, accentClass = "text-emerald-400") {
  if (!text) return null;

  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, idx) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const match = block.match(/```([\w-]*)\n?([\s\S]*?)```/);
      const lang = match?.[1] || "code";
      const code = match?.[2] || "";
      return (
        <div key={`${copyKey}-code-${idx}`} className="my-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className={accentClass}>{lang}</span>
            <button
              onClick={() => onCopy(code, `${copyKey}-${idx}`)}
              className="inline-flex items-center gap-1 hover:text-white"
            >
              <Copy size={13} />
            </button>
          </div>
          <pre className="overflow-x-auto p-3 text-xs leading-6 text-slate-200">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const lines = block.split("\n");
    return (
      <div key={`${copyKey}-${idx}`} className="space-y-1 whitespace-pre-wrap text-sm leading-7">
        {lines.map((line, lineIdx) => {
          if (/^###\s+/.test(line)) {
            return (
              <div key={lineIdx} className={`mt-3 text-base font-bold ${accentClass}`}>
                {line.replace(/^###\s+/, "")}
              </div>
            );
          }
          if (/^##\s+/.test(line)) {
            return (
              <div key={lineIdx} className={`mt-4 text-lg font-bold ${accentClass}`}>
                {line.replace(/^##\s+/, "")}
              </div>
            );
          }
          if (/^#\s+/.test(line)) {
            return (
              <div key={lineIdx} className={`mt-5 text-xl font-black ${accentClass}`}>
                {line.replace(/^#\s+/, "")}
              </div>
            );
          }
          if (/^- /.test(line)) {
            return (
              <div key={lineIdx} className="pl-4">
                • {line.replace(/^- /, "")}
              </div>
            );
          }
          const cleaned = line
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code class='rounded bg-white/10 px-1 py-0.5 text-[12px]'>$1</code>");
          return (
            <div key={lineIdx} dangerouslySetInnerHTML={{ __html: cleaned || "&nbsp;" }} />
          );
        })}
      </div>
    );
  });
}

export default function App() {
  const [theme, setTheme] = useState("cyber");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState("chat");
  const [showSettings, setShowSettings] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const [apiKeys, setApiKeys] = useState({ openrouter: "", groq: "", hf: "" });
  const [rememberKeys, setRememberKeys] = useState(true);
  const [tone, setTone] = useState("balanced");
  const [selectedModel, setSelectedModel] = useState("openrouter/auto");
  const [selectedImageModel, setSelectedImageModel] = useState("openai/gpt-5-image");
  const [liveSearchMode, setLiveSearchMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [starred, setStarred] = useState([]);
  const [memoryFacts, setMemoryFacts] = useState([]);
  const [memoryInput, setMemoryInput] = useState("");

  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [streamed, setStreamed] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [promptChip, setPromptChip] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [openRouterImageModels, setOpenRouterImageModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const [canvasTabs, setCanvasTabs] = useState([
    {
      id: "tab1",
      name: "Workspace",
      html: "<div class='app'><h1>Workspace Ready</h1><p>Paste HTML here or let an assistant response open a new tab.</p></div>",
      css: "body{font-family:sans-serif;background:#050510;color:#e2e8f0;padding:24px}.app{max-width:900px;margin:0 auto}",
      js: "console.log('Canvas ready')",
    },
  ]);
  const [activeCanvasTab, setActiveCanvasTab] = useState("tab1");

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageEditPrompt, setImageEditPrompt] = useState("");
  const [imageSource, setImageSource] = useState("");
  const [imageResult, setImageResult] = useState("");
  const [imageBusy, setImageBusy] = useState(false);

  const [stats, setStats] = useState({ tokens: 0, chats: 0 });
  const [timerOn, setTimerOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const drawerRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentTheme = THEME_PRESETS[theme] || THEME_PRESETS.cyber;

  const currentSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const visibleSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    const filtered = q
      ? sessions.filter((s) => `${s.title} ${s.messages.map((m) => toPlainText(m.content)).join(" ")}`.toLowerCase().includes(q))
      : sessions;
    const pinned = filtered.filter((s) => starred.includes(s.id));
    const rest = filtered.filter((s) => !starred.includes(s.id));
    return [...pinned, ...rest];
  }, [sessions, sessionSearch, starred]);

  const currentMessages = useMemo(() => currentSession?.messages || [], [currentSession]);

  useEffect(() => {
    const savedSessions = safeParse(localStorage.getItem(STORAGE.sessions), []);
    const savedActive = localStorage.getItem(STORAGE.activeSession) || "";
    const savedKeys = safeParse(localStorage.getItem(STORAGE.keys), { openrouter: "", groq: "", hf: "" });
    const savedUi = safeParse(localStorage.getItem(STORAGE.ui), {});
    const savedMemory = safeParse(localStorage.getItem(STORAGE.memory), []);
    const savedStars = safeParse(localStorage.getItem(STORAGE.stars), []);
    const savedCanvas = safeParse(localStorage.getItem(STORAGE.canvas), []);
    const savedImage = safeParse(localStorage.getItem(STORAGE.image), null);

    setSessions(savedSessions.length ? savedSessions : [{
      id: uid("session"),
      title: "Welcome",
      pinned: true,
      messages: [
        {
          id: uid("msg"),
          role: "assistant",
          content:
            "Welcome to Gunnarz AI OS.\n\nOpen the drawer, choose a model, then start chatting. You also have Image Studio, Canvas, memory, and OpenRouter model browsing.",
        },
      ],
    }]);

    setActiveSessionId(savedActive || (savedSessions[0]?.id || ""));
    setApiKeys(savedKeys || { openrouter: "", groq: "", hf: "" });
    setTheme(savedUi.theme || "cyber");
    setTone(savedUi.tone || "balanced");
    setSelectedModel(savedUi.selectedModel || "openrouter/auto");
    setSelectedImageModel(savedUi.selectedImageModel || "openai/gpt-5-image");
    setRememberKeys(savedUi.rememberKeys ?? true);
    setLiveSearchMode(savedUi.liveSearchMode ?? false);
    setAutoScroll(savedUi.autoScroll ?? true);
    setMemoryFacts(Array.isArray(savedMemory) ? savedMemory : []);
    setStarred(Array.isArray(savedStars) ? savedStars : []);
    setCanvasTabs(Array.isArray(savedCanvas) && savedCanvas.length ? savedCanvas : []);
    if (savedImage) {
      setImagePrompt(savedImage.imagePrompt || "");
      setImageEditPrompt(savedImage.imageEditPrompt || "");
      setImageSource(savedImage.imageSource || "");
      setImageResult(savedImage.imageResult || "");
    }
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    safeSet(STORAGE.sessions, sessions);
    localStorage.setItem(STORAGE.activeSession, activeSessionId || "");
    safeSet(STORAGE.keys, apiKeys);
    safeSet(STORAGE.ui, { theme, tone, selectedModel, selectedImageModel, rememberKeys, liveSearchMode, autoScroll });
    safeSet(STORAGE.memory, memoryFacts);
    safeSet(STORAGE.stars, starred);
    safeSet(STORAGE.canvas, canvasTabs);
    safeSet(STORAGE.image, { imagePrompt, imageEditPrompt, imageSource, imageResult });
  }, [
    sessions,
    activeSessionId,
    apiKeys,
    theme,
    tone,
    selectedModel,
    selectedImageModel,
    rememberKeys,
    liveSearchMode,
    autoScroll,
    memoryFacts,
    starred,
    canvasTabs,
    imagePrompt,
    imageEditPrompt,
    imageSource,
    imageResult,
  ]);

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => {
      setTimerSeconds((t) => {
        if (t <= 1) {
          setTimerOn(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  useEffect(() => {
    if (autoScroll) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, streamed, autoScroll]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchBarOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setShowSettings(false);
        setShowModels(false);
        setShowImageStudio(false);
        setShowCanvas(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function refreshOpenRouterModels() {
    setModelsLoading(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models");
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const textModels = list
        .filter((m) => {
          const modalities = m.output_modalities || m.modalities || [];
          return modalities.includes?.("text") || modalities.includes?.("image") || String(m.id || m.slug || "").length > 0;
        })
        .map((m) => ({
          slug: m.id || m.slug,
          label: m.name || m.id || m.slug,
          provider: m.author || m.provider || "OpenRouter",
          kind: Array.isArray(m.output_modalities) && m.output_modalities.includes("image") ? "image" : "text",
        }));
      const imageModels = textModels.filter((m) => m.kind === "image");
      setOpenRouterModels(textModels.length ? textModels : FALLBACK_TEXT_MODELS);
      setOpenRouterImageModels(imageModels.length ? imageModels : FALLBACK_IMAGE_MODELS);
    } catch {
      setOpenRouterModels(FALLBACK_TEXT_MODELS);
      setOpenRouterImageModels(FALLBACK_IMAGE_MODELS);
    } finally {
      setModelsLoading(false);
    }
  }

  useEffect(() => {
    refreshOpenRouterModels();
  }, []);

  function ensureSession() {
    if (currentSession) return currentSession;
    const newSession = {
      id: uid("session"),
      title: "New Chat",
      pinned: false,
      messages: [],
    };
    setSessions([newSession]);
    setActiveSessionId(newSession.id);
    return newSession;
  }

  function updateSession(id, updater) {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }

  function newSession() {
    const sess = {
      id: uid("session"),
      title: `Chat ${sessions.length + 1}`,
      pinned: false,
      messages: [],
    };
    setSessions((prev) => [sess, ...prev]);
    setActiveSessionId(sess.id);
    setDrawerOpen(false);
  }

  function deleteSession(id) {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      const nextActive = next[0]?.id || "";
      setActiveSessionId(nextActive);
      return next.length ? next : [{
        id: uid("session"),
        title: "Welcome",
        pinned: true,
        messages: [
          {
            id: uid("msg"),
            role: "assistant",
            content: "Welcome to Gunnarz AI OS.",
          },
        ],
      }];
    });
  }

  function togglePin(id) {
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }

  function renameSession(id, title) {
    updateSession(id, (s) => ({ ...s, title: title.trim() || s.title }));
  }

  function copyText(text, id) {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1300);
  }

  function addAttachment(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachments((prev) => [
        ...prev,
        {
          id: uid("att"),
          name: file.name,
          type: file.type || "file",
          data: e.target?.result,
        },
      ]);
    };
    if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else reader.readAsText(file);
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (file) addAttachment(file);
    e.target.value = "";
  }

  function openCanvasFromHtml(htmlCode) {
    const tab = {
      id: uid("tab"),
      name: `Module ${canvasTabs.length + 1}`,
      html: htmlCode,
      css: "",
      js: "",
    };
    setCanvasTabs((prev) => [...prev, tab]);
    setActiveCanvasTab(tab.id);
    setPanel("canvas");
    setShowCanvas(true);
  }

  function isRateLimitLikeError(message = "") {
    return /rate limit|quota|limit|429|too many requests|insufficient|exceeded|temporar/i.test(String(message).toLowerCase());
  }

  function pickGroqModel() {
    const map = [
      ["openai/gpt-5.2", "llama-3.3-70b-versatile"],
      ["openai/gpt-5-chat-latest", "llama-3.3-70b-versatile"],
      ["anthropic/claude-sonnet-4", "llama-3.3-70b-versatile"],
      ["anthropic/claude-opus-4", "llama-3.3-70b-versatile"],
      ["google/gemini-2.5-pro", "llama-3.3-70b-versatile"],
      ["google/gemini-2.5-flash", "llama-3.1-8b-instant"],
      ["perplexity/sonar-pro", "llama-3.1-8b-instant"],
      ["meta-llama/llama-4-maverick", "llama-3.3-70b-versatile"],
      ["qwen/qwen3-coder", "qwen/qwen3-32b"],
    ];
    return map.find(([needle]) => String(selectedModel).includes(needle))?.[1] || "llama-3.3-70b-versatile";
  }

  async function callGroq(messages, model = pickGroqModel()) {
    if (!apiKeys.groq) throw new Error("Add your Groq key in Settings.");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeys.groq}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || "Groq request failed.");
    return data;
  }

  async function callHuggingFaceImage(prompt, sourceImage = "") {
    if (!apiKeys.hf) throw new Error("Add your Hugging Face token in Settings.");
    const model = "black-forest-labs/FLUX.1-schnell";
    const payload = sourceImage
      ? { inputs: { prompt, image: sourceImage } }
      : { inputs: prompt };
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeys.hf}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Hugging Face image request failed.");
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async function callOpenRouter(messages, model, modalType = "text", imageModalities = ["text"]) {
    if (!apiKeys.openrouter) throw new Error("Add your OpenRouter key in Settings.");

    const body = {
      model,
      messages,
      stream: false,
    };

    if (modalType === "image") {
      body.modalities = imageModalities;
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeys.openrouter}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": APP_NAME,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error?.message || "OpenRouter request failed.";
      const rateLimited = isRateLimitLikeError(message) || res.status === 429;
      if (rateLimited && modalType === "text" && apiKeys.groq) {
        return { ...await callGroq(messages), _fallback: "groq" };
      }
      if (rateLimited && modalType === "image" && apiKeys.hf) {
        const lastContent = messages[messages.length - 1]?.content;
        const prompt = toPlainText(lastContent || "");
        const sourceImage = Array.isArray(lastContent)
          ? (lastContent.find((p) => p?.type === "image_url")?.image_url?.url || "")
          : "";
        return { _fallback: "hf-image", _imageUrl: await callHuggingFaceImage(prompt, sourceImage) };
      }
      throw new Error(message);
    }
    return data;
  }

  function sessionSystemPrompt() {
    const memoryBlock = memoryFacts.length
      ? `\nUser memory:\n${memoryFacts.map((f, i) => `${i + 1}. ${f}`).join("\n")}`
      : "";
    return {
      role: "system",
      content: `${TONES[tone] || TONES.balanced}${memoryBlock}`,
    };
  }

  async function sendMessage(textOverride = "") {
    const session = ensureSession();
    const rawText = String(textOverride || composer).trim();
    if (!rawText && !attachments.length) return;
    if (isTyping) return;

    const userText = rawText || "See attached files";
    const nextUserMsg = { id: uid("msg"), role: "user", content: userText, attachments: clone(attachments) };

    updateSession(session.id, (s) => ({
      ...s,
      messages: [...s.messages, nextUserMsg],
      title: s.title === "Welcome" || s.title === "New Chat" ? userText.slice(0, 30) : s.title,
    }));

    setComposer("");
    setAttachments([]);
    setIsTyping(true);
    setStreamed("");

    try {
      let reply = "";

      const conversation = [
        sessionSystemPrompt(),
        ...currentMessages.map((m) => ({
          role: m.role,
          content: toPlainText(m.content),
        })),
        {
          role: "user",
          content: userText,
        },
      ];

      if (liveSearchMode || selectedModel.includes("perplexity")) {
        conversation[0] = {
          role: "system",
          content: `${TONES.perplexity}\nUse concise grounded answers. If a claim is uncertain, say so.`,
        };
      }

      if (attachments.length) {
        const imageAttachment = attachments.find((a) => String(a.type).startsWith("image/"));
        if (imageAttachment) {
          conversation[conversation.length - 1] = {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageAttachment.data } },
            ],
          };
        }
      }

      if (apiKeys.openrouter) {
        const result = await callOpenRouter(conversation, selectedModel, "text");
        reply = result?.choices?.[0]?.message?.content || "No response returned.";
      } else if (apiKeys.groq) {
        const result = await callGroq(conversation);
        reply = result?.choices?.[0]?.message?.content || "No response returned.";
      } else {
        reply = "Add an OpenRouter or Groq key in Settings, then pick a model and send again.";
      }

      setStreamed(reply);
      updateSession(session.id, (s) => ({
        ...s,
        messages: [
          ...s.messages,
          { id: uid("msg"), role: "assistant", content: reply },
        ],
      }));

      const htmlMatch = reply.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch?.[1]) openCanvasFromHtml(htmlMatch[1].trim());

      const estimatedTokens = Math.ceil((userText.length + reply.length) / 4);
      setStats((prev) => ({ tokens: prev.tokens + estimatedTokens, chats: sessions.length }));
    } catch (err) {
      const reply = `Error: ${err.message}`;
      updateSession(session.id, (s) => ({
        ...s,
        messages: [...s.messages, { id: uid("msg"), role: "assistant", content: reply }],
      }));
      setStreamed(reply);
    } finally {
      setIsTyping(false);
    }
  }

  async function generateImage() {
    const prompt = imagePrompt.trim();
    if (!prompt || imageBusy) return;
    setImageBusy(true);
    try {
      let url = "";
      if (apiKeys.openrouter) {
        try {
          const messages = [{ role: "user", content: prompt }];
          const result = await callOpenRouter(messages, selectedImageModel, "image", ["image"]);
          const msg = result?.choices?.[0]?.message;
          url = msg?.images?.[0]?.imageUrl?.url || msg?.images?.[0]?.url || result?._imageUrl || "";
        } catch (err) {
          if (!apiKeys.hf) throw err;
          url = await callHuggingFaceImage(prompt);
        }
      } else if (apiKeys.hf) {
        url = await callHuggingFaceImage(prompt);
      } else {
        throw new Error("Add an OpenRouter or Hugging Face key in Settings.");
      }
      if (!url) throw new Error("No image returned by the model.");
      setImageResult(url);
    } catch (err) {
      setImageResult("");
      throw err;
    } finally {
      setImageBusy(false);
    }
  }

  async function editImage() {
    const prompt = imageEditPrompt.trim();
    if (!prompt || imageBusy) return;
    if (!imageSource) {
      throw new Error("Upload or paste a source image first.");
    }
    setImageBusy(true);
    try {
      let url = "";
      if (apiKeys.openrouter) {
        try {
          const messages = [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageSource } },
              ],
            },
          ];
          const result = await callOpenRouter(messages, selectedImageModel, "image", ["image", "text"]);
          const msg = result?.choices?.[0]?.message;
          url = msg?.images?.[0]?.imageUrl?.url || msg?.images?.[0]?.url || result?._imageUrl || "";
        } catch (err) {
          if (!apiKeys.hf) throw err;
          url = await callHuggingFaceImage(`${prompt}\nUse the source image as reference.`, imageSource);
        }
      } else if (apiKeys.hf) {
        url = await callHuggingFaceImage(`${prompt}\nUse the source image as reference.`, imageSource);
      } else {
        throw new Error("Add an OpenRouter or Hugging Face key in Settings.");
      }
      if (!url) throw new Error("No edited image returned.");
      setImageResult(url);
    } catch (err) {
      setImageResult("");
      throw err;
    } finally {
      setImageBusy(false);
    }
  }

  function addMemoryFact() {
    const text = memoryInput.trim();
    if (!text) return;
    setMemoryFacts((prev) => [text, ...prev]);
    setMemoryInput("");
  }

  function removeMemoryFact(index) {
    setMemoryFacts((prev) => prev.filter((_, i) => i !== index));
  }

  function runCanvasTab() {
    const tab = canvasTabs.find((t) => t.id === activeCanvasTab) || canvasTabs[0];
    if (!tab) return "";
    const doc = `<!doctype html><html><head><style>${tab.css || ""}</style></head><body>${tab.html || ""}<script>
    try {
      const _log = console.log;
      console.log = (...a) => _log(...a);
      ${tab.js || ""}
    } catch (e) { console.error(e); }
    </script></body></html>`;
    return doc;
  }

  function exportSession() {
    const data = JSON.stringify(currentSession, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${currentSession?.title || "session"}.json`;
    a.click();
  }

  function importSession(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target.result));
        parsed.id = uid("session");
        parsed.messages = Array.isArray(parsed.messages) ? parsed.messages : [];
        setSessions((prev) => [parsed, ...prev]);
        setActiveSessionId(parsed.id);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const modelSource = useMemo(() => {
    const list = openRouterModels.length ? openRouterModels : FALLBACK_TEXT_MODELS;
    return list;
  }, [openRouterModels]);

  const imageModelSource = useMemo(() => {
    const list = openRouterImageModels.length ? openRouterImageModels : FALLBACK_IMAGE_MODELS;
    return list;
  }, [openRouterImageModels]);

  const activeCanvas = canvasTabs.find((t) => t.id === activeCanvasTab) || canvasTabs[0];

  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.root}`}>
      <input ref={fileInputRef} onChange={handleFilePick} type="file" className="hidden" />
      <input ref={imageInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImageSource(String(ev.target.result || ""));
        reader.readAsDataURL(file);
        e.target.value = "";
      }} type="file" accept="image/*" className="hidden" />

      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <aside
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm transform border-r transition-transform duration-300 md:static md:z-0 md:block md:w-80 ${drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${currentTheme.panel}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-wide">
                <Sparkles size={18} className={currentTheme.accent} />
                <div>
                  <div className="text-sm uppercase">{APP_NAME}</div>
                  <div className={`text-[11px] ${currentTheme.muted}`}>Chat • Canvas • Images • Models</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="md:hidden">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={newSession} className={`flex-1 rounded-2xl px-3 py-2 text-sm font-bold ${currentTheme.accentBg}`}>
                <span className="inline-flex items-center gap-2"><Plus size={16} /> New Chat</span>
              </button>
              <button onClick={() => setSearchBarOpen((v) => !v)} className={`rounded-2xl border px-3 py-2 ${currentTheme.chip}`}>
                <Search size={16} />
              </button>
            </div>

            {searchBarOpen && (
              <div className="mt-3">
                <input
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Search chats, memory, messages..."
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${currentTheme.panel2} ${currentTheme.muted}`}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <SectionTitle
              icon={MessageSquare}
              title="Chats"
              action={<button onClick={() => setSessionSearch("")} className={`text-[11px] ${currentTheme.muted}`}>Clear</button>}
            />
            <div className="space-y-2">
              {visibleSessions.map((s) => {
                const active = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    className={`group rounded-2xl border p-3 ${active ? "border-white/20 bg-white/5" : "border-white/10 bg-transparent"}`}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setPanel("chat");
                      setDrawerOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-xl p-2 ${currentTheme.panel2}`}>
                        <MessageSquare size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const title = prompt("Rename chat", s.title);
                              if (title !== null) renameSession(s.id, title);
                            }}
                            className="truncate text-left text-sm font-semibold"
                          >
                            {s.title}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(s.id);
                            }}
                            className={starred.includes(s.id) ? "text-yellow-400" : currentTheme.muted}
                          >
                            <Star size={14} fill={starred.includes(s.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className={`mt-1 truncate text-xs ${currentTheme.muted}`}>
                          {toPlainText(s.messages?.[s.messages.length - 1]?.content || "") || "Empty chat"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 opacity-90">
                      <button onClick={(e) => { e.stopPropagation(); setActiveSessionId(s.id); exportSession(); }} className="text-[11px] font-semibold">
                        Export
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} className="text-[11px] font-semibold text-red-400">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <SectionTitle
                icon={Layers3}
                title="Workspace"
                action={<button onClick={() => { setShowCanvas(true); setPanel("canvas"); }} className={`text-[11px] ${currentTheme.muted}`}>Open</button>}
              />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "chat", label: "Chat", icon: MessageSquare },
                  { id: "canvas", label: "Canvas", icon: LayoutTemplate },
                  { id: "models", label: "Models", icon: BrainCircuit },
                  { id: "image", label: "Images", icon: Wand2 },
                  { id: "settings", label: "Settings", icon: Settings },
                  { id: "memory", label: "Memory", icon: Database },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPanel(item.id);
                      if (item.id === "canvas") setShowCanvas(true);
                      if (item.id === "models") setShowModels(true);
                      if (item.id === "image") setShowImageStudio(true);
                      if (item.id === "settings") setShowSettings(true);
                      if (item.id === "memory") setPanel("settings");
                      setDrawerOpen(false);
                    }}
                    className={`rounded-2xl border p-3 text-left ${currentTheme.chip}`}
                  >
                    <item.icon size={16} />
                    <div className="mt-2 text-sm font-semibold">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle icon={Database} title="Memory" />
              <div className="space-y-2">
                {memoryFacts.slice(0, 4).map((fact, index) => (
                  <div key={index} className={`rounded-2xl border p-3 text-sm ${currentTheme.panel2}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="pr-2">{fact}</div>
                      <button onClick={() => removeMemoryFact(index)} className="text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle icon={Download} title="Import / Export" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={exportSession} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${currentTheme.chip}`}>
                  Export
                </button>
                <label className={`cursor-pointer rounded-2xl border px-3 py-3 text-sm font-semibold ${currentTheme.chip}`}>
                  Import
                  <input type="file" accept=".json" onChange={importSession} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className={`text-[11px] uppercase tracking-[0.3em] ${currentTheme.muted}`}>Focus</div>
              <button onClick={() => setTimerOn((v) => !v)} className={`text-xs ${currentTheme.accent}`}>
                {timerOn ? "Pause" : "Start"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold">
              <span>{fmtTime(timerSeconds)}</span>
              <button
                onClick={() => {
                  setTimerOn(false);
                  setTimerSeconds(25 * 60);
                }}
                className={currentTheme.muted}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className={`sticky top-0 z-30 flex items-center justify-between border-b px-3 py-3 md:px-4 ${currentTheme.panel}`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawerOpen(true)} className={`rounded-2xl border p-2 md:hidden ${currentTheme.chip}`}>
              <Menu size={18} />
            </button>
            <button onClick={() => setDrawerOpen((v) => !v)} className={`hidden rounded-2xl border p-2 md:inline-flex ${currentTheme.chip}`}>
              <PanelLeftOpen size={18} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{currentSession?.title || "New Chat"}</div>
              <div className={`truncate text-[11px] ${currentTheme.muted}`}>Mobile-first AI workspace</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowModels(true)} className={`hidden rounded-full border px-3 py-2 text-xs font-semibold md:inline-flex ${currentTheme.chip}`}>
              {selectedModel}
            </button>
            <button onClick={() => setSearchBarOpen((v) => !v)} className={`rounded-2xl border p-2 ${currentTheme.chip}`}>
              <Search size={18} />
            </button>
            <button onClick={() => setShowSettings(true)} className={`rounded-2xl border p-2 ${currentTheme.chip}`}>
              <Settings size={18} />
            </button>
          </div>
        </header>

        {panel === "chat" && (
          <section className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
              <div className="mx-auto max-w-4xl space-y-4">
                {currentMessages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[92%] rounded-3xl border px-4 py-3 shadow-sm md:max-w-[82%] ${isUser ? "border-white/10 bg-white/6" : "border-white/10 bg-white/4"}`}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-60">
                            {isUser ? "You" : "Gunnarz"}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isUser && (
                              <button onClick={() => copyText(toPlainText(msg.content), msg.id)} className="opacity-70 hover:opacity-100">
                                {copiedId === msg.id ? <CheckCheck size={14} /> : <Copy size={14} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {typeof msg.content === "string" ? (
                            renderRichText(msg.content, msg.id, copyText, currentTheme.accent)
                          ) : Array.isArray(msg.content) ? (
                            msg.content.map((part, idx) => {
                              if (part?.type === "text") return <div key={idx}>{renderRichText(part.text, `${msg.id}-${idx}`, copyText, currentTheme.accent)}</div>;
                              if (part?.type === "image_url") return <img key={idx} src={part.image_url.url} alt="" className="max-h-72 rounded-2xl border border-white/10" />;
                              return null;
                            })
                          ) : (
                            <pre className="overflow-x-auto text-xs">{JSON.stringify(msg.content, null, 2)}</pre>
                          )}

                          {msg.attachments?.length ? (
                            <div className="mt-3 grid gap-2">
                              {msg.attachments.map((a) => (
                                <div key={a.id} className={`rounded-2xl border p-3 text-xs ${currentTheme.panel2}`}>
                                  <div className="font-semibold">{a.name}</div>
                                  <div className={`mt-1 break-all ${currentTheme.muted}`}>{a.type}</div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-3xl border px-4 py-3 ${currentTheme.panel2}`}>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles size={14} className={currentTheme.accent} />
                        <span>{streamed || "Thinking..."}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className={`border-t px-3 py-3 md:px-6 ${currentTheme.panel}`}>
              <div className="mx-auto max-w-4xl">
                {promptChip ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setComposer(p);
                          setPromptChip("");
                        }}
                        className={`rounded-full border px-3 py-2 text-xs ${currentTheme.chip}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <ModelBadge label={selectedModel} onClick={() => setShowModels(true)} tone={currentTheme.chip} />
                  <button onClick={() => setLiveSearchMode((v) => !v)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${liveSearchMode ? currentTheme.accentBg : currentTheme.chip}`}>
                    <Globe size={14} className="inline" /> Web
                  </button>
                  <button onClick={() => setShowImageStudio(true)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                    <Wand2 size={14} className="inline" /> Images
                  </button>
                  <button onClick={() => setShowCanvas(true)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                    <LayoutTemplate size={14} className="inline" /> Canvas
                  </button>
                  <button onClick={() => setPromptChip((v) => !v ? "open" : "")} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                    <Grid3X3 size={14} className="inline" /> Prompts
                  </button>
                </div>

                <div className={`flex items-end gap-2 rounded-[28px] border p-2 ${currentTheme.panel2}`}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-2xl border p-3 ${currentTheme.chip}`}
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className={`rounded-2xl border p-3 ${currentTheme.chip}`}
                    title="Attach image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button
                    onClick={() => setShowImageStudio(true)}
                    className={`rounded-2xl border p-3 ${currentTheme.chip}`}
                    title="Image studio"
                  >
                    <Wand2 size={18} />
                  </button>

                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Message Gunnarz AI..."
                    rows={1}
                    className="max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none"
                  />

                  <button
                    onClick={() => sendMessage()}
                    className={`rounded-[20px] px-4 py-3 text-sm font-bold ${currentTheme.accentBg}`}
                  >
                    <Send size={18} />
                  </button>
                </div>

                {attachments.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((a, idx) => (
                      <div key={a.id} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${currentTheme.chip}`}>
                        <FileText size={14} />
                        <span className="max-w-[180px] truncate">{a.name}</span>
                        <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {panel === "canvas" && showCanvas && (
          <section className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-hidden p-3 md:p-4">
              <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-3 lg:grid-cols-2">
                <div className={`rounded-3xl border p-3 ${currentTheme.panel}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <SectionTitle icon={LayoutTemplate} title="Canvas" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCanvasTabs((prev) => [...prev, { id: uid("tab"), name: `Tab ${prev.length + 1}`, html: "", css: "", js: "" }])} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                        <Plus size={14} /> Tab
                      </button>
                      <button onClick={() => setPanel("chat")} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                        <MessageSquare size={14} /> Back
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {canvasTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCanvasTab(tab.id)}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold ${tab.id === activeCanvasTab ? currentTheme.accentBg : currentTheme.chip}`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={activeCanvas?.html || ""}
                      onChange={(e) => setCanvasTabs((prev) => prev.map((t) => t.id === activeCanvasTab ? { ...t, html: e.target.value } : t))}
                      rows={8}
                      placeholder="HTML"
                      className={`w-full rounded-2xl border p-3 text-sm outline-none ${currentTheme.panel2}`}
                    />
                    <textarea
                      value={activeCanvas?.css || ""}
                      onChange={(e) => setCanvasTabs((prev) => prev.map((t) => t.id === activeCanvasTab ? { ...t, css: e.target.value } : t))}
                      rows={6}
                      placeholder="CSS"
                      className={`w-full rounded-2xl border p-3 text-sm outline-none ${currentTheme.panel2}`}
                    />
                    <textarea
                      value={activeCanvas?.js || ""}
                      onChange={(e) => setCanvasTabs((prev) => prev.map((t) => t.id === activeCanvasTab ? { ...t, js: e.target.value } : t))}
                      rows={6}
                      placeholder="JS"
                      className={`w-full rounded-2xl border p-3 text-sm outline-none ${currentTheme.panel2}`}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => updateSession(currentSession.id, (s) => s)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                      Save
                    </button>
                    <button onClick={() => window.open(URL.createObjectURL(new Blob([runCanvasTab()], { type: "text/html" })), "_blank")} className={`rounded-full border px-4 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                      <Play size={14} className="inline" /> Run
                    </button>
                    <button onClick={() => setShowCanvas(false)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                      Close
                    </button>
                  </div>
                </div>

                <div className={`rounded-3xl border p-3 ${currentTheme.panel}`}>
                  <SectionTitle icon={MonitorPlay} title="Preview" />
                  <iframe title="Canvas Preview" srcDoc={runCanvasTab()} className="h-[70vh] w-full rounded-2xl border border-white/10 bg-white" />
                </div>
              </div>
            </div>
          </section>
        )}

        {showModels && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-3 md:items-center" onClick={() => setShowModels(false)}>
            <div
              className={`max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-[28px] border ${currentTheme.panel}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black">Model Browser</div>
                    <div className={`text-xs ${currentTheme.muted}`}>OpenRouter models plus your favorites</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={refreshOpenRouterModels} className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${currentTheme.chip}`}>
                      <RefreshCcw size={14} className="inline" /> Refresh
                    </button>
                    <button onClick={() => setShowModels(false)} className={`rounded-2xl border p-2 ${currentTheme.chip}`}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <input
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search models..."
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${currentTheme.panel2}`}
                  />
                </div>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div>
                    <SectionTitle icon={BrainCircuit} title="Text Models" />
                    <div className="grid gap-2">
                      {modelSource
                        .filter((m) => `${m.slug} ${m.label} ${m.provider} ${m.kind}`.toLowerCase().includes(modelSearch.toLowerCase()))
                        .map((m) => (
                          <button
                            key={m.slug}
                            onClick={() => {
                              setSelectedModel(m.slug);
                              setPanel("chat");
                              setShowModels(false);
                            }}
                            className={`rounded-2xl border p-3 text-left ${selectedModel === m.slug ? currentTheme.accentBg : currentTheme.chip}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold">{m.label}</div>
                                <div className="text-[11px] opacity-70">{m.slug}</div>
                              </div>
                              <div className="text-[11px] uppercase opacity-60">{m.provider}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <SectionTitle icon={ImageIcon} title="Image Models" />
                    <div className="grid gap-2">
                      {imageModelSource
                        .filter((m) => `${m.slug} ${m.label} ${m.provider}`.toLowerCase().includes(modelSearch.toLowerCase()))
                        .map((m) => (
                          <button
                            key={m.slug}
                            onClick={() => {
                              setSelectedImageModel(m.slug);
                              setShowModels(false);
                            }}
                            className={`rounded-2xl border p-3 text-left ${selectedImageModel === m.slug ? currentTheme.accentBg : currentTheme.chip}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold">{m.label}</div>
                                <div className="text-[11px] opacity-70">{m.slug}</div>
                              </div>
                              <div className="text-[11px] uppercase opacity-60">{m.provider}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-4 ${currentTheme.panel2}`}>
                  <SectionTitle icon={SlidersHorizontal} title="Model Shortcuts" />
                  <div className="space-y-3">
                    {SYSTEM_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTone(p.id)}
                        className={`w-full rounded-2xl border p-3 text-left ${tone === p.id ? currentTheme.accentBg : currentTheme.chip}`}
                      >
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-[11px] opacity-70">{p.hint}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border p-3 text-sm">
                    <div className="font-semibold">Active</div>
                    <div className={`mt-1 text-xs ${currentTheme.muted}`}>Text: {selectedModel}</div>
                    <div className={`mt-1 text-xs ${currentTheme.muted}`}>Image: {selectedImageModel}</div>
                    <div className={`mt-1 text-xs ${currentTheme.muted}`}>Tone: {tone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showImageStudio && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-3 md:items-center" onClick={() => setShowImageStudio(false)}>
            <div
              className={`max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border ${currentTheme.panel}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black">Image Studio</div>
                    <div className={`text-xs ${currentTheme.muted}`}>Generate, edit, and reuse images</div>
                  </div>
                  <button onClick={() => setShowImageStudio(false)} className={`rounded-2xl border p-2 ${currentTheme.chip}`}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div className={`space-y-4 rounded-3xl border p-4 ${currentTheme.panel2}`}>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setImagePrompt((v) => v || "A cinematic futuristic AI workspace")} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                      Quick prompt
                    </button>
                    <button onClick={() => imageInputRef.current?.click()} className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentTheme.chip}`}>
                      Upload source image
                    </button>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Generate</div>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={4}
                      className={`w-full rounded-2xl border p-3 text-sm outline-none ${currentTheme.panel}`}
                      placeholder="Describe the image you want..."
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imageModelSource.slice(0, 6).map((m) => (
                        <button
                          key={m.slug}
                          onClick={() => setSelectedImageModel(m.slug)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold ${selectedImageModel === m.slug ? currentTheme.accentBg : currentTheme.chip}`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={generateImage}
                      disabled={imageBusy}
                      className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${currentTheme.accentBg}`}
                    >
                      <Wand2 size={16} className="inline" /> {imageBusy ? "Working..." : "Generate"}
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Edit</div>
                    <textarea
                      value={imageEditPrompt}
                      onChange={(e) => setImageEditPrompt(e.target.value)}
                      rows={4}
                      className={`w-full rounded-2xl border p-3 text-sm outline-none ${currentTheme.panel}`}
                      placeholder="Tell the model how to edit the source image..."
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => imageInputRef.current?.click()} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${currentTheme.chip}`}>
                        Choose image
                      </button>
                      <button
                        onClick={editImage}
                        disabled={imageBusy}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold ${currentTheme.accentBg}`}
                      >
                        <ImageIcon size={16} className="inline" /> {imageBusy ? "Working..." : "Edit"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-4 ${currentTheme.panel2}`}>
                  <SectionTitle icon={ImageIcon} title="Preview" />
                  {imageSource ? (
                    <img src={imageSource} alt="Source" className="mb-3 max-h-60 w-full rounded-2xl border border-white/10 object-contain" />
                  ) : null}
                  {imageResult ? (
                    <img src={imageResult} alt="Result" className="max-h-[52vh] w-full rounded-2xl border border-white/10 object-contain" />
                  ) : (
                    <div className={`grid min-h-[45vh] place-items-center rounded-2xl border border-dashed text-center ${currentTheme.muted}`}>
                      <div>
                        <ImageIcon size={42} className="mx-auto mb-3 opacity-70" />
                        <div className="text-sm font-semibold">No image yet</div>
                        <div className="mt-1 text-xs">Generate something amazing or edit an upload.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-3 md:items-center" onClick={() => setShowSettings(false)}>
            <div
              className={`max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border ${currentTheme.panel}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black">Settings</div>
                    <div className={`text-xs ${currentTheme.muted}`}>Keys, fallback providers, theme, memory, and workspace controls</div>
                  </div>
                  <button onClick={() => setShowSettings(false)} className={`rounded-2xl border p-2 ${currentTheme.chip}`}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div className={`space-y-4 rounded-3xl border p-4 ${currentTheme.panel2}`}>
                  <SectionTitle icon={Settings} title="App" />
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold">Theme</label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)} className={`w-full rounded-2xl border px-4 py-3 ${currentTheme.panel}`}>
                      <option value="cyber">Cyber</option>
                      <option value="light">Light</option>
                      <option value="neon">Neon</option>
                    </select>

                    <label className="block text-sm font-semibold">Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className={`w-full rounded-2xl border px-4 py-3 ${currentTheme.panel}`}>
                      {SYSTEM_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>

                    <label className="block text-sm font-semibold">Default text model</label>
                    <input
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                      placeholder="openrouter/auto"
                    />

                    <label className="block text-sm font-semibold">Default image model</label>
                    <input
                      value={selectedImageModel}
                      onChange={(e) => setSelectedImageModel(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                      placeholder="openai/gpt-5-image"
                    />

                    <div className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="text-sm font-semibold">Remember keys</div>
                        <div className={`text-xs ${currentTheme.muted}`}>Store keys on this device</div>
                      </div>
                      <button onClick={() => setRememberKeys((v) => !v)} className={`rounded-full px-3 py-2 text-xs font-bold ${rememberKeys ? currentTheme.accentBg : currentTheme.chip}`}>
                        {rememberKeys ? "On" : "Off"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="text-sm font-semibold">Live search mode</div>
                        <div className={`text-xs ${currentTheme.muted}`}>Search-focused answer style</div>
                      </div>
                      <button onClick={() => setLiveSearchMode((v) => !v)} className={`rounded-full px-3 py-2 text-xs font-bold ${liveSearchMode ? currentTheme.accentBg : currentTheme.chip}`}>
                        {liveSearchMode ? "On" : "Off"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="text-sm font-semibold">Auto scroll</div>
                        <div className={`text-xs ${currentTheme.muted}`}>Keep chat pinned to the latest message</div>
                      </div>
                      <button onClick={() => setAutoScroll((v) => !v)} className={`rounded-full px-3 py-2 text-xs font-bold ${autoScroll ? currentTheme.accentBg : currentTheme.chip}`}>
                        {autoScroll ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`space-y-4 rounded-3xl border p-4 ${currentTheme.panel2}`}>
                  <SectionTitle icon={Database} title="Keys and Memory" />
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold">OpenRouter API key</label>
                      <input
                        type="password"
                        value={apiKeys.openrouter}
                        onChange={(e) => setApiKeys((p) => ({ ...p, openrouter: e.target.value }))}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                        placeholder="sk-or-..."
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold">Groq API key</label>
                      <input
                        type="password"
                        value={apiKeys.groq}
                        onChange={(e) => setApiKeys((p) => ({ ...p, groq: e.target.value }))}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                        placeholder="gsk_..."
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold">Hugging Face token</label>
                      <input
                        type="password"
                        value={apiKeys.hf}
                        onChange={(e) => setApiKeys((p) => ({ ...p, hf: e.target.value }))}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                        placeholder="hf_..."
                      />
                    </div>

                    <div className="rounded-2xl border p-3">
                      <div className="mb-2 text-sm font-semibold">Memory facts</div>
                      <div className="flex gap-2">
                        <input
                          value={memoryInput}
                          onChange={(e) => setMemoryInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addMemoryFact()}
                          className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm ${currentTheme.panel}`}
                          placeholder="Add a long-term fact..."
                        />
                        <button onClick={addMemoryFact} className={`rounded-2xl px-4 py-3 text-sm font-bold ${currentTheme.accentBg}`}>
                          Add
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {memoryFacts.map((fact, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 rounded-2xl border p-3 text-sm">
                            <div className="pr-2">{fact}</div>
                            <button onClick={() => removeMemoryFact(idx)} className="text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setSessions([])} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${currentTheme.chip}`}>
                        Clear chats
                      </button>
                      <button onClick={() => setMemoryFacts([])} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${currentTheme.chip}`}>
                        Clear memory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
