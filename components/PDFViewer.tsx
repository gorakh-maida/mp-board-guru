
import React, { useState, useEffect } from 'react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initiating Guru Archives...');

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  useEffect(() => {
    const statuses = [
      'Authenticating MPBSE Source...',
      'Verifying Document Blueprint...',
      'Analyzing Chapter Metadata...',
      'Optimizing for Class View...',
      'Finalizing Guru Preview...'
    ];
    
    let currentStatus = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const jump = Math.random() * 15;
        if (prev + jump > currentStatus * 20 + 20) {
          currentStatus = Math.min(statuses.length - 1, currentStatus + 1);
          setStatus(statuses[currentStatus]);
        }
        return prev + jump;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-200">
      <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-colors duration-300 ring-1 ring-white/10">
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">GURU PDF</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] md:max-w-md">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download
            </a>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-opacity duration-500">
               <div className="w-full max-w-md">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">Guru Loading Engine</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 animate-pulse">{status}</span>
                    </div>
                    <span className="text-xl font-black text-slate-300 dark:text-slate-700">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-4 opacity-40">
                    <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  </div>
               </div>
            </div>
          )}
          <iframe 
            src={viewerUrl}
            onLoad={() => {
              setProgress(100);
              setTimeout(() => setIsLoading(false), 800);
            }}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
