import { useState, useEffect, useRef } from 'react';
import { budgetAPI } from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiArchive, FiList, FiInbox } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import CurrencyDisplay from '../components/CurrencyDisplay';
import Spinner from '../components/Spinner';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const modalRef = useRef(null);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getAll({ month: selectedMonth, year: selectedYear }).catch(() => ({ data: { data: [] } }));
      setBudgets(response.data.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget.id, formData);
      } else {
        await budgetAPI.create(formData);
      }
      setShowModal(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert(error.response?.data?.message || 'Error saving budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.delete(id);
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this budget to history?')) {
      try {
        await budgetAPI.archive(id);
        fetchBudgets();
      } catch (error) {
        console.error('Error archiving budget:', error);
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const categories = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  const getUtilizationPercentage = (budget) => {
    return (budget.spent / budget.amount) * 100;
  };

  const getStatusColor = (percentage) => {
    if (percentage > 100) return 'from-rose-500 to-rose-400';
    if (percentage >= 90) return 'from-amber-500 to-amber-400';
    return 'from-emerald-500 to-emerald-400';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
            Budgets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Create and manage your monthly budgets</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingBudget(null);
            setShowModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 px-5 flex items-center justify-center gap-2 shadow-sm text-xs tracking-widest uppercase font-bold w-full md:w-auto transition-colors"
        >
          <FiPlus size={16} /> New Budget
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm w-full">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Target Cycle</label>
          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none px-3 py-1.5 cursor-pointer border-r border-slate-200 dark:border-slate-700 transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {format(new Date(2000, month - 1), 'MMMM')}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none px-3 py-1.5 cursor-pointer transition-colors"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Spinner text="Loading budgets..." />
          </div>
        ) : budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const utilization = getUtilizationPercentage(budget);
              const remaining = budget.amount - budget.spent;
              return (
                <div
                  key={budget.id}
                  className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Background Blur Ring */}
                  {utilization > 90 && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none -mr-20 -mt-20" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-700/50">
                        <FiList size={22} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{budget.category}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {format(new Date(budget.year, budget.month - 1), 'MMMM yyyy')} Tracking
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-left md:text-right hidden sm:block">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Velocity</p>
                        <p className={`text-base font-bold tracking-tight ${utilization > 100 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{utilization.toFixed(1)}%</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-200 shadow-sm"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(budget.id)}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-slate-400 hover:text-sky-600 rounded-lg transition-colors border border-transparent hover:border-sky-200 shadow-sm"
                        >
                          <FiArchive size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200 shadow-sm"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expenditure</span>
                        <div className="font-financial text-base text-slate-900 dark:text-white flex items-center gap-1 font-bold">
                          <CurrencyDisplay amount={budget.spent} />
                          <span className="text-slate-400 text-sm font-sans font-medium">/</span>
                          <CurrencyDisplay amount={budget.amount} className="text-slate-400 text-sm font-sans font-medium" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-financial text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 ${remaining >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'}`}>
                          <CurrencyDisplay amount={Math.abs(remaining)} />
                          <span>{remaining >= 0 ? 'Surplus' : 'Deficit'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Minimal Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                      <div
                        className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${getStatusColor(utilization)} relative`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      >
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-900/50">
            <FiInbox className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No Budget Found</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">No budget models identified for this cycle. <br /> Establish a monitoring threshold.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingBudget(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 px-5 flex items-center justify-center gap-2 shadow-sm text-xs tracking-widest uppercase font-bold transition-colors"
            >
              <FiPlus size={16} /> Deploy Budget Strategy
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount ({getCurrencySymbol(user?.currency)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {format(new Date(2000, month - 1), 'MMMM')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingBudget ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBudget(null);
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
      )}
    </div>
  );
};

export default Budgets;
