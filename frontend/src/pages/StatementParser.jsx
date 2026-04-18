import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiUploadCloud, FiShield, FiCheckCircle, FiInfo, FiArrowRight, FiX } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const StatementParser = () => {
    const [file, setFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsed, setParsed] = useState(false);

    const handleUpload = () => {
        if (!file) return;
        setIsParsing(true);
        // Simulation of parsing logic
        setTimeout(() => {
            setIsParsing(false);
            setParsed(true);
        }, 2000);
    };

    return (
        <div className="space-y-16 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Ledger<span className="text-emerald-600">Sync</span></h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-2">Automated Data Extraction • Phase 5 Audit Tool</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-50 dark:bg-[#050505] border border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <FiShield size={16} />
                    <span>Local Data Processing Only</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="card shadow-2xl shadow-slate-200/50  p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />

                    <div className="mb-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                            <FiUploadCloud size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Import Bank Statement</h3>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">PDF Formats Sustained (Simulated Engine)</p>
                    </div>

                    <input
                        type="file"
                        id="statement-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    {!file ? (
                        <label
                            htmlFor="statement-upload"
                            className="btn-primary inline-flex items-center gap-3 px-12 py-5 rounded-2xl cursor-pointer shadow-2xl shadow-emerald-500/20 active:scale-95"
                        >
                            <FiFileText size={20} />
                            <span>Select Document</span>
                        </label>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#050505] flex items-center justify-between border border-slate-100 dark:border-slate-800 max-w-sm mx-auto group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <FiFileText className="text-emerald-600 flex-shrink-0" size={20} />
                                    <span className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{file.name}</span>
                                </div>
                                <button
                                    onClick={() => { setFile(null); setParsed(false); }}
                                    className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            {!parsed ? (
                                <button
                                    onClick={handleUpload}
                                    disabled={isParsing}
                                    className="w-full btn-primary py-5 text-base rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/10"
                                >
                                    {isParsing ? (
                                        <div className="flex items-center">
                                            <Spinner size="sm" text="Parsing Audit Sequences..." />
                                        </div>
                                    ) : (
                                        <>
                                            <span>Execute AI Parsing</span>
                                            <FiArrowRight />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-800/30 flex flex-col items-center gap-4"
                                >
                                    <FiCheckCircle className="text-emerald-600" size={48} />
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tighter">Audit Synchronized</h4>
                                        <p className="text-sm font-bold text-emerald-700/70 uppercase tracking-widest leading-relaxed">12 Transactions extracted and mapped <br /> to your primary ledger.</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Protocol Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="card p-10 bg-slate-50/50 dark:bg-[#050505] border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white">
                            <FiShield size={16} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacy Protocol</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        Data extraction is performed within the client-side sandbox. No sensitive PII or financial identifiers are persistent on server-side architecture.
                    </p>
                </div>
                <div className="card p-10 bg-slate-50/50 dark:bg-[#050505] border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white">
                            <FiInfo size={16} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Workflow Logic</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        Extracted nodes are automatically categorized using historical patterns and synchronized with your primary Dashboard analytics.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatementParser;
