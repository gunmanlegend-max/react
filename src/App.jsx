import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Mic, Image as ImageIcon, Settings, Send, Paperclip, Loader2, Play, Volume2, ShieldAlert } from 'lucide-react';

const APP_FULL = "Gunnarz AI OS V30 SINGULARITY";
const BRAND = "Produced by Gunnarz";

const CHAT_MODELS = {
  "⚡ Llama 3.3 70B (best)": "llama-3.3-70b-versatile",
  "🚀 Llama 3.1 8B  (fast)": "llama-3.1-8b-instant",
  "🔀 Mixtral 8x7B": "mixtral-8x7b-32768",
  "💎 Gemma 2 9B": "gemma2-9b-it",
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [keys, setKeys] = useState({ groq: '', hf: '' });
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Search State
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchFocus, setSearchFocus] = useState('All');

  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Voice State
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, listening, thinking, speaking
  const [isContinuousVoice, setIsContinuousVoice] = useState(false); // Hands-free conversation loop
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isContinuousVoiceRef = useRef(false);

  // Sync ref with state so the recorder callbacks always read the current toggled value
  useEffect(() => {
    isContinuousVoiceRef.current = isContinuousVoice;
  }, [isContinuousVoice]);

  // Load persistent settings and memory on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('gunnarz_keys');
    if (savedKeys) setKeys(JSON.parse(savedKeys));
    
    const savedChat = localStorage.getItem('gunnarz_chat');
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('gunnarz_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const saveKeys = (newKeys) => {
    setKeys(newKeys);
    localStorage.setItem('gunnarz_keys', JSON.stringify(newKeys));
  };

  const handleGroqChat = async (messages) => {
    if (!keys.groq) return "❌ Please configure your Groq API Key in the Settings tab first!";
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.groq}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices[0].message.content;
    } catch (error) {
      return `❌ API Connection Error: ${error.message}`;
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);

    const systemMsg = { 
      role: 'system', 
      content: `You are ${APP_FULL}, a helpful, positive, and polite AI companion. Provide clean, safe, and age-appropriate discussions. Use formatting like bullet points and markdown.` 
    };

    const replyText = await handleGroqChat([systemMsg, ...newHistory]);
    
    setChatHistory(prev => [...prev, { role: 'assistant', content: replyText }]);
    setIsTyping(false);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const query = searchInput;
    const userMsg = { role: 'user', content: `[SEARCH: ${searchFocus}] ${query}` };
    const newHistory = [...searchHistory, userMsg];
    setSearchHistory(newHistory);
    setSearchInput('');
    setIsTyping(true);

    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
      const wikiData = await wikiRes.json();
      const snippets = wikiData.query.search.slice(0, 4).map(s => s.title + ": " + s.snippet.replace(/<[^>]+>/g, '')).join('\n\n');

      const systemMsg = { 
        role: 'system', 
        content: `You are an AI research specialist. Focus: ${searchFocus}. Rely on the search context below to provide an educational and safe explanation. Cite referenced source titles.\n\nSEARCH RESULTS:\n${snippets}` 
      };

      const replyText = await handleGroqChat([systemMsg, ...newHistory]);
      setSearchHistory(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (error) {
      setSearchHistory(prev => [...prev, { role: 'assistant', content: `❌ Safe Search Error: ${error.message}` }]);
    }
    setIsTyping(false);
  };

  const handleImageGen = async (e) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    if (!keys.hf) {
      alert("Please enter a Hugging Face Token in the Settings tab.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: { Authorization: `Bearer ${keys.hf}` },
          method: "POST",
          body: JSON.stringify({ inputs: imagePrompt }),
        }
      );
      if (!response.ok) {
        throw new Error("Unable to create art. Check your Hugging Face Token.");
      }
      const blob = await response.blob();
      setGeneratedImage(URL.createObjectURL(blob));
    } catch (error) {
      alert("Image Generation failed: " + error.message);
    }
    setIsGenerating(false);
  };

  // Triggers the voice recording loop
  const startRecordingSequence = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setVoiceStatus('thinking');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');
        formData.append('model', 'whisper-large-v3');

        try {
          const transcriptRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${keys.groq}` },
            body: formData
          });
          const transcriptData = await transcriptRes.json();
          if (transcriptData.error) throw new Error(transcriptData.error.message);
          
          const spokenText = transcriptData.text;
          if (!spokenText.trim()) {
            if (isContinuousVoiceRef.current) {
              setTimeout(() => startRecordingSequence(), 1000);
            } else {
              setVoiceStatus('idle');
            }
            return;
          }

          const systemMsg = { role: 'system', content: `You are ${APP_FULL} in real-time conversation mode. Speak cleanly, conversationally, and very briefly (1-2 short sentences maximum).` };
          const replyText = await handleGroqChat([systemMsg, { role: 'user', content: spokenText }]);

          setVoiceStatus('speaking');
          
          const utterance = new SpeechSynthesisUtterance(replyText);
          utterance.onend = () => {
            if (isContinuousVoiceRef.current) {
              setVoiceStatus('listening');
              setTimeout(() => {
                startRecordingSequence();
              }, 600);
            } else {
              setVoiceStatus('idle');
            }
          };
          utterance.onerror = () => {
            setVoiceStatus('idle');
          };
          window.speechSynthesis.speak(utterance);

        } catch (err) {
          alert("Transcription Error: " + err.message);
          setVoiceStatus('idle');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setVoiceStatus('listening');
    } catch (err) {
      alert("Could not access mic. Check system permissions.");
      setVoiceStatus('idle');
    }
  };

  const handleVoiceToggle = () => {
    if (!keys.groq) {
      alert("Please configure your Groq API Key in Settings to enable Live Voice features.");
      return;
    }

    if (voiceStatus === 'idle') {
      startRecordingSequence();
    } else if (voiceStatus === 'listening') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else if (voiceStatus === 'speaking') {
      window.speechSynthesis.cancel();
      setVoiceStatus('idle');
    }
  };

  const hasNoKeys = !keys.groq;

  return (
    <div className="min-h-screen bg-[#070711] text-[#c8c8d8] font-sans selection:bg-[#00ffcc]/30 pb-8">
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#08081a] via-[#12062a] to-[#08141e] border border-[#00ffcc]/10 rounded-2xl p-6 sm:p-8 text-center mb-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00ffcc15_0%,transparent_60%)] pointer-events-none"></div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#00ffcc] via-[#00ccff] to-[#aa88ff] mb-2 drop-shadow-sm">
            {APP_FULL.replace(" V30 SINGULARITY", "")}
            <span className="block text-lg sm:text-2xl mt-1 text-[#00ccff]">V30 SINGULARITY</span>
          </h1>
          <p className="text-[#3a3a6a] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase">{BRAND}</p>
        </header>

        {/* API Key Missing Notification */}
        {hasNoKeys && activeTab !== 'settings' && (
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-200 text-sm">
            <ShieldAlert size={24} className="text-amber-400 shrink-0" />
            <div className="text-center sm:text-left">
              <span className="font-bold">Personalized App Mode:</span> No API keys are pre-loaded to keep your app shareable and private. Tap the Settings tab to link your free key in 10 seconds!
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-[#070711] font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
            >
              Configure Keys
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex overflow-x-auto gap-1 border-b border-[#16162a] mb-6 scrollbar-thin scrollbar-thumb-[#16162a]">
          <NavButton id="chat" icon={MessageSquare} label="Chat" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="search" icon={Search} label="Search" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="voice" icon={Mic} label="Live Voice" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="image" icon={ImageIcon} label="Vision/Art" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavButton id="settings" icon={Settings} label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {/* Content Box */}
        <main className="bg-[#090917] border border-[#14142a] rounded-2xl overflow-hidden shadow-xl min-h-[55vh] flex flex-col">
          
          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[55vh]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#3a3a6a] text-center p-4">
                    <MessageSquare size={44} className="mb-3 opacity-45" />
                    <p className="text-sm font-medium">Safe Sandbox Chat Active. Memory is stored entirely on your device.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#00ffcc]/10 border border-[#00ffcc]/25 text-[#e0e0f0]' 
                          : 'bg-[#0c0c1f] border border-[#1c1c32]'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#0c0c1f] border border-[#1c1c32] px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#00ffcc]" />
                      <span className="text-xs text-[#50507a]">AI is compiling response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 bg-[#070711] border-t border-[#14142a]">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask standard questions safely..."
                    className="flex-1 bg-[#0c0c1f] border border-[#1c1c32] rounded-xl px-4 py-3 text-[#d0d0e8] focus:outline-none focus:border-[#00ffcc]/50 transition-all text-sm"
                  />
                  <button type="submit" disabled={!chatInput.trim() || isTyping} className="p-3 rounded-xl bg-gradient-to-br from-[#00ccaa] to-[#00ffcc] text-[#020d0a] shadow-[0_0_12px_rgba(0,255,204,0.15)] hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all disabled:opacity-40 shrink-0">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Search Panel */}
          {activeTab === 'search' && (
            <div className="flex flex-col h-[55vh]">
              <div className="p-3 border-b border-[#14142a] bg-[#0c0c1f] flex gap-2 overflow-x-auto">
                {['All', 'Web', 'Academic', 'Code', 'Math'].map(focus => (
                  <button 
                    key={focus}
                    onClick={() => setSearchFocus(focus)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors shrink-0 border ${
                      searchFocus === focus 
                        ? 'bg-[#00ffcc]/20 text-[#00ffcc] border-[#00ffcc]/35' 
                        : 'bg-[#070711] text-[#50507a] border-[#1c1c32] hover:text-[#aaffee]'
                    }`}
                  >
                    {focus}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {searchHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#3a3a6a] text-center p-4">
                    <Search size={44} className="mb-3 opacity-45" />
                    <p className="text-sm font-medium">Safe Search Engine. Combines clean web articles with AI analysis.</p>
                  </div>
                ) : (
                  searchHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#1a1a2e] border border-[#2a2a4a] text-[#e0e0f0]' 
                          : 'bg-[#0c0c1f] border border-[#1c1c32]'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#0c0c1f] border border-[#1c1c32] px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#00ccff]" />
                      <span className="text-xs text-[#50507a]">Formulating trusted facts...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#070711] border-t border-[#14142a]">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffcc]/40" size={18} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search any learning topic safely..."
                    className="w-full bg-[#0c0c1f] border-2 border-[#00ffcc]/15 rounded-full py-3.5 pl-11 pr-14 text-sm text-[#d0d0e8] focus:outline-none focus:border-[#00ffcc]/50 transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#00ffcc]/10 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-[#070711] transition-colors">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Voice Panel */}
          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#090917] to-[#070711] min-h-[50vh]">
              
              <div className="mb-6 max-w-sm flex items-center justify-between p-3 rounded-xl bg-[#0c0c1f] border border-[#1c1c32] w-full">
                <span className="text-xs font-semibold text-[#8080a8] flex items-center gap-1.5">
                  <Volume2 size={16} className="text-[#00ffcc]" />
                  Continuous Reply Loop
                </span>
                <button
                  type="button"
                  onClick={() => setIsContinuousVoice(!isContinuousVoice)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isContinuousVoice ? 'bg-[#00ffcc]' : 'bg-[#1c1c32]'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isContinuousVoice ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div 
                className={`relative mb-6 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                  voiceStatus === 'listening' ? 'scale-105 shadow-[0_0_40px_rgba(0,136,255,0.35)]' : 
                  voiceStatus === 'thinking' ? 'scale-100 shadow-[0_0_25px_rgba(255,204,0,0.3)]' : 
                  voiceStatus === 'speaking' ? 'scale-105 shadow-[0_0_50px_rgba(0,255,136,0.4)]' : 
                  'scale-100 hover:scale-102 shadow-[0_0_15px_rgba(0,255,204,0.15)]'
                }`}
                onClick={handleVoiceToggle}
                style={{ 
                  width: '140px', 
                  height: '140px', 
                  backgroundColor: '#0c0c1f', 
                  border: `2.5px solid ${
                    voiceStatus === 'listening' ? '#0088ff' : 
                    voiceStatus === 'thinking' ? '#ffcc00' : 
                    voiceStatus === 'speaking' ? '#00ff88' : '#00ffcc'
                  }` 
                }}
              >
                {voiceStatus === 'idle' && <Mic size={56} className="text-[#00ffcc]" />}
                {voiceStatus === 'listening' && <Mic size={56} className="text-[#0088ff] animate-pulse" />}
                {voiceStatus === 'thinking' && <Loader2 size={56} className="text-[#ffcc00] animate-spin" />}
                {voiceStatus === 'speaking' && <Play size={56} className="text-[#00ff88] animate-pulse" />}
              </div>
              
              <div className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                voiceStatus === 'listening' ? 'bg-[#020a14] border-[#0088ff]/40 text-[#44aaff]' : 
                voiceStatus === 'thinking' ? 'bg-[#140f00] border-[#ffcc00]/40 text-[#ffcc00]' : 
                voiceStatus === 'speaking' ? 'bg-[#04120a] border-[#00ff88]/40 text-[#00ff88]' : 
                'bg-[#030f0c] border-[#00ffcc]/30 text-[#00ffcc]'
              }`}>
                {voiceStatus === 'idle' ? 'Tap Mic to Start Conversing' :
                 voiceStatus === 'listening' ? 'Listening... Tap to End' :
                 voiceStatus === 'thinking' ? 'Analyzing voice...' :
                 'Replying back aloud...'}
              </div>

              <p className="mt-6 text-[#50507a] max-w-sm text-xs leading-relaxed">
                {isContinuousVoice 
                  ? "Continuous Mode: The app keeps listening and talking in a complete conversation cycle without you tapping again!" 
                  : "Tap on the microphone to begin. When you stop speaking, the app replies automatically."}
              </p>
            </div>
          )}

          {/* Image Panel */}
          {activeTab === 'image' && (
            <div className="flex flex-col h-[55vh] p-4 sm:p-6">
              <div className="flex-1 bg-[#0c0c1f] border border-[#1c1c32] rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
                {isGenerating ? (
                  <div className="text-center text-[#00ffcc]">
                    <Loader2 size={40} className="animate-spin mx-auto mb-3" />
                    <p className="animate-pulse text-xs">Transforming pixels...</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} alt="AI Generated" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-[#3a3a6a] p-4">
                    <ImageIcon size={52} className="mx-auto mb-3 opacity-45" />
                    <p className="text-sm">Safe Art Generator. Create family-friendly graphics and conceptual backgrounds.</p>
                  </div>
                )}
              </div>
              <form onSubmit={handleImageGen} className="flex gap-2">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe a safe concept (e.g., A glowing cyber garden, anime style)"
                  className="flex-1 bg-[#0c0c1f] border border-[#1c1c32] rounded-xl px-4 py-3 text-sm text-[#d0d0e8] focus:outline-none focus:border-[#00ffcc]/50 transition-all"
                />
                <button type="submit" disabled={!imagePrompt.trim() || isGenerating} className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#00ccaa] to-[#00ffcc] text-[#020d0a] font-bold text-sm shadow-[0_0_12px_rgba(0,255,204,0.15)] hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all shrink-0">
                  Draw
                </button>
              </form>
            </div>
          )}

          {/* Settings Panel */}
          {activeTab === 'settings' && (
            <div className="p-4 sm:p-6 h-[55vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-[#00ffcc] mb-5 border-b border-[#1c1c32] pb-3">Settings Hub (Local Device)</h2>
              
              <div className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaffee] mb-2">Groq API Key (Chat & Whisper Translation)</label>
                  <input 
                    type="password" 
                    value={keys.groq}
                    onChange={(e) => saveKeys({...keys, groq: e.target.value})}
                    placeholder="gsk_..." 
                    className="w-full bg-[#0c0c1f] border border-[#1c1c32] rounded-xl p-3 text-sm text-[#d0d0e8] focus:border-[#00ffcc]/50 outline-none"
                  />
                  <p className="text-[10px] text-[#50507a] mt-1">Get one for free securely at console.groq.com</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaffee] mb-2">Hugging Face Token (Art Generation)</label>
                  <input 
                    type="password" 
                    value={keys.hf}
                    onChange={(e) => saveKeys({...keys, hf: e.target.value})}
                    placeholder="hf_..." 
                    className="w-full bg-[#0c0c1f] border border-[#1c1c32] rounded-xl p-3 text-sm text-[#d0d0e8] focus:border-[#00ffcc]/50 outline-none"
                  />
                  <p className="text-[10px] text-[#50507a] mt-1">Get one for free securely at huggingface.co/settings/tokens</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaffee] mb-2">Intelligent LLM Engine</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0c0c1f] border border-[#1c1c32] rounded-xl p-3 text-sm text-[#d0d0e8] focus:border-[#00ffcc]/50 outline-none appearance-none cursor-pointer"
                  >
                    {Object.entries(CHAT_MODELS).map(([name, val]) => (
                      <option key={val} value={val}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#1c1c32]">
                  <p className="text-xs text-[#50507a] leading-relaxed">
                    <strong>Zero Leak Guarantee:</strong> This application has no database server backend. When compiling this APK for distribution, do not hardcode your API keys here. Your friends can type their keys inside their device setting page, protecting your private accounts!
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Reusable navigation item with responsive touch design
function NavButton({ id, icon: Icon, label, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2.5 px-4 py-3 font-semibold text-xs tracking-wide uppercase transition-all border-b-2 shrink-0 ${
        isActive 
          ? 'text-[#00ffcc] border-[#00ffcc] bg-[#00ffcc]/5' 
          : 'text-[#3a3a6a] border-transparent hover:text-[#aaffee]'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
