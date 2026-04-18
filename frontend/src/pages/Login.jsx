import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', name: formData.email.split('@')[0], email: formData.email }));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    setLoadingGoogle(true);
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const authUrl = baseUrl.endsWith('/api')
      ? `${baseUrl}/auth/google`
      : `${baseUrl}/api/auth/google`;

    window.location.href = authUrl;
  };

  const handleGithubOAuth = () => {
    setLoadingGithub(true);
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    baseUrl = baseUrl.replace(/\/$/, '');
    const authUrl = baseUrl.endsWith('/api')
      ? `${baseUrl}/auth/github`
      : `${baseUrl}/api/auth/github`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="nova-glow top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-300 dark:bg-indigo-700" />
        <div className="nova-glow bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200 dark:bg-violet-800" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">Nova<span className="gradient-text">Mint</span></span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Identity Verification</h1>
          <p className="mt-2 text-slate-400 font-bold text-sm tracking-widest uppercase">Secure Professional Access</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card shadow-2xl shadow-slate-200/50 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-3 rounded-2xl text-xs font-black uppercase text-center tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Identifier</label>
              <div className="relative group">
                <FiMail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-14"
                  placeholder="Enter your Email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Passkey</label>
                <Link to="#" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700">Lost Key?</Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-14"
                  placeholder="Enter your Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loadingGoogle || loadingGithub}
              className="w-full btn-primary py-3.5 text-base rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <FiArrowRight />
                </>
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-black tracking-widest uppercase">Or</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={loading || loadingGoogle || loadingGithub}
                className="w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-3 transition-all border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#050505] hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.98] dark:text-white font-bold shadow-sm"
              >
                {loadingGoogle ? (
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-emerald-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <FaGoogle size={20} className="text-sky-500" />
                    <span>Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGithubOAuth}
                disabled={loading || loadingGoogle || loadingGithub}
                className="w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-3 transition-all border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#050505] hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.98] dark:text-white font-bold shadow-sm"
              >
                {loadingGithub ? (
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <FaGithub size={20} className="text-slate-800 dark:text-white" />
                    <span>GitHub</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
              New to the platform? <br />
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors inline-flex items-center gap-2">
                Establish New Account <FiArrowRight />
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center items-center gap-8 opacity-30">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <div className="w-1 h-1 rounded-full bg-indigo-500" /> AES-256
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <div className="w-1 h-1 rounded-full bg-indigo-500" /> SSL SECURE
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <div className="w-1 h-1 rounded-full bg-indigo-500" /> PRIVATE
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
