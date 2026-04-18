import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiPlus, FiTrash2, FiFlag, FiTrendingUp, FiClock, FiHome, FiTruck, FiBriefcase, FiBook, FiUmbrella, FiCoffee, FiStar, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';
import { goalAPI } from '../services/api';
import Spinner from '../components/Spinner';

const FinancialGoals = () => {
    const { user } = useAuth();
    const sym = getCurrencySymbol(user?.currency);
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showTrackForm, setShowTrackForm] = useState(null); // ID of goal being tracked
    const [trackAmount, setTrackAmount] = useState('');
    const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchGoals = async () => {
        try {
            const res = await goalAPI.getAll();
            setGoals(res.data.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const addGoal = async () => {
        if (!newGoal.title || !newGoal.target || !newGoal.deadline) return;
        try {
            const res = await goalAPI.create(newGoal);
            setGoals([res.data.data, ...goals]);
            setNewGoal({ title: '', target: '', deadline: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error adding goal:', error);
        }
    };

    const deleteGoal = async (id) => {
        try {
            await goalAPI.delete(id);
            setGoals(goals.filter(g => g.id !== id));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const updateGoalProgress = async (goal) => {
        if (!trackAmount || isNaN(trackAmount) || trackAmount <= 0) return;
        try {
            const newCurrent = (goal.current || 0) + parseFloat(trackAmount);
            const res = await goalAPI.update(goal.id, { current: newCurrent });
            setGoals(goals.map(g => g.id === goal.id ? res.data.data : g));
            setShowTrackForm(null);
            setTrackAmount('');
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const getMonthsLeft = (deadline) => {
        if (!deadline) return 1;
        const d = new Date(deadline);
        const now = new Date();
        const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
        return months > 0 ? months : 1;
    };

    const getGoalIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes('home') || t.includes('house') || t.includes('rent')) return FiHome;
        if (t.includes('car') || t.includes('bike') || t.includes('travel') || t.includes('trip')) return FiTruck;
        if (t.includes('education') || t.includes('school') || t.includes('course')) return FiBook;
        if (t.includes('business') || t.includes('work') || t.includes('startup')) return FiBriefcase;
        if (t.includes('emergency') || t.includes('health') || t.includes('insurance')) return FiUmbrella;
        if (t.includes('coffee') || t.includes('food')) return FiCoffee;
        if (t.includes('investment') || t.includes('stocks')) return FiStar;
        return FiTarget;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Wealth<span className="text-emerald-600">Targets</span></h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-2">Strategic Milestone Tracking • Phase 5 Monitoring</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 px-8 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 text-xs tracking-[0.2em] uppercase font-black w-full md:w-auto transition-all active:scale-95"
                >
                    <FiPlus size={20} />
                    <span>Establish Target</span>
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm mb-6"
                    >
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Create Target Goal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input
                                placeholder="Goal Title (e.g. Travel)"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Target Amount"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                value={newGoal.target}
                                onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={addGoal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">Save Goal</button>
                            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="flex justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <Spinner text="Loading goals..." />
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No financial goals set yet. Click "Set New Goal" to start tracking!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    const monthsLeft = getMonthsLeft(goal.deadline);
                    const amountPerMonth = Math.round((goal.target - goal.current) / monthsLeft);
                    return (
                        <motion.div
                            key={goal.id}
                            layout
                            className="group relative overflow-hidden bg-white dark:bg-[#050505] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                {React.createElement(getGoalIcon(goal.title), { size: 120 })}
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:text-emerald-500 transition-colors">
                                        {React.createElement(getGoalIcon(goal.title), { size: 28 })}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 uppercase h-7 overflow-hidden">{goal.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            <FiClock size={12} className="text-emerald-500" />
                                            <span>Deadline: {goal.deadline}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setShowTrackForm(showTrackForm === goal.id ? null : goal.id)}
                                        className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                        title="Add Funds"
                                    >
                                        <FiPlus size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        title="Delete Goal"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Audit Progress</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black font-financial text-slate-900 dark:text-white tracking-tighter">{sym}{goal.current.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-slate-400 lowercase tracking-tight">of {sym}{goal.target.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${progress >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900'}`}>
                                        {Math.min(progress, 100).toFixed(0)}% SYNCHRONIZED
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min(progress, 100)}%` }}
                                        className={`h-full relative z-10 ${progress >= 100 ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-emerald-600'}`}
                                    />
                                    {progress > 0 && progress < 100 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full animate-shimmer" />
                                    )}
                                </div>

                                {/* Tracking Form Box */}
                                <AnimatePresence>
                                    {showTrackForm === goal.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder={`Amount in ${sym}`}
                                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                                        value={trackAmount}
                                                        onChange={e => setTrackAmount(e.target.value)}
                                                    />
                                                    <button onClick={() => updateGoalProgress(goal)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-sm transition-colors whitespace-nowrap">
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 group-hover:border-emerald-500/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                        <FiTrendingUp size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Required Inflow</p>
                                        <p className="text-sm text-slate-900 dark:text-white font-black tracking-tight leading-none uppercase">
                                            {sym}{amountPerMonth.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold tracking-normal">Per Month</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            )}
        </div>
    );
};

export default FinancialGoals;
