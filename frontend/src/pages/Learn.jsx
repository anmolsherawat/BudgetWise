import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { learnAPI } from '../services/api';
import { motion } from 'framer-motion';
import { FiBookOpen, FiCheckCircle, FiPlay, FiStar, FiChevronRight, FiClock, FiLayers, FiArrowRight, FiActivity, FiTrendingUp } from 'react-icons/fi';
import CourseCard from '../components/CourseCard';

const Learn = () => {
    const { user } = useAuth();
    
    // Global tracking states
    const [completedLessons, setCompletedLessons] = useState([]);
    const [stats, setStats] = useState({});
    const [totalUsers, setTotalUsers] = useState(1);
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Category');
    
    const [activeLesson, setActiveLesson] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await learnAPI.getStats();
                if (res.data?.success) {
                    setCompletedLessons(res.data.myCompleted || []);
                    setStats(res.data.stats || {});
                    setTotalUsers(res.data.totalUsers || 1);
                }
            } catch (err) {
                console.error("Failed to fetch learn stats", err);
            }
        };
        fetchStats();
    }, []);

    const roadmap = [
        {
            title: "Level 1: Capital Fundamentals",
            description: "Establishing the core principles of wealth management.",
            icon: FiLayers,
            lessons: [
                {
                    id: 'l1',
                    title: "The Philosophy of Money",
                    description: "Learn the psychology behind modern financial systems and wealth creation.",
                    image: "/philosophy%20of%20money.jpg",
                    provider: "Core Mastery",
                    status: "In Class",
                    deadline: "Mar 2nd 2026, 11:56 am",
                    multiplier: "2x",
                    points: "0/40",
                    content: [
                        "Money, at its core, is a measure of trust and utility within a society. Understanding wealth creation requires a shift from viewing money as a finite resource to recognizing it as a scalable exchange of value.",
                        "Historically, human capital was traded directly. Today, financial systems allow us to abstract that value. The biggest psychological trap is equating hourly labor directly to lifelong wealth. True wealth generation occurs when capital operates independently of your time.",
                        "In this chapter, we outline the shift from a 'consumer mindset' (where income is immediately converted to depreciating liabilities) to an 'investor mindset' (where income buys assets that produce further income)."
                    ]
                },
                {
                    id: 'l2',
                    title: "Strategic Saving Protocols",
                    description: "Advanced techniques for optimizing your savings rate without compromising lifestyle.",
                    image: "/strategic%20saving%20protocols.jpg",
                    provider: "Budgeting 101",
                    status: "Available",
                    deadline: "Mar 5th 2026, 10:00 am",
                    multiplier: "1.5x",
                    points: "0/30",
                    content: [
                        "Parkinson’s Law states that expenses rise to meet income. The fundamental cure to this economic certainty is 'Pay Yourself First'.",
                        "Strategic saving isn't about skipping lattes; it's about structural automation. By immediately diverting 20% of all incoming revenue to inaccessible accumulation accounts, you force your lifestyle to adapt to the remaining 80%.",
                        "We will cover high-yield environments, liquidity ladders, and why your checking account should never hold more than two months of living expenses."
                    ]
                },
                {
                    id: 'l3',
                    title: "Emergency Capital Reserves",
                    description: "Building a bulletproof emergency fund for complete financial security.",
                    image: "/emergency%20capital%20reserve.jpg",
                    provider: "Risk Mgmt",
                    status: "Available",
                    deadline: "Mar 10th 2026, 06:00 pm",
                    multiplier: "3x",
                    points: "0/60",
                    content: [
                        "An emergency fund is not an investment; it is insurance. It protects your actual investments from being liquidated during a crisis at unfavorable market prices.",
                        "The golden rule is 3 to 6 months of baseline living expenses. If you are a freelancer or have highly variable income, this should scale to 9-12 months.",
                        "Your reserves should be held in highly liquid, virtually risk-free vehicles like Tier-1 savings accounts or short-term treasury bills. Accessibility is paramount over yield."
                    ]
                },
            ]
        },
        {
            title: "Level 2: Resource Optimization",
            description: "Advanced techniques for managing cash flow and growth.",
            icon: FiActivity,
            lessons: [
                {
                    id: 'l4',
                    title: "The 50/30/20 Framework",
                    description: "Master the gold standard of modern budgeting architectures.",
                    image: "/budgeting%20framework.jpg",
                    provider: "Budgeting 201",
                    status: "In Class",
                    deadline: "Mar 15th 2026, 11:00 am",
                    multiplier: "2x",
                    points: "0/45",
                    content: [
                        "Senator Elizabeth Warren popularized the 50/30/20 rule, a framework that simplifies budget allocation into absolute needs, flexible wants, and future planning.",
                        "50% Needs: Housing, groceries, utilities, and mandatory minimum debt payments. If this exceeds 50%, structural lifestyle changes might be required.",
                        "30% Wants: The psychological necessity of budgeting. Deprivation leads to financial bingeing. Allocate guilt-free spending here.",
                        "20% Savings/Investing: The engine of your net worth growth. Debt aggressively above 5%, otherwise direct this entirely into market investments."
                    ]
                },
                {
                    id: 'l5',
                    title: "Macroeconomic Inflation",
                    description: "Understanding how global economic shifts impact your purchasing power.",
                    image: "/microeconomic%20inflation.jpg",
                    provider: "Economics",
                    status: "Available",
                    deadline: "Mar 20th 2026, 09:30 am",
                    multiplier: "2.5x",
                    points: "0/50",
                    content: [
                        "Inflation is the silent tax on stored capital. A 3% annual inflation rate means cash loses half its purchasing power every 24 years.",
                        "Governments intentionally target mild inflation to incentivize spending and investment over hoarding. Your financial architecture must structurally outpace this invisible decay.",
                        "Assets that historically hedge against inflation include equities, real estate, and occasionally direct commodities. Cash is a guaranteed loss in long-term horizons."
                    ]
                },
                {
                    id: 'l6',
                    title: "Capital Structure: Debt vs Equity",
                    description: "Strategic management of liabilities and equity for wealth expansion.",
                    image: "/capital%20structure%20debt%20vs%20equity.jpg",
                    provider: "Corporate Finance",
                    status: "Available",
                    deadline: "Mar 25th 2026, 02:00 pm",
                    multiplier: "3x",
                    points: "0/80",
                    content: [
                        "Not all debt is toxic. The wealthy utilize 'good debt' to leverage asset acquisition while passing the cost of capital onto renters or tax deductions.",
                        "Credit cards and high-interest loans are wealth destroyers, compounding against you. Mortgages and low-interest business loans are wealth accelerators, allowing you to control large assets with minimal upfront equity.",
                        "We discuss the concept of Arbitrage—borrowing at 4% to invest safely at 8%—and the inherent risks of overleveraging your balance sheet."
                    ]
                },
            ]
        },
        {
            title: "Level 3: Strategic Wealth Building",
            description: "High-performance investing and long-term security.",
            icon: FiTrendingUp,
            lessons: [
                {
                    id: 'l7',
                    title: "Systematic Investment Plans",
                    description: "Automating your wealth growth through disciplined market participation.",
                    image: "/systematic%20investment%20plan.jpg",
                    provider: "Investing 301",
                    status: "Available",
                    deadline: "Apr 1st 2026, 11:59 pm",
                    multiplier: "4x",
                    points: "0/100",
                    content: [
                        "Timing the market is statistically impossible for retail investors over a 30-year horizon. Time IN the market is the ultimate variable.",
                        "Dollar-Cost Averaging (DCA) completely removes emotional psychology from investing. By automatically investing $500 on the 1st of every month, you buy fewer shares when the market is expensive, and more shares when the market crashes.",
                        "Automate your future wealth. Set up systems that withdraw capital from your checking account the day after you get paid, before you ever see it."
                    ]
                },
                {
                    id: 'l8',
                    title: "The Geometric Growth Engine",
                    description: "Unlocking the power of compounded returns for exponential gains.",
                    image: "/geometric%20growth%20engine.jpg",
                    provider: "Wealth Strategy",
                    status: "In Class",
                    deadline: "Apr 5th 2026, 12:00 pm",
                    multiplier: "2x",
                    points: "0/50",
                    content: [
                        "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
                        "If you invest $10,000 at a 10% annual return, year one generates $1,000. But year two generates $1,100, year three $1,210. While linear growth is addition, compounding is geometric multiplication.",
                        "The most critical variable in the compound formula is 'n' (time). Starting at age 25 versus age 35 can mathematically double your retirement portfolio with the exact same principal invested."
                    ]
                },
                {
                    id: 'l9',
                    title: "Public Market Integration",
                    description: "Navigating stocks, bonds, and ETFs to build a diversified portfolio.",
                    image: "/public%20market%20integration.jpg",
                    provider: "Stock Market",
                    status: "Available",
                    deadline: "Apr 10th 2026, 04:30 pm",
                    multiplier: "5x",
                    points: "0/150",
                    content: [
                        "The stock market is a mechanism for transferring wealth from the impatient to the patient. Broad-market index funds (like the S&P 500) historically return 8-10% annually over decades.",
                        "Stock picking and day trading often result in underperformance due to fees, taxes, and psychological panic. Diversification across massive baskets of companies reduces localized risk.",
                        "In this final stage, we review the mechanics of an ETF, how expense ratios erode returns, and the tax advantages of specialized retirement accounts like Roth IRAs and 401(k)s."
                    ]
                },
            ]
        },
        {
            title: "Level 4: Advanced Portfolio Architectures",
            description: "Constructing resilient, multi-asset portfolios for generational wealth.",
            icon: FiLayers,
            lessons: [
                {
                    id: 'l10',
                    title: "Asset Allocation Strategies",
                    description: "Balancing risk and reward across diverse asset classes.",
                    image: "/asset%20allocation.jpg",
                    provider: "Wealth Building",
                    status: "Available",
                    deadline: "May 1st 2026, 10:00 am",
                    multiplier: "3x",
                    points: "0/60",
                    content: [
                        "Asset allocation is the most critical decision in portfolio construction. It accounts for over 90% of a portfolio's return variability.",
                        "A classic 60/40 portfolio (60% equities, 40% bonds) provides a robust foundation, but modern portfolios often integrate real estate, commodities, and alternative investments to reduce correlation.",
                        "Rebalancing is the mechanical process of selling winners and buying losers to maintain your target allocation. It systematically forces you to buy low and sell high without emotional interference."
                    ]
                },
                {
                    id: 'l11',
                    title: "Real Estate & Tangible Assets",
                    description: "Leveraging property and physical assets for generation wealth.",
                    image: "/real%20state%20and%20tangible%20.jpg",
                    provider: "Real Estate",
                    status: "Available",
                    deadline: "May 5th 2026, 12:00 pm",
                    multiplier: "4x",
                    points: "0/80",
                    content: [
                        "Real estate offers unique advantages: steady cash flow, tax depreciation, and leverage. By utilizing a mortgage, you can control a large asset with a small down payment.",
                        "Unlike stocks, private real estate is highly illiquid. It requires significant capital and management overhead unless you use REITs (Real Estate Investment Trusts) to gain exposure passively.",
                        "Tangible assets hedge effectively against inflation because their underlying value is intrinsic. When fiat currency devalues, the nominal price of real estate naturally rises."
                    ]
                },
                {
                    id: 'l12',
                    title: "Tax-Advantaged Engineering",
                    description: "Advanced legal frameworks to minimize tax liabilities legally.",
                    image: "/Tax-Advantaged%20Engineering.jpg",
                    provider: "Tax Strategy",
                    status: "Available",
                    deadline: "May 10th 2026, 04:30 pm",
                    multiplier: "5x",
                    points: "0/150",
                    content: [
                        "Taxes are arguably your single largest lifelong expense. Minimizing them ethically accelerates compound growth immensely.",
                        "Accounts like Roth IRAs and HSAs (Health Savings Accounts) offer massive tax shields. HSAs uniquely provide triple tax advantages: contributions are tax-deductible, growth is tax-free, and healthcare withdrawals are tax-free.",
                        "Long-term capital gains taxes are substantially lower than ordinary income taxes. Structuring your wealth to generate capital gains rather than W-2 income is the cornerstone of ultimate financial freedom."
                    ]
                }
            ]
        },
        {
            title: "Level 5: Behavioral Economics",
            description: "Mastering the psychology of money to prevent disastrous mistakes.",
            icon: FiActivity,
            lessons: [
                {
                    id: 'l13',
                    title: "The Sunk Cost Fallacy",
                    description: "Overcoming cognitive biases that destroy portfolio returns.",
                    image: "/The%20Sunk%20Cost%20Fallacy.jpg",
                    provider: "Behavioral Finance",
                    status: "Available",
                    deadline: "Jun 1st 2026, 10:00 am",
                    multiplier: "3x",
                    points: "0/60",
                    content: [
                        "The sunk cost fallacy is the human tendency to continue an endeavor because of previously invested resources, even when it no longer makes rational sense to do so.",
                        "In investing, this manifests as holding onto a plummeting stock just to 'get back to even'. The market does not know or care what price you paid for an asset.",
                        "Every day you hold an asset is a choice to buy it at today's price. If you wouldn't buy it today, you should sell it immediately and deploy exactly that capital elsewhere."
                    ]
                },
                {
                    id: 'l14',
                    title: "Herd Mentality & FOMO",
                    description: "Maintaining extreme emotional discipline during market bubbles.",
                    image: "/Herd%20Mentality%20&%20FOMO.jpg",
                    provider: "Market Psychology",
                    status: "Available",
                    deadline: "Jun 5th 2026, 12:00 pm",
                    multiplier: "4x",
                    points: "0/80",
                    content: [
                        "Fear Of Missing Out (FOMO) drives speculative bubbles. When everyone around you is getting rich on a speculative asset, it triggers intense psychological panic to join in.",
                        "Herd mentality provides comfort in numbers, but superior returns require doing something different than the masses. Warren Buffett stated: 'Be fearful when others are greedy, and greedy when others are fearful.'",
                        "The absolute best defense against FOMO is a tightly constructed, automated Investment Policy Statement (IPS) that cleanly separates emotional noise from mathematical facts."
                    ]
                }
            ]
        }
    ];

    const totalLessons = roadmap.length > 0 ? roadmap.reduce((acc, level) => acc + (level.lessons?.length || 0), 0) : 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

    const toggleLessonCompletion = async (lessonId) => {
        // Optimistic UI Update
        const isCurrentlyCompleted = completedLessons.includes(lessonId);
        setCompletedLessons(prev => isCurrentlyCompleted ? prev.filter(id => id !== lessonId) : [...prev, lessonId]);
        setStats(prev => {
            const currentCount = prev[lessonId] || 0;
            return {
                ...prev,
                [lessonId]: isCurrentlyCompleted ? Math.max(0, currentCount - 1) : currentCount + 1
            };
        });

        try {
            await learnAPI.toggleLesson(lessonId);
        } catch (error) {
            console.error("Failed to toggle completion on backend", error);
        }
    };

    // Flatten all lessons into a single array to match the dribbble single-grid layout
    const allLessons = roadmap.flatMap(level => level.lessons);

    // Compute unique categories dynamically
    const uniqueCategories = ['All Category', ...new Set(allLessons.map(lesson => lesson.provider))];

    // Filter derived data
    const displayedLessons = allLessons
        .filter(lesson => {
            const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'All Category' || lesson.provider === categoryFilter;
            return matchesSearch && matchesCategory;
        });

    return (
        <div className="space-y-8 pb-24 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto bg-[#f8fafd] dark:bg-[#070707] min-h-screen pt-8">
            {!activeLesson ? (
                <>
                    {/* Header Area */}
                    <div className="flex flex-col gap-6 mb-8">
                <h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight">Courses</h1>
                
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in your courses..."
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex w-full md:w-auto items-center">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full md:w-48 appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 shadow-sm pr-10 focus:outline-none cursor-pointer capitalize"
                        >
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="pt-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {displayedLessons.length > 0 ? displayedLessons.map((lesson) => (
                            <div key={lesson.id} className="h-full">
                                <CourseCard
                                    title={lesson.title}
                                    description={lesson.description}
                                    image={lesson.image}
                                    provider={lesson.provider}
                                    status={lesson.status}
                                    deadline={lesson.deadline}
                                    multiplier={lesson.multiplier}
                                    points={`${stats[lesson.id] || 0}/${totalUsers}`}
                                    isCompleted={completedLessons.includes(lesson.id)}
                                    onToggleCompletion={() => toggleLessonCompletion(lesson.id)}
                                    onAction={() => setActiveLesson(lesson)}
                                />
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <p className="text-slate-500 font-bold uppercase tracking-widest">No courses found matching your criteria</p>
                            </div>
                        )}
                    </motion.div>
                </div>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <button
                        onClick={() => setActiveLesson(null)}
                        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                        <span className="rotate-180"><FiArrowRight /></span> Back to Curriculum
                    </button>

                    <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden shadow-slate-200/40">
                        <div className="h-64 md:h-[400px] w-full relative">
                            <img src={activeLesson.image} alt={activeLesson.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                                <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-md mb-6 inline-block border border-white/10">{activeLesson.provider}</span>
                                <h2 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">{activeLesson.title}</h2>
                                <p className="text-slate-200 font-medium md:text-xl max-w-3xl leading-relaxed">{activeLesson.description}</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-12">
                            <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                                {activeLesson.content?.map((paragraph, index) => (
                                    <p key={index} className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <FiCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Done Reading?</p>
                                        <p className="text-sm font-bold text-slate-500">Mark this chapter to track your progress.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleLessonCompletion(activeLesson.id)}
                                    className={`px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-95 ${completedLessons.includes(activeLesson.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl hover:bg-emerald-600 dark:hover:bg-emerald-500'}`}
                                >
                                    {completedLessons.includes(activeLesson.id) ? 'Completed - Unmark' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Learn;
