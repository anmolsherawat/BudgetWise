import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FiAlertCircle, FiCheckCircle, FiZap, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { transactionAPI, budgetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/Spinner';
import { getCurrencySymbol } from '../utils/currency';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const SmartAlerts = () => {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Initialize dismissed alerts from localStorage (parse as array, construct Set)
    const [dismissed, setDismissed] = useState(() => {
        const saved = localStorage.getItem('finance_tracker_dismissed_alerts');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
                const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

                const [analyticsRes, budgetsRes] = await Promise.all([
                    transactionAPI.getAnalytics({ startDate, endDate }).catch(() => ({ data: { data: {} } })),
                    budgetAPI.getAll({ startDate, endDate }).catch(() => ({ data: { data: [] } }))
                ]);

                const data = analyticsRes.data.data;
                const budgets = budgetsRes.data.data || [];
                const generatedAlerts = [];
                let alertId = 1;
                const sym = getCurrencySymbol(user?.currency);

                const inc = data.income || 0;
                const exp = data.expenses || 0;
                const sav = data.savings || 0;

                // 1. Spending > Income Alert
                if (exp > inc && inc > 0) {
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'danger',
                        title: 'Deficit Warning',
                        message: `Your spending this month (${sym}${exp.toLocaleString()}) has exceeded your income by ${sym}${Math.abs(sav).toLocaleString()}. It's time to pause non-essential purchases.`,
                        time: 'Just now',
                        icon: <FiAlertCircle size={32} className="text-rose-500" />,
                        colorClass: 'rose',
                        actionLink: '/'
                    });
                }

                // 2. Financial Goal Achieved / High Savings
                if (sav > 0 && (sav / inc) >= 0.2) {
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'success',
                        title: 'Financial Goal Milestone!',
                        message: `Awesome job! You've secured ${sym}${sav.toLocaleString()} in surplus this month. You are firmly on track to hit your year-end financial goals.`,
                        time: '2 hours ago',
                        icon: <FiCheckCircle size={32} className="text-emerald-500" />,
                        colorClass: 'emerald',
                        actionLink: '/goals'
                    });
                }

                // 3. Budgets Near Limit
                const overBudgets = budgets.filter(b => {
                    const spent = b.spentAmount ?? b.spent ?? 0;
                    const limit = b.budgetedAmount ?? b.amount ?? 1;
                    return (spent / limit) >= 0.9 && (spent / limit) < 1.0;
                });
                if (overBudgets.length > 0) {
                    const b = overBudgets[0];
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'warning',
                        title: `${b.category} Budget Nearing Limit`,
                        message: `You've used over 90% of your ${b.category} budget. You have ${sym}${((b.budgetedAmount ?? b.amount) - (b.spentAmount ?? b.spent)).toLocaleString()} left for the rest of the month.`,
                        time: '5 hours ago',
                        icon: <FiBarChart2 size={32} className="text-emerald-500" />,
                        colorClass: 'amber',
                        actionLink: '/budgets'
                    });
                }

                const exceededBudgets = budgets.filter(b => {
                    const spent = b.spentAmount ?? b.spent ?? 0;
                    const limit = b.budgetedAmount ?? b.amount ?? 1;
                    return (spent / limit) >= 1.0;
                });
                if (exceededBudgets.length > 0) {
                    const b = exceededBudgets[0];
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'danger',
                        title: `Budget Exceeded`,
                        message: `You've overspent your ${b.category} budget by ${sym}${((b.spentAmount ?? b.spent) - (b.budgetedAmount ?? b.amount)).toLocaleString()}. Try to compensate by saving in other categories.`,
                        time: '1 day ago',
                        icon: <FiDollarSign size={32} className="text-emerald-500" />,
                        colorClass: 'rose',
                        actionLink: '/budgets'
                    });
                }

                // 4. Activity and Default Fallbacks
                if (inc === 0 && exp === 0) {
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'info',
                        title: 'Ready for action',
                        message: "Your financial dashboard is looking a bit quiet. Start logging your income and expenses so we can analyze your habits and generate smart reminders!",
                        time: 'Just now',
                        icon: <FiZap size={32} className="text-amber-500" />,
                        colorClass: 'sky',
                        actionLink: '/transactions'
                    });

                    generatedAlerts.push({
                        id: alertId++,
                        type: 'warning',
                        title: 'Missing Budget Limits',
                        message: "You haven't set up bounds for your spending. Creating budgets is the fastest way to control capital outflow and hit savings targets.",
                        time: '1 hour ago',
                        icon: <FiZap size={32} className="text-indigo-500" />,
                        colorClass: 'amber',
                        actionLink: '/budgets'
                    });
                }

                // Inject a mock goal achievement if the user doesn't have an authentic high savings rate yet, to keep them motivated
                if ((sav / inc) < 0.2 || inc === 0) {
                    generatedAlerts.push({
                        id: alertId++,
                        type: 'success',
                        title: 'Goal Progression',
                        message: `You're tracking well towards establishing a solid financial foundation. Log a new transaction today to keep your streak alive!`,
                        time: '1 day ago',
                        icon: <FiCheckCircle size={32} className="text-emerald-500" />,
                        colorClass: 'emerald',
                        actionLink: '/goals'
                    });
                }

                generatedAlerts.push({
                    id: alertId++,
                    type: 'info',
                    title: 'Food for thought',
                    message: "Did you know that investing the cost of a daily coffee could turn into hundreds of thousands over a decade? Every small choice compounds!",
                    time: '1 day ago',
                    icon: <FiZap size={32} className="text-amber-500" />,
                    colorClass: 'sky',
                    actionLink: '/learn'
                });

                setAlerts(generatedAlerts);
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [user?.currency]);

    const handleDismiss = (title) => {
        setDismissed(prev => {
            const newSet = new Set([...prev, title]);
            localStorage.setItem('finance_tracker_dismissed_alerts', JSON.stringify([...newSet]));
            return newSet;
        });
    };

    // Filter by title instead of id so it persists predictably across reloads
    const activeAlerts = alerts.filter(a => !dismissed.has(a.title));

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-16 px-4 md:px-0">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none -mt-32 -mr-32" />
                <div className="relative z-10 w-full flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            Smart <span className="text-emerald-500">Reminders</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] pl-4">AI-Powered Financial Nudges</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                        <FiBell className="text-slate-800 dark:text-slate-200" size={24} />
                        {activeAlerts.length > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white"
                            >
                                {activeAlerts.length}
                            </motion.span>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="col-span-full py-20 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <Spinner text="Scanning activity..." />
                </div>
            ) : (
                <div className="space-y-6 relative">
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-emerald-500/0 via-slate-200 dark:via-slate-800 to-emerald-500/0 hidden md:block" />

                    <AnimatePresence>
                        {activeAlerts.length > 0 ? activeAlerts.map((alert, i) => {
                            const colors = {
                                rose: 'hover:shadow-rose-500/10 border-rose-100 dark:border-rose-900/30 group-hover:border-rose-200',
                                emerald: 'hover:shadow-emerald-500/10 border-emerald-100 dark:border-emerald-900/30 group-hover:border-emerald-200',
                                sky: 'hover:shadow-sky-500/10 border-sky-100 dark:border-sky-900/30 group-hover:border-sky-200',
                                amber: 'hover:shadow-amber-500/10 border-amber-100 dark:border-amber-900/30 group-hover:border-amber-200',
                            };

                            const btnColors = {
                                rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-600 hover:text-white',
                                emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white',
                                sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 hover:bg-sky-600 hover:text-white',
                                amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-500 hover:text-white',
                            };

                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }}
                                    className={`group p-6 md:ml-12 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start relative z-10 ${colors[alert.colorClass]}`}
                                >
                                    <div className="absolute -left-14 top-6 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 transition-colors hidden md:block" />

                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0 shadow-inner border border-slate-100 dark:border-slate-700/50 group-hover:scale-110 transition-transform duration-500">
                                        {React.cloneElement(alert.icon, { size: 24 })}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                                            <h4 className={`text-lg font-bold text-slate-900 dark:text-white tracking-tight`}>
                                                {alert.title}
                                            </h4>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{alert.time}</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 text-sm">
                                            {alert.message}
                                        </p>
                                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <button
                                                onClick={() => navigate(alert.actionLink)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${btnColors[alert.colorClass]}`}
                                            >
                                                Take Action <FiArrowRight size={14} />
                                            </button>
                                            <button onClick={() => handleDismiss(alert.title)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[10px] font-bold uppercase tracking-widest transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
                                                <FiCheck size={14} /> Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900"
                            >
                                <FiCheckCircle size={48} className="mx-auto mb-4 text-emerald-500/50" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">All Caught Up!</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You have no pending reminders. Keep up the great work.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Persistence Awareness Card */}
            <div className={`p-8 rounded-2xl shadow-sm relative overflow-hidden border transition-colors ${darkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}>
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] opacity-5 bg-cover pointer-events-none mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-xl shadow-sm border flex items-center justify-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <FiZap size={20} className="text-emerald-500" />
                            </div>
                            <h3 className={`text-xl font-extrabold tracking-tight uppercase ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500' : 'text-slate-900'}`}>
                                Small Steps, Big Impact
                            </h3>
                        </div>
                        <p className={`text-sm font-medium leading-relaxed mb-6 max-w-xl italic border-l-2 border-emerald-500 pl-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            "Do not save what is left after spending, but spend what is left after saving."
                        </p>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">— Warren Buffett</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartAlerts;
