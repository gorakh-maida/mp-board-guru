
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StudentClass, ChatMessage, MessageRole } from './types';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';
import PDFViewer from './components/PDFViewer';
import StudyPlanner from './components/StudyPlanner';
import LiveSessionOverlay from './components/LiveSessionOverlay';
import { sendMessageToGemini } from './services/geminiService';
import { stopGuruSpeaking, speakText } from './services/ttsService';
import { COMMON_QUERIES } from './constants';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: MessageRole.MODEL,
  content: "NAMASTE! I AM YOUR MP BOARD GURU. 🎓\n\nI AM READY TO PREPARE YOU FOR YOUR 2026 BOARD EXAMS WITH HIGH-DEFINITION VISUALS AND HANDWRITTEN NOTES!\n\n✨ HOW I HELP:\n1. 🏠 DESI ANALOGY: Complex Science & Social Science explained through local daily life.\n2. 🧊 3D GEOMETRY: View interactive 3D models for Mathematics & Chemistry.\n3. 🎨 MAGIC CANVAS: High-quality AI illustrations using Imagen 4.\n4. 📄 SMART NOTES: Generate and download handwritten-style PDF summaries instantly.\n\nASK ME ANYTHING, LIKE:\n- 'DRAW A NEAT DIAGRAM OF THE HUMAN HEART.'\n- 'EXPLAIN THE DIFFERENCE BETWEEN BIODEGRADABLE AND NON-BIODEGRADABLE WASTE.'\n- 'GIVE ME IMPORTANT QUESTIONS FOR CLASS 10TH HINDI.'",
  timestamp: Date.now(),
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('guru-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedHistory = localStorage.getItem('guru-chat-history');
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse history", e);
        return [WELCOME_MESSAGE];
      }
    }
    return [WELCOME_MESSAGE];
  });

  const [selectedClass, setSelectedClass] = useState<StudentClass>(StudentClass.CLASS_10);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; base64: string } | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = inputValue.trim().toLowerCase();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const classQueries = COMMON_QUERIES[selectedClass];
    const filtered = classQueries.filter(q => {
      const target = q.toLowerCase();
      let searchIdx = 0;
      for (let char of query) {
        searchIdx = target.indexOf(char, searchIdx);
        if (searchIdx === -1) return false;
        searchIdx++;
      }
      return true;
    }).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [inputValue, selectedClass]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('guru-chat-history', JSON.stringify(messages));
    setLastSaved(Date.now());
  }, [messages]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('guru-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const openPdfPreview = useCallback((url: string, title: string) => {
    setPreviewPdf({ url, title });
  }, []);

  const handleSpeak = useCallback(async (id: string, text: string) => {
    setCurrentlySpeakingId(id);
    await speakText(id, text, speechSpeed, () => {
      setCurrentlySpeakingId(null);
    });
  }, [speechSpeed]);

  const handleStopSpeech = useCallback(() => {
    stopGuruSpeaking();
    setCurrentlySpeakingId(null);
  }, []);

  const clearHistory = () => {
    if (window.confirm("GURU ASKS: Are you sure you want to clear your entire study memory?")) {
      handleStopSpeech();
      setMessages([WELCOME_MESSAGE]);
      localStorage.removeItem('guru-chat-history');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      
      if (!isPdf && !isImage) {
        alert("Guru supports PDF files and Images (JPG/PNG) only.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert("File is too large. Please upload under 15MB.");
        return;
      }
      const base64 = await fileToBase64(file);
      setPendingFile({ file, base64 });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = useCallback(async (text?: string, isMagicCanvas?: boolean) => {
    let messageText = text || inputValue.trim();
    if (isMagicCanvas) {
      messageText = `GURU, PLEASE GENERATE A HIGH-QUALITY EDUCATIONAL ILLUSTRATION FOR: ${messageText}. USE THE IMAGEN 4 TOOL FOR THIS.`;
    }
    
    if ((!messageText && !pendingFile) || isLoading) return;

    setShowSuggestions(false);
    handleStopSpeech();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text || inputValue.trim() || (pendingFile?.file.type.startsWith('image/') ? "WHAT IS IN THIS PHOTO?" : "PLEASE EXPLAIN THIS DOCUMENT."),
      timestamp: Date.now(),
      attachedFile: pendingFile ? {
        name: pendingFile.file.name,
        mimeType: pendingFile.file.type
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const fileDataToSend = pendingFile ? {
      data: pendingFile.base64,
      mimeType: pendingFile.file.type
    } : undefined;

    setPendingFile(null);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role as 'user' | 'model',
      parts: [{ text: m.content }]
    }));

    const response = await sendMessageToGemini(
      messageText, 
      history, 
      fileDataToSend
    );

    const modelMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: MessageRole.MODEL,
      content: response.text,
      groundingUrls: response.groundingUrls,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  }, [inputValue, messages, isLoading, pendingFile, handleStopSpeech]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSendMessage(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseLive = (finalTranscript: { role: string; content: string }[]) => {
    setIsLiveOpen(false);
    if (finalTranscript.length > 0) {
      const newMessages: ChatMessage[] = finalTranscript.map((t, idx) => ({
        id: `live-${Date.now()}-${idx}`,
        role: t.role as MessageRole,
        content: t.content,
        timestamp: Date.now(),
      }));
      setMessages(prev => [...prev, ...newMessages]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {previewPdf && (
        <PDFViewer 
          url={previewPdf.url} 
          title={previewPdf.title} 
          onClose={() => setPreviewPdf(null)} 
        />
      )}

      {isPlannerOpen && (
        <StudyPlanner 
          selectedClass={selectedClass} 
          onClose={() => setIsPlannerOpen(false)} 
        />
      )}

      {isLiveOpen && (
        <LiveSessionOverlay 
          selectedClass={selectedClass}
          onClose={handleCloseLive}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-500 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          selectedClass={selectedClass} 
          setSelectedClass={setSelectedClass}
          onSubjectSelect={(prompt) => handleSendMessage(prompt)}
          onOpenPlanner={() => setIsPlannerOpen(true)}
          onOpenLive={() => {
             handleStopSpeech();
             setIsLiveOpen(true);
          }}
          onClearHistory={clearHistory}
          lastSaved={lastSaved}
        />
      </div>

      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-xl md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                MP BOARD GURU
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                handleStopSpeech();
                setIsLiveOpen(true);
              }} 
              className="hidden sm:flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100 dark:border-red-900/30"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Live Session
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {darkMode ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setSelectedClass(selectedClass === StudentClass.CLASS_10 ? StudentClass.CLASS_12 : StudentClass.CLASS_10)}
              className="text-[10px] font-black border-2 border-slate-900 dark:border-slate-100 px-5 py-2.5 rounded-2xl uppercase tracking-widest active:scale-95 text-slate-900 dark:text-white"
            >
              SWITCH CLASS
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scroll-smooth scrollbar-hide">
          <div className="max-w-4xl mx-auto w-full pb-20">
            {messages.map((msg, index) => (
              <ChatBubble 
                key={msg.id} 
                message={msg} 
                isLatest={index === messages.length - 1}
                isCurrentlySpeaking={currentlySpeakingId === msg.id}
                speechSpeed={speechSpeed}
                onSpeedChange={setSpeechSpeed}
                onSpeak={handleSpeak}
                onStop={handleStopSpeech}
                onPreviewPDF={openPdfPreview}
                onAskGuru={(p) => handleSendMessage(p)}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-10 animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-[2rem] rounded-bl-none flex flex-col gap-4 max-w-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 shadow-2xl z-20 transition-colors">
          <div className="max-w-4xl mx-auto relative">
            {showSuggestions && (
              <div ref={suggestionsRef} className="absolute bottom-full left-0 right-0 mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-[60]">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="w-full text-left px-5 py-4 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-4"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 p-2.5 rounded-[2.5rem] focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-3.5 rounded-full text-slate-400 hover:text-indigo-600 transition-colors" title="Upload Study Material">
                📎
              </button>
              <button 
                onClick={() => handleSendMessage(undefined, true)}
                disabled={!inputValue.trim() || isLoading}
                className={`p-3.5 rounded-full transition-colors ${inputValue.trim() ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} 
                title="Guru Magic Canvas (Generate Image)"
              >
                🎨
              </button>
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Guru or type for Magic Canvas..."
                  rows={1}
                  className="w-full bg-transparent border-none rounded-2xl pl-2 pr-14 py-3.5 text-slate-800 dark:text-slate-100 focus:outline-none resize-none max-h-[200px] overflow-y-auto font-medium"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !pendingFile) || isLoading}
                  className="absolute right-1.5 bottom-1.5 w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-full disabled:opacity-20 transition-all"
                >
                  {isLoading ? '...' : '↑'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
