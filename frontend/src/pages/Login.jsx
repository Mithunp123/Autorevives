import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context';
import { ROLES } from '@/utils';
import { publicService } from '@/services';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [siteStats, setSiteStats] = useState({ total_users: 0, live_auctions: 0, total_auction_value: 0 });

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    window.scrollTo(0, 0);
    publicService.getHomeData()
      .then(({ data }) => { if (data?.stats) setSiteStats(data.stats); })
      .catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      if (user.role === ROLES.ADMIN) navigate('/dashboard', { replace: true });
      else if (user.role === ROLES.OFFICE) navigate('/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] relative flex flex-col items-center justify-center py-12 sm:py-16">
      <Helmet>
        <title>Login - AutoRevive</title>
        <meta name="description" content="Sign in to your AutoRevive account to bid on vehicles, manage auctions, and more." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4285F4]/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#4285F4]/[0.08] rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-white/[0.03] rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '3s' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-[460px] mx-4 sm:mx-6">
        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/images/Logo.webp"
              alt="AutoRevive"
              width={48}
              height={48}
              className="h-12 w-auto drop-shadow-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              Auto<span className="text-accent">Revive</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">India's Premium Vehicle Auction Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8 sm:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Username</label>
              <div className="relative group">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-[#4285F4] transition-colors"></i>
                <input
                  {...register('username', { required: 'Username is required' })}
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all ${
                    errors.username
                      ? 'border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400'
                      : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300'
                  }`}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="fas fa-circle-exclamation"></i>{errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative group">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-[#4285F4] transition-colors"></i>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all ${
                    errors.password
                      ? 'border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400'
                      : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4285F4] transition-colors focus:outline-none"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <i className="fas fa-circle-exclamation"></i>{errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4285F4] focus:ring-[#4285F4]/20 cursor-pointer" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-bold text-[#4285F4] hover:text-[#3367D6] hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3367D6] hover:bg-[#2851a3] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Signing in...
                </>
              ) : (
                <>Sign In <i className="fas fa-arrow-right"></i></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          {/* Create Account */}
          <Link
            to="/register"
            className="w-full h-12 border-2 border-[#202124] text-[#202124] rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#202124] hover:text-white active:scale-[0.98]"
          >
            <i className="fas fa-user-plus text-xs"></i>Create New Account
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { val: siteStats.total_users?.toLocaleString('en-IN') || '0', label: 'Active Users', icon: 'fa-users' },
            { val: siteStats.live_auctions?.toLocaleString('en-IN') || '0', label: 'Live Auctions', icon: 'fa-gavel' },
            { val: `₹${((siteStats.total_auction_value || 0) / 10000000).toFixed(1)}Cr`, label: 'Total Volume', icon: 'fa-indian-rupee-sign' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <i className={`fas ${s.icon} text-[#4285F4] text-xs`}></i>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 font-display">{s.val}</p>
              <p className="text-slate-400 text-[11px] font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

