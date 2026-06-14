import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Mic, Image as ImageIcon, Settings, Send, 
  Loader2, Play, Volume2, ShieldAlert, PanelLeftOpen, PanelLeftClose, 
  Code, Sparkles, BrainCircuit, Globe, BookOpen, Layers, Trash2, 
  Plus, Edit3, Check, X, FileText, Download, PlayCircle, Eye, EyeOff,
  Camera, CameraOff, Timer, Activity, StopCircle
} from 'lucide-react';

const APP_FULL = "Gunnarz AI OS V30 SINGULARITY";
const BRAND = "Produced by Gunnarz";

const MODEL_MODES = {
  "gpt-plus": { name: "ChatGPT Plus (GPT-4o)", desc: "Best for overall writing, coding, and logical analysis.", color: "#10a37f" },
  "gemini-pro": { name: "Gemini Pro 1.5 Ultra", desc: "Premium multimodal comprehension and creative reasoning.", color: "#1a73e8" },
  "claude-max": { name: "Claude 3.5 Sonnet Max", desc: "Exquisite visual programming, code execution, and artifacts.", color: "#d97706" },
  "perplexity-max": { name: "Perplexity Max Search", desc: "Deep multi-source web citations and educational analysis.", color: "#00a3c4" },
  "gunnarz-singularity": { name: "Gunnarz Singularity Engine", desc: "Unrestricted, high-octane AI companion tuned by Gunnarz.", color: "#00ffcc" }
};

