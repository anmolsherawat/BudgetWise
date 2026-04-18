import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { currencies, getCurrencySymbol } from '../utils/currency';
import { FiUser, FiLock, FiSettings, FiSave, FiBriefcase, FiActivity, FiMail, FiGlobe } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    occupation: '',
    lifestyle: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password Form State
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'USD',
        occupation: user.occupation || '',
        lifestyle: user.lifestyle || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data.data || response.data;
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setPwdLoading(true);
      const response = await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMessage({ type: 'success', text: response.data.message || 'Password updated successfully' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setPwdMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Personal Profile', icon: FiUser },
    { id: 'preferences', label: 'App Preferences', icon: FiSettings },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass card animate-fade-in">
              <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                <FiUser className="text-emerald-500" /> Personal Information
              </h2>

              {message.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Occupation</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiBriefcase className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lifestyle Profile</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiActivity className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="lifestyle"
                        value={formData.lifestyle}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="e.g. Frugal, Moderate"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <Spinner size="sm" text="" />
                    ) : (
                      <>
                        <FiSave /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass card animate-fade-in">
              <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                <FiSettings className="text-emerald-500" /> App Preferences
              </h2>

              {message.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display Currency</label>
                  <div className="relative max-w-md group">
                    <FiGlobe className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="input-field pl-14 appearance-none"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    This symbol will be used throughout the application.
                  </p>

                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 mb-2">Preview</p>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {getCurrencySymbol(formData.currency)}1,234.56
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        + {getCurrencySymbol(formData.currency)}500.00
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <Spinner size="sm" text="" />
                    ) : (
                      <>
                        <FiSave /> Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass card animate-fade-in">
              <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                <FiLock className="text-emerald-500" /> Security Settings
              </h2>

              {pwdMessage.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${pwdMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                  {pwdMessage.text}
                </div>
              )}

              <form onSubmit={handlePwdSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters long.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={pwdForm.confirmNewPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmNewPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {pwdLoading ? (
                      <Spinner size="sm" text="" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
