import React, { useState } from 'react';
import { NeuCard, NeuButton, NeuInput, NeuTextArea } from '../components/Neu';
import { Calculator, FileText, Split, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { roastResume } from '../services/geminiService';

const BillSplitter = () => {
    const [total, setTotal] = useState<string>('');
    const [people, setPeople] = useState<string>('2');
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const t = parseFloat(total);
        const p = parseInt(people);
        if (t && p) setResult(t / p);
    };

    return (
        <NeuCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <Split size={20} />
                </div>
                <h3 className="font-bold text-lg dark:text-slate-200">Roommate Splitter</h3>
            </div>
            <div className="space-y-4">
                <NeuInput 
                    type="number" 
                    placeholder="Total Bill (KSh)" 
                    value={total} 
                    onChange={e => setTotal(e.target.value)} 
                />
                <NeuInput 
                    type="number" 
                    placeholder="Number of People" 
                    value={people} 
                    onChange={e => setPeople(e.target.value)} 
                />
                <NeuButton variant="primary" className="w-full" onClick={calculate}>
                    Calculate Split
                </NeuButton>
                {result !== null && (
                    <div className="text-center mt-4 p-4 rounded-xl bg-ceramic dark:bg-obsidian shadow-inner">
                        <span className="text-sm text-slate-500">Each pays</span>
                        <div className="text-3xl font-bold text-emerald-500">KSh {result.toFixed(2)}</div>
                    </div>
                )}
            </div>
        </NeuCard>
    );
};

const ResumeRoaster = () => {
    const [resumeText, setResumeText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoast = async () => {
        if (!resumeText) return;
        setLoading(true);
        const response = await roastResume(resumeText);
        setFeedback(response);
        setLoading(false);
    };

    return (
        <NeuCard className="p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg dark:text-slate-200">AI Resume Roast</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Paste a bullet point or summary from your resume. Our AI recruiter will destroy it (constructively).</p>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <NeuTextArea 
                        rows={6} 
                        placeholder="Paste resume text here..." 
                        value={resumeText}
                        onChange={e => setResumeText(e.target.value)}
                    />
                    <NeuButton 
                        variant="primary" 
                        className="w-full" 
                        onClick={handleRoast}
                        disabled={loading || !resumeText}
                    >
                        {loading ? 'Roasting...' : 'Roast Me 🔥'}
                    </NeuButton>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-ceramic dark:bg-obsidian rounded-xl shadow-inner opacity-50 pointer-events-none"></div>
                    <div className={`relative p-4 h-full rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 italic text-sm ${!feedback ? 'opacity-50' : ''}`}>
                        {feedback || "Feedback will appear here..."}
                    </div>
                </div>
            </div>
        </NeuCard>
    );
};

const Tools: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Micro-Tools</h2>
            <p className="text-slate-500">Utilities to make campus life easier.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BillSplitter />
            <ResumeRoaster />
            
            <NeuCard className="p-6 flex flex-col items-center justify-center text-center opacity-70">
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold mb-2 dark:text-slate-200">Schedule Optimizer</h3>
                <p className="text-xs text-slate-500 mb-4">Coming soon to the Hustle Kit API.</p>
                <NeuButton disabled className="w-full">Unlock (KSh 150)</NeuButton>
            </NeuCard>
        </div>
    </div>
  );
};

export default Tools;