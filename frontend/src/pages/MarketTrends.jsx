import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiArrowRight } from 'react-icons/fi';
import { FiGlobe, FiTrendingUp, FiTrendingDown, FiFileText, FiActivity, FiZap, FiCheckCircle, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { aiAPI } from '../services/api';
import Spinner from '../components/Spinner';

const FINNHUB_KEY = 'd6g3bhhr01qqnmbqjv20d6g3bhhr01qqnmbqjv2g';

const MarketTrends = () => {
    const [news, setNews] = useState([]);
    const [highlights, setHighlights] = useState([
        { label: "S&P 500 (SPY)", symbol: 'SPY', value: "Loading...", change: "", up: true, data: Array(60).fill({ time: '', value: 0 }) },
        { label: "NASDAQ (QQQ)", symbol: 'QQQ', value: "Loading...", change: "", up: true, data: Array(60).fill({ time: '', value: 0 }) },
        { label: "Bitcoin (BTC)", symbol: 'BINANCE:BTCUSDT', value: "Loading...", change: "", up: true, data: Array(60).fill({ time: '', value: 0 }) },
    ]);
    const [loading, setLoading] = useState(true);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const handleTerminalBasics = async () => {
        setAiLoading(true);
        setShowAiModal(true);
        try {
            const response = await aiAPI.chat("Explain the very basics of using a financial terminal, what stock market indices are, and how to start investing for a beginner. Keep it very concise, like 3 short paragraphs.");
            if (response.data.success) {
                setAiResponse(response.data.data.message);
            } else {
                setAiResponse("I'm having trouble connecting to the advisory right now.");
            }
        } catch (error) {
            setAiResponse("Error connecting to Advisor. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // Fetch News
                const newsRes = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`);
                // Only take the top 5 articles
                setNews(newsRes.data.slice(0, 5));

                // Fetch live quotes for our 3 main trackers
                const updatedHighlights = await Promise.all(highlights.map(async (highlight) => {
                    const quoteRes = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${highlight.symbol}&token=${FINNHUB_KEY}`);
                    const data = quoteRes.data;

                    // Format values
                    const isCrypto = highlight.symbol.includes('BTC');
                    const value = isCrypto ?
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.c) :
                        `$${data.c.toFixed(2)}`;

                    const percentChange = data.dp ? `${data.dp > 0 ? '+' : ''}${data.dp.toFixed(2)}%` : '0.00%';
                    const isUp = data.dp >= 0;

                    // Generate a simulated sparkline based on the open and close just for visual effect
                    // Make it 60 data points for a smoother area chart, creating a random walk
                    // between the daily low, high, open and close.
                    let currentVal = data.o;
                    const simulatedDataValues = Array.from({ length: 60 }, (_, i) => {
                        if (i === 0) return data.o;
                        if (i === 59) return data.c;

                        // Add some random walk variation, bounded by the daily high/low
                        const maxVariation = (data.h - data.l) * 0.1;
                        let walk = (Math.random() - 0.5) * maxVariation;

                        // Give it momentum towards the final close price in the second half of the day
                        if (i > 30) {
                            const diffToClose = data.c - currentVal;
                            walk += (diffToClose * 0.1);
                        }

                        currentVal += walk;
                        currentVal = Math.max(data.l, Math.min(data.h, currentVal)); // Bound to H/L

                        return currentVal;
                    });

                    // Smooth the data slightly to make it look nicer
                    for (let i = 1; i < 59; i++) {
                        simulatedDataValues[i] = (simulatedDataValues[i - 1] + simulatedDataValues[i] + simulatedDataValues[i + 1]) / 3;
                    }

                    // Map it to objects with time labels (Simulating 5 years = 60 months)
                    const simulatedData = simulatedDataValues.map((val, idx) => {
                        const today = new Date();
                        const date = new Date(today.getFullYear() - 5, today.getMonth() + idx);
                        const timeLabel = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

                        return { time: timeLabel, value: val };
                    });

                    return {
                        ...highlight,
                        value,
                        change: percentChange,
                        up: isUp,
                        data: simulatedData
                    };
                }));

                setHighlights(updatedHighlights);

            } catch (error) {
                console.error("Error fetching Finnhub data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();

        // Refresh quotes every 30 seconds
        const interval = setInterval(fetchMarketData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-16 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Market<span className="text-emerald-600">Intelligence</span></h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-2">Global Economic Flow • Simulated Terminal Data</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest shadow-sm">
                    <FiGlobe size={18} className="text-emerald-500 animate-spin-slow" />
                    <span>Real-time Terminal Active</span>
                </div>
            </div>

            {/* Market Highlights Ticker Layout with Interactive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {highlights.map((h, i) => {
                    const isCrypto = h.symbol.includes('BTC');
                    return (
                        <div key={i} className="card p-0 group border shadow-xl shadow-slate-200/50  border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all relative overflow-hidden flex flex-col justify-between h-96 bg-white dark:bg-black">
                            {/* Card Header showing current status */}
                            <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#050505]">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{h.label}</p>
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border ${h.up ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/50' : 'bg-rose-50 text-rose-700 border-rose-200 dark:border-rose-800 dark:bg-rose-950/50'}`}>
                                        {h.up ? <FiTrendingUp size={14} className="text-emerald-500" /> : <FiTrendingDown size={14} className="text-rose-500" />}
                                        {h.change}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{h.value}</p>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> X: Time (Last 5 Years)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Y: Price (USD)</span>
                                </div>
                            </div>

                            {/* Main Chart Area */}
                            <div className="flex-1 w-full bg-white dark:bg-[#050505] relative px-4 pt-4 pb-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={h.data}
                                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={h.up ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={h.up ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                                            tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                            width={60}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid #E2E8F0',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                fontWeight: 'bold',
                                                padding: '12px 16px'
                                            }}
                                            itemStyle={{ color: '#0F172A', fontSize: '14px', fontWeight: 900 }}
                                            labelStyle={{ color: '#64748B', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                            formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                                            labelFormatter={(label) => `Time: ${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={h.up ? "#10b981" : "#f43f5e"}
                                            strokeWidth={3}
                                            fill={`url(#color-${i})`}
                                            animationDuration={1500}
                                            animationEasing="ease-in-out"
                                            isAnimationActive={true}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* News Feed */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                            <FiFileText size={22} className="text-sky-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Verified Intelligence Flow</h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <Spinner text="Loading trends..." />
                        </div>
                    ) : news.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="card p-0 group overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-all bg-white dark:bg-black shadow-xl shadow-slate-200/40   flex flex-col md:flex-row"
                        >
                            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative border-r border-slate-100 dark:border-slate-800">
                                {item.image ? (
                                    <img src={item.image} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                                        <FiFileText size={48} className="opacity-50 text-slate-400" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg border backdrop-blur-md dark:backdrop-blur-none bg-emerald-500/90 text-white border-emerald-400">
                                        Live Feed
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                        <FiActivity size={16} className="text-emerald-500" /> {item.source}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter group-hover:text-emerald-600 transition-colors cursor-pointer leading-tight">
                                    {item.headline || item.title}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                                    {item.summary}
                                </p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest group-hover:text-emerald-600 transition-colors cursor-pointer w-fit">
                                    <span className="transform group-hover:translate-x-1 transition-transform">Read Full Analysis</span> <FiArrowRight />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sidebar Context */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card p-10 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <FiZap size={44} className="text-amber-500" />
                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">Strategic <br /> Awareness</h3>
                            <p className="text-slate-400 text-sm font-bold leading-relaxed">
                                Market intelligence allows for the synchronization of personal assets with global economic shifts. Professional awareness prevents capital erosion by inflation.
                            </p>
                            <div className="pt-4 space-y-4">
                                <div className="flex items-center gap-3 text-xs font-black uppercase text-emerald-400">
                                    <FiCheckCircle size={18} className="text-emerald-500" /> Asset Allocation
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black uppercase text-emerald-400">
                                    <FiCheckCircle size={18} className="text-emerald-500" /> Risk Assessment
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black uppercase text-emerald-400">
                                    <FiCheckCircle size={18} className="text-emerald-500" /> Inflation Guard
                                </div>
                            </div>
                            <button onClick={handleTerminalBasics} className="w-full btn-primary py-4 text-xs tracking-[0.2em] shadow-none ring-1 ring-white/10 mt-8 disabled:opacity-50" disabled={aiLoading}>
                                {aiLoading ? 'ANALYZING...' : 'TERMINAL BASICS'}
                            </button>
                        </div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
                    </div>

                    <div className="card p-8 border-slate-100 dark:border-slate-800 bg-sky-50/20">
                        <div className="flex items-center gap-4 mb-4">
                            <FiInfo size={40} className="text-sky-500" />
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Investing Flow</h5>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">Want to grow your wealth?</h4>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                            The best way to participate in global economic growth is by investing consistently over time. Consider these simple steps to start:
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white border shadow-sm">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">1. Broad Index Funds</p>
                                <p className="text-xs text-slate-500">Assets like S&P 500 ETFs (VOO, SPY) offer diversified exposure to the top 500 US companies instantly.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white border shadow-sm">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">2. Technology Trackers</p>
                                <p className="text-xs text-slate-500">Nasdaq ETF (QQQ) focuses on major tech & innovation drivers.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white border shadow-sm">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">3. Automated Investing</p>
                                <p className="text-xs text-slate-500">Use a platform like Vanguard or Charles Schwab to automatically invest a set amount every single month.</p>
                            </div>
                        </div>

                        <button onClick={() => window.open('https://investor.vanguard.com/', '_blank')} className="w-full btn-primary py-4 text-xs tracking-[0.2em] shadow-xl shadow-sky-500/20 mt-8 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500">
                            START INVESTING <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="glass card w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent flex items-center gap-2">
                                <FiZap size={28} className="text-emerald-500" /> Terminal Basics
                            </h2>
                            <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold uppercase tracking-widest">
                                Close
                            </button>
                        </div>
                        {aiLoading ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <Spinner size="md" text="Loading definitions..." />
                            </div>
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed space-y-4">
                                {aiResponse.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => {
                                    const boldParsed = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i} className="text-slate-800 dark:text-slate-200">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    });
                                    return <p key={idx}>{boldParsed}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketTrends;
