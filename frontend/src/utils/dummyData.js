// src/utils/dummyData.js
import { subDays, format, startOfMonth, subMonths } from 'date-fns';

// Helper to generate dates
const today = new Date();

export const dummyUser = {
    id: 'usr_12345',
    name: 'Alex Sterling',
    email: 'alex.sterling@example.com',
    currency: 'USD',
    joinDate: subMonths(today, 6).toISOString(),
    profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
};

// --- Dashboard Data ---

// 1. Net Worth / Portfolio Performance (Last 6 Months)
export const portfolioHistory = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(today, 5 - i);
    // Base value + random growth
    const baseValue = 45000;
    const growth = i * 2500 + (Math.random() * 1000 - 500);
    return {
        month: format(date, 'MMM'),
        fullDate: format(date, 'MMM yyyy'),
        portfolioValue: Math.round(baseValue + growth),
        liquidCash: Math.round((baseValue + growth) * 0.25),
        investments: Math.round((baseValue + growth) * 0.75),
    };
});

// 2. Monthly Cash Flow (Income vs Expenses)
export const cashFlowData = [
    { name: 'Income', value: 8500, fill: '#059669' }, // Emerald 600
    { name: 'Expenses', value: 5200, fill: '#f43f5e' }, // Rose 500
    { name: 'Savings', value: 3300, fill: '#0ea5e9' }, // Sky 500
];

// 3. Expense Breakdown (Pie Chart)
export const expenseCategories = [
    { name: 'Housing & Utilities', value: 2400, color: '#0f766e' }, // Teal 700
    { name: 'Food & Dining', value: 950, color: '#10b981' }, // Emerald 500
    { name: 'Transportation', value: 650, color: '#3b82f6' }, // Blue 500
    { name: 'Lifestyle & Ent.', value: 800, color: '#8b5cf6' }, // Violet 500
    { name: 'Healthcare', value: 400, color: '#f43f5e' }, // Rose 500
];

// 4. Recent Transactions (Audit Log)
export const recentTransactions = [
    {
        id: 'tx_1',
        date: format(subDays(today, 1), 'MMM dd, yyyy'),
        time: '14:30',
        description: 'Vanguard S&P 500 ETF (VOO)',
        category: 'Investment',
        type: 'expense', // It's an outflow from checking an inflow to investment
        amount: 1500.00,
        status: 'Completed',
        merchantLogo: 'V'
    },
    {
        id: 'tx_2',
        date: format(subDays(today, 2), 'MMM dd, yyyy'),
        time: '09:15',
        description: 'TechPulse Inc. - Salary Deposit',
        category: 'Income',
        type: 'income',
        amount: 8500.00,
        status: 'Completed',
        merchantLogo: 'T'
    },
    {
        id: 'tx_3',
        date: format(subDays(today, 3), 'MMM dd, yyyy'),
        time: '19:42',
        description: 'Whole Foods Market',
        category: 'Groceries',
        type: 'expense',
        amount: 142.50,
        status: 'Completed',
        merchantLogo: 'W'
    },
    {
        id: 'tx_4',
        date: format(subDays(today, 5), 'MMM dd, yyyy'),
        time: '10:05',
        description: 'Equinox Fitness Club',
        category: 'Health',
        type: 'expense',
        amount: 250.00,
        status: 'Completed',
        merchantLogo: 'E'
    },
    {
        id: 'tx_5',
        date: format(subDays(today, 7), 'MMM dd, yyyy'),
        time: '20:11',
        description: 'Uber Rideshare',
        category: 'Transport',
        type: 'expense',
        amount: 34.20,
        status: 'Pending',
        merchantLogo: 'U'
    }
];

// --- Market Trends Data ---

export const marketIndices = [
    { label: "S&P 500", value: "5,241.53", change: "+1.24%", up: true, data: [5100, 5150, 5120, 5180, 5200, 5241] },
    { label: "NASDAQ", value: "16,396.83", change: "+1.51%", up: true, data: [16000, 16100, 16050, 16200, 16300, 16396] },
    { label: "Bitcoin (BTC)", value: "$67,420.00", change: "-2.10%", up: false, data: [69000, 68500, 69200, 68000, 67800, 67420] },
];

export const marketNews = [
    {
        title: "Federal Reserve Signals Potential Rate Cuts Later This Year",
        summary: "Market rallies as Chairman Powell indicates inflation is moving toward the 2% target, opening the door for policy easing in Q3.",
        impact: "Positive",
        date: "2 hours ago",
        source: "Bloomberg",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Tech Earnings Continue to Beat Wall Street Expectations",
        summary: "Major technology firms report strong Q1 results driven by AI adoption and aggressive cost-cutting measures implementation.",
        impact: "Positive",
        date: "5 hours ago",
        source: "Reuters",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Oil Prices Stabilize Amid Geopolitical Tensions",
        summary: "Energy markets hold steady as OPEC+ delegates maintain current production quotas despite supply chain disruptions in the Red Sea.",
        impact: "Neutral",
        date: "Yesterday",
        source: "Financial Times",
        image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80"
    }
];
