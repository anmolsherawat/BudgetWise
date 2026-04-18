import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FiShield, FiZap, FiPieChart, FiCheckCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import Spinner from '../components/Spinner';

const AIAdvisor = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        income: '',
        expenses: '',
        savings: '',
        goals: []
    });
    const [loading, setLoading] = useState(false);
    const [geminiAdvice, setGeminiAdvice] = useState('');

    const reset = () => {
        setStep(1);
        setGeminiAdvice('');
    };

    const getAdvice = () => {
        const inc = parseFloat(formData.income) || 0;
        const exp = parseFloat(formData.expenses) || 0;
        const sav = parseFloat(formData.savings) || 0;

        if (inc === 0) return null;

        const expRatio = (exp / inc) * 100;
        const savRatio = (sav / inc) * 100;

        return {
            score: Math.max(0, 100 - (expRatio * 0.8) + (savRatio * 1.5)),
            budget: {
                essentials: inc * 0.5,
                wants: inc * 0.3,
                savings: inc * 0.2
            }
        };
    };

    const handleGetPlan = async () => {
        setStep(2);
        setLoading(true);
        try {
            const message = `I earn ${formData.income} a month and my essential bills are ${formData.expenses}. Please give me some actionable financial advice based on my specific situation.`;
            const response = await aiAPI.chat(message);
            if (response.data.success) {
                setGeminiAdvice(response.data.data.message);
            } else {
                setGeminiAdvice("I'm having trouble connecting to your advisor right now.");
            }
        } catch (error) {
            setGeminiAdvice("Error connecting to Advisor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const advice = getAdvice();

    return (
        <div className="space-y-16 pb-24">
            {/* Header with Hero Image */}
            <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80" alt="AI Advisory" className="absolute inset-0 w-full h-full object-cover opacity-30 contrast-125 grayscale mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-slate-900/90 dark:from-slate-900 dark:to-slate-950/90" />
                <div className="relative z-10 p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">Meet Your <span className="text-emerald-400">Advisor</span></h1>
                        <p className="text-emerald-100 font-bold text-sm tracking-wide mt-2 opacity-80">Simple, personalized financial guidance.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md dark:backdrop-blur-none px-6 py-3 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3 text-emerald-300">
                        <FiShield size={20} className="text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-white shadow-sm">100% Private</span>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="card shadow-2xl shadow-slate-200/50  p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">How much do you earn a month?</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">{getCurrencySymbol(user?.currency)}</span>
                                        <input
                                            type="number"
                                            value={formData.income}
                                            onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                                            placeholder="50000"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">How much are your essential bills?</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">{getCurrencySymbol(user?.currency)}</span>
                                        <input
                                            type="number"
                                            value={formData.expenses}
                                            onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                                            placeholder="30000"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGetPlan}
                                disabled={!formData.income || !formData.expenses}
                                className="w-full btn-primary py-5 text-base rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:grayscale shadow-xl shadow-emerald-500/20"
                            >
                                <FiZap size={24} className="text-emerald-500" />
                                <span className="font-black tracking-wide shadow-sm">Get My Plan</span>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-10"
                    >
                        {/* Analytical Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Visual Allocation PieChart */}
                            <div className="lg:col-span-12 xl:col-span-5 card relative overflow-hidden flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 z-10 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full bg-white dark:bg-[#050505] shadow-sm relative"><span className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Optimal Split</p>
                                <div className="w-full h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Essentials', value: advice?.budget.essentials },
                                                    { name: 'Lifestyle', value: advice?.budget.wants },
                                                    { name: 'Savings', value: advice?.budget.savings }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={105}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                <Cell fill="#059669" />
                                                <Cell fill="#0ea5e9" />
                                                <Cell fill="#8b5cf6" />
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">{Math.round(advice?.score || 0)}</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Health Score</span>
                                </div>
                            </div>

                            {/* Strategic Allocation Bars */}
                            <div className="lg:col-span-12 xl:col-span-7 card p-10 shadow-xl shadow-slate-200/40  border border-slate-200 dark:border-slate-800">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><FiPieChart size={24} className="text-slate-600 dark:text-slate-300" /></div>
                                    How You Should Budget
                                </h3>
                                <div className="space-y-10">
                                    {[
                                        { label: 'Needs & Bills (50%)', value: advice?.budget.essentials, color: 'bg-emerald-600', width: '50%' },
                                        { label: 'Wants & Fun (30%)', value: advice?.budget.wants, color: 'bg-sky-500', width: '30%' },
                                        { label: 'Savings & Investing (20%)', value: advice?.budget.savings, color: 'bg-violet-500', width: '20%' }
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                                                <CurrencyDisplay amount={item.value} className="text-2xl text-slate-900 dark:text-white font-black" valueClassName="font-financial" />
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                                                <motion.div initial={{ width: 0 }} animate={{ width: item.width }} transition={{ duration: 1, ease: "easeOut", delay: i * 0.2 }} className={`h-full ${item.color} shadow-sm`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Engine */}
                        <div className="card p-8 md:p-12 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50  min-h-[300px]">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 flex items-center gap-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm"><FiCheckCircle size={32} className="text-emerald-600" /></div>
                                Your Personalized Tips
                            </h2>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Spinner text="Analyzing Your Finances..." />
                                </div>
                            ) : (
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed space-y-4">
                                    {geminiAdvice.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => {
                                        // Simple bold parsing just in case Gemini returns markdown bold
                                        const boldParsed = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i} className="text-slate-800 dark:text-slate-200">{part.slice(2, -2)}</strong>;
                                            }
                                            return part;
                                        });

                                        return (
                                            <p key={idx}>{boldParsed}</p>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center pt-10">
                            <button
                                onClick={reset}
                                className="text-xs font-black text-slate-400 hover:text-emerald-600 uppercase tracking-[0.3em] transition-all flex items-center gap-3"
                            >
                                Start Over <FiArrowRight />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAdvisor;
