import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, MessageSquare, Mic, Image as ImageIcon, Settings, Send,
  Loader2, Play, Volume2, PanelLeftOpen, Trash2, Plus, Edit3, Check, X,
  FileText, Camera, RotateCcw, MonitorPlay, FileCode2, Star, Sun, Moon, Key,
  Download, Languages, Copy, CheckCheck, LayoutTemplate, Paperclip, Scan,
  Maximize, Minimize, Sparkles, BrainCircuit, Activity, CameraOff, StopCircle
} from 'lucide-react';

const APP_FULL = 'Gunnarz AI OS V30 SINGULARITY';

const MODEL_MODES = {
  'gunnarz-singularity': { name: 'Singularity Engine', model: 'llama-3.3-70b-versatile' },
  'vision-pro': { name: 'Vision Analytics', model: 'llama-3.2-90b-vision-preview' },
  'gpt-plus': { name: 'ChatGPT Plus (GPT-4o)', model: 'llama-3.3-70b-versatile' },
  'gemini-pro': { name: 'Gemini Pro 1.5', model: 'llama-3.3-70b-versatile' },
  'claude-max': { name: 'Claude 3.5 Sonnet', model: 'llama-3.3-70b-versatile' },
  'perplexity-max': { name: 'Perplexity Deep', model: 'llama-3.1-8b-instant' },
  'open-router': { name: 'OpenRouter Suite', model: 'openrouter' },
};

const PROMPT_TEMPLATES = [
  { label: "👶 Explain Like I'm 5", prompt: 'Explain the following concept like I am a 5 year old using simple analogies:\n' },
  { label: '🐛 Debug Code Block', prompt: 'Inspect the following code for bugs, errors, or performance issues and explain the fix cleanly:\n' },
  { label: '📝 Summarize Article', prompt: 'Provide a concise bulleted summary of this text highlighting key takeaways:\n' },
  { label: '🎓 Write Study Guide', prompt: 'Create a structured study guide with quick quiz questions for this topic:\n' },
];

