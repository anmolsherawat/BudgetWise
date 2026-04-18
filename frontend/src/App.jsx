import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import History from './pages/History';
import Settings from './pages/Settings';
import Learn from './pages/Learn';
import MarketTrends from './pages/MarketTrends';
import AIAdvisor from './pages/AIAdvisor';
import FinancialTools from './pages/FinancialTools';
import FinancialGoals from './pages/FinancialGoals';
import SmartAlerts from './pages/SmartAlerts';
import StatementParser from './pages/StatementParser';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/market" element={<MarketTrends />} />
                      <Route path="/advisor" element={<AIAdvisor />} />
                      <Route path="/goals" element={<FinancialGoals />} />
                      <Route path="/tools" element={<FinancialTools />} />
                      <Route path="/alerts" element={<SmartAlerts />} />
                      <Route path="/parser" element={<StatementParser />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                    <AIChatbot />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
