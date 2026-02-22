import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context';
import { Button } from '@/components/ui';
import { ROLES } from '@/utils';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      if (user.role === ROLES.ADMIN) navigate('/dashboard', { replace: true });
      else if (user.role === ROLES.OFFICE) navigate('/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg-dark" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary-600/15 to-accent/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col justify-center px-16 space-y-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center shadow-glow-lg">
              <i className="fas fa-bolt text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white font-display tracking-tight">
                Auto<span className="text-gradient">Revive</span>
              </h1>
              <p className="text-white/30 text-sm font-medium">Premium Auction Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <FeatureItem icon="fa-shield-halved" title="Secure Platform" description="Enterprise-grade security for all transactions and data" />
            <FeatureItem icon="fa-gauge-high" title="1,000+ Vehicles" description="Access to a wide range of verified vehicles across India" />
            <FeatureItem icon="fa-indian-rupee-sign" title="Best Prices" description="Transparent bidding ensures the best value for buyers" />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/[0.06]">
            {[
              { val: '1,456', lbl: 'Active Users' },
              { val: '248', lbl: 'Vehicles Listed' },
              { val: '\u20B94.5Cr', lbl: 'Total Volume' },
            ].map((s) => (
              <div key={s.lbl}>
                <p className="text-2xl font-extrabold text-white font-display tracking-tight">{s.val}</p>
                <p className="text-white/30 text-xs font-medium mt-1">{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-surface mesh-bg">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center shadow-glow">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
              Auto<span className="text-gradient">Revive</span>
            </h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user text-slate-400 text-xs"></i>
                </div>
                <input
                  {...register('username', { required: 'Username is required' })}
                  className="input-field pl-14"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-xs text-danger mt-1.5 font-medium">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lock text-slate-400 text-xs"></i>
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-14 pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/20" />
                <span className="text-sm text-slate-500 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm text-accent hover:text-accent-hover font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
              <i className="fas fa-arrow-right-to-bracket mr-2"></i>Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-bold hover:text-accent-hover transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon} text-accent-light`}></i>
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-white/40 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}
