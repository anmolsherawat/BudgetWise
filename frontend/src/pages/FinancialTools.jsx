import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiEdit, FiTrash2, FiCpu, FiTrendingUp, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const FinancialTools = () => {
    const { user } = useAuth();
    const sym = getCurrencySymbol(user?.currency);
    const [activeTab, setActiveTab] = useState('SIP');

    // SIP Calculator State
    const [sipMonthly, setSipMonthly] = useState(5000);
    const [sipRate, setSipRate] = useState(12);
    const [sipYears, setSipYears] = useState(10);

    // EMI Calculator State
    const [emiPrincipal, setEmiPrincipal] = useState(1000000);
    const [emiRate, setEmiRate] = useState(8.5);
    const [emiYears, setEmiYears] = useState(20);

    const calculateSIP = () => {
        const P = sipMonthly;
        const i = (sipRate / 100) / 12;
        const n = sipYears * 12;
        const M = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const invested = P * n;

        // Generate chart data for each year
        const chartData = [];
        for (let year = 1; year <= sipYears; year++) {
            const monthsStr = year * 12;
            const currentM = P * ((Math.pow(1 + i, monthsStr) - 1) / i) * (1 + i);
            const currentInv = P * monthsStr;
            chartData.push({
                year: `Year ${year}`,
                Invested: Math.round(currentInv),
                Maturity: Math.round(currentM),
            });
        }

        return { maturity: Math.round(M), invested: Math.round(invested), returns: Math.round(M - invested), chartData };
    };

    const calculateEMI = () => {
        const P = emiPrincipal;
        const r = (emiRate / 100) / 12;
        const n = emiYears * 12;
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;

        // Generate chart data for remaining balance
        const chartData = [];
        let balance = P;
        for (let year = 0; year <= emiYears; year++) {
            if (year === 0) {
                chartData.push({ year: `Year 0`, Balance: Math.round(balance) });
                continue;
            }
            // principal paid in this year
            for (let m = 1; m <= 12; m++) {
                const interest = balance * r;
                const principal = emi - interest;
                balance -= principal;
            }
            chartData.push({
                year: `Year ${year}`,
                Balance: Math.max(0, Math.round(balance)),
            });
        }

        return { emi: Math.round(emi), total: Math.round(totalAmount), interest: Math.round(totalAmount - P), chartData };
    };

    const sipResult = calculateSIP();
    const emiResult = calculateEMI();

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 md:px-0 relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="text-center space-y-3 relative z-10 pt-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <FiCpu size={14} className="text-slate-400" /> Intelligent Planners
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Financial <span className="bg-gradient-to-r from-emerald-600 to-teal-400 text-transparent bg-clip-text">Simulations</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Precise wealth modeling and debt-paydown engines for superior planning.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center p-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 max-w-xs mx-auto relative z-10">
                {['SIP', 'EMI'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm rounded-lg font-bold transition-all ${activeTab === tab
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                            }`}
                    >
                        {tab} Engine
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'SIP' ? (
                    <motion.div
                        key="sip"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Inputs */}
                        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group space-y-6">
                            <div className="relative z-10 space-y-4">
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Monthly Inv.</label>
                                        <span className="text-emerald-600 font-black">{sym}{sipMonthly.toLocaleString()}</span>
                                    </div>
                                    <input type="range" min="500" max="100000" step="500" value={sipMonthly} onChange={e => setSipMonthly(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                </div>
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Exp. Return</label>
                                        <span className="text-emerald-600 font-black">{sipRate}%</span>
                                    </div>
                                    <input type="range" min="1" max="30" step="0.5" value={sipRate} onChange={e => setSipRate(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                </div>
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Time Period</label>
                                        <span className="text-emerald-600 font-black">{sipYears}y</span>
                                    </div>
                                    <input type="range" min="1" max="40" step="1" value={sipYears} onChange={e => setSipYears(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    * Model computes compound interest assuming start-of-month investments.
                                </p>
                            </div>
                        </div>

                        {/* Visual Results */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-56">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5"><FiTrendingUp /> Growth Projection</p>
                                </div>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sipResult.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip formatter={(value) => `${sym}${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="Maturity" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMaturity)" />
                                            <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Invested</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white font-financial">{sym}{sipResult.invested.toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-80">Est. Returns</p>
                                    <p className="text-xl font-bold font-financial">{sym}{sipResult.returns.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md flex justify-between items-center">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-50 break-words drop-shadow-sm mb-1">Maturity Value</p>
                                    <p className="text-3xl md:text-4xl font-black drop-shadow-sm tracking-tight font-financial">{sym}{sipResult.maturity.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <FiDollarSign size={24} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="emi"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* EMI Inputs */}
                        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group space-y-6">
                            <div className="relative z-10 space-y-4">
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Loan Amount</label>
                                        <span className="text-rose-600 font-black">{sym}{emiPrincipal.toLocaleString()}</span>
                                    </div>
                                    <input type="range" min="100000" max="10000000" step="50000" value={emiPrincipal} onChange={e => setEmiPrincipal(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                                </div>
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Interest (p.a)</label>
                                        <span className="text-rose-600 font-black">{emiRate}%</span>
                                    </div>
                                    <input type="range" min="5" max="25" step="0.1" value={emiRate} onChange={e => setEmiRate(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                                </div>
                                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="font-bold text-slate-500">Period (Years)</label>
                                        <span className="text-rose-600 font-black">{emiYears}y</span>
                                    </div>
                                    <input type="range" min="1" max="30" step="1" value={emiYears} onChange={e => setEmiYears(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    * Amortized standard EMI logic applied across the period.
                                </p>
                            </div>
                        </div>

                        {/* EMI Results */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-56">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1.5">Debt Paydown</p>
                                </div>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={emiResult.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip formatter={(value) => `${sym}${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="Balance" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Repayable</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white font-financial">{sym}{emiResult.total.toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-80">Total Interest</p>
                                    <p className="text-xl font-bold font-financial">{sym}{emiResult.interest.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md flex justify-between items-center">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-50 break-words drop-shadow-sm mb-1">Monthly Payment</p>
                                    <p className="text-3xl md:text-4xl font-black drop-shadow-sm tracking-tight font-financial">{sym}{emiResult.emi.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <FiRefreshCw size={24} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FinancialTools;