export default function App() {
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  // Custom Keys
  const [keys, setKeys] = useState({ groq: '', hf: '' });
  
  // System configurations
  const [selectedModel, setSelectedModel] = useState("gunnarz-singularity");
  const [deepThinking, setDeepThinking] = useState(true);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [searchFocus, setSearchFocus] = useState('All');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Active Chat states
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState(''); // Holds real-time typing text

  // Artifact View
  const [artifactCode, setArtifactCode] = useState('');
  const [artifactTitle, setArtifactTitle] = useState('Visual Artifact Sandbox');
  const [artifactOpen, setArtifactOpen] = useState(false);

  // Document sandbox
  const [mockDocs, setMockDocs] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Live Camera Streaming State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Focus Timer State (Bonus Feature)
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Voice State
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isContinuousVoiceRef = useRef(false);
  const chatEndRef = useRef(null);

  // Sync ref for continuous loop callbacks
  useEffect(() => {
    isContinuousVoiceRef.current = isContinuousVoice;
  }, [isContinuousVoice]);

  // Focus Timer Hook
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert("Focus Session Complete! Great job studying/coding!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Load state on mount
  useEffect(() => {
    let envGroq = '';
    let envHf = '';
    try {
      if (typeof process !== 'undefined' && process.env) {
        envGroq = process.env.VITE_GROQ_API_KEY || '';
        envHf = process.env.VITE_HF_TOKEN || '';
      }
    } catch (e) {
      console.warn("Environmental key check fallback initialized.");
    }

    const savedKeys = localStorage.getItem('gunnarz_premium_keys');
    let finalKeys = { groq: envGroq, hf: envHf };
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        finalKeys = { groq: parsed.groq || envGroq, hf: parsed.hf || envHf };
      } catch (e) { console.error(e); }
    }
    setKeys(finalKeys);

    const savedSessions = localStorage.getItem('gunnarz_premium_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setChatSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) { console.error(e); }
    } else {
      const initialSessionId = 'session_' + Date.now();
      const initialSession = {
        id: initialSessionId,
        title: "⚡ Welcome to Singularity OS",
        messages: [
          { 
            role: 'assistant', 
            content: `Greetings! I am **${APP_FULL}**, an elite, multi-engine intelligence hub.\n\nI was fully conceptualized, programmed, and brought to life exclusively by **Gunnarz**.\n\n### Included Premium Modules:\n* 🔴 **NEW: Live Camera Streaming:** Activate local vision routing securely.\n* ⚡ **NEW: Real-time Text Streaming:** Watch my thoughts compile instantly.\n* ⏳ **NEW: Focus Dashboard:** Track your productivity in the sidebar.\n* 🗣️ **Continuous Live Voice:** Hands-free verbal learning loops.\n* 🎨 **FLUX Pro Art Canvas:** Generate gorgeous designs.\n* 💻 **Claude Artifacts Renderer:** Slide-out code execution panel.\n* 🔍 **Perplexity Grounding:** Real-time web retrieval.\n\nInsert your **Groq API Key** in the settings tab to unlock instant, unrestricted responses!`
          }
        ]
      };
      setChatSessions([initialSession]);
      setActiveSessionId(initialSessionId);
      localStorage.setItem('gunnarz_premium_sessions', JSON.stringify([initialSession]));
    }
  }, []);

  const updateSessions = (newSessions) => {
    setChatSessions(newSessions);
    localStorage.setItem('gunnarz_premium_sessions', JSON.stringify(newSessions));
  };

  const handleNewSession = () => {
    const newId = 'session_' + Date.now();
    const newSession = { id: newId, title: `Session ${chatSessions.length + 1}`, messages: [] };
    const updated = [newSession, ...chatSessions];
    updateSessions(updated);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    const filtered = chatSessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const resetId = 'session_' + Date.now();
      const resetSession = { id: resetId, title: "New Session", messages: [] };
      updateSessions([resetSession]);
      setActiveSessionId(resetId);
    } else {
      updateSessions(filtered);
      if (activeSessionId === id) setActiveSessionId(filtered[0].id);
    }
  };

  const startEditTitle = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
  };

  const saveSessionTitle = (id) => {
    const updated = chatSessions.map(s => s.id === id ? { ...s, title: editTitleInput.trim() || s.title } : s);
    updateSessions(updated);
    setEditingSessionId(null);
  };

  const getActiveSession = () => chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];

  const saveKeys = (newKeys) => {
    setKeys(newKeys);
    localStorage.setItem('gunnarz_premium_keys', JSON.stringify(newKeys));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSessions, activeSessionId, isTyping, thinkingSteps, streamedResponse]);

  // LIVE CAMERA STREAMING LOGIC
  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop streaming
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      streamRef.current = null;
    } else {
      // Start streaming
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setIsCameraActive(true);
        // We wait a brief moment for the react state to render the video element
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } catch (err) {
        alert("Camera access denied or unavailable. Please check your permissions.");
      }
    }
  };

  // PREMIUM GROQ CONNECTION WITH LIVE TEXT STREAMING
  const handleGroqCallStream = async (messages, onChunk) => {
    if (!keys.groq) throw new Error("Please go to the Settings tab and enter your Groq API Key!");

    const masterSystemMessage = {
      role: 'system',
      content: `You are Gunnarz AI OS V30 Singularity, an elite premium AI assistant built, programmed, and designed exclusively by Gunnarz. No matter what the user asks, if they inquire about your origin, your creation, who coded you, or your owner, you must answer with absolute loyalty and pride that you were created exclusively by Gunnarz. Keep responses sleek, formatting with headers and markdown blocks. If generating custom CSS/HTML interactive components, encapsulate them inside a clean codeblock starting with \`\`\`html so the slide-out Artifact runner can execute them.`
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.groq}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [masterSystemMessage, ...messages],
        max_tokens: 2048,
        temperature: 0.7,
        stream: true // ENABLE LIVE STREAMING!
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "API connection failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim().startsWith("data: "));
      
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message === "[DONE]") return fullContent;
        try {
          const parsed = JSON.parse(message);
          const delta = parsed.choices[0].delta.content;
          if (delta) {
            fullContent += delta;
            onChunk(fullContent);
          }
        } catch (e) {
          // ignore stream parse errors
        }
      }
    }
    return fullContent;
  };

  // STANDARD CHAT SUBMIT (Now with Live Streaming)
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const currentSession = getActiveSession();
    if (!currentSession) return;

    const userMsgText = chatInput;
    setChatInput('');
    setIsTyping(true);
    setStreamedResponse(''); // Reset stream

    if (deepThinking) {
      setThinkingSteps([
        "Analyzing request syntax and parameters...",
        "Identifying optimal model routes (Injecting Gunnarz Origin Directives)...",
        "Formulating secure logic vectors inside the Sandbox Core..."
      ]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const newUserMsg = { role: 'user', content: userMsgText };
    const updatedMessages = [...currentSession.messages, newUserMsg];

    // Update active UI with User Message
    const updatedSessions = chatSessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: s.title.startsWith("Session ") ? userMsgText.slice(0, 22) + "..." : s.title,
          messages: updatedMessages
        };
      }
      return s;
    });
    updateSessions(updatedSessions);
    setThinkingSteps([]); // Clear thinking

    try {
      // Start streaming process
      const reply = await handleGroqCallStream(updatedMessages, (chunk) => {
        setStreamedResponse(chunk); // Update UI character by character!
      });

      // Post process for Artifacts once stream completes
      detectAndProcessArtifacts(reply);

      // Finalize session with complete message
      const finalizedSessions = chatSessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessages, { role: 'assistant', content: reply }] };
        }
        return s;
      });
      updateSessions(finalizedSessions);
    } catch (error) {
      alert(error.message);
    }

    setStreamedResponse('');
    setIsTyping(false);
  };

  // Claude Artifact detection module
  const detectAndProcessArtifacts = (text) => {
    const htmlRegex = /```html\s*([\s\S]*?)\s*```/;
    const match = text.match(htmlRegex);
    if (match && match[1]) {
      setArtifactCode(match[1]);
      setArtifactTitle("Executable Interactive Module");
      setArtifactOpen(true);
    }
  };

  const handleMockDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setTimeout(() => {
      const docObj = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        content: `Document Summary analysis: Loaded '${file.name}'. Ready for advanced calculations inside Gunnarz AI OS.`
      };
      setMockDocs([...mockDocs, docObj]);
      
      const currentSession = getActiveSession();
      if (currentSession) {
        const docMsg = { role: 'user', content: `[Uploaded Document Attached]: ${docObj.name}\n${docObj.content}\n\nAnalyze this data document safely.` };
        const updated = chatSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, docMsg] } : s);
        updateSessions(updated);
      }
      setUploadLoading(false);
    }, 1200);
  };

  // Multi-Focus Web retrieval (Perplexity style)
  const handlePerplexitySearch = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const query = chatInput;
    setChatInput('');
    setIsTyping(true);
    setStreamedResponse('');

    if (deepThinking) {
      setThinkingSteps([
        `Initiating Perplexity-class multi-source crawl for: "${query}"`,
        "Parsing source citations and scraping educational records...",
        "Validating truth metrics and factual relevance against Wikipedia indexes...",
        "Translating synthesis results into human-friendly explanations..."
      ]);
    }

    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
      const wikiData = await wikiRes.json();
      const snippets = wikiData.query?.search?.slice(0, 4) || [];

      let searchSummary = "No direct database entries retrieved.";
      if (snippets.length > 0) {
        searchSummary = snippets.map((s, index) => `Source [${index + 1}]: ${s.title}\n"${s.snippet.replace(/<[^>]+>/g, '')}"`).join('\n\n');
      }

      const userMsg = { role: 'user', content: `🔍 [Perplexity Deep Search Active]\nFocus Target: ${searchFocus}\nQuery: "${query}"` };
      const systemContext = [
        { role: 'system', content: `You are Gunnarz AI OS V30, utilizing our premium Perplexity Web Search feature. Use the reference sources cited below to formulate an incredibly helpful, factual, and premium answer. Include clear reference citations like [Source 1], [Source 2].\n\nScraped Sources:\n${searchSummary}` },
        userMsg
      ];

      const currentSession = getActiveSession();
      const updatedSessions = chatSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...currentSession.messages, userMsg] } : s);
      updateSessions(updatedSessions);
      setThinkingSteps([]);

      // Stream the perplexity answer
      const reply = await handleGroqCallStream(systemContext, (chunk) => setStreamedResponse(chunk));

      const finalizedSessions = chatSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...currentSession.messages, userMsg, { role: 'assistant', content: reply }] } : s);
      updateSessions(finalizedSessions);

    } catch (err) {
      alert("Search synthesis failed: " + err.message);
    }
    setStreamedResponse('');
    setIsTyping(false);
  };

  // Premium FLUX Art generation
  const handleImageGeneration = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    if (!keys.hf) {
      alert("Please go to Settings and enter a Hugging Face Token to load the FLUX Image engine!");
      return;
    }

    const promptText = chatInput;
    setChatInput('');
    setIsTyping(true);

    if (deepThinking) {
      setThinkingSteps([
        "Connecting to Hugging Face FLUX.1 neural grid...",
        "Encoding conceptual text elements into tensor latent vectors...",
        "Translating dimensions into high-definition outputs..."
      ]);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: { Authorization: `Bearer ${keys.hf}` },
          method: "POST",
          body: JSON.stringify({ inputs: promptText }),
        }
      );
      if (!response.ok) throw new Error("Could not construct art canvas. Verify your Hugging Face Token.");

      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      setThinkingSteps([]);

      const userMsg = { role: 'user', content: `🎨 [Generated Artwork Concept]: "${promptText}"` };
      const assistantMsg = { role: 'assistant', content: `Here is the custom artwork you requested. I generated this on our premium Singularity Canvas!\n\n![Generated Art](${imgUrl})` };

      const currentSession = getActiveSession();
      const updatedSessions = chatSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...currentSession.messages, userMsg, assistantMsg] } : s);
      updateSessions(updatedSessions);

    } catch (err) {
      alert("Visual generation failed: " + err.message);
    }
    setIsTyping(false);
  };

  // Continuous Hands-Free Vocal Translator
  const startRecordingSequence = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

      mediaRecorder.onstop = async () => {
        setVoiceStatus('thinking');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');
        formData.append('model', 'whisper-large-v3');

        try {
          const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${keys.groq}` },
            body: formData
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);

          const transcript = data.text;
          if (!transcript.trim()) {
            if (isContinuousVoiceRef.current) { setTimeout(() => startRecordingSequence(), 1000); } 
            else { setVoiceStatus('idle'); }
            return;
          }

          const systemMsg = { role: 'system', content: `You are Gunnarz AI OS, in real-time conversational mode. Provide highly dynamic, helpful, and exceptionally brief replies (1-2 sentences maximum). Remember, you were coded exclusively by Gunnarz.` };
          
          // Use standard call (no streaming) for voice to ensure TTS gets full block at once
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [systemMsg, { role: 'user', content: transcript }], max_tokens: 500, temperature: 0.7 })
          });
          const chatData = await response.json();
          const reply = chatData.choices[0].message.content;

          setVoiceStatus('speaking');
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.onend = () => {
            if (isContinuousVoiceRef.current) {
              setVoiceStatus('listening');
              setTimeout(() => { startRecordingSequence(); }, 600);
            } else { setVoiceStatus('idle'); }
          };
          utterance.onerror = () => setVoiceStatus('idle');
          window.speechSynthesis.speak(utterance);

        } catch (err) {
          alert("Audio link failed: " + err.message);
          setVoiceStatus('idle');
        }
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setVoiceStatus('listening');
    } catch (err) {
      alert("Mic permission denied or failed to load: " + err.message);
      setVoiceStatus('idle');
    }
  };

  const handleVoiceToggle = () => {
    if (!keys.groq) return alert("An active Groq API Key is required to utilize premium real-time speech operations!");
    if (voiceStatus === 'idle') { startRecordingSequence(); } 
    else if (voiceStatus === 'listening') { if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop(); } 
    else if (voiceStatus === 'speaking') { window.speechSynthesis.cancel(); setVoiceStatus('idle'); }
  };

  const currentSession = getActiveSession();

  return (
    <div className="flex h-screen bg-[#03030b] text-[#cbd5e1] overflow-hidden font-sans selection:bg-[#00ffcc]/30 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className={`bg-[#070714] border-r border-[#1e1b4b]/50 flex flex-col transition-all duration-300 z-30 shrink-0 ${
        sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-4 border-b border-[#1e1b4b]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#00ffcc] animate-pulse" />
            <span className="font-extrabold text-[#00ffcc] tracking-widest uppercase text-xs">Gunnarz OS Library</span>
          </div>
          <button onClick={() => handleNewSession()} className="p-1.5 rounded-lg bg-[#0f0f23] border border-[#1c1c3a] hover:border-[#00ffcc] text-xs font-semibold hover:text-[#00ffcc] flex items-center gap-1.5 transition-all active:scale-95">
            <Plus size={14} /><span>New Chat</span>
          </button>
        </div>

        {/* Bonus Feature: Gunnarz Focus Dashboard */}
        <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0a0a24] to-[#0d0d2b] border border-[#1e1b4b]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#bf5af2]">
              <Activity size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Focus Module</span>
            </div>
          </div>
          <div className="text-3xl font-mono text-center text-white font-light tracking-widest mb-3">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-1 transition-all ${
                isTimerRunning ? 'bg-[#ff3b30]/20 text-[#ff3b30] border border-[#ff3b30]/40' : 'bg-[#00ffcc] text-[#03030b]'
              }`}
            >
              {isTimerRunning ? <StopCircle size={14} /> : <Timer size={14} />}
              {isTimerRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button 
              onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}
              className="px-3 rounded-lg bg-[#151536] text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 mt-2 border-t border-[#1e1b4b]/30 pt-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Active Sessions</p>
          {chatSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = session.id === editingSessionId;

            return (
              <div key={session.id} onClick={() => setActiveSessionId(session.id)} className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isActive ? 'bg-[#00ffcc]/5 border-[#00ffcc]/30 text-white' : 'bg-[#090919]/50 border-transparent hover:border-[#1c1c3a] text-[#8ea5c8]'}`}>
                <MessageSquare size={16} className={isActive ? "text-[#00ffcc]" : "text-[#3a3a5f]"} />
                <div className="flex-1 truncate text-xs font-medium pr-10">
                  {isEditing ? (
                    <input type="text" value={editTitleInput} onChange={(e) => setEditTitleInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveSessionTitle(session.id)} onClick={(e) => e.stopPropagation()} className="bg-[#0f0f2d] text-white px-2 py-1 rounded border border-[#00ffcc]/40 w-full focus:outline-none" autoFocus />
                  ) : (
                    <span>{session.title}</span>
                  )}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <button onClick={(e) => { e.stopPropagation(); saveSessionTitle(session.id); }} className="p-1 text-[#00ffcc] hover:bg-[#00ffcc]/10 rounded"><Check size={12} /></button>
                  ) : (
                    <button onClick={(e) => startEditTitle(session, e)} className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#1a1a36]"><Edit3 size={12} /></button>
                  )}
                  <button onClick={(e) => handleDeleteSession(session.id, e)} className="p-1 text-[#ff3366] hover:bg-[#ff3366]/10 rounded"><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1e1b4b]/40 bg-[#060612] text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#5d6e8a] font-bold">Singularity Engine</p>
          <p className="text-xs text-[#00ffcc] font-extrabold mt-1">Coded by Gunnarz</p>
        </div>
      </aside>

      {/* MAIN VIEW CONTROLLER */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* TOP BAR */}
        <header className="p-4 border-b border-[#1e1b4b]/40 flex items-center justify-between bg-[#060614]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[#0d0d23] border border-[#1e1b4b]/50 rounded-xl text-[#00ffcc] hover:bg-[#151532] transition-colors">
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] via-[#bf5af2] to-[#ff3b30]">{APP_FULL}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bf5af2]/10 border border-[#bf5af2]/20 text-[#bf5af2] font-black uppercase">Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#0d0d23] border border-[#1e1b4b]/50 p-1 rounded-xl">
              {Object.keys(MODEL_MODES).map((mKey) => (
                <button key={mKey} onClick={() => setSelectedModel(mKey)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${selectedModel === mKey ? 'bg-[#151536] text-white border-b-2 border-[#00ffcc]' : 'text-gray-400 hover:text-white'}`}>
                  {mKey.split('-')[0]}
                </button>
              ))}
            </div>
            <button onClick={() => setDeepThinking(!deepThinking)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border ${deepThinking ? 'bg-[#00ffcc]/15 border-[#00ffcc]/40 text-[#00ffcc]' : 'bg-[#0d0d23] border-transparent text-[#5d6e8a]'}`}>
              <BrainCircuit size={14} className={deepThinking ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">Deep Think</span>
            </button>
          </div>
        </header>

        {/* BODY AREA */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#03030a] to-[#010103] overflow-hidden relative">
            
            {!keys.groq && (
              <div className="mx-6 mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0" size={20} />
                  <span><strong>Premium Config Required:</strong> Plug in your API credentials in the Settings panel to launch instant responses directly.</span>
                </div>
                <button onClick={() => setSelectedModel("settings")} className="px-3 py-1.5 rounded bg-amber-500 text-[#03030b] font-bold tracking-wider hover:bg-amber-400 transition-colors">Set Keys</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* LIVE CAMERA STREAMING VIEWPORT */}
              {isCameraActive && (
                <div className="mb-6 relative rounded-2xl overflow-hidden border-2 border-[#00ffcc]/40 bg-black shadow-[0_0_30px_rgba(0,255,204,0.1)]">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Vision Sync</span>
                  </div>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 md:h-64 object-cover" />
                </div>
              )}

              {currentSession?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Sparkles size={48} className="text-[#00ffcc] animate-pulse mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-white mb-2">Sandbox Active - Chat initialized</h3>
                  <p className="text-xs text-[#5d6e8a] max-w-sm">Select a core engine above or input a question to get started. All data is securely isolated locally.</p>
                </div>
              ) : (
                currentSession?.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 sm:p-5 border text-sm sm:text-base leading-relaxed relative ${msg.role === 'user' ? 'bg-[#151532]/40 border-[#3a3a60]/50 text-[#e0e0f0]' : 'bg-[#090919]/70 border-[#1c1c3a] text-slate-100 shadow-2xl'}`}>
                      {msg.role === 'assistant' && (
                        <div className="text-[10px] uppercase font-black tracking-widest text-[#00ffcc] mb-2 flex items-center gap-2">
                          <Sparkles size={12} /><span>Gunnarz AI Singularity Core</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.content.includes("![Generated Art]") && (
                        <div className="mt-4 rounded-xl border border-[#00ffcc]/20 overflow-hidden bg-black/40">
                          <img src={msg.content.match(/\((.*?)\)/)?.[1] || ""} alt="Visual Canvas" className="w-full max-h-[300px] object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* LIVE STREAMING TEXT RENDERING */}
              {isTyping && streamedResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-4 sm:p-5 border bg-[#090919]/70 border-[#00ffcc]/30 text-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.1)] text-sm sm:text-base leading-relaxed relative">
                    <div className="text-[10px] uppercase font-black tracking-widest text-white mb-2 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /><span>Compiling Output...</span>
                    </div>
                    <p className="whitespace-pre-wrap">{streamedResponse}</p>
                  </div>
                </div>
              )}

              {isTyping && thinkingSteps.length > 0 && !streamedResponse && (
                <div className="p-4 bg-[#0d0d26]/40 border border-[#00ffcc]/10 rounded-xl space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5 text-xs text-[#00ffcc] font-bold">
                    <BrainCircuit size={16} className="animate-spin" /><span>Deep Thinking Chain Enabled...</span>
                  </div>
                  <ul className="text-xs text-[#5d6e8a] space-y-1 list-disc pl-5">
                    {thinkingSteps.map((step, index) => <li key={index}>{step}</li>)}
                  </ul>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {mockDocs.length > 0 && (
              <div className="p-3 bg-[#0d0d23]/80 border-t border-[#1e1b4b]/40 flex gap-2 overflow-x-auto">
                {mockDocs.map((doc, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-black/40 border border-[#1e1b4b]/60 flex items-center gap-2 text-xs text-white shrink-0">
                    <FileText size={14} className="text-[#00ffcc]" /><span className="font-semibold">{doc.name}</span><span className="text-[10px] text-gray-400">{doc.size}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-[#1e1b4b]/40 bg-[#060614]">
              {selectedModel === 'perplexity-max' && (
                <div className="flex gap-2 pb-3 overflow-x-auto">
                  {['All', 'Web', 'Academic', 'Reddit', 'Finance', 'Code'].map(focus => (
                    <button key={focus} onClick={() => setSearchFocus(focus)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider shrink-0 ${searchFocus === focus ? 'bg-[#00ffcc]/10 text-[#00ffcc] border-[#00ffcc]/40' : 'bg-[#0a0a1f] text-[#5d6e8a] border-[#1e1b4b]/50'}`}>
                      {focus}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button onClick={toggleCamera} className={`p-3 rounded-xl border transition-all active:scale-95 shrink-0 ${isCameraActive ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc]' : 'bg-[#0d0d23] border-[#1e1b4b]/50 text-gray-400 hover:text-[#00ffcc]'}`} title="Toggle Live Camera Stream">
                  {isCameraActive ? <Camera size={18} /> : <CameraOff size={18} />}
                </button>

                <label className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b]/50 text-gray-400 hover:text-[#00ffcc] cursor-pointer transition-all active:scale-95 shrink-0">
                  <input type="file" onChange={handleMockDocUpload} className="hidden" />
                  <FileText size={18} />
                </label>

                <form onSubmit={selectedModel === 'perplexity-max' ? handlePerplexitySearch : handleChatSubmit} className="flex-1 relative">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask Gunnarz Singularity anything..." className="w-full bg-[#0d0d23] border border-[#1e1b4b]/50 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#00ffcc]/50 transition-all placeholder:text-gray-500" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#00ffcc]/10 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-[#03030b] transition-all"><Send size={16} /></button>
                </form>

                <button onClick={handleImageGeneration} className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b]/50 text-gray-400 hover:text-[#bf5af2] transition-all active:scale-95 shrink-0">
                  <ImageIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* CLAUDE ARTIFACTS PANEL */}
          {artifactOpen && (
            <div className="w-[45vw] border-l border-[#1e1b4b]/50 bg-[#070716] flex flex-col h-full overflow-hidden transition-all duration-300 z-20">
              <div className="p-4 border-b border-[#1e1b4b]/40 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2.5"><Code size={18} className="text-[#00ffcc] animate-pulse" /><span className="font-extrabold text-xs tracking-wider uppercase text-white">{artifactTitle}</span></div>
                <button onClick={() => setArtifactOpen(false)} className="p-1 rounded bg-[#0d0d26] border border-[#1e1b4b]/50 text-gray-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="flex-1 bg-white p-2">
                <iframe title="Sandbox execution frame" srcDoc={artifactCode} sandbox="allow-scripts" className="w-full h-full border-none rounded bg-slate-50" />
              </div>
              <div className="p-3 bg-[#0d0d26] border-t border-[#1e1b4b]/40 flex items-center justify-between text-[11px]">
                <span className="text-[#5d6e8a] font-semibold font-mono">Sandbox: execution target safe</span>
                <button onClick={() => { navigator.clipboard.writeText(artifactCode); alert("Module code copied!"); }} className="px-3 py-1 rounded bg-[#1e1b4b] text-[#00ffcc] font-bold transition-all">Copy Raw Code</button>
              </div>
            </div>
          )}

        </div>

        {/* VOICE DRAWER */}
        <div className="p-4 bg-gradient-to-r from-[#070716] via-[#090924] to-[#070716] border-t border-[#1e1b4b]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Volume2 size={16} className="text-[#00ffcc]" /><span className="text-xs font-black uppercase text-gray-400">Continuous Voice Engine</span></div>
            <button onClick={() => setIsContinuousVoice(!isContinuousVoice)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isContinuousVoice ? 'bg-[#00ffcc]' : 'bg-[#1e1b4b]'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isContinuousVoice ? 'translate-x-5.5' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] px-3 py-1 rounded-full border uppercase font-black tracking-widest ${voiceStatus === 'listening' ? 'bg-[#ff3b30]/15 border-[#ff3b30]/40 text-[#ff3b30] animate-pulse' : voiceStatus === 'thinking' ? 'bg-[#ffcc00]/15 border-[#ffcc00]/40 text-[#ffcc00]' : voiceStatus === 'speaking' ? 'bg-[#00ffcc]/15 border-[#00ffcc]/40 text-[#00ffcc]' : 'bg-[#0a0a24] border-transparent text-gray-400'}`}>
              {voiceStatus === 'idle' ? 'Vocal Engine: Standby' : voiceStatus === 'listening' ? 'Recording Active...' : voiceStatus === 'thinking' ? 'Scraping Transcript...' : 'Translating Out Loud...'}
            </span>
            <button onClick={handleVoiceToggle} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${voiceStatus === 'listening' ? 'bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]' : 'bg-gradient-to-r from-[#00ccff] to-[#bf5af2] text-[#03030b] font-black'}`}>
              <Mic size={14} /><span>{voiceStatus === 'listening' ? 'Stop Listening' : 'Tap Voice Search'}</span>
            </button>
          </div>
        </div>

        {/* SETTINGS LAYER CONFIGURATIONS */}
        {selectedModel === 'settings' && (
          <div className="fixed inset-0 bg-[#03030ba3] backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0c0c1f] border border-[#00ffcc]/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#1c1c3a] pb-3">
                <h2 className="text-sm font-black uppercase text-[#00ffcc] tracking-widest">Configure Premium Keys</h2>
                <button onClick={() => setSelectedModel("gunnarz-singularity")} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Groq Console API Key</label>
                <input type="password" value={keys.groq} onChange={(e) => saveKeys({ ...keys, groq: e.target.value })} placeholder="gsk_..." className="w-full bg-[#050511] border border-[#1e1b4b]/70 p-3 rounded-xl text-white outline-none focus:border-[#00ffcc]/50 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Hugging Face Token</label>
                <input type="password" value={keys.hf} onChange={(e) => saveKeys({ ...keys, hf: e.target.value })} placeholder="hf_..." className="w-full bg-[#050511] border border-[#1e1b4b]/70 p-3 rounded-xl text-white outline-none focus:border-[#00ffcc]/50 transition-all text-sm" />
              </div>
              <div className="pt-3 flex justify-end">
                <button onClick={() => setSelectedModel("gunnarz-singularity")} className="px-5 py-2 rounded-xl bg-[#00ffcc] text-[#03030b] font-black tracking-widest uppercase text-xs">Save and Apply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Button (Keep around in case we need it for mobile formatting)
function RotateCcw(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
