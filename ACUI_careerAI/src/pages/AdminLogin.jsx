import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LockKeyhole, ArrowRight, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, authError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-8 shadow-2xl shadow-blue-950/10 backdrop-blur">
        <div className="mb-6 flex items-center gap-3 text-blue-700">
          <div className="rounded-xl bg-blue-100 p-2">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-600">Owner access</p>
            <h1 className="text-2xl font-semibold">Admin portal</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              placeholder="owner@careerai.local"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              placeholder="Enter admin password"
            />
          </label>

          {(error || authError) && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5" />
              <span>{error || authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LockKeyhole size={17} />
            {isSubmitting ? 'Signing in...' : 'Login to dashboard'}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
