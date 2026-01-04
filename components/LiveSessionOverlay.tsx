
import React, { useState, useEffect, useRef } from 'react';
import { startLiveSession, stopLiveSession, LiveSessionCallbacks } from '../services/liveService';
import { SYSTEM_INSTRUCTION } from '../constants';

interface LiveSessionOverlayProps {
  onClose: (finalTranscript: { role: string; content: string }[]) => void;
  selectedClass: string;
}

const LiveSessionOverlay: React.FC<LiveSessionOverlayProps> = ({ onClose, selectedClass }) => {
  const [status, setStatus] = useState('Initiating Guru Live Vani...');
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const callbacks: LiveSessionCallbacks = {
      onInputTranscription: (text) => setInputTranscription(prev => prev + text),
      onOutputTranscription: (text) => setOutputTranscription(prev => prev + text),
      onTurnComplete: () => {
        setHistory(prev => [
          ...prev, 
          { role: 'user', content: inputTranscription },
          { role: 'model', content: outputTranscription }
        ]);
        setInputTranscription('');
        setOutputTranscription('');
      },
      onError: (err) => setStatus(`Error: ${err}`),
      onClose: () => setIsConnected(false),
    };

    const instruction = `${SYSTEM_INSTRUCTION}\n\nYou are in a LIVE VOICE SESSION with a Class ${selectedClass} student. Be concise, energetic, and highly interactive. Use small sentences. Hinglish mix is encouraged.`;
    
    sessionPromiseRef.current = startLiveSession(callbacks, instruction);
    sessionPromiseRef.current.then(() => {
      setIsConnected(true);
      setStatus('Guru is Listening...');
    });

    return () => {
      if (sessionPromiseRef.current) {
        stopLiveSession(sessionPromiseRef.current);
      }
    };
  }, [selectedClass]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, inputTranscription, outputTranscription]);

  const handleEnd = () => {
    const finalHistory = [...history];
    if (inputTranscription || outputTranscription) {
      finalHistory.push({ role: 'user', content: inputTranscription || '...' });
      finalHistory.push({ role: 'model', content: outputTranscription || '...' });
    }
    onClose(finalHistory);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-2xl flex flex-col p-6 animate-in fade-in duration-300">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">LIVE GURU VANI</h2>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">{status}</p>
            </div>
          </div>
          <button 
            onClick={handleEnd}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95"
          >
            End Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide mb-8 pr-2">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-200 border border-slate-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {inputTranscription && (
            <div className="flex justify-end">
              <div className="max-w-[85%] p-4 rounded-3xl text-sm font-medium bg-indigo-600 text-white shadow-xl animate-pulse">
                {inputTranscription}
              </div>
            </div>
          )}

          {outputTranscription && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-4 rounded-3xl text-sm font-medium bg-slate-800 text-white border-l-4 border-indigo-500 animate-in slide-in-from-left-2">
                {outputTranscription}
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="flex flex-col items-center gap-8 mb-8">
          <div className="flex items-center gap-1 h-12">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-indigo-500 rounded-full animate-bounce"
                style={{ 
                  height: isConnected ? `${Math.random() * 100 + 20}%` : '20%',
                  animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em] max-w-xs">
            Direct real-time connection established. Ask your doubts aloud.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionOverlay;
