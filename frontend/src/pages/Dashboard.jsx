import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiCalendar, FiArrowRight, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import CurrencyDisplay from '../components/CurrencyDisplay';
import Spinner from '../components/Spinner';
import { portfolioHistory, cashFlowData, expenseCategories, recentTransactions as dummyTransactions } from '../utils/dummyData';
import { transactionAPI, budgetAPI } from '../services/api';
import { exportToCSV, exportToPDF } from '../utils/exportData';
import { FiDownload } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({ income: 0, expenses: 0, savings: 0 });
  const [budgets, setBudgets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, budgetsRes, transactionsRes] = await Promise.all([
          transactionAPI.getAnalytics({ startDate, endDate }),
          budgetAPI.getAll({ startDate, endDate }),
          transactionAPI.getAll({ limit: 5 })
        ]);

        if (analyticsRes.data.success) {
          const data = analyticsRes.data.data;
          setAnalytics({
            income: data.income || 0,
            expenses: data.expenses || 0,
            savings: data.savings || 0
          });

          const formattedPieData = Object.entries(data.categoryBreakdown || {}).map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
          }));
          setPieData(formattedPieData);

          if (data.dailyStats) {
            const formattedLineData = data.dailyStats.map(stat => {
              const dateObj = new Date(stat.date);
              return {
                month: format(dateObj, 'MMM dd'),
                fullDate: format(dateObj, 'MMM dd, yyyy'),
                portfolioValue: stat.income - stat.expense,
                investments: 0
              }
            });
            let cumulative = 0;
            const cumulativeData = formattedLineData.map(d => {
              cumulative += d.portfolioValue;
              return { ...d, portfolioValue: cumulative };
            });
            setLineChartData(cumulativeData);
          }
        }

        if (budgetsRes.data.success) {
          setBudgets(budgetsRes.data.data || []);
        }

        if (transactionsRes.data.success) {
          setRecentTransactions(transactionsRes.data.data || []);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate]);

  const handleExportPDF = async () => {
    try {
      const [allTransactionsRes, allBudgetsRes] = await Promise.all([
        transactionAPI.getAll({ limit: 1000, startDate, endDate }),
        budgetAPI.getAll({ startDate, endDate })
      ]);
      const fullTxs = allTransactionsRes.data.data || [];
      const fullBudgets = allBudgetsRes.data.data || [];
      exportToPDF(fullTxs, fullBudgets, user);
    } catch (e) {
      console.error("Failed to export PDF", e);
    }
  };

  const handleExportCSV = async () => {
    try {
      const [allTransactionsRes, allBudgetsRes] = await Promise.all([
        transactionAPI.getAll({ limit: 1000, startDate, endDate }),
        budgetAPI.getAll({ startDate, endDate })
      ]);
      const fullTxs = allTransactionsRes.data.data || [];
      const fullBudgets = allBudgetsRes.data.data || [];
      exportToCSV(fullTxs, fullBudgets);
    } catch (e) {
      console.error("Failed to export CSV", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Spinner text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">{format(new Date(), 'MMMM yyyy')} Overview</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm font-medium border border-primary-200"
            >
              <FiDownload size={16} /> PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium border border-gray-200"
            >
              <FiDownload size={16} /> CSV
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
            <FiCalendar className="text-primary-500" size={18} />
            <div className="flex items-center gap-3 text-sm font-medium text-gray-900">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none"
              />
              <span className="text-gray-300">/</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: analytics?.income, color: 'text-green-600', icon: FiTrendingUp },
          { label: 'Expenditure', value: analytics?.expenses, color: 'text-red-600', icon: FiTrendingDown },
          { label: 'Net Savings', value: analytics?.savings, color: analytics?.savings >= 0 ? 'text-green-600' : 'text-red-600', icon: FiDollarSign }
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase">{stat.label}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="flex items-baseline gap-1">
              <CurrencyDisplay
                amount={stat.value || 0}
                className="text-gray-900"
                symbolClassName={stat.color}
                valueClassName="text-2xl font-bold"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Wealth Growth</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => `${getCurrencySymbol(user?.currency)}${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                  labelFormatter={(value, payload) => payload && payload.length > 0 ? payload[0].payload.fullDate : value}
                />
                <Area type="monotone" dataKey="portfolioValue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Budget</h2>
          <div className="space-y-6">
            {budgets.length > 0 ? budgets.slice(0, 3).map((budget, i) => {
              const spent = budget.spentAmount ?? budget.spent ?? 0;
              const limit = budget.budgetedAmount ?? budget.amount ?? 1;
              const percent = Math.min(100, (spent / limit) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">{budget.category}</span>
                      <div className="font-bold text-gray-900">
                        <CurrencyDisplay amount={spent} />
                        <span className="text-gray-400 mx-1">/</span>
                        <CurrencyDisplay amount={limit} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${percent > 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${percent > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="py-12 text-center text-gray-500">
                No budgets yet. Create one to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                  {transaction.type === 'income' ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.category}</p>
                  <p className="text-sm text-gray-500">{transaction.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{' '}
                  <CurrencyDisplay amount={transaction.amount} />
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(transaction.date), 'dd MMM')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
