
import React, { useRef, useState, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { generateImage } from '../services/geminiService';
import { speakText, stopGuruSpeaking, preCacheFirstChunk } from '../services/ttsService';

interface ChatBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  isCurrentlySpeaking: boolean;
  speechSpeed: number;
  onSpeedChange: (speed: number) => void;
  onSpeak: (id: string, text: string) => void;
  onStop: () => void;
  onPreviewPDF: (url: string, title: string) => void;
  onAskGuru?: (question: string) => void;
}

const GroundingPdfCard: React.FC<{ uri: string; title: string; onFullPreview: () => void }> = ({ uri, title, onFullPreview }) => {
  const [showPeek, setShowPeek] = useState(false);
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(uri)}&embedded=true`;

  const getBadge = () => {
    const t = title.toUpperCase();
    if (t.includes('SYLLABUS')) return { text: 'SYLLABUS', color: 'bg-emerald-500' };
    if (t.includes('BLUEPRINT')) return { text: 'BLUEPRINT', color: 'bg-indigo-500' };
    if (t.includes('PAPER') || t.includes('MODEL')) return { text: 'EXAM PAPER', color: 'bg-rose-500' };
    return { text: 'BOARD DOC', color: 'bg-slate-500' };
  };

  const badge = getBadge();

  return (
    <div className="my-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-widest mb-1 ${badge.color}`}>
              {badge.text}
            </div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h5>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPeek(!showPeek)}
            className={`p-3 rounded-xl transition-all ${showPeek ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
            title="Inline Peek"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            onClick={onFullPreview}
            className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all"
            title="Full Study Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      
      {showPeek && (
        <div className="h-80 w-full border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
          <iframe src={viewerUrl} className="w-full h-full border-none" />
        </div>
      )}
    </div>
  );
};

const GeneratedImage: React.FC<{ prompt: string }> = ({ prompt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      const url = await generateImage(prompt);
      if (url) {
        setImageUrl(url);
      } else {
        setError(true);
      }
      setLoading(false);
    };
    fetchImage();
  }, [prompt]);

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Guru_Illustration_${prompt.substring(0, 20).replace(/\s+/g, '_')}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="my-6 w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 animate-pulse">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Crafting Visual Concept...</p>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="my-8 group relative transition-all duration-300">
      {showFull && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowFull(false)}>
          <img src={imageUrl!} alt={prompt} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-8 right-8 text-white p-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_#818cf8]"></div>
        <span className="text-[9px] font-black text-white uppercase tracking-widest">Imagen 4 High-Res</span>
      </div>
      
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-200">
        <img 
          src={imageUrl!} 
          alt={prompt} 
          className="w-full h-auto transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
          onClick={() => setShowFull(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex gap-2 w-full">
            <button 
              onClick={downloadImage}
              className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Save Image
            </button>
            <button 
              onClick={() => setShowFull(true)}
              className="p-3 bg-white/20 backdrop-blur text-white rounded-xl border border-white/30 hover:bg-white/40 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] italic">AI Visual Reconstruction for Study Purpose</p>
    </div>
  );
};

const CompareTable: React.FC<{ headerA: string; headerB: string; rows: string[] }> = ({ headerA, headerB, rows }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const tableText = `${headerA}\t${headerB}\n` + rows.map(r => r.replace('|', '\t')).join('\n');
    navigator.clipboard.writeText(tableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5 dark:ring-white/5 relative group">
      <div className="absolute top-2 right-2 z-20">
        <button 
          onClick={copyToClipboard}
          className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {copied ? (
            <span className="text-[9px] font-black text-green-600 dark:text-green-400 px-2">COPIED</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 bg-slate-900 dark:bg-slate-950 text-white font-black text-[11px] uppercase tracking-[0.2em]">
        <div className="p-5 border-r border-white/10 text-center">{headerA}</div>
        <div className="p-5 text-center">{headerB}</div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, i) => {
          const parts = row.split('|').map(s => s.trim());
          return (
            <div key={i} className="grid grid-cols-2 text-sm">
              <div className="p-5 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/20 font-medium">{parts[0]}</div>
              <div className="p-5 text-slate-700 dark:text-slate-400 leading-relaxed">{parts[1] || "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Model3D: React.FC<{ type: string }> = ({ type }) => {
  const t = type.toUpperCase();
  const isAtom = t === 'ATOM';
  const isCube = t === 'CUBE';
  return (
    <div className="my-8 bg-slate-950 rounded-[2.5rem] p-12 flex flex-col items-center justify-center border-b-[6px] border-slate-900 shadow-2xl relative group ring-1 ring-white/10">
      <div className="h-56 w-56 perspective-1000 flex items-center justify-center">
        <div className="preserve-3d animate-spin-slow w-full h-full relative">
          {isCube ? (
             <div className="relative w-36 h-36 mx-auto preserve-3d">
              <div className="absolute inset-0 bg-indigo-500/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'translateZ(72px)' }}></div>
              <div className="absolute inset-0 bg-indigo-600/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'translateZ(-72px) rotateY(180deg)' }}></div>
              <div className="absolute inset-0 bg-indigo-700/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'rotateY(90deg) translateZ(72px)' }}></div>
              <div className="absolute inset-0 bg-indigo-800/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'rotateY(-90deg) translateZ(72px)' }}></div>
              <div className="absolute inset-0 bg-indigo-900/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'rotateX(90deg) translateZ(72px)' }}></div>
              <div className="absolute inset-0 bg-slate-950/30 border-2 border-indigo-400/60 backdrop-blur-[2px]" style={{ transform: 'rotateX(-90deg) translateZ(72px)' }}></div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="w-14 h-14 bg-red-600 rounded-full shadow-[0_0_40px_rgba(239,68,68,1)] z-10 border-2 border-red-400 animate-pulse"></div>
              <div className="absolute w-44 h-44 border-[1.5px] border-blue-400/50 rounded-full animate-[spin_4s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(10deg)' }}>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-6 text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">Interactive 3D {t}</p>
    </div>
  );
};

const NoteContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={i} className="h-6"></div>;

        if (trimmedLine.startsWith('[IMP]')) {
          return (
            <div key={i} className="flex items-start gap-3 my-2 bg-red-500/5 py-1 px-3 -ml-3 rounded-lg border-l-4 border-red-400">
              <span className="text-red-600 mt-1 scale-125">⭐</span>
              <span className="font-bold uppercase tracking-tight text-red-900/80">{trimmedLine.replace('[IMP]', '').trim()}</span>
            </div>
          );
        }

        if (trimmedLine.startsWith('[TIP]')) {
          return (
            <div key={i} className="flex items-start gap-3 my-2 bg-amber-500/5 py-1 px-3 -ml-3 rounded-lg border-l-4 border-amber-400">
              <span className="text-amber-600 mt-1 scale-125">💡</span>
              <span className="italic text-amber-900/80">{trimmedLine.replace('[TIP]', '').trim()}</span>
            </div>
          );
        }

        if (trimmedLine.startsWith('[DEF]')) {
          return (
            <div key={i} className="flex items-start gap-3 my-2 bg-indigo-500/5 py-1 px-3 -ml-3 rounded-lg border-l-4 border-indigo-400">
              <span className="text-indigo-600 mt-1 scale-125">📖</span>
              <span className="font-bold underline decoration-indigo-200 decoration-wavy underline-offset-4">{trimmedLine.replace('[DEF]', '').trim()}</span>
            </div>
          );
        }

        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return (
            <div key={i} className="flex items-start gap-4 ml-2">
              <span className="shrink-0 mt-3 w-2 h-2 rounded-full border-2 border-slate-900/40 rotate-12"></span>
              <span>{trimmedLine.substring(1).trim()}</span>
            </div>
          );
        }

        const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start gap-4 ml-1">
              <span className="shrink-0 mt-1 font-black text-slate-400/60 text-lg border-b-2 border-slate-200">{numberedMatch[1]}</span>
              <span>{numberedMatch[2]}</span>
            </div>
          );
        }

        return <div key={i} className="pl-1">{trimmedLine}</div>;
      })}
    </div>
  );
};

const NoteCard: React.FC<{ color: string; title: string; content: string; onDeepDive?: () => void }> = ({ color, title, content, onDeepDive }) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getColors = () => {
    const c = color.toUpperCase();
    switch (c) {
      case 'BLUE': return { bg: 'bg-[#f0f9ff]', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-blue-600', tape: 'bg-blue-300/30' };
      case 'GREEN': return { bg: 'bg-[#f0fdf4]', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-600', tape: 'bg-emerald-300/30' };
      case 'PINK': return { bg: 'bg-[#fff1f2]', border: 'border-rose-200', text: 'text-rose-900', accent: 'bg-rose-600', tape: 'bg-rose-300/30' };
      case 'YELLOW': 
      default: return { bg: 'bg-[#fffbeb]', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-500', tape: 'bg-amber-300/30' };
    }
  };

  const handleSaveToBag = () => {
    const savedNotes = JSON.parse(localStorage.getItem('guru-study-bag') || '[]');
    const newNote = { id: Date.now(), title, content, color, date: new Date().toLocaleDateString() };
    localStorage.setItem('guru-study-bag', JSON.stringify([...savedNotes, newNote]));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const downloadPDF = async () => {
    if (!noteRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const canvas = await (window as any).html2canvas(noteRef.current, {
        scale: 4,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 4, canvas.height / 4]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 4, canvas.height / 4);
      pdf.save(`GuruNote_${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const style = getColors();

  return (
    <div className="my-12 relative group max-w-2xl mx-auto transition-all duration-300">
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 ${style.tape} backdrop-blur-[2px] -rotate-3 z-30 shadow-sm border border-black/5`}></div>
      <div ref={noteRef} className={`border-t-4 ${style.accent} border-r border-b border-l ${style.border} ${style.bg} p-10 rounded-sm shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        <div className="absolute top-0 left-14 bottom-0 w-[1.5px] bg-red-400/20"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 opacity-10 rotate-12 pointer-events-none">
          <svg viewBox="0 0 100 100" className="text-slate-900 fill-current">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"/>
            <text x="50" y="45" textAnchor="middle" className="text-[10px] font-black uppercase tracking-tighter">MP Board</text>
            <text x="50" y="65" textAnchor="middle" className="text-[14px] font-black uppercase tracking-widest">GURU</text>
            <path d="M20,50 L80,50" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8 border-b border-black/5 pb-4">
            <div className={`w-4 h-4 rounded-full ${style.accent}`}></div>
            <h4 className={`font-black text-lg uppercase tracking-widest ${style.text}`}>{title}</h4>
          </div>
          <div className={`font-handwriting text-2xl md:text-3xl ruled-paper ${style.text} whitespace-pre-wrap pl-12 min-h-[200px]`}>
            <NoteContentRenderer content={content} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button 
          onClick={downloadPDF}
          disabled={isExporting}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF Note
            </>
          )}
        </button>
        <button 
          onClick={handleSaveToBag}
          className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${isSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
        >
          {isSaved ? 'Saved to Bag!' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              Add to Bag
            </>
          )}
        </button>
        {onDeepDive && (
          <button 
            onClick={onDeepDive}
            className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Explain More
          </button>
        )}
      </div>
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLatest, isCurrentlySpeaking, speechSpeed, onSpeedChange, onSpeak, onStop, onPreviewPDF, onAskGuru }) => {
  const isUser = message.role === MessageRole.USER;
  const isPdfLink = (url: string) => url.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    if (!isUser && message.content && isLatest) {
      preCacheFirstChunk(message.id, message.content);
    }
  }, [message.id, message.content, isUser, isLatest]);

  const toggleSpeak = () => {
    if (isCurrentlySpeaking) {
      onStop();
    } else {
      onSpeak(message.id, message.content);
    }
  };

  const handleSpeedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.2, 1.5];
    const currentIndex = speeds.indexOf(speechSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onSpeedChange(speeds[nextIndex]);
  };

  const renderContent = (content: string) => {
    const model3dRegex = /\[3D:\s*(.*?)\]/g;
    const noteRegex = /\[NOTE:\s*(.*?)\s*\|\s*(.*?)\]([\s\S]*?)\[END_NOTE\]/g;
    const drawRegex = /\[DRAW:\s*(.*?)\]/g;
    const diffRegex = /\[DIFF:\s*(.*?)\s*\|\s*(.*?)\]([\s\S]*?)\[END_DIFF\]/g;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const combinedRegex = new RegExp(`${model3dRegex.source}|${noteRegex.source}|${drawRegex.source}|${diffRegex.source}`, 'g');
    let match;

    while ((match = combinedRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        elements.push(content.substring(lastIndex, match.index));
      }
      if (match[1]) { 
        elements.push(<Model3D key={`3d-${match.index}`} type={match[1].trim()} />);
      } else if (match[2]) {
        const title = match[3].trim();
        elements.push(<NoteCard key={`note-${match.index}`} color={match[2].trim()} title={title} content={match[4].trim()} onDeepDive={onAskGuru ? () => onAskGuru(`GURU, CAN YOU EXPLAIN THE NOTE ON "${title.toUpperCase()}" IN MORE DETAIL?`) : undefined} />);
      } else if (match[5]) {
        elements.push(<GeneratedImage key={`draw-${match.index}`} prompt={match[5].trim()} />);
      } else if (match[6]) {
        const rows = match[8].trim().split('\n').filter((r: string) => r.trim());
        elements.push(<CompareTable key={`diff-${match.index}`} headerA={match[6].trim()} headerB={match[7].trim()} rows={rows} />);
      }
      lastIndex = combinedRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      elements.push(content.substring(lastIndex));
    }
    return elements.length > 0 ? elements : content;
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[95%] md:max-w-[85%] p-6 rounded-[2rem] shadow-sm relative transition-colors duration-300 ${
        isUser ? 'bg-indigo-600 dark:bg-indigo-700 text-white rounded-br-none' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
      }`}>
        <div className={`text-[9px] font-black mb-3 flex items-center justify-between uppercase tracking-[0.25em] ${isUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
          <div className="flex items-center gap-2">
            {isUser ? 'Student' : 'Guru Visual Engine'}
          </div>
          {!isUser && (
            <div className="flex items-center gap-2">
              {isCurrentlySpeaking && (
                <div className="flex items-center gap-1.5 mr-2 h-4 px-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-full">
                  <div className="w-1 bg-indigo-500 animate-[bounce_0.6s_infinite_ease-in-out]"></div>
                  <div className="w-1 bg-indigo-500 animate-[bounce_0.6s_infinite_ease-in-out_0.2s]"></div>
                  <div className="w-1 bg-indigo-500 animate-[bounce_0.6s_infinite_ease-in-out_0.4s]"></div>
                  <button 
                    onClick={handleSpeedToggle}
                    className="ml-1 text-[8px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    {speechSpeed}X
                  </button>
                </div>
              )}
              <button 
                onClick={toggleSpeak}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isCurrentlySpeaking ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}
              >
                <span className="text-sm leading-none">{isCurrentlySpeaking ? '⏹' : '🔊'}</span>
                <span className="font-black tracking-widest">{isCurrentlySpeaking ? 'STOP' : 'READ'}</span>
              </button>
            </div>
          )}
        </div>
        <div className={`whitespace-pre-wrap leading-relaxed ${!isUser ? 'font-mono text-[13px] md:text-sm tracking-tight' : 'text-sm font-medium'}`}>
          {isUser ? message.content : renderContent(message.content)}
        </div>
        
        {!isUser && message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">Official Board References</label>
            <div className="grid grid-cols-1 gap-1">
              {message.groundingUrls.map((url, idx) => {
                const pdf = isPdfLink(url.uri);
                if (pdf) {
                  return (
                    <GroundingPdfCard 
                      key={idx} 
                      uri={url.uri} 
                      title={url.title || "MP Board Official Document"} 
                      onFullPreview={() => onPreviewPDF(url.uri, url.title)}
                    />
                  );
                }
                return (
                  <div key={idx} className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl group/res">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{url.title || "External Source"}</p>
                    </div>
                    <a href={url.uri} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 text-[9px] font-black uppercase px-4 py-2.5 rounded-xl">Open</a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