const QUICK_ACTIONS = [
  { label: 'Summarize', prompt: 'Summarize this clearly and briefly:\n' },
  { label: 'Translate', prompt: 'Translate the following text to Spanish:\n' },
  { label: 'Explain', prompt: 'Explain this in simple terms:\n' },
  { label: 'Code', prompt: 'Turn this into clean code:\n' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [keys, setKeys] = useState({ groq: '', hf: '', openrouter: '' });
  const [customORModel, setCustomORModel] = useState('google/gemini-2.5-flash');

  const [selectedModel, setSelectedModel] = useState('gunnarz-singularity');
  const [deepThinking, setDeepThinking] = useState(true);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [isLightMode, setIsLightMode] = useState(false);
  const [fontSize, setFontSize] = useState('text-sm');

  const [isIncognito, setIsIncognito] = useState(false);
  const [appLocked, setAppLocked] = useState(false);
  const [appPin, setAppPin] = useState('');
  const [pinInput, setPinInput] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredMessages, setStarredMessages] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  const [attachments, setAttachments] = useState([]);
  const [persistentDocs, setPersistentDocs] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [canvasTabs, setCanvasTabs] = useState([
    {
      id: 'tab1',
      name: 'index.html',
      code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #070711; color: #00ffcc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  h1 { text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px #00ffcc; }
</style>
</head>
<body>
  <h1>Gunnarz OS Workspace Active</h1>
</body>
</html>`
    }
  ]);
  const [activeCanvasTab, setActiveCanvasTab] = useState('tab1');
  const [artifactCode, setArtifactCode] = useState('<h1>Welcome to the Gunnarz Canvas</h1>');
  const [artifactTitle, setArtifactTitle] = useState('Visual Sandbox');
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactFullscreen, setArtifactFullscreen] = useState(false);
  const [canvasTabMode, setCanvasTabMode] = useState('preview');
  const [pythonOutput, setPythonOutput] = useState('');
  const [isPythonLoading, setIsPythonLoading] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isContinuousVoiceRef = useRef(false);
  const audioContextRef = useRef(null);
  const voiceDetectionLoopRef = useRef(null);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);

  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [memoryNotes, setMemoryNotes] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareModels, setCompareModels] = useState(['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']);
  const [importStatus, setImportStatus] = useState('');

  const [copiedTextId, setCopiedTextId] = useState(null);
  const chatEndRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { isContinuousVoiceRef.current = isContinuousVoice; }, [isContinuousVoice]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    else if (timeLeft === 0) { setIsTimerRunning(false); alert('Focus Session Complete!'); }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setAttachments((prev) => [...prev, { type: 'image', name: 'pasted_image.jpg', data: ev.target.result }]);
              processOCR(ev.target.result, 'pasted_image.jpg');
            };
            reader.readAsDataURL(file);
            setSelectedModel('vision-pro');
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    const savedKeys = localStorage.getItem('gunnarz_premium_keys_v3');
    if (savedKeys) { try { setKeys(JSON.parse(savedKeys)); } catch {} }

    const savedPin = localStorage.getItem('gunnarz_app_pin');
    if (savedPin) { setAppLocked(true); setAppPin(savedPin); }

    const savedSessions = localStorage.getItem('gunnarz_premium_sessions_v3');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setChatSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch {}
    } else {
      setupDefaultSession();
    }

    const savedStars = localStorage.getItem('gunnarz_starred');
    if (savedStars) { try { setStarredMessages(JSON.parse(savedStars)); } catch {} }

    const savedMemory = localStorage.getItem('gunnarz_memory_notes_v1');
    if (savedMemory) { try { setMemoryNotes(JSON.parse(savedMemory)); } catch {} }
  }, []);

  const setupDefaultSession = () => {
    const initialId = `session_${Date.now()}`;
    const initialSession = {
      id: initialId,
      title: '⚡ Welcome to Singularity',
      messages: [{
        role: 'assistant',
        content: `Greetings! I am **${APP_FULL}**, an elite intelligence hub exclusively coded by **Gunnarz**.\n\n### Premium Modules Online:\n* 👁️ **Vision Pro:** Live camera or image uploads.\n* 📂 **Document OCR/PDF:** Upload text, PDFs, or images for deep analysis.\n* 💻 **Premium Canvas:** Edit and preview code in real-time.\n* 🗣️ **Smart Voice:** Human-like conversational pausing.\n\n*Plug in your API keys in Settings to begin.*`
      }]
    };
    setChatSessions([initialSession]);
    setActiveSessionId(initialId);
    if (!isIncognito) localStorage.setItem('gunnarz_premium_sessions_v3', JSON.stringify([initialSession]));
  };

  const updateSessions = (newSessions) => {
    setChatSessions(newSessions);
    if (!isIncognito) localStorage.setItem('gunnarz_premium_sessions_v3', JSON.stringify(newSessions));
  };

  const getActiveSession = () => chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  const saveKeys = (newKeys) => {
    setKeys(newKeys);
    localStorage.setItem('gunnarz_premium_keys_v3', JSON.stringify(newKeys));
  };

  const saveMemoryNotes = (notes) => {
    setMemoryNotes(notes);
    if (!isIncognito) localStorage.setItem('gunnarz_memory_notes_v1', JSON.stringify(notes));
  };

  const extractMemoryFromMessage = (text) => {
    if (typeof text !== 'string') return null;
    const patterns = [/remember that (.+)/i, /my name is (.+)/i, /i prefer (.+)/i, /save this: (.+)/i, /note that (.+)/i];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return null;
  };

  const exportCurrentSession = () => {
    const currentSession = getActiveSession();
    if (!currentSession) return;
    const payload = {
      app: APP_FULL,
      exportedAt: new Date().toISOString(),
      session: currentSession,
      memoryNotes,
      starredMessages,
      persistentDocs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentSession.title || 'gunnarz-session'}.json`;
    link.click();
  };

  const importSessionFile = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data?.session?.id || !Array.isArray(data?.session?.messages)) throw new Error('Invalid session file');
      const importedId = `session_${Date.now()}`;
      const importedSession = { ...data.session, id: importedId, title: data.session.title ? `Imported: ${data.session.title}` : 'Imported Session' };
      updateSessions([importedSession, ...chatSessions]);
      setActiveSessionId(importedId);
      if (Array.isArray(data.memoryNotes)) saveMemoryNotes(data.memoryNotes);
      if (Array.isArray(data.starredMessages)) setStarredMessages(data.starredMessages);
      if (Array.isArray(data.persistentDocs)) setPersistentDocs(data.persistentDocs);
      setImportStatus('Session imported successfully.');
    } catch (err) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  const handleNewSession = () => {
    const newId = `session_${Date.now()}`;
    const newSession = { id: newId, title: `Session ${chatSessions.length + 1}`, messages: [] };
    const nextSessions = [newSession, ...chatSessions];
    updateSessions(nextSessions);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    const filtered = chatSessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      const resetId = `session_${Date.now()}`;
      updateSessions([{ id: resetId, title: 'New Session', messages: [] }]);
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
    const updated = chatSessions.map((s) => (s.id === id ? { ...s, title: editTitleInput.trim() || s.title } : s));
    updateSessions(updated);
    setEditingSessionId(null);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = (e) => { e.preventDefault(); dragCounter.current += 1; if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); dragCounter.current -= 1; if (dragCounter.current === 0) setIsDragging(false); };
  const handleDrop = async (e) => { e.preventDefault(); setIsDragging(false); dragCounter.current = 0; const file = e.dataTransfer.files[0]; if (file) await processUploadedFile(file); };

  const processOCR = async (imageSrc, fileName) => {
    setIsProcessingFile(true);
    try {
      if (!window.Tesseract) {
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/tesseract.js@v5.1.0/dist/tesseract.min.js';
          script.onload = res;
          script.onerror = rej;
          document.head.appendChild(script);
        });
      }
      const result = await window.Tesseract.recognize(imageSrc, 'eng');
      const docPayload = { type: 'document', name: `OCR_${fileName}.txt`, data: `[Extracted Text]:\n${result.data.text}` };
      setAttachments((prev) => [...prev, docPayload]);
      setPersistentDocs((prev) => [...prev, docPayload]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const processPDF = async (file) => {
    setIsProcessingFile(true);
    try {
      if (!window.pdfjsLib) {
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          script.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'; res(); };
          script.onerror = rej;
          document.head.appendChild(script);
        });
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += `--- Page ${i} ---\n${content.items.map((item) => item.str).join(' ')}\n\n`;
          }
          const docPayload = { type: 'document', name: file.name, data: `[PDF Content]:\n${fullText}` };
          setAttachments((prev) => [...prev, docPayload]);
          setPersistentDocs((prev) => [...prev, docPayload]);
        } catch (err) {
          alert(`PDF Error: ${err.message}`);
        } finally {
          setIsProcessingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert('PDF load failed.');
      setIsProcessingFile(false);
    }
  };

  const processUploadedFile = async (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments((prev) => [...prev, { type: 'image', name: file.name, data: ev.target.result }]);
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
          method: 'POST',
          headers: { Authorization: `Bearer ${keys.groq}` },
          body: formData,
        });
        const d = await res.json();
        if (d.text) setAttachments((prev) => [...prev, { type: 'document', name: `Audio_${file.name}.txt`, data: `[Audio Transcript]:\n${d.text}` }]);
      } catch {
        alert('Audio transcription failed.');
      } finally {
        setIsProcessingFile(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const docPayload = { type: 'document', name: file.name, data: ev.target.result };
      setAttachments((prev) => [...prev, docPayload]);
      setPersistentDocs((prev) => [...prev, docPayload]);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) await processUploadedFile(file);
  };

  const removeAttachment = (index) => setAttachments((prev) => prev.filter((_, i) => i !== index));

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      setIsCameraActive(false);
      streamRef.current = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      } catch {
        alert('Camera access denied.');
      }
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg');
    setAttachments((prev) => [...prev, { type: 'image', name: 'Snapshot.jpg', data: b64 }]);
    setSelectedModel('vision-pro');
    processOCR(b64, 'Snapshot.jpg');
  };

  const handleGroqCallStream = async (messages, onChunk, overrideModel) => {
    if (!keys.groq && selectedModel !== 'open-router') throw new Error('Missing Groq API Key.');

    let targetModel = overrideModel || MODEL_MODES[selectedModel].model;
    let url = 'https://api.groq.com/openai/v1/chat/completions';
    let headers = { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' };

    if (selectedModel === 'open-router') {
      if (!keys.openrouter) throw new Error('Missing OpenRouter Key.');
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        Authorization: `Bearer ${keys.openrouter}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gunnarz-ai.netlify.app',
        'X-Title': 'Gunnarz AI OS',
      };
      targetModel = customORModel;
    }

    const systemMsg = {
      role: 'system',
      content: `You are Gunnarz AI OS V30 Singularity. Format beautifully with markdown. Put executable HTML/CSS/JS code inside \`\`\`html code blocks so users can immediately run it.`
    };

    const safeMsgs = messages.map((m) => ({ role: m.role, content: m.content }));
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: targetModel, messages: [systemMsg, ...safeMsgs], max_tokens: 3000, temperature: 0.7, stream: true }),
    });

    if (!response.ok) throw new Error((await response.json()).error?.message || 'Completions Connection Error');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunks = decoder.decode(value, { stream: true }).split('\n');
      for (const chunk of chunks) {
        if (chunk.trim().startsWith('data: ') && chunk.trim() !== 'data: [DONE]') {
          try {
            const data = JSON.parse(chunk.replace(/^data: /, ''));
            if (data.choices?.[0]?.delta?.content) {
              fullContent += data.choices[0].delta.content;
              onChunk(fullContent);
            }
          } catch {}
        }
      }
    }
    return fullContent;
  };

  const compareModelReplies = async (messages) => {
    const results = [];
    for (const model of compareModels) {
      try {
        const reply = await handleGroqCallStream(messages, () => {}, model);
        results.push({ model, reply });
      } catch (e) {
        results.push({ model, reply: `Error: ${e.message}` });
      }
    }
    return results;
  };

  const compressContextIfNecessary = async (messages) => {
    if (messages.length > 10 && keys.groq) {
      const compressCount = Math.floor(messages.length / 2);
      const toCompress = messages.slice(0, compressCount);
      const remainder = messages.slice(compressCount);
      setThinkingSteps((prev) => [...prev, 'Auto-summarizing old message frames to preserve context window tokens...']);
      const summarySystem = [
        { role: 'system', content: 'Summarize the critical facts, parameters, and details of this discussion inside 3 dense sentences.' },
        ...toCompress.map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })),
      ];
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: summarySystem }),
        });
        const data = await res.json();
        const compressedSummary = data.choices[0].message.content;
        return [{ role: 'system', content: `Historical Session Summary (Retained context): ${compressedSummary}` }, ...remainder];
      } catch {
        return messages;
      }
    }
    return messages;
  };

  const generateSilentSessionTitle = async (sessionId, firstMessageText) => {
    if (!keys.groq) return;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Create a ultra-short 2 to 3 word title for this prompt. Return ONLY the title with no quotes or extra text.' },
            { role: 'user', content: firstMessageText },
          ],
        }),
      });
      const data = await res.json();
      const generatedTitle = data.choices[0].message.content;
      if (generatedTitle?.trim()) setChatSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: generatedTitle.trim() } : s)));
    } catch {
      console.warn('Silent title generation bypassed.');
    }
  };

  const handleChatSubmit = async (e, textOverride = '') => {
    if (e) e.preventDefault();
    const activeText = textOverride || chatInput;
    if ((!activeText.trim() && attachments.length === 0) || isTyping) return;

    const currentSession = getActiveSession();
    if (!currentSession) return;

    const memoryHit = extractMemoryFromMessage(activeText);
    if (memoryHit) {
      saveMemoryNotes([{ id: Date.now(), note: memoryHit, savedAt: new Date().toISOString() }, ...memoryNotes]);
    }

    const wantsCode = /code|canvas|app|website|html/i.test(activeText);
    if (wantsCode && !artifactOpen) setArtifactTitle('Preparing Sandbox...');

    setChatInput('');
    setIsTyping(true);
    setStreamedResponse('');

    if (deepThinking) {
      setThinkingSteps(['Analyzing syntax...', 'Injecting Gunnarz Directives...', 'Formulating secure sandbox logic...']);
      await new Promise((r) => setTimeout(r, 900));
    }

    let payloadContent = activeText;
    const hasImages = attachments.some((a) => a.type === 'image');

    if (hasImages) {
      payloadContent = [{ type: 'text', text: activeText }];
      const texts = attachments.filter((a) => a.type !== 'image');
      if (texts.length) payloadContent[0].text += texts.map((d) => `\n[${d.name}]:\n${d.data}`).join('');
      attachments.filter((a) => a.type === 'image').forEach((img) => payloadContent.push({ type: 'image_url', image_url: { url: img.data } }));
    } else if (attachments.length || persistentDocs.length) {
      const combinedDocs = [...attachments, ...persistentDocs];
      payloadContent += combinedDocs.map((d) => `\n\n--- [${d.name}] ---\n${d.data}`).join('');
    }

    if (webSearchEnabled) {
      payloadContent += `\n\n[Web Search Enabled] User requested current context if needed.`;
    }

    const payloadMsg = { role: 'user', content: payloadContent };
    const uiMsg = { role: 'user', content: activeText, attachments: [...attachments] };
    const isFirstMessage = currentSession.messages.length === 0;
    const updatedMessages = [...currentSession.messages, payloadMsg];
    const compressedMsgs = await compressContextIfNecessary(updatedMessages);

    updateSessions(chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, uiMsg] } : s)));
    setThinkingSteps([]);
    setAttachments([]);

    try {
      if (compareMode) {
        const replies = await compareModelReplies(compressedMsgs);
        const comparisonText = replies.map((r) => `### ${r.model}\n${r.reply}`).join('\n\n');
        updateSessions(chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: comparisonText }] } : s)));
      } else {
        const reply = await handleGroqCallStream(compressedMsgs, setStreamedResponse, hasImages ? MODEL_MODES['vision-pro'].model : null);
        const htmlMatch = reply.match(/```html\s*([\s\S]*?)\s*```/);
        if (htmlMatch?.[1]) {
          const tabId = `tab_${Date.now()}`;
          const tabName = `Module_${canvasTabs.length + 1}.html`;
          const code = htmlMatch[1];
          setCanvasTabs((prev) => [...prev, { id: tabId, name: tabName, code }]);
          setActiveCanvasTab(tabId);
          setArtifactCode(code);
          setArtifactTitle('Generated Sandbox');
          setArtifactOpen(true);
        }
        const nextSessions = chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: reply }] } : s));
        updateSessions(nextSessions);
        if (isFirstMessage) generateSilentSessionTitle(activeSessionId, activeText);
      }
    } catch (err) {
      alert(err.message);
    }

    setStreamedResponse('');
    setIsTyping(false);
  };

  const handleImageGeneration = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    if (!keys.hf) return alert('Hugging Face Token needed in Settings.');

    const prompt = chatInput;
    setChatInput('');
    setIsTyping(true);
    if (deepThinking) {
      setThinkingSteps(['Accessing FLUX.1...', 'Generating high-def latent vectors...']);
      await new Promise((r) => setTimeout(r, 1000));
    }

    try {
      const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        headers: { Authorization: `Bearer ${keys.hf}` },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      });
      if (!res.ok) throw new Error('Image gen failed. Check HF Token.');
      const imgUrl = URL.createObjectURL(await res.blob());
      const uiMsg = { role: 'user', content: `🎨 Draw: "${prompt}"` };
      const asMsg = { role: 'assistant', content: `![Generated Art](${imgUrl})` };
      updateSessions(chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, uiMsg, asMsg] } : s)));
    } catch (err) {
      alert(err.message);
    }
    setThinkingSteps([]);
    setIsTyping(false);
  };

  const startRecordingSequence = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const actx = new AudioCtx();
      audioContextRef.current = actx;
      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let silenceStart = Date.now();
      let hasSpoken = false;

      const checkSilence = () => {
        if (mediaRecorder.state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (avg > 10) { hasSpoken = true; silenceStart = Date.now(); }
        else if (hasSpoken && Date.now() - silenceStart > 1800) { mediaRecorder.stop(); return; }
        else if (!hasSpoken && Date.now() - silenceStart > 10000) { mediaRecorder.stop(); return; }
        voiceDetectionLoopRef.current = requestAnimationFrame(checkSilence);
      };

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        cancelAnimationFrame(voiceDetectionLoopRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        setVoiceStatus('thinking');
        try {
          const formData = new FormData();
          formData.append('file', new Blob(audioChunksRef.current, { type: 'audio/webm' }), 'voice.webm');
          formData.append('model', 'whisper-large-v3');
          const tRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${keys.groq}` },
            body: formData,
          });
          const tData = await tRes.json();
          if (!tData.text?.trim()) throw new Error('Empty audio.');

          const sysMsg = { role: 'system', content: 'You are Gunnarz AI OS. Speak naturally, very briefly (1-2 sentences). Coded by Gunnarz.' };
          const cRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [sysMsg, { role: 'user', content: tData.text }], max_tokens: 250, temperature: 0.7 }),
          });
          const reply = (await cRes.json()).choices[0].message.content;
          updateSessions(chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'user', content: tData.text }, { role: 'assistant', content: reply }] } : s)));

          setVoiceStatus('speaking');
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.rate = ttsSpeed;
          utterance.onend = () => {
            if (isContinuousVoiceRef.current) { setVoiceStatus('listening'); setTimeout(() => startRecordingSequence(), 500); }
            else setVoiceStatus('idle');
          };
          window.speechSynthesis.speak(utterance);
        } catch {
          if (isContinuousVoiceRef.current) { setVoiceStatus('listening'); setTimeout(() => startRecordingSequence(), 500); }
          else setVoiceStatus('idle');
        }
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setVoiceStatus('listening');
      silenceStart = Date.now();
      checkSilence();
    } catch (err) {
      alert(`Mic error: ${err.message}`);
      setVoiceStatus('idle');
    }
  };

  const handleVoiceToggle = () => {
    if (!keys.groq) return alert('Groq key needed for Voice.');
    if (voiceStatus === 'idle') startRecordingSequence();
    else if (voiceStatus === 'listening' && mediaRecorderRef.current) mediaRecorderRef.current.stop();
    else if (voiceStatus === 'speaking') { window.speechSynthesis.cancel(); setVoiceStatus('idle'); }
  };

  const playMessageAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(typeof text === 'string' ? text : JSON.stringify(text));
    utterance.rate = ttsSpeed;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const summarizeCurrentChatSession = async () => {
    const currentSession = getActiveSession();
    if (!currentSession || currentSession.messages.length === 0) return;
    setIsTyping(true);
    setThinkingSteps(['Condensing complete discussion frame...']);
    const summaryPrompt = [
      { role: 'system', content: 'Generate a premium, dense bulleted recap summarizing the key decisions, solutions, and code frameworks discussed in this chat session.' },
      ...currentSession.messages.map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })),
    ];
    try {
      const reply = await handleGroqCallStream(summaryPrompt, setStreamedResponse, 'llama-3.1-8b-instant');
      const asMsg = { role: 'assistant', content: `📝 **Chat Summary Recap:**\n\n${reply}` };
      updateSessions(chatSessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, asMsg] } : s)));
    } catch {
      alert('Recap compaction failed.');
    } finally {
      setIsTyping(false);
      setThinkingSteps([]);
      setStreamedResponse('');
    }
  };

  const toggleStarMessage = (content) => {
    const isStarred = starredMessages.includes(content);
    const updated = isStarred ? starredMessages.filter((m) => m !== content) : [...starredMessages, content];
    setStarredMessages(updated);
    localStorage.setItem('gunnarz_starred', JSON.stringify(updated));
  };

  const loadPyodideEngine = () => {
    if (window.loadPyodide) return Promise.resolve(window.loadPyodide);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = () => resolve(window.loadPyodide);
      script.onerror = () => reject(new Error('Failed to load Pyodide Python compilation WASM module.'));
      document.head.appendChild(script);
    });
  };

  const runPythonInBrowser = async (pyCode) => {
    setIsPythonLoading(true);
    setPythonOutput('Initializing Pyodide Python WASM Engine in browser sandbox...');
    try {
      await loadPyodideEngine();
      if (!window.pyodideInstance) {
        window.pyodideInstance = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
      }
      await window.pyodideInstance.runPythonAsync('import sys\nimport io\nsys.stdout = io.StringIO()');
      await window.pyodideInstance.runPythonAsync(pyCode);
      const stdout = await window.pyodideInstance.runPythonAsync('sys.stdout.getvalue()');
      setPythonOutput(stdout || 'Execution finished with success (No output/prints generated).');
      setCanvasTabMode('preview');
    } catch (err) {
      setPythonOutput(`Python Syntax/Sandbox Error: ${err.message}`);
    } finally {
      setIsPythonLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === appPin) setAppLocked(false);
    else { alert('Invalid Pin code. Lockout mode active.'); setPinInput(''); }
  };

  const setupNewPin = () => {
    if (pinInput.length === 4) {
      localStorage.setItem('gunnarz_app_pin', pinInput);
      setAppPin(pinInput);
      setAppLocked(false);
      setPinInput('');
      alert('PIN Security Saved.');
    } else alert('Pin must be 4 digits.');
  };

  const handleTabCodeChange = (codeText) => {
    setCanvasTabs((prev) => prev.map((t) => (t.id === activeCanvasTab ? { ...t, code: codeText } : t)));
    setArtifactCode(codeText);
  };

  const downloadSandboxCode = () => {
    const blob = new Blob([artifactCode], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gunnarz_workspace_project.html';
    link.click();
  };

  const toggleIncognitoMode = () => {
    if (!isIncognito) {
      setIsIncognito(true);
      alert('Incognito active: Conversations will NOT write to storage.');
    } else {
      setIsIncognito(false);
      alert('Standard memory mode restored.');
    }
  };

  const renderFormattedMessage = (content, msgId) => {
    if (!content) return null;

    if (Array.isArray(content)) {
      return content.map((item, idx) => {
        if (typeof item === 'string') return <span key={idx}>{renderFormattedMessage(item, `${msgId}-${idx}`)}</span>;
        if (item.type === 'text') return <span key={idx}>{renderFormattedMessage(item.text, `${msgId}-${idx}`)}</span>;
        if (item.type === 'image_url') {
          return <div key={idx} className="mt-3 rounded-lg border border-[#00ffcc]/30 max-h-[300px] overflow-hidden"><img src={item.image_url.url} alt="Vision context" className="max-h-[300px] object-contain" /></div>;
        }
        return null;
      });
    }

    if (typeof content === 'object') {
      return <pre className="text-xs text-red-400 overflow-auto bg-black p-2 rounded">{JSON.stringify(content, null, 2)}</pre>;
    }

    return content.split(/(```[\s\S]*?```)/g).map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```([\w-]*)\n([\s\S]*?)```/);
        const code = match ? match[2] : part.slice(3, -3);
        const language = match ? match[1].toLowerCase() : '';
        const isHTML = language === 'html' || part.includes('<html>') || part.includes('<style>');
        const isPython = language === 'python' || language === 'py';
        const blockId = `${msgId}-code-${idx}`;
        return (
          <div key={idx} className="my-3 bg-[#0a0a1a] rounded-lg overflow-hidden border border-[#1e1b4b]">
            <div className="flex justify-between items-center bg-[#151532] px-3 py-1.5 text-xs text-gray-400">
              <span className="uppercase text-[#aaffee] font-bold">{language || 'CODE'}</span>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(code); setCopiedTextId(blockId); setTimeout(() => setCopiedTextId(null), 2000); }} className="hover:text-white flex items-center gap-1">{copiedTextId === blockId ? <CheckCheck size={14} className="text-[#00ffcc]" /> : <Copy size={14} />}</button>
                {isHTML && <button onClick={() => { setArtifactCode(code); setArtifactOpen(true); }} className="text-[#00ffcc] hover:text-white flex items-center gap-1 font-bold ml-2"><Play size={14} /> Run Sandbox</button>}
                {isPython && <button onClick={() => runPythonInBrowser(code)} className="text-[#bf5af2] hover:text-white flex items-center gap-1 font-bold ml-2"><Play size={14} /> Run Python WASM</button>}
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-xs text-gray-300 font-mono"><code>{code}</code></pre>
          </div>
        );
      }

      let html = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold text-[#00ffcc] mt-3 mb-1">$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-[#00ffcc] mt-4 mb-2">$1</h2>')
        .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');

      if (html.includes('![Generated Art]')) {
        const imgUrl = html.match(/\((.*?)\)/)?.[1] || '';
        return (
          <div key={idx}>
            <div dangerouslySetInnerHTML={{ __html: html.replace(/!\[Generated Art\]\(.*?\)/g, '') }} />
            {imgUrl && <img src={imgUrl} alt="Art" className="mt-3 rounded-lg border border-[#00ffcc]/30 max-h-[300px]" />}
          </div>
        );
      }
      return <div key={idx} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  const currentSession = getActiveSession();
  const filteredMessages = currentSession?.messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    return typeof msg.content === 'string' && msg.content.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const getSessionStats = () => {
    const current = getActiveSession();
    if (!current) return { count: 0, estimatedTokens: 0 };
    const charCount = current.messages.reduce((acc, m) => acc + (typeof m.content === 'string' ? m.content.length : JSON.stringify(m.content).length), 0);
    return { count: current.messages.length, estimatedTokens: Math.ceil(charCount / 4) };
  };

  if (appLocked) {
    return (
      <div className="min-h-screen bg-[#03030b] flex items-center justify-center p-4 text-center font-sans">
        <div className="bg-[#0c0c1f] border border-[#00ffcc]/30 p-8 rounded-3xl w-full max-w-sm shadow-2xl space-y-6">
          <Key className="text-[#00ffcc] animate-pulse mx-auto" size={48} />
          <h2 className="text-[#00ffcc] font-black text-xl uppercase tracking-widest">{APP_FULL}</h2>
          <p className="text-xs text-gray-400">Lockout enabled. Enter your secret 4-Digit Pin to unlock this workspace.</p>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN Code"
            className="w-full bg-[#050511] border border-[#1e1b4b] rounded-xl p-3 text-center text-white tracking-widest font-black outline-none focus:border-[#00ffcc]"
          />
          <div className="flex gap-2">
            <button onClick={handlePinSubmit} className="flex-1 bg-[#00ffcc] text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#00ffcc]/10">Unlock System</button>
            <button onClick={setupNewPin} className="px-4 bg-[#151536] text-white rounded-xl">Save</button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSessionStats();

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isLightMode ? 'bg-[#f4f5f6] text-[#333]' : 'bg-[#03030b] text-[#cbd5e1]'}`}>
      {isDragging && (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="fixed inset-0 bg-[#00ffcc]/10 backdrop-blur border-4 border-[#00ffcc] border-dashed z-50 flex flex-col items-center justify-center text-center text-white pointer-events-auto">
          <Paperclip size={64} className="text-[#00ffcc] animate-bounce mb-3" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Drop Your File Here</h2>
          <p className="text-xs text-gray-300 mt-1">Accepting PDFs, Images, TXT, CSV, JSON and Audio Files</p>
        </div>
      )}

      <aside className={`border-r flex flex-col transition-all duration-300 z-30 shrink-0 ${sidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden'} ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#070714] border-[#1e1b4b]/50'}`}>
        <div className="p-4 border-b border-[#1e1b4b]/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#00ffcc]" />
            <span className="font-extrabold text-xs tracking-wider uppercase">Singularity Library</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleNewSession} className="p-1.5 rounded-lg bg-[#0f0f23] border border-[#1c1c3a] hover:border-[#00ffcc] text-white"><Plus size={14} /></button>
            <button onClick={() => setIsLightMode(!isLightMode)} className="p-1.5 rounded-lg bg-[#0f0f23] border border-[#1c1c3a] hover:border-[#00ffcc] text-white">{isLightMode ? <Moon size={14} /> : <Sun size={14} />}</button>
          </div>
        </div>

        <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0a0a24] to-[#0d0d2b] border border-[#1e1b4b] text-white">
          <div className="flex items-center gap-2 text-[#bf5af2] mb-2"><Activity size={14} /><span className="text-[10px] font-black uppercase">Focus Timer</span></div>
          <div className="text-2xl font-mono text-center mb-3">{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</div>
          <div className="flex gap-2">
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${isTimerRunning ? 'bg-[#ff3b30]/20 text-[#ff3b30]' : 'bg-[#00ffcc] text-black'}`}>{isTimerRunning ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }} className="px-3 rounded-lg bg-[#151536] text-gray-400 hover:text-white flex items-center justify-center"><RotateCcw size={14} /></button>
          </div>
        </div>

        <div className="px-3 mt-4 relative">
          <Search size={14} className="absolute left-6 top-3 text-gray-400" />
          <input type="text" placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0d0d23] border border-[#1e1b4b] rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#00ffcc]" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatSessions.map((session) => (
            <div key={session.id} onClick={() => setActiveSessionId(session.id)} className={`group relative p-3 rounded-xl border cursor-pointer flex items-center gap-3 ${session.id === activeSessionId ? 'bg-[#00ffcc]/10 border-[#00ffcc]/30 text-white' : 'border-transparent hover:border-[#1c1c3a] text-gray-400'}`}>
              <MessageSquare size={14} className={session.id === activeSessionId ? 'text-[#00ffcc]' : ''} />
              <div className="flex-1 truncate text-xs">
                {editingSessionId === session.id ? (
                  <input type="text" value={editTitleInput} onChange={(e) => setEditTitleInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveSessionTitle(session.id)} onClick={(e) => e.stopPropagation()} className="bg-black text-white px-1 w-full outline-none border border-[#00ffcc]" autoFocus />
                ) : <span>{session.title}</span>}
              </div>
              <div className="hidden group-hover:flex items-center gap-1">
                {editingSessionId === session.id ? <button onClick={(e) => { e.stopPropagation(); saveSessionTitle(session.id); }} className="text-[#00ffcc]"><Check size={12} /></button> : <button onClick={(e) => startEditTitle(session, e)} className="hover:text-white"><Edit3 size={12} /></button>}
                <button onClick={(e) => handleDeleteSession(session.id, e)} className="text-[#ff3b30]"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {memoryNotes.length > 0 && (
          <div className="p-3 border-t border-[#1e1b4b]/40">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">🧠 Memory</span>
            <div className="max-h-28 overflow-y-auto space-y-1.5">
              {memoryNotes.map((m) => <div key={m.id} className="p-2 rounded bg-black/40 border border-gray-800 text-[10px] text-gray-300">{m.note}</div>)}
            </div>
          </div>
        )}

        {starredMessages.length > 0 && (
          <div className="p-3 border-t border-[#1e1b4b]/40">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">⭐ Bookmarked Snippets</span>
            <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin">
              {starredMessages.map((msg, sIdx) => (
                <div key={sIdx} onClick={() => { navigator.clipboard.writeText(msg); alert('Copied bookmark!'); }} className="p-2 rounded bg-black/40 border border-gray-800 text-[10px] text-gray-400 truncate hover:text-[#00ffcc] cursor-pointer">{msg.slice(0, 50)}...</div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden h-full relative">
        <header className={`p-3 border-b flex justify-between items-center z-20 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#060614]/90 border-[#1e1b4b]/40 backdrop-blur'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[#0d0d23] rounded-lg text-[#00ffcc]"><PanelLeftOpen size={16} /></button>
            <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#bf5af2]">{APP_FULL}</span>
            <span className="text-[10px] text-gray-500">{stats.count} msgs • ~{stats.estimatedTokens} tok</span>
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={summarizeCurrentChatSession} className="p-1.5 bg-[#0d0d23] hover:text-[#00ffcc] text-gray-400 rounded-lg text-xs font-bold hidden sm:block">Recap</button>
            <button onClick={exportCurrentSession} className="p-1.5 bg-[#0d0d23] hover:text-[#00ffcc] text-gray-400 rounded-lg text-xs font-bold hidden sm:block"><Download size={14} /></button>
            <label className="hidden sm:flex items-center gap-1 bg-[#0d0d23] border border-[#1e1b4b]/50 text-xs text-white rounded-lg px-2 py-1 cursor-pointer">
              Import
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files[0] && importSessionFile(e.target.files[0])} />
            </label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="hidden sm:block bg-[#0d0d23] border border-[#1e1b4b]/50 text-xs text-white rounded-lg px-2 outline-none">
              {Object.keys(MODEL_MODES).map((k) => <option key={k} value={k}>{MODEL_MODES[k].name}</option>)}
            </select>
            {selectedModel === 'open-router' && <input type="text" value={customORModel} onChange={(e) => setCustomORModel(e.target.value)} placeholder="meta-llama/llama-3.1-8b" className="bg-black text-[10px] text-white px-2 rounded-lg border border-gray-800" />}
            <button onClick={() => setWebSearchEnabled(!webSearchEnabled)} className={`px-2 py-1 rounded-lg text-xs font-bold border ${webSearchEnabled ? 'border-[#00ffcc] text-[#00ffcc]' : 'border-[#1e1b4b]/50 text-gray-400'}`}>Web</button>
            <button onClick={() => setCompareMode(!compareMode)} className={`px-2 py-1 rounded-lg text-xs font-bold border ${compareMode ? 'border-[#bf5af2] text-[#bf5af2]' : 'border-[#1e1b4b]/50 text-gray-400'}`}>Compare</button>
            <button onClick={() => setArtifactOpen(!artifactOpen)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${artifactOpen ? 'bg-[#bf5af2]/20 border-[#bf5af2] text-[#bf5af2]' : 'bg-[#0d0d23] border-[#1e1b4b]/50 text-gray-400 hover:text-white'}`}><LayoutTemplate size={14} /> Canvas</button>
            <button onClick={() => setSelectedModel('settings')} className="p-1.5 bg-[#0d0d23] rounded-lg text-gray-400 hover:text-[#00ffcc]"><Settings size={16} /></button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col relative ${artifactFullscreen ? 'hidden' : 'flex'} ${isLightMode ? 'bg-white' : 'bg-gradient-to-b from-[#03030a] to-[#010103]'}`}>
            <div className="p-2 border-b border-gray-800 bg-[#070716]/60 flex gap-1.5 overflow-x-auto">
              {PROMPT_TEMPLATES.map((tmpl, tIdx) => (
                <button key={tIdx} onClick={() => setChatInput(tmpl.prompt)} className="px-2.5 py-1 bg-black/40 hover:bg-[#00ffcc]/10 hover:text-[#00ffcc] text-gray-400 border border-gray-800 rounded-lg text-[10px] tracking-wide shrink-0">{tmpl.label}</button>
              ))}
              {QUICK_ACTIONS.map((a, i) => (
                <button key={`qa-${i}`} onClick={() => setChatInput(a.prompt)} className="px-2.5 py-1 bg-black/40 hover:bg-[#bf5af2]/10 hover:text-[#bf5af2] text-gray-400 border border-gray-800 rounded-lg text-[10px] tracking-wide shrink-0">{a.label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isCameraActive && (
                <div className="relative rounded-xl overflow-hidden border border-red-500/50 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                  <button onClick={takeSnapshot} className="absolute bottom-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><Scan size={14} /> Capture</button>
                </div>
              )}

              {filteredMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-4 border relative ${fontSize} ${msg.role === 'user' ? 'bg-[#151532]/40 border-[#3a3a60]/50 text-white' : 'bg-[#090919] border-[#1c1c3a] text-gray-200'}`}>
                    {msg.attachments?.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {msg.attachments.map((att, idx) => (att.type === 'image' ? <img key={idx} src={att.data} alt="Upload" className="h-12 w-12 object-cover rounded border border-gray-600" /> : <div key={idx} className="bg-black text-xs px-2 py-1 rounded text-[#bf5af2]"><FileText size={12} className="inline" /> {att.name}</div>))}
                      </div>
                    )}
                    {renderFormattedMessage(msg.content, `msg-${i}`)}
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between">
                        <div className="flex gap-3">
                          <button onClick={() => playMessageAloud(msg.content)} className="text-gray-400 hover:text-[#00ffcc]"><Volume2 size={13} /></button>
                          <button onClick={() => toggleStarMessage(msg.content)} className={`hover:text-amber-400 ${starredMessages.includes(msg.content) ? 'text-amber-400' : 'text-gray-400'}`}><Star size={13} /></button>
                          <button onClick={() => handleChatSubmit(null, `Translate the following text to Spanish: ${msg.content}`)} className="text-gray-400 hover:text-[#bf5af2]"><Languages size={13} /></button>
                        </div>
                        <span className="text-[9px] text-gray-600 uppercase tracking-widest">{APP_FULL}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && streamedResponse && <div className="flex justify-start"><div className={`max-w-[85%] rounded-xl p-4 bg-[#090919] border border-[#00ffcc]/30 text-white ${fontSize}`}>{renderFormattedMessage(streamedResponse, 'stream')}</div></div>}
              {isTyping && !streamedResponse && <div className="flex items-center gap-2 text-[#00ffcc] text-xs"><BrainCircuit size={14} className="animate-spin" /> Parsing models...</div>}
              <div ref={chatEndRef} />
            </div>

            {persistentDocs.length > 0 && (
              <div className="px-4 py-1.5 bg-[#00ffcc]/5 border-t border-[#00ffcc]/20 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Attached Knowledge Source: {persistentDocs.map((d) => d.name).join(', ')}</span>
                <button onClick={() => setPersistentDocs([])} className="text-xs text-red-500 font-bold uppercase tracking-widest hover:text-white">Clear Context</button>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="p-2 bg-black/50 border-t border-[#1e1b4b] flex gap-2 overflow-x-auto">
                {attachments.map((att, i) => (
                  <div key={i} className="relative bg-gray-900 rounded p-1 shrink-0">
                    {att.type === 'image' ? <img src={att.data} className="h-10 w-10 object-cover rounded" /> : <div className="text-[10px] px-2 py-1 text-[#00ffcc]">{att.name.slice(0, 12)}</div>}
                    <button onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            {!isTyping && currentSession?.messages.length > 0 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none bg-[#03030b]/40">
                {['Summarize the code framework', 'Explain this concept in details', 'Give me 3 learning check quiz questions'].map((suggestion, sIdx) => (
                  <button key={sIdx} onClick={() => handleChatSubmit(null, suggestion)} className="px-3 py-1 bg-black/40 hover:bg-[#00ffcc]/15 text-xs text-[#00ffcc] border border-[#00ffcc]/20 rounded-full shrink-0 transition-all font-semibold">{suggestion}</button>
                ))}
              </div>
            )}

            <div className="p-3 bg-[#060614] border-t border-[#1e1b4b]/40">
              <div className="flex gap-2 items-center">
                <button onClick={toggleCamera} className={`p-3 rounded-xl border ${isCameraActive ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#0d0d23] border-[#1e1b4b] text-gray-400 hover:text-white'}`}>{isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}</button>
                <label className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b] text-gray-400 hover:text-[#00ffcc] cursor-pointer"><input type="file" accept="image/*,.txt,.pdf,.mp3,.wav" onChange={handleFileUpload} className="hidden" /><Paperclip size={18} /></label>
                <form onSubmit={handleChatSubmit} className="flex-1 relative">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isProcessingFile} placeholder={isProcessingFile ? 'Extracting file data...' : 'Ask Singularity...'} className="w-full bg-[#0d0d23] border border-[#1e1b4b] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00ffcc]/50" />
                  <button type="submit" disabled={isProcessingFile} className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black"><Send size={16} /></button>
                </form>
                <button onClick={handleImageGeneration} className="p-3 rounded-xl bg-[#0d0d23] border border-[#1e1b4b] text-gray-400 hover:text-[#bf5af2]"><ImageIcon size={18} /></button>
              </div>
              <div className="mt-2 flex gap-2 items-center text-[10px] text-gray-500">
                <button onClick={() => setDeepThinking(!deepThinking)} className={`px-2 py-1 rounded ${deepThinking ? 'bg-[#00ffcc]/10 text-[#00ffcc]' : 'bg-black/30'}`}>Deep Think</button>
                <button onClick={toggleIncognitoMode} className={`px-2 py-1 rounded ${isIncognito ? 'bg-purple-500/20 text-purple-300' : 'bg-black/30'}`}>Incognito</button>
                <button onClick={() => setIsContinuousVoice(!isContinuousVoice)} className={`px-2 py-1 rounded ${isContinuousVoice ? 'bg-[#00ffcc]/10 text-[#00ffcc]' : 'bg-black/30'}`}>Voice Loop</button>
                <button onClick={() => setFontSize(fontSize === 'text-sm' ? 'text-base' : 'text-sm')} className="px-2 py-1 rounded bg-black/30">Text Size</button>
                {importStatus && <span className="ml-auto text-[#00ffcc]">{importStatus}</span>}
              </div>
            </div>
          </div>

          {artifactOpen && (
            <div className={`${artifactFullscreen ? 'w-full' : 'w-full md:w-[45vw] absolute md:relative right-0'} flex flex-col bg-[#070716] border-l border-[#1e1b4b] z-20 transition-all`}>
              <div className="p-1 border-b border-[#1e1b4b] flex items-center justify-between bg-black/40">
                <div className="flex gap-1 overflow-x-auto">
                  {canvasTabs.map((tab) => (
                    <button key={tab.id} onClick={() => { setActiveCanvasTab(tab.id); setArtifactCode(tab.code); }} className={`px-3 py-1 rounded text-xs font-bold transition-all shrink-0 ${activeCanvasTab === tab.id ? 'bg-[#00ffcc]/10 text-[#00ffcc]' : 'text-gray-400'}`}>{tab.name}</button>
                  ))}
                </div>
                <button onClick={() => { const newId = `tab_${Date.now()}`; setCanvasTabs([...canvasTabs, { id: newId, name: `workspace_${canvasTabs.length + 1}.html`, code: '<h1>Empty File</h1>' }]); setActiveCanvasTab(newId); }} className="p-1 text-[#00ffcc] bg-gray-900 rounded"><Plus size={12} /></button>
              </div>

              <div className="flex justify-between bg-black/60 p-2 border-b border-[#1e1b4b]">
                <div className="flex bg-[#0d0d23] rounded-lg p-1">
                  <button onClick={() => setCanvasTabMode('preview')} className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${canvasTabMode === 'preview' ? 'bg-[#bf5af2]/20 text-[#bf5af2]' : 'text-gray-400'}`}><MonitorPlay size={14} /> Preview</button>
                  <button onClick={() => setCanvasTabMode('code')} className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${canvasTabMode === 'code' ? 'bg-[#00ffcc]/20 text-[#00ffcc]' : 'text-gray-400'}`}><FileCode2 size={14} /> Live Code</button>
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={downloadSandboxCode} className="text-gray-400 hover:text-white p-1" title="Download workspace file"><Download size={14} /></button>
                  <button onClick={() => setArtifactFullscreen(!artifactFullscreen)} className="text-gray-400 hover:text-white p-1">{artifactFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</button>
                  <button onClick={() => setArtifactOpen(false)} className="text-red-500 hover:bg-red-500/20 p-1 rounded"><X size={16} /></button>
                </div>
              </div>

              <div className="flex-1 bg-white relative">
                {canvasTabMode === 'preview' ? (
                  isPythonLoading ? (
                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4 text-center"><Loader2 size={32} className="animate-spin text-[#bf5af2] mb-2" /><span className="text-xs text-[#bf5af2]">Executing script logic...</span></div>
                  ) : pythonOutput ? (
                    <div className="absolute inset-0 bg-[#050511] text-[#00ffcc] p-4 font-mono text-xs overflow-y-auto whitespace-pre-wrap">
                      <div className="flex justify-between border-b border-gray-800 pb-2 mb-3"><span className="font-bold text-white uppercase text-[10px]">Python WASM Output Console</span><button onClick={() => setPythonOutput('')} className="text-red-500 font-bold uppercase text-[10px]">Clear console</button></div>
                      {pythonOutput}
                    </div>
                  ) : (
                    <iframe srcDoc={artifactCode} sandbox="allow-scripts allow-modals allow-popups" className="w-full h-full border-none bg-white" />
                  )
                ) : (
                  <textarea value={artifactCode} onChange={(e) => handleTabCodeChange(e.target.value)} className="w-full h-full bg-[#0a0a1a] text-gray-300 font-mono text-sm p-4 outline-none resize-none" spellCheck="false" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-gradient-to-r from-[#070716] to-[#0d0d26] border-t border-[#1e1b4b] flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-[#00ffcc]" />
            <span className="text-[10px] uppercase font-bold text-gray-400 hidden sm:block">Hands-Free Conversational Voice Loop</span>
            <button onClick={() => setIsContinuousVoice(!isContinuousVoice)} className={`relative h-5 w-9 rounded-full ${isContinuousVoice ? 'bg-[#00ffcc]' : 'bg-gray-600'}`}>
              <span className={`block h-3.5 w-3.5 mt-0.5 rounded-full bg-white transition-transform ${isContinuousVoice ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </button>
          </div>
          <button onClick={handleVoiceToggle} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${voiceStatus === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-r from-[#00ccaa] to-[#00ffcc] text-black'}`}>
            <Mic size={14} /> {voiceStatus === 'listening' ? 'Stop' : voiceStatus === 'thinking' ? 'Analyzing...' : voiceStatus === 'speaking' ? 'Speaking...' : 'Voice Sync'}
          </button>
        </div>

        {selectedModel === 'settings' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-50 p-4">
            <div className="bg-[#0c0c1f] border border-[#00ffcc]/30 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-[#00ffcc] font-bold text-sm uppercase tracking-widest">Configuration Center</h2>
                <button onClick={() => setSelectedModel('gunnarz-singularity')} className="text-red-500"><X size={18} /></button>
              </div>

              <div><label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Groq Console Key</label><input type="password" value={keys.groq} onChange={(e) => saveKeys({ ...keys, groq: e.target.value })} placeholder="gsk_..." className="w-full bg-[#050511] border border-[#1e1b4b] p-3 rounded-lg text-white outline-none text-xs" /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">OpenRouter API Key</label><input type="password" value={keys.openrouter} onChange={(e) => saveKeys({ ...keys, openrouter: e.target.value })} placeholder="sk-or_..." className="w-full bg-[#050511] border border-[#1e1b4b] p-3 rounded-lg text-white outline-none text-xs" /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">HuggingFace Token</label><input type="password" value={keys.hf} onChange={(e) => saveKeys({ ...keys, hf: e.target.value })} placeholder="hf_..." className="w-full bg-[#050511] border border-[#1e1b4b] p-3 rounded-lg text-white outline-none text-xs" /></div>

              <div className="border-t border-gray-800 pt-3">
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Local App PIN Security</span>
                <div className="flex gap-2">
                  <input type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="Set 4-Digit PIN" className="flex-1 bg-[#050511] border border-[#1e1b4b] p-3 rounded-lg text-white outline-none text-xs" />
                  <button onClick={setupNewPin} className="px-4 rounded-lg bg-[#00ffcc] text-black font-bold text-xs">Save</button>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-3 space-y-3">
                <label className="flex items-center justify-between text-xs text-gray-300"><span>Web search context</span><input type="checkbox" checked={webSearchEnabled} onChange={(e) => setWebSearchEnabled(e.target.checked)} /></label>
                <label className="flex items-center justify-between text-xs text-gray-300"><span>Compare model replies</span><input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} /></label>
                <label className="flex items-center justify-between text-xs text-gray-300"><span>Deep thinking</span><input type="checkbox" checked={deepThinking} onChange={(e) => setDeepThinking(e.target.checked)} /></label>
              </div>

              <div className="border-t border-gray-800 pt-3 flex gap-2">
                <button onClick={exportCurrentSession} className="flex-1 py-2 rounded-lg bg-[#0d0d23] text-white text-xs border border-[#1e1b4b]">Export Session</button>
                <button onClick={toggleIncognitoMode} className={`flex-1 py-2 rounded-lg text-xs border ${isIncognito ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-[#0d0d23] text-white border-[#1e1b4b]'}`}>Incognito</button>
              </div>

              {importStatus && <div className="text-xs text-[#00ffcc]">{importStatus}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
