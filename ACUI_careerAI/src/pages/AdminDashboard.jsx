import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowUpRight, BookOpenCheck, LogOut, Search, ShieldCheck, Users } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentAdmin, logout } = useAdminAuth();
  const [stats, setStats] = useState({ totalUsers: 0, recentUserLogins: 0, totalCompletedCourses: 0, totalCourseResults: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recentUsers;
    return recentUsers.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query));
  }, [recentUsers, search]);

  useEffect(() => {
    let active = true;

    const refreshDashboard = async () => {
      try {
        const { stats: dashboardStats, recentUsers: dashboardUsers, recentActivity: dashboardActivity } = await apiRequest('/api/admin/dashboard');
        if (!active) return;
        setStats(dashboardStats);
        setRecentUsers(dashboardUsers);
        setActivity(dashboardActivity);
        setError('');
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    refreshDashboard();
    const timer = setInterval(refreshDashboard, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img className="h-8 w-auto max-w-36 object-contain" src="/images/careerai-logo.png" alt="CareerAI" />
            <div>
              <h1 className="text-lg font-semibold">Owner dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-800">
              {currentAdmin?.name || 'Owner'}
            </span>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-slate-500">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Overview</p>
            <h2 className="mt-2 text-3xl font-semibold">Admin overview</h2>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-slate-500">
            <ArrowLeft size={15} />
            Back to app
          </Link>
        </div>

        {error && <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} icon={<Users size={18} />} accent="cyan" />
          <StatCard label="Recent user logins" value={stats.recentUserLogins} icon={<Activity size={18} />} accent="emerald" />
          <StatCard label="Completed courses" value={stats.totalCompletedCourses} icon={<BookOpenCheck size={18} />} accent="violet" />
          <StatCard label="Course results" value={stats.totalCourseResults} icon={<ShieldCheck size={18} />} accent="amber" />
        </div>

        <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="min-w-0 rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-600">Users</p>
                <h3 className="mt-1 text-xl font-semibold">Recent registrations</h3>
              </div>
              <div className="relative w-full max-w-xs">
                <label htmlFor="admin-user-search" className="sr-only">Search recent registrations by name or email</label>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="admin-user-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  aria-label="Search recent registrations by name or email"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Loading users…</p>
            ) : filteredUsers.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">Recent registrations for CareerAI users and their available actions.</caption>
                  <thead className="text-slate-600">
                    <tr>
                      <th scope="col" className="pb-3 pr-4 font-medium">Name</th>
                      <th scope="col" className="pb-3 pr-4 font-medium">Email</th>
                      <th scope="col" className="pb-3 pr-4 font-medium">Courses</th>
                      <th scope="col" className="pb-3 pr-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-slate-200 text-slate-800">
                        <td className="py-3 pr-4 font-medium">{user.name}</td>
                        <td className="py-3 pr-4 text-slate-700">{user.email}</td>
                        <td className="py-3 pr-4 text-slate-700">{user.completed_courses || 0}</td>
                        <td className="py-3 text-right">
                          <Link to={`/admin/users/${user.id}`} aria-label={`View details for ${user.name}`} className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900">
                            View details
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No users match your current filter.</p>
            )}
          </section>

          <aside className="min-w-0 rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-600">Recent activity</p>
            <h3 className="mt-1 text-xl font-semibold">Latest events</h3>
            <div className="mt-4 space-y-3">
              {activity.length ? activity.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#d1e2f3] bg-[#e5f1fd] p-3">
                  <p className="text-sm font-medium text-slate-800">{item.description}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{item.user_name || 'System'}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-600">No activity recorded yet.</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  const colorStyles = {
    cyan: 'text-sky-700',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    amber: 'text-amber-700'
  };

  return (
    <div className="rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-4 shadow-sm shadow-blue-950/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl bg-white/80 p-2 ${colorStyles[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}
