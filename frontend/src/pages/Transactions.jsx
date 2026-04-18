import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiFilter, FiSearch, FiArrowUpRight, FiArrowDownRight, FiClock, FiDollarSign, FiInbox } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import CurrencyDisplay from '../components/CurrencyDisplay';
import Spinner from '../components/Spinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Transactions = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const response = await transactionAPI.getAll(params).catch(() => ({ data: { data: [] } }));
      let data = response.data.data;

      if (filters.search) {
        data = data.filter(
          (t) =>
            t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setTransactions(data);
      const income = data.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = data.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      setSummary({ income, expense });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setSummary({ income: 0, expense: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, formData);
      } else {
        await transactionAPI.create(formData);
      }
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(error.response?.data?.message || 'Error saving transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const INCOME_CATEGORIES = ['Salary', 'Business', 'Farming', 'Investment', 'Freelance', 'Other'];
  const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  const filterCategories = filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])].sort();
  const formCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const COLORS = ['#10b981', '#f43f5e'];
  const summaryData = [
    { name: 'Income', value: summary.income },
    { name: 'Expense', value: summary.expense },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
            Transactions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTransaction(null);
            setShowModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 px-5 flex items-center justify-center gap-2 shadow-sm text-xs tracking-widest uppercase font-bold w-full md:w-auto transition-colors"
        >
          <FiPlus size={16} /> New Entry
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`lg:col-span-1 p-5 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-center border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FiDollarSign size={100} className="text-emerald-100 dark:text-emerald-900/40 opacity-70" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 relative z-10 text-slate-500">Cash Flow</h2>
          <div className="flex flex-col gap-3 mb-2 relative z-10">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Inflow</p>
              <CurrencyDisplay amount={summary.income} className="text-lg font-bold text-emerald-600" valueClassName="font-financial" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Outflow</p>
              <CurrencyDisplay amount={summary.expense} className="text-lg font-bold text-rose-500" valueClassName="font-financial" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="lg:col-span-3 p-5 rounded-2xl flex flex-col justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-slate-400" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Ledger Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {filterCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters({ type: '', category: '', search: '' })}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <FiFilter size={14} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Spinner text="Loading ledger..." />
          </div>
        ) : transactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50 ${transaction.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'
                    }`}>
                    {transaction.type === 'income' ? <FiArrowUpRight className="text-emerald-600" size={18} /> : <FiArrowDownRight className="text-rose-500" size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {transaction.description || transaction.category}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{transaction.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <FiClock size={10} />
                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0 relative z-10">
                  <div className={`text-right ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    <div className="text-base font-bold font-financial flex justify-end items-center gap-1">
                      <span>{transaction.type === 'income' ? '+' : '-'}</span>
                      <CurrencyDisplay amount={transaction.amount} />
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                    >
                      <FiEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtle indicator strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
            <FiInbox className="mb-6 text-slate-300 dark:text-slate-600" size={64} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No Transactions Found</h3>
            <p className="text-xs text-slate-500 mb-6">Your ledger is empty right now. Start logging your activity.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingTransaction(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg shadow-sm flex items-center gap-2 text-xs tracking-widest uppercase font-bold transition-colors"
            >
              <FiPlus size={16} /> New Entry
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {
        showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                    className="input-field"
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {formCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ({getCurrencySymbol(user?.currency)})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field cursor-pointer"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingTransaction ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTransaction(null);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Transactions;
