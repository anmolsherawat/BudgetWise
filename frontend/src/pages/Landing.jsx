import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

import {
  FiArrowRight,
  FiCheck,
  FiMenu,
  FiX,
  FiGithub,
  FiSun,
  FiMoon,
  FiBarChart2,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiSmartphone,
  FiBarChart,
  FiCheckCircle,
  FiLayers,
  FiActivity,
  FiTarget,
  FiCpu,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────
   Logo mark — reused across nav & footer
───────────────────────────────────────────── */
const Logo = ({ size = 'md' }) => (
  <Link to="/" className="inline-flex items-center gap-2.5 group">
    <div className={`
      ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl
      bg-gradient-to-br from-indigo-500 to-violet-600
      flex items-center justify-center
      shadow-lg shadow-indigo-500/30
      group-hover:scale-105 transition-transform duration-300 shrink-0
    `}>
      <FiActivity className="text-white" size={size === 'sm' ? 16 : 20} strokeWidth={2.5} />
    </div>
    <span className={`font-black tracking-tighter text-slate-900 dark:text-white uppercase ${size === 'sm' ? 'text-lg' : 'text-xl'}`}>
      Nova<span className="gradient-text">Mint</span>
    </span>
  </Link>
);

/* ─────────────────────────────────────────────
   Feature card
───────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, delay, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true, margin: '-80px' }}
    whileHover={{ y: -6 }}
    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-nova-card
               border border-slate-100 dark:border-nova-border
               shadow-sm hover:shadow-nova-lg transition-all duration-500 p-8"
  >
    {/* Top gradient accent bar */}
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Glow orb */}
    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />

    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon size={22} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:gradient-text transition-all">
      {title}
    </h3>
    <p className="text-slate-500 dark:text-nova-muted font-medium leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

/* ─────────────────────────────────────────────
   Stat pill
───────────────────────────────────────────── */
const StatPill = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-black gradient-text tracking-tighter">{value}</div>
    <div className="text-xs font-bold text-slate-400 dark:text-nova-muted uppercase tracking-widest mt-1">{label}</div>
  </div>
);

