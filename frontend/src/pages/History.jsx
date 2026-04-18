import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrencySymbol } from '../utils/currency';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiArrowUpRight, FiArrowDownRight, FiFilter, FiClock } from 'react-icons/fi';
import { FiBarChart2, FiInbox } from 'react-icons/fi';

const CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

const History = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear, selectedCategory, selectedType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;

      const response = await transactionAPI.getAll(params);
      const data = response.data?.data || response.data?.transactions || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const symbol = getCurrencySymbol(user?.currency);

  // Timeline: group transactions over time
  const buildTimeline = () => {
    if (transactions.length === 0) return [];

    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dataMap = new Map();

    sorted.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      // Group by day if a specific month is selected, otherwise group by month
      const key = selectedMonth ? format(d, 'dd MMM') : format(d, 'MMM yyyy');

      if (!dataMap.has(key)) {
        dataMap.set(key, { name: key, income: 0, expense: 0 });
      }
      const entry = dataMap.get(key);
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });

    return Array.from(dataMap.values());
  };
  const chartData = buildTimeline();

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-800">
          <FiBarChart2 size={24} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Transaction History</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your complete financial record</p>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
              <FiArrowUpRight className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Income</p>
              <p className="text-lg font-bold text-emerald-600">{symbol}{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/50">
              <FiArrowDownRight className="text-rose-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Expenses</p>
              <p className="text-lg font-bold text-rose-500">{symbol}{totalExpense.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${net >= 0 ? 'bg-sky-50 border-sky-100 dark:border-sky-800/50 dark:bg-sky-900/20' : 'bg-amber-50 border-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20'}`}>
              <FiFilter className={net >= 0 ? 'text-sky-500' : 'text-amber-500'} size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Net Balance</p>
              <p className={`text-lg font-bold ${net >= 0 ? 'text-sky-500' : 'text-amber-500'}`}>{net >= 0 ? '+' : ''}{symbol}{net.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{format(new Date(2000, m - 1), 'MMMM')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <div className={`p-5 rounded-2xl shadow-sm border relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10 flex-wrap gap-3">
            <h2 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'
              }`}>
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Cash Flow Timeline
            </h2>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${darkMode ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}>Over Time</span>
          </div>
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} barGap={2} barCategoryGap="2%">
                <defs>
                  <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 'bold' }} tickFormatter={(v) => `${symbol}${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                <Tooltip cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc', opacity: 0.8 }} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`, borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', color: darkMode ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '13px' }} formatter={(value) => [`${symbol}${value.toLocaleString()}`]} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '8px' }} formatter={(value) => <span style={{ color: darkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{value}</span>} />
                <Bar dataKey="income" fill="url(#chartIncome)" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="url(#chartExpense)" name="Expense" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      {/* Transaction List */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Spinner text="Loading history..." />
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
          <FiInbox className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No Transactions Found</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">No transactions match the selected filters.<br />Try adjusting or clearing the filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((txn) => (
              <div
                key={txn.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50 ${txn.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                    {txn.type === 'income'
                      ? <FiArrowUpRight className="text-emerald-600" size={18} />
                      : <FiArrowDownRight className="text-rose-500" size={18} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{txn.description || txn.category}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{txn.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <FiClock size={10} />
                        {txn.date ? format(new Date(txn.date), 'dd MMM yyyy') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold font-financial ${txn.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {txn.type === 'income' ? '+' : '-'}{symbol}{txn.amount?.toLocaleString()}
                  </p>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 mt-1 inline-block rounded-md ${txn.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'}`}>
                    {txn.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
