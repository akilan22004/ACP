import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CalendarClock, CheckCircle2, Clock3, LogOut, Mail, UserRound } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { logout } = useAdminAuth();
  const [user, setUser] = useState(null);
  const [courseResults, setCourseResults] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest(`/api/admin/users/${userId}`)
      .then(({ user: userData, completedCourses, recentLogins, recentActivities }) => {
        if (!active) return;
        setUser(userData);
        setCourseResults(completedCourses);
        setLoginHistory(recentLogins);
        setActivity(recentActivities);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white px-4 py-10 text-slate-600">Loading user details…</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white px-4 py-10 text-rose-700">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-600">User profile</p>
            <h1 className="text-lg font-semibold">Owner dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-slate-500">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900">
          <ArrowLeft size={14} /> Back to admin dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700"><UserRound size={22} /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Account</p>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
              </div>
            </div>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700">User ID #{user.id}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoRow label="Name" value={user.name} icon={<UserRound size={15} />} />
            <InfoRow label="Email" value={user.email} icon={<Mail size={15} />} />
            <InfoRow label="Created" value={new Date(user.createdAt).toLocaleString()} icon={<CalendarClock size={15} />} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-5">
            <div className="flex items-center gap-2 text-blue-700">
              <Award size={18} />
              <h3 className="text-xl font-semibold">Completed courses</h3>
            </div>
            <div className="mt-4 space-y-3">
              {courseResults.length ? courseResults.map((course) => (
                <div key={`${course.courseId}-${course.completedAt}`} className="rounded-xl border border-[#d1e2f3] bg-[#e5f1fd] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">{course.courseName}</p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-800">{course.marks}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>{course.status}</span>
                    <span>{new Date(course.completedAt).toLocaleString()}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-600">No completed courses recorded yet.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-5">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock3 size={18} />
              <h3 className="text-xl font-semibold">Recent logins</h3>
            </div>
            <div className="mt-4 space-y-3">
              {loginHistory.length ? loginHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-[#d1e2f3] bg-[#e5f1fd] p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{entry.status}</span>
                    <span className="text-xs text-slate-600">{new Date(entry.loginAt).toLocaleString()}</span>
                  </div>
                  {entry.logoutAt && <p className="mt-2 text-xs text-slate-600">Logged out: {new Date(entry.logoutAt).toLocaleString()}</p>}
                </div>
              )) : <p className="text-sm text-slate-600">No login history available.</p>}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-[#d7e6f5] bg-[#eef6ff] p-5">
          <div className="flex items-center gap-2 text-blue-700">
            <CheckCircle2 size={18} />
            <h3 className="text-xl font-semibold">Activity</h3>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length ? activity.map((entry, index) => (
              <div key={`${entry.activityType}-${index}`} className="rounded-xl border border-[#d1e2f3] bg-[#e5f1fd] p-3">
                <p className="text-sm font-medium text-slate-800">{entry.description}</p>
                <p className="mt-1 text-xs text-slate-600">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-slate-600">No user activity has been recorded.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-[#d1e2f3] bg-[#e5f1fd] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-600">
        {icon}
        {label}
      </div>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}
