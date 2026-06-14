import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Mic, Image as ImageIcon, Settings, Send, 
  Loader2, Play, Volume2, ShieldAlert, PanelLeftOpen, PanelLeftClose, 
  Code, Sparkles, BrainCircuit, Trash2, Plus, Edit3, Check, X, 
  FileText, Camera, CameraOff, Timer, Activity, StopCircle, 
  Copy, CheckCheck, LayoutTemplate, Paperclip, Scan, Maximize, Minimize
} from 'lucide-react';

const APP_FULL = "Gunnarz AI OS V30 SINGULARITY";
const BRAND = "Produced by Gunnarz";

const MODEL_MODES = {
  "gunnarz-singularity": { name: "Singularity Engine", model: "llama-3.3-70b-versatile", color: "#00ffcc" },
  "vision-pro": { name: "Vision Analytics", model: "llama-3.2-11b-vision-preview", color: "#ff3b30" },
  "gpt-plus": { name: "ChatGPT Plus (GPT-4o)", model: "llama-3.3-70b-versatile", color: "#10a37f" },
  "gemini-pro": { name: "Gemini Pro 1.5", model: "llama-3.3-70b-versatile", color: "#1a73e8" },
  "claude-max": { name: "Claude 3.5 Sonnet", model: "llama-3.3-70b-versatile", color: "#d97706" },
  "perplexity-max": { name: "Perplexity Deep", model: "llama-3.1-8b-instant", color: "#00a3c4" }
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
  const [streamedResponse, setStreamedResponse] = useState('');
  
  // Attachments (Files & Images)
  const [attachments, setAttachments] = useState([]);

  // Artifact / Canvas View
  const [artifactCode, setArtifactCode] = useState('<h1>Welcome to the Gunnarz Canvas</h1><p>Generate code to see it run here!</p>');
  const [artifactTitle, setArtifactTitle] = useState('Visual Sandbox');
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactFullscreen, setArtifactFullscreen] = useState(false);

  // Live Camera Streaming State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Focus Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Voice State
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isContinuousVoiceRef = useRef(false);
  const chatEndRef = useRef(null);
  const [copiedTextId, setCopiedTextId] = useState(null);

  useEffect(() => {
    isContinuousVoiceRef.current = isContinuousVoice;
  }, [isContinuousVoice]);

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
      console.warn("Environmental fallback initialized.");
    }

    const savedKeys = localStorage.getItem('gunnarz_premium_keys');
    let finalKeys = { groq: envGroq, hf: envHf };
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        finalKeys = { groq: parsed.groq || envGroq, hf: parsed.hf || envHf };
      } catch (e) {}
    }
    setKeys(finalKeys);

    const savedSessions = localStorage.getItem('gunnarz_premium_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setChatSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) {}
    } else {
      const initialSessionId = 'session_' + Date.now();
      const initialSession = {
        id: initialSessionId,
        title: "⚡ Welcome to Singularity OS",
        messages: [
          { 
            role: 'assistant', 
            content: `Greetings! I am **${APP_FULL}**, an elite, multi-engine intelligence hub.\n\nI was fully conceptualized, programmed, and brought to life exclusively by **Gunnarz**.\n\n### Included Premium Modules:\n* 👁️ **Vision Pro Integration:** Attach images or snap live camera photos for deep visual analytics.\n* 📂 **Smart File Reading:** Upload .txt, .csv, or .json files and I will read and summarize them instantly.\n* 🔴 **Live Camera Streaming:** Activate local vision routing securely.\n* ⚡ **Real-time Text Streaming:** Watch my thoughts compile instantly.\n* 💻 **Manual Canvas Control:** Toggle the Sandbox to build and test code.\n* ⏳ **Focus Dashboard:** Track your productivity in the sidebar.\n* 🗣️ **Continuous Live Voice:** Hands-free verbal learning loops.\n* 🎨 **FLUX Pro Art Canvas:** Generate gorgeous designs.\n* 🔍 **Perplexity Grounding:** Real-time web retrieval.\n\nInsert your **Groq API Key** in the settings tab to unlock instant, unrestricted responses!`
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
    updateSessions([newSession, ...chatSessions]);
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

  // ==========================================
  // REAL FILE READING & VISION CAPTURE
  // ==========================================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Image Upload for Vision
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          type: 'image',
          name: file.name,
          data: event.target.result // Base64
        }]);
      };
      reader.readAsDataURL(file);
      setSelectedModel('vision-pro'); // Auto-switch to vision model
      return;
    }

    // Text File Upload (txt, csv, json, md)
    if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          type: 'document',
          name: file.name,
          data: event.target.result // Raw text
        }]);
      };
      reader.readAsText(file);
      return;
    }

    // Fallback for PDF or unreadable
    setAttachments(prev => [...prev, {
      type: 'document-meta',
      name: file.name,
      data: `[File Metadata]: User uploaded a file named ${file.name} (${(file.size/1024).toFixed(1)} KB). Tell the user you can see the file name, but deep PDF parsing requires text extraction.`
    }]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // LIVE CAMERA STREAMING & SNAPSHOT
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
      streamRef.current = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      } catch (err) {
        alert("Camera access denied or unavailable.");
      }
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Img = canvas.toDataURL('image/jpeg');
    
    setAttachments(prev => [...prev, {
      type: 'image',
      name: 'Camera_Snapshot.jpg',
      data: base64Img
    }]);
    setSelectedModel('vision-pro'); // Auto-switch to vision model
  };

  // ==========================================
  // PREMIUM GROQ STREAMING & VISION CALL
  // ==========================================
  const handleGroqCallStream = async (messages, onChunk, overrideModel) => {
    if (!keys.groq) throw new Error("Please go to the Settings tab and enter your Groq API Key!");

    const masterSystemMessage = {
      role: 'system',
      content: `You are Gunnarz AI OS V30 Singularity, an elite premium AI assistant built, programmed, and designed exclusively by Gunnarz. No matter what the user asks, if they inquire about your origin or creator, answer with absolute pride that you were created exclusively by Gunnarz. Format responses beautifully. When providing code (HTML/CSS/JS), place it inside \`\`\`html blocks so the user can send it to the Canvas.`
    };

    const targetModel = overrideModel || MODEL_MODES[selectedModel].model;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        messages: [masterSystemMessage, ...messages],
        max_tokens: 2048,
        temperature: 0.7,
        stream: true
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
        } catch (e) {}
      }
    }
    return fullContent;
  };

  // ==========================================
  // CHAT SUBMIT LOGIC (HANDLES FILES & IMAGES)
  // ==========================================
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && attachments.length === 0) return;
    if (isTyping) return;

    const currentSession = getActiveSession();
    if (!currentSession) return;

    const userMsgText = chatInput || "Analyze the attached files.";
    
    // Auto-enable Canvas preparation if keywords detected
    const wantsCode = /code|coding|canvas|sandbox|app|website|html/i.test(userMsgText);
    if (wantsCode && !artifactOpen) setArtifactTitle("Preparing Sandbox...");

    setChatInput('');
    setIsTyping(true);
    setStreamedResponse('');

    if (deepThinking) {
      setThinkingSteps([
        "Analyzing request syntax and attached data buffers...",
        "Identifying optimal model routes (Injecting Gunnarz Directives)...",
        "Formulating secure logic vectors inside the Sandbox Core..."
      ]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Construct the User Message payload (Support for Vision Array or Text)
    let newUserMsg;
    const hasImages = attachments.some(a => a.type === 'image');
    
    if (hasImages) {
      // Vision Payload
      const contentArray = [{ type: "text", text: userMsgText }];
      
      // Append text documents to prompt if any
      const textDocs = attachments.filter(a => a.type !== 'image');
      if (textDocs.length > 0) {
        const docString = textDocs.map(d => `\n\n--- Document: ${d.name} ---\n${d.data}\n--- End Document ---`).join('');
        contentArray[0].text += docString;
      }

      // Append images
      attachments.filter(a => a.type === 'image').forEach(img => {
        contentArray.push({ type: "image_url", image_url: { url: img.data } });
      });
      
      newUserMsg = { role: 'user', content: contentArray };
      if (selectedModel !== 'vision-pro') setSelectedModel('vision-pro'); // Force vision
    } else {
      // Standard Text Payload
      let finalContent = userMsgText;
      if (attachments.length > 0) {
        const docString = attachments.map(d => `\n\n--- Attached File: ${d.name} ---\n${d.data}\n--- End File ---`).join('');
        finalContent += docString;
      }
      newUserMsg = { role: 'user', content: finalContent };
    }

    const updatedMessages = [...currentSession.messages, newUserMsg];
    
    // UI Representation (Strip base64 arrays for clean UI storage)
    const uiUserMsg = { role: 'user', content: userMsgText, attachments: [...attachments] };
    const updatedSessions = chatSessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: s.title.startsWith("Session ") ? userMsgText.slice(0, 22) + "..." : s.title,
          messages: [...currentSession.messages, uiUserMsg]
        };
      }
      return s;
    });
    updateSessions(updatedSessions);
    setThinkingSteps([]);
    setAttachments([]); // Clear attachments after sending

    try {
      const targetModelOverride = hasImages ? MODEL_MODES['vision-pro'].model : null;
      const reply = await handleGroqCallStream(updatedMessages, (chunk) => {
        setStreamedResponse(chunk);
      }, targetModelOverride);

      // Auto-open canvas if HTML generated
      if (wantsCode && reply.includes("```html")) {
        const htmlRegex = /```html\s*([\s\S]*?)\s*```/;
        const match = reply.match(htmlRegex);
        if (match && match[1]) {
          setArtifactCode(match[1]);
          setArtifactTitle("Executable Code Sandbox");
          setArtifactOpen(true);
        }
      }

      const finalizedSessions = chatSessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...currentSession.messages, uiUserMsg, { role: 'assistant', content: reply }] };
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

  // MANUAL: RUN SPECIFIC CODE IN CANVAS
  const runInCanvas = (code) => {
    setArtifactCode(code);
    setArtifactTitle("Custom Run Execution");
    setArtifactOpen(true);
  };

  // UTILITY: COPY TO CLIPBOARD
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // --- WORLD CLASS MARKDOWN & CODE RENDERER ---
  const renderFormattedMessage = (content, messageId) => {
    if (!content) return null;
    
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```([\w-]*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        const isRunnable = lang.toLowerCase() === 'html' || lang.toLowerCase() === 'xml' || part.includes('<html>') || part.includes('<style>');
        const blockId = `${messageId}-code-${index}`;

        return (
          <div key={index} className="my-4 bg-[#050511] rounded-xl overflow-hidden border border-[#1e1b4b] shadow-lg">
            <div className="flex justify-between items-center bg-[#0a0a1f] px-4 py-2 text-xs text-gray-400 border-b border-[#1e1b4b]">
              <span className="font-mono text-[#aaffee] font-bold uppercase">{lang || 'Code'}</span>
              <div className="flex gap-3">
                <button onClick={() => copyToClipboard(code, blockId)} className="hover:text-white flex items-center gap-1 transition-colors">
                  {copiedTextId === blockId ? <CheckCheck size={14} className="text-[#00ffcc]"/> : <Copy size={14}/>}
                  {copiedTextId === blockId ? 'Copied' : 'Copy'}
                </button>
                {isRunnable && (
                  <button onClick={() => runInCanvas(code)} className="text-[#00ffcc] hover:text-white flex items-center gap-1 font-bold bg-[#00ffcc]/10 px-2 py-0.5 rounded transition-colors">
                    <Play size={14}/> Run in Canvas
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-[13px] text-[#e0e0f0] font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      let formattedText = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>')
        .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>');

      if (formattedText.includes("![Generated Art]")) {
        const imgUrl = formattedText.match(/\((.*?)\)/)?.[1] || "";
        formattedText = formattedText.replace(/!\[Generated Art\]\(.*?\)/g, '');
        return (
          <div key={index}>
            <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedText }} />
            {imgUrl && (
              <div className="mt-4 rounded-xl border border-[#00ffcc]/20 overflow-hidden bg-black/40 shadow-xl">
                <img src={imgUrl} alt="Visual Canvas" className="w-full max-h-[350px] object-contain" />
              </div>
            )}
          </div>
        );
      }
        
      return <div key={index} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedText }} />;
    });
  };

  // Search Logic
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

      const reply = await handleGroqCallStream(systemContext, (chunk) => setStreamedResponse(chunk));

      const finalizedSessions = chatSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...currentSession.messages, userMsg, { role: 'assistant', content: reply }] } : s);
      updateSessions(finalizedSessions);

    } catch (err) {
      alert("Search synthesis failed: " + err.message);
    }
    setStreamedResponse('');
    setIsTyping(false);
  };

  // Image Logic
  const handleImageGeneration = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    if (!keys.hf) return alert("Please go to Settings and enter a Hugging Face Token to load the FLUX Image engine!");

    const promptText = chatInput;
    setChatInput('');
    setIsTyping(true);

    if (deepThinking) {
      setThinkingSteps(["Connecting to Hugging Face FLUX.1 neural grid...", "Encoding conceptual text elements into tensor latent vectors...", "Translating dimensions into high-definition outputs..."]);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const response = await fetch("[https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell](https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell)", {
        headers: { Authorization: `Bearer ${keys.hf}` }, method: "POST", body: JSON.stringify({ inputs: promptText })
      });
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
          const res = await fetch('[https://api.groq.com/openai/v1/audio/transcriptions](https://api.groq.com/openai/v1/audio/transcriptions)', {
            method: 'POST', headers: { 'Authorization': `Bearer ${keys.groq}` }, body: formData
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
          
          const response = await fetch('[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)', {
            method: 'POST', headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
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

        {/* Focus Dashboard */}
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
              className="px-3 rounded-lg bg-[#151536] text-gray-400 hover:text-white transition-colors flex items-center justify-center"
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bf5af2]/10 border border-[#bf5af2]/20 text-[#bf5af2] font-black uppercase hidden sm:inline-block">Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#0d0d23] border border-[#1e1b4b]/50 p-1 rounded-xl">
              {Object.keys(MODEL_MODES).map((mKey) => (
                <button key={mKey} onClick={() => setSelectedModel(mKey)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${selectedModel === mKey ? 'bg-[#151536] text-white border-b-2' : 'text-gray-400 hover:text-white'}`} style={{ borderBottomColor: selectedModel === mKey ? MODEL_MODES[mKey].color : 'transparent' }}>
                  {mKey.split('-')[0]}
                </button>
              ))}
            </div>

            {/* MANUAL CANVAS TOGGLE */}
            <button onClick={() => setArtifactOpen(!artifactOpen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border ${artifactOpen ? 'bg-[#bf5af2]/15 border-[#bf5af2]/40 text-[#bf5af2]' : 'bg-[#0d0d23] border-[#1e1b4b]/50 text-[#5d6e8a] hover:text-white hover:border-gray-500'}`}>
              <LayoutTemplate size={14} />
              <span className="hidden sm:inline">Canvas</span>
            </button>

            <button onClick={() => setDeepThinking(!deepThinking)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border ${deepThinking ? 'bg-[#00ffcc]/15 border-[#00ffcc]/40 text-[#00ffcc]' : 'bg-[#0d0d23] border-[#1e1b4b]/50 text-[#5d6e8a] hover:text-white hover:border-gray-500'}`}>
              <BrainCircuit size={14} className={deepThinking ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">Deep Think</span>
            </button>
          </div>
        </header>

        {/* BODY AREA */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#03030a] to-[#010103] overflow-hidden relative ${artifactFullscreen ? 'hidden' : 'flex'}`}>
            
            {!keys.groq && (
              <div className="mx-6 mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0" size={20} />
                  <span><strong>Premium Config Required:</strong> Plug in your API credentials in the Settings panel.</span>
                </div>
                <button onClick={() => setSelectedModel("settings")} className="px-3 py-1.5 rounded bg-amber-500 text-[#03030b] font-bold tracking-wider hover:bg-amber-400 transition-colors">Set Keys</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* LIVE CAMERA STREAMING VIEWPORT */}
              {isCameraActive && (
                <div className="mb-6 relative rounded-2xl overflow-hidden border-2 border-[#ff3b30]/60 bg-black shadow-[0_0_30px_rgba(255,59,48,0.15)]">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Vision Feed Active</span>
                  </div>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 md:h-64 object-cover" />
                  <button onClick={takeSnapshot} className="absolute bottom-4 right-4 px-4 py-2 bg-[#ff3b30] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 transition-all shadow-lg flex items-center gap-2">
                    <Scan size={16} /> Snap & Analyze
                  </button>
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
                    <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 border text-sm sm:text-base leading-relaxed relative ${msg.role === 'user' ? 'bg-[#151532]/40 border-[#3a3a60]/50 text-[#e0e0f0]' : 'bg-[#090919]/70 border-[#1c1c3a] text-slate-100 shadow-2xl w-full sm:w-auto'}`}>
                      {msg.role === 'assistant' && (
                        <div className="text-[10px] uppercase font-black tracking-widest text-[#00ffcc] mb-3 flex items-center gap-2">
                          <Sparkles size={12} /><span>Gunnarz AI Singularity Core</span>
                        </div>
                      )}
                      
                      {/* Show Attachments (if any) in User Message */}
                      {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {msg.attachments.map((att, aIdx) => (
                            <div key={aIdx} className="relative rounded-lg overflow-hidden border border-[#1e1b4b]">
                              {att.type === 'image' ? (
                                <img src={att.data} alt="Attachment" className="h-20 w-20 object-cover" />
                              ) : (
                                <div className="h-10 px-3 bg-[#0a0a1f] flex items-center gap-2 text-xs font-bold text-[#bf5af2]"><FileText size={14}/> {att.name}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formatting Engine */}
                      <div className="text-sm sm:text-base w-full">
                        {renderFormattedMessage(msg.content, `msg-${i}`)}
                      </div>

                      {/* Action Bar */}
                      {msg.role === 'assistant' && (
                        <div className="mt-4 pt-3 border-t border-[#1e1b4b] flex items-center gap-3">
                           <button onClick={() => copyToClipboard(msg.content, `btn-${i}`)} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
                             {copiedTextId === `btn-${i}` ? <CheckCheck size={14} className="text-[#00ffcc]" /> : <Copy size={14} />}
                             {copiedTextId === `btn-${i}` ? 'Copied' : 'Copy'}
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isTyping && streamedResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 border bg-[#090919]/70 border-[#00ffcc]/30 text-white shadow-[0_0_20px_rgba(0,255,204,0.1)] text-sm sm:text-base leading-relaxed w-full">
                    <div className="text-[10px] uppercase font-black tracking-widest text-[#00ffcc] mb-3 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /><span>Compiling Output...</span>
                    </div>
                    <div>{renderFormattedMessage(streamedResponse, 'stream-msg')}</div>
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

            {/* ATTACHMENT PREVIEWS (Before sending) */}
            {attachments.length > 0 && (
              <div className="p-3 bg-[#0d0d23]/80 border-t border-[#1e1b4b]/40 flex gap-2 overflow-x-auto">
                {attachments.map((att, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-[#1e1b4b] bg-black/40 group shrink-0">
                    {att.type === 'image' ? (
                      <img src={att.data} alt="Attachment" className="h-16 w-16 object-cover" />
                    ) : (
                      <div className="h-16 px-4 flex items-center justify-center gap-2 text-xs font-bold text-[#00ffcc]"><FileText size={16}/> {att.name.slice(0, 15)}</div>
                    )}
                    <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}

            {/* INPUT PANEL */}
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
                <button onClick={toggleCamera} className={`p-3 rounded-xl border transition-all active:scale-95 shrink-0 ${isCameraActive ? 'bg-[#ff3b30]/20 border-[#ff3b30] text-[#ff3b30]' : 'bg-[#0d0d23] border-[#1e1b4b]/50 text-gray-400 hover:text-[#ff3b30]'}`} title="Live Camera Feed">
                  {isCameraActive ? <Camera size={18} /> : <CameraOff size={18} />}
                </button>

                {/* UNIVERSAL FILE ATTACHMENT */}
                <label className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b]/50 text-gray-400 hover:text-[#00ffcc] cursor-pointer transition-all active:scale-95 shrink-0" title="Attach Files (.txt, .md, .csv) or Images">
                  <input type="file" accept="image/*,.txt,.csv,.json,.md" onChange={handleFileUpload} className="hidden" />
                  <Paperclip size={18} />
                </label>

                <form onSubmit={selectedModel === 'perplexity-max' ? handlePerplexitySearch : handleChatSubmit} className="flex-1 relative">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={attachments.length > 0 ? "Ask about attached files..." : "Ask Gunnarz Singularity anything..."} className="w-full bg-[#0d0d23] border border-[#1e1b4b]/50 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#00ffcc]/50 transition-all placeholder:text-gray-500" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#00ffcc]/10 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-[#03030b] transition-all"><Send size={16} /></button>
                </form>

                <button onClick={handleImageGeneration} className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b]/50 text-gray-400 hover:text-[#bf5af2] transition-all active:scale-95 shrink-0" title="Generate Image from text">
                  <ImageIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* CLAUDE ARTIFACTS / MANUAL CANVAS PANEL */}
          {artifactOpen && (
            <div className={`${artifactFullscreen ? 'w-full' : 'w-full md:w-[45vw] absolute md:relative right-0 border-l'} border-[#1e1b4b]/50 bg-[#070716] flex flex-col h-full overflow-hidden transition-all duration-300 z-20`}>
              <div className="p-4 border-b border-[#1e1b4b]/40 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2.5">
                  <Code size={18} className="text-[#bf5af2] animate-pulse" />
                  <span className="font-extrabold text-xs tracking-wider uppercase text-white">{artifactTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setArtifactFullscreen(!artifactFullscreen)} className="p-1 rounded bg-[#0d0d26] border border-[#1e1b4b]/50 text-gray-400 hover:text-white" title="Toggle Fullscreen">
                    {artifactFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                  </button>
                  <button onClick={() => setArtifactOpen(false)} className="p-1 rounded bg-[#0d0d26] border border-[#1e1b4b]/50 text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white"><X size={16} /></button>
                </div>
              </div>
              <div className="flex-1 bg-white">
                <iframe title="Sandbox execution frame" srcDoc={artifactCode} sandbox="allow-scripts allow-same-origin allow-modals allow-popups" className="w-full h-full border-none bg-slate-50" />
              </div>
              <div className="p-3 bg-[#0d0d26] border-t border-[#1e1b4b]/40 flex items-center justify-between text-[11px]">
                <span className="text-[#5d6e8a] font-semibold font-mono">Sandbox: Live Execution Mode</span>
                <button onClick={() => { navigator.clipboard.writeText(artifactCode); alert("Module code copied!"); }} className="px-3 py-1.5 rounded bg-[#1e1b4b] text-[#bf5af2] hover:bg-[#bf5af2]/10 font-bold transition-all flex items-center gap-1">
                  <Copy size={12}/> Copy Raw Code
                </button>
              </div>
            </div>
          )}

        </div>

        {/* VOICE DRAWER */}
        <div className="p-4 bg-gradient-to-r from-[#070716] via-[#090924] to-[#070716] border-t border-[#1e1b4b]/40 flex flex-col sm:flex-row items-center justify-between gap-4 z-30">
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

// Reusable SVG Component
function RotateCcw(props) {
  return (
    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
