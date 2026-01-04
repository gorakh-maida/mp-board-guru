
import React from 'react';
import { StudentClass } from '../types';
import { CLASS_10_SUBJECTS, CLASS_12_SUBJECTS } from '../constants';

interface SidebarProps {
  selectedClass: StudentClass;
  setSelectedClass: (cls: StudentClass) => void;
  onSubjectSelect: (subject: string) => void;
  onOpenPlanner: () => void;
  onOpenLive: () => void;
  onClearHistory: () => void;
  lastSaved: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedClass, 
  setSelectedClass, 
  onSubjectSelect, 
  onOpenPlanner,
  onOpenLive,
  onClearHistory,
  lastSaved
}) => {
  const subjects = selectedClass === StudentClass.CLASS_10 ? CLASS_10_SUBJECTS : CLASS_12_SUBJECTS;

  return (
    <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col w-72 md:w-80 shrink-0 transition-colors duration-300">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tighter">
          <span className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.246.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </span>
          MP GURU
        </h1>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">AI Study Engine</span>
           <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest italic">V3.5</span>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Class Tier</label>
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
            <button 
              onClick={() => setSelectedClass(StudentClass.CLASS_10)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                selectedClass === StudentClass.CLASS_10 
                ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white ring-1 ring-slate-100 dark:ring-slate-600' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              10TH
            </button>
            <button 
              onClick={() => setSelectedClass(StudentClass.CLASS_12)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                selectedClass === StudentClass.CLASS_12 
                ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white ring-1 ring-slate-100 dark:ring-slate-600' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              12TH
            </button>
          </div>
        </div>

        <button 
          onClick={onOpenLive}
          className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 animate-pulse"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">GURU LIVE VANI</p>
              <p className="text-sm font-black uppercase leading-tight">Live Study Session</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
        </button>

        {selectedClass === StudentClass.CLASS_10 && (
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">Revision Shortcuts</label>
            <button 
              onClick={() => onSubjectSelect("Create detailed handwritten notes for Photosynthesis Class 10. Include a diagram prompt [DRAW: Photosynthesis Process] and an important question note [NOTE: GREEN | EXAM IMP].")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl group transition-all hover:bg-emerald-100"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">🍀</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Quick Notes</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Photosynthesis (Class 10)</p>
              </div>
            </button>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">Memory & Context</label>
          <div className="space-y-3">
            <button 
              onClick={onClearHistory}
              className="w-full flex items-center gap-4 px-5 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear Session
            </button>
            <div className="px-5 py-2">
               <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">
                 Last Auto-Sync: {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-[2rem] p-6 shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <label className="text-[9px] font-black text-indigo-200 uppercase mb-2 block tracking-widest">Blueprint Checker</label>
            <p className="text-sm text-white font-bold leading-tight mb-4">Validate your syllabus for 2025-26 Board Exams.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onSubjectSelect(`Is the topic [WRITE TOPIC] included in the current MP Board Class ${selectedClass} syllabus for 2025-26?`)}
                className="w-full py-3 bg-white text-indigo-600 dark:text-indigo-700 text-[10px] font-black uppercase rounded-2xl shadow-lg hover:shadow-white/20 transition-all active:scale-95 tracking-widest"
              >
                VERIFY TOPIC
              </button>
              <button 
                onClick={onOpenPlanner}
                className="w-full py-3 bg-indigo-900/40 text-white text-[10px] font-black uppercase rounded-2xl border border-white/20 hover:bg-indigo-900/60 transition-all active:scale-95 tracking-widest flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                STUDY PLANNER
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">Major Subjects</label>
          <div className="grid grid-cols-1 gap-2">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubjectSelect(sub.name)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-md hover:text-indigo-700 dark:hover:text-indigo-400 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl group-hover:scale-125 transition-transform duration-300">{sub.icon}</span>
                  <span className="uppercase tracking-tighter">{sub.name}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">Board Resources</label>
          <div className="space-y-3">
            {[
              { label: 'Exam Dates 2026', prompt: 'Official MP Board 2026 Exam Date Sheet' },
              { label: 'Subject Blueprints', prompt: '2026 MP Board Blueprints for ' + selectedClass },
              { label: 'Sample Papers', prompt: 'Previous 5 year sample papers for Class ' + selectedClass }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => onSubjectSelect(action.prompt)}
                className="w-full text-left px-5 py-3.5 bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-2xl text-[10px] font-black text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-between group uppercase tracking-widest"
              >
                {action.label}
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:scale-150 transition-all"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Prep Progress</span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">92% TARGET</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-600 h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
