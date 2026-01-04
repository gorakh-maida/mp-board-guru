
import React, { useState, useRef } from 'react';
import { StudentClass, StudyPlan } from '../types';
import { CLASS_10_SUBJECTS, CLASS_12_SUBJECTS } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';

interface StudyPlannerProps {
  selectedClass: StudentClass;
  onClose: () => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ selectedClass, onClose }) => {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState('');
  const [formData, setFormData] = useState<StudyPlan>({
    class: selectedClass,
    subjects: [],
    intensity: 'moderate',
    examDate: '2026-02-15'
  });

  const exportRef = useRef<HTMLDivElement>(null);
  const subjects = selectedClass === StudentClass.CLASS_10 ? CLASS_10_SUBJECTS : CLASS_12_SUBJECTS;

  const toggleSubject = (name: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(name) 
        ? prev.subjects.filter(s => s !== name) 
        : [...prev.subjects, name]
    }));
  };

  const generatePlan = async () => {
    if (formData.subjects.length === 0) {
      alert("Guru says: Please select at least one subject!");
      return;
    }
    setLoading(true);
    
    const prompt = `GURU STUDY PLAN GENERATOR:
      Create a detailed study schedule for a Class ${formData.class} student for the 2025-26 Academic Session.
      TARGET EXAM DATE: ${formData.examDate}
      INTENSITY: ${formData.intensity} hours/day
      SUBJECTS: ${formData.subjects.join(', ')}
      
      Format the response inside a [PLAN] block like this:
      [PLAN]
      TITLE: Personalized 2026 Board Victory Plan
      BODY:
      - Week 1: [Focus Area]
      - Week 2: [Focus Area]
      ...
      GURU TIP: [Specific IMP tip]
      [END_PLAN]
      
      Use strictly MP Board 2025-26 Blueprint logic. Avoid asterisks for bold, use CAPS for emphasis.`;

    const response = await sendMessageToGemini(prompt, []);
    setPlanResult(response.text);
    setLoading(false);
    setStep('result');
  };

  const exportToPDF = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await (window as any).html2canvas(exportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`MP_Board_StudyPlan_2026_${selectedClass}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const renderResult = () => {
    const planMatch = planResult.match(/\[PLAN\]([\s\S]*?)\[END_PLAN\]/);
    const content = planMatch ? planMatch[1] : planResult;
    const titleMatch = content.match(/TITLE:\s*(.*)/);
    const bodyMatch = content.match(/BODY:([\s\S]*)/);
    
    const title = titleMatch ? titleMatch[1] : "GURU STUDY PLAN 2026";
    const body = bodyMatch ? bodyMatch[1] : content;

    return (
      <div className="animate-in fade-in zoom-in duration-300">
        <div ref={exportRef} className="bg-white dark:bg-slate-900 p-10 border-2 border-indigo-100 dark:border-indigo-900 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[10rem] -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">🎓</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Class {selectedClass} • Exam Target: {formData.examDate}</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-l-4 border-indigo-500 pl-6 py-2">
              {body}
            </div>
            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Official MP Board Guru Prep Engine</span>
              <div className="text-[9px] text-indigo-600 font-bold uppercase italic">Blueprint Optimized 2025-26</div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={exportToPDF} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Download Plan PDF</button>
          <button onClick={() => setStep('form')} className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all">New Plan</button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl scrollbar-hide">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {step === 'form' ? (
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Guru Plan Generator</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Create a high-impact study schedule for your board exams.</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Select Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSubject(s.name)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        formData.subjects.includes(s.name)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Daily Intensity</label>
                  <select 
                    value={formData.intensity}
                    onChange={(e) => setFormData({...formData, intensity: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="light">Light (2-3 hrs)</option>
                    <option value="moderate">Moderate (4-6 hrs)</option>
                    <option value="intensive">Intensive (8+ hrs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Exam Target</label>
                  <input 
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={generatePlan}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Consulting 2025-26 Board Syllabus...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate Victory Plan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          renderResult()
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