/* ════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════ */
const Landing = () => {
  const featuresRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const features = [
    {
      icon: FiBarChart2,
      title: 'Smart Analytics',
      description: 'Real-time cash-flow charts and spending pattern breakdowns in one beautiful dashboard.',
    },
    {
      icon: FiTarget,
      title: 'Goal Tracking',
      description: 'Define financial milestones, set target dates, and watch your progress build automatically.',
    },
    {
      icon: FiCpu,
      title: 'AI Advisor',
      description: 'Gemini-powered insights that analyse your real transactions and surface personalised actions.',
    },
    {
      icon: FiShield,
      title: 'Bank-Level Security',
      description: 'AES-256 encryption, JWT tokens, and zero data sharing — your numbers stay yours.',
    },
    {
      icon: FiLayers,
      title: 'Smart Budgets',
      description: 'Set category limits, receive live alerts when approaching thresholds, and stay on track.',
    },
    {
      icon: FiBarChart,
      title: 'PDF / CSV Reports',
      description: 'Export professional statements of every transaction and budget status in seconds.',
    },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Register in under 60 seconds — email or Google OAuth.' },
    { num: '02', title: 'Log Transactions', desc: 'Add income & expenses with category tags and notes.' },
    { num: '03', title: 'Watch AI Work', desc: 'Get personalised insights, alerts, and growth plans.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-nova-dark font-sans overflow-x-hidden w-full">

      {/* ── Premium Aurora Background ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50 dark:bg-[#030014]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80vh] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-900/40 dark:via-purple-900/20 blur-[100px]" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] -right-[10%] w-[40%] h-[50%] rounded-full bg-violet-400/20 dark:bg-violet-600/20 blur-[120px] mix-blend-screen" 
        />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-purple-300/10 dark:bg-purple-900/20 blur-[120px]" />
        
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM4MTg1ODkiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* ══════════════════ NAVIGATION ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-nova-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-nova-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-nova-card text-slate-400 dark:text-nova-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-nova-border" />
            <Link
              to="/login"
              className="text-sm font-bold text-slate-500 dark:text-nova-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
            >
              Sign In
            </Link>
            <Link to="/register" className="btn-primary rounded-xl px-6 py-2.5 text-sm">
              Get Started <FiArrowRight className="inline ml-1" size={14} />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-nova-muted">
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button className="text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 dark:border-nova-border bg-white dark:bg-nova-card px-6 py-6 space-y-4"
            >
              <Link to="/login" className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary block text-center rounded-xl">Get Started</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-8">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-indigo-50 dark:bg-indigo-950/40
                       border border-indigo-100 dark:border-indigo-900/60
                       text-indigo-700 dark:text-indigo-300
                       text-xs font-black uppercase tracking-widest"
          >
            <FiCheckCircle size={14} className="text-indigo-500" />
            Built by TEAM07 · AI-Powered Finance Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1] text-slate-900 dark:text-white font-display relative"
          >
            Your Money.<br />
            <div className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl rounded-full" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-500">
                Amplified.
              </span>
            </div>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Stop guessing, start growing. Track every transaction, crush your goals,
            and let AI do the heavy lifting — all inside one premium dashboard.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10"
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base rounded-2xl w-full sm:w-auto font-black text-white bg-slate-900 dark:bg-white dark:text-slate-900 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
              <span className="relative z-10 flex items-center">Start for Free <FiArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-base rounded-2xl w-full sm:w-auto text-center font-bold text-slate-700 dark:text-white bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Live Demo
            </Link>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-10 pt-8 border-t border-slate-100 dark:border-nova-border w-fit mx-auto"
          >
            <StatPill value="10K+" label="Users" />
            <div className="w-px h-10 bg-slate-200 dark:bg-nova-border" />
            <StatPill value="₹2Cr+" label="Tracked" />
            <div className="w-px h-10 bg-slate-200 dark:bg-nova-border" />
            <StatPill value="99.9%" label="Uptime" />
          </motion.div>
        </div>

        {/* Premium Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative mx-auto max-w-5xl perspective-1000"
        >
          {/* Mockup Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl -z-10 rounded-[2.5rem] transform translate-y-8 scale-95" />
          
          <div className="relative rounded-[2.5rem] p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-500/20"
               style={{ transform: "rotateX(2deg) rotateY(0deg)" }}>
            
            {/* Top Mac-like window bar */}
            <div className="absolute top-0 inset-x-0 h-10 bg-white/50 dark:bg-black/20 rounded-t-[2rem] border-b border-white/20 dark:border-white/5 flex items-center px-6 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="ml-auto w-32 h-4 rounded-full bg-slate-200/50 dark:bg-white/10" />
            </div>

            <div className="bg-slate-50/90 dark:bg-[#08080c]/90 rounded-[1.8rem] p-6 pt-12 min-h-[300px] grid grid-cols-1 md:grid-cols-4 gap-4 backdrop-blur-sm border border-white/50 dark:border-white/5">
              
              {/* Sidebar placeholder */}
              <div className="hidden md:flex flex-col gap-3 pr-2 border-r border-slate-200/50 dark:border-white/10">
                <div className="flex items-center gap-2 mb-4 p-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex-shrink-0" />
                  <div className="w-20 h-3 rounded bg-slate-200 dark:bg-white/20" />
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-8 rounded-lg w-full ${i === 1 ? 'bg-indigo-500/10' : 'bg-slate-200/30 dark:bg-white/5'} flex items-center px-3`}>
                    <div className="w-4 h-4 rounded-sm bg-slate-300 dark:bg-white/20" />
                  </div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                {/* Header title */}
                <div className="col-span-3 mb-2 flex justify-between items-end">
                  <div>
                    <div className="w-16 h-2 rounded bg-slate-200 dark:bg-white/20 mb-2" />
                    <div className="w-32 h-6 rounded bg-slate-300 dark:bg-white/40" />
                  </div>
                  <div className="w-24 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">+ New Entry</div>
                </div>

                {/* Mini stat cards */}
                {[
                  { label: 'Total Portfolio', value: '₹14,24,580', change: '+12.4%', up: true },
                  { label: 'Monthly Growth', value: '₹45,000',  change: '+8.2%',  up: true },
                  { label: 'Total Expenses', value: '₹18,340', change: '-3.1%', up: false },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5, ease: "easeInOut" }}
                    className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{s.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-financial tracking-tight">{s.value}</p>
                    <span className={`text-[10px] font-bold mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${s.up ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {s.up ? '↑' : '↓'} {s.change}
                    </span>
                  </motion.div>
                ))}

                {/* Sparkline & AI widget placeholder */}
                <div className="col-span-2 bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/3 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-between">
                    <span>Performance Analytics</span>
                    <span className="text-indigo-500">Live</span>
                  </p>
                  <div className="flex items-end gap-3 h-24 mt-2">
                    {[30, 45, 35, 60, 50, 75, 65, 90, 80, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: `${h}%`, opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.8, type: "spring" }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/80 to-purple-500/80 hover:from-indigo-400 hover:to-purple-400 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {/* Narrow AI widget */}
                <div className="col-span-1 bg-gradient-to-br from-indigo-500 sm:from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-inner text-white relative overflow-hidden flex flex-col justify-between">
                  {/* Glass reflection */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                      <FiZap size={14} className="text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-100 mb-1">AI Insights</p>
                    <p className="text-xs font-medium leading-tight">Optimized budget available based on recent spend.</p>
                  </div>
                  <div className="mt-4 w-full py-1.5 rounded-lg bg-white/20 text-[10px] font-bold text-center backdrop-blur-md cursor-pointer hover:bg-white/30 transition-colors">
                    Review Now
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section ref={featuresRef} className="py-20 md:py-28 bg-slate-50/50 dark:bg-nova-deeper/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="badge-indigo mx-auto mb-4"
            >
              Everything You Need
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="section-title mb-4"
            >
              Built for <span className="gradient-text">Serious</span> Money Moves
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-slate-500 dark:text-nova-muted font-medium text-lg max-w-xl mx-auto"
            >
              Powerful tools wrapped in a clean, minimal interface that stays out of your way.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            Zero Learning Curve
          </motion.h2>
          <p className="text-slate-500 dark:text-nova-muted font-medium text-lg">Three steps to financial clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-0 h-px bg-gradient-to-r from-indigo-200 dark:from-indigo-900 to-transparent" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                <span className="text-white font-black text-lg">{s.num}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{s.title}</h3>
              <p className="text-slate-500 dark:text-nova-muted font-medium text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center text-white bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-2xl shadow-indigo-500/30">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter font-display">
              Design Your<br />Financial Future.
            </h2>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto font-medium">
              Join NovaMint and let AI-powered insights help you build real, lasting wealth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-8 py-3.5 rounded-2xl font-black text-base hover:scale-105 hover:shadow-xl transition-all active:scale-95"
              >
                Join TEAM07's Platform
              </Link>
              <Link
                to="/login"
                className="border border-white/30 text-white px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 pt-4 opacity-70">
              {['Fast Registration', 'Zero Platform Fees', 'Private & Secure'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm font-bold">
                  <FiCheck size={14} className="text-gold-300" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="py-12 md:py-16 max-w-6xl mx-auto px-6 border-t border-slate-100 dark:border-nova-border mt-8">
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <Logo />
          <p className="text-sm text-slate-500 dark:text-nova-muted font-medium leading-relaxed max-w-md">
            AI-powered wealth management for the modern era. Built with ❤️ by TEAM07.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-nova-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-black tracking-widest text-slate-400 dark:text-nova-muted uppercase text-center">
            © {new Date().getFullYear()} NOVAMINT · TEAM07. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-300 dark:text-nova-muted">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
            <span>·</span>
            <span>AES-256</span>
            <span>·</span>
            <span>SSL Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
