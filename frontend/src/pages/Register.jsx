import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context';
import { Button } from '@/components/ui';

export default function Register() {
  const { register: authRegister, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'user' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      navigate('/login', { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg-dark" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 -left-10 w-60 h-60 bg-primary-400/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center shadow-glow-lg">
              <i className="fas fa-bolt text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display tracking-tight">
              Auto<span className="text-gradient">Revive</span>
            </h1>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-display leading-tight mb-5 tracking-tight">
            Join India's Leading<br />Vehicle Auction Platform
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm font-medium">
            Register as a buyer to bid on verified vehicles, or as a finance office to list your inventory and reach thousands of potential buyers.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-surface mesh-bg">
        <div className="w-full max-w-lg space-y-7">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center shadow-glow">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
              Auto<span className="text-gradient">Revive</span>
            </h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Choose your role and fill in the details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <label className={`card-hover p-5 cursor-pointer text-center transition-all ${selectedRole === 'user' ? 'border-accent ring-2 ring-accent/20 shadow-glow' : ''}`}>
                <input type="radio" value="user" {...register('role')} className="hidden" />
                <div className={`w-12 h-12 mx-auto mb-2.5 rounded-xl flex items-center justify-center ${selectedRole === 'user' ? 'bg-gradient-to-br from-accent to-primary-400 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                  <i className="fas fa-user text-lg"></i>
                </div>
                <p className="text-sm font-bold text-slate-800">Customer</p>
                <p className="text-xs text-slate-400 mt-0.5">Buy vehicles</p>
              </label>
              <label className={`card-hover p-5 cursor-pointer text-center transition-all ${selectedRole === 'office' ? 'border-accent ring-2 ring-accent/20 shadow-glow' : ''}`}>
                <input type="radio" value="office" {...register('role')} className="hidden" />
                <div className={`w-12 h-12 mx-auto mb-2.5 rounded-xl flex items-center justify-center ${selectedRole === 'office' ? 'bg-gradient-to-br from-accent to-primary-400 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                  <i className="fas fa-building text-lg"></i>
                </div>
                <p className="text-sm font-bold text-slate-800">Finance Office</p>
                <p className="text-xs text-slate-400 mt-0.5">List vehicles</p>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-slate-400 text-xs"></i>
                  </div>
                  <input {...register('username', { required: 'Required' })} className="input-field pl-14" placeholder="Username" />
                </div>
                {errors.username && <p className="text-xs text-danger mt-1.5 font-medium">{errors.username.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-envelope text-slate-400 text-xs"></i>
                  </div>
                  <input {...register('email', { required: 'Required' })} type="email" className="input-field pl-14" placeholder="you@example.com" />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1.5 font-medium">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-phone text-slate-400 text-xs"></i>
                </div>
                <input {...register('mobile_number', { required: 'Required' })} className="input-field pl-14" placeholder="9876543210" />
              </div>
              {errors.mobile_number && <p className="text-xs text-danger mt-1.5 font-medium">{errors.mobile_number.message}</p>}
            </div>

            {selectedRole === 'office' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="label">Finance Company Name</label>
                  <input {...register('finance_name', { required: selectedRole === 'office' && 'Required' })} className="input-field" placeholder="Company name" />
                  {errors.finance_name && <p className="text-xs text-danger mt-1.5 font-medium">{errors.finance_name.message}</p>}
                </div>
                <div>
                  <label className="label">Owner Name</label>
                  <input {...register('owner_name', { required: selectedRole === 'office' && 'Required' })} className="input-field" placeholder="Owner full name" />
                  {errors.owner_name && <p className="text-xs text-danger mt-1.5 font-medium">{errors.owner_name.message}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lock text-slate-400 text-xs"></i>
                </div>
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-14 pr-12"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register('terms', { required: 'You must accept terms' })} type="checkbox" className="w-4 h-4 mt-0.5 rounded border-slate-300 text-accent focus:ring-accent/20" />
              <span className="text-sm text-slate-500 font-medium">
                I agree to the <Link to="/privacy-policy" className="text-accent font-semibold hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-accent font-semibold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-danger -mt-2 font-medium">{errors.terms.message}</p>}

            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
              <i className="fas fa-rocket mr-2"></i>Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-bold hover:text-accent-hover transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
