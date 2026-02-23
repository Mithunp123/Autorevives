import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context';
import { Button } from '@/components/ui';

export default function Register() {
  const { register: authRegister, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <Helmet>
        <title>Register - AutoRevive</title>
        <meta name="description" content="Create your AutoRevive account. Register as a buyer or finance office." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#202124] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#4285F4]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 -left-10 w-60 h-60 bg-white/[0.03] rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-14">
            <img src="/images/Logo.png" alt="AutoRevive" width={56} height={56} className="h-14 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
            <h1 className="text-3xl font-extrabold text-white font-display tracking-tight">
              Auto<span className="text-[#4285F4]">Revive</span>
            </h1>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-display leading-tight mb-5 tracking-tight">
            Join India's Leading<br />Vehicle Auction Platform
          </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">
            Register as a buyer to bid on verified vehicles, or as a finance office to list your inventory and reach thousands of potential buyers.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-surface mesh-bg">
        <div className="w-full max-w-lg space-y-7">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <img src="/images/Logo.png" alt="" width={40} height={40} className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
            <h1 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
              Auto<span className="text-[#4285F4]">Revive</span>
            </h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Create Account</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Choose your role and fill in the details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <label className={`block relative p-5 cursor-pointer rounded-2xl border-2 transition-all ${
                selectedRole === 'user' 
                  ? 'border-[#4285F4] bg-[#4285F4]/5 shadow-sm ring-1 ring-[#4285F4]/30' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
                <input type="radio" value="user" {...register('role')} className="hidden" />
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                  selectedRole === 'user' ? 'bg-[#4285F4] text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className="fas fa-user text-xl"></i>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedRole === 'user' ? 'text-slate-900' : 'text-slate-600'}`}>Customer</p>
                  <p className="text-xs text-slate-500 mt-0.5">Buy vehicles</p>
                </div>
                {selectedRole === 'user' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#4285F4] rounded-full flex items-center justify-center">
                     <i className="fas fa-check text-white text-[10px]"></i>
                  </div>
                )}
              </label>
              
              <label className={`block relative p-5 cursor-pointer rounded-2xl border-2 transition-all ${
                selectedRole === 'office' 
                  ? 'border-[#4285F4] bg-[#4285F4]/5 shadow-sm ring-1 ring-[#4285F4]/30' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
                <input type="radio" value="office" {...register('role')} className="hidden" />
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                  selectedRole === 'office' ? 'bg-[#4285F4] text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className="fas fa-building text-xl"></i>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedRole === 'office' ? 'text-slate-900' : 'text-slate-600'}`}>Finance Office</p>
                  <p className="text-xs text-slate-500 mt-0.5">List vehicles</p>
                </div>
                {selectedRole === 'office' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#4285F4] rounded-full flex items-center justify-center">
                     <i className="fas fa-check text-white text-[10px]"></i>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                    <i className="fas fa-user text-sm"></i>
                  </div>
                  <input {...register('username', { required: 'Required' })} 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400" 
                    placeholder="Username" />
                </div>
                {errors.username && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.username.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                    <i className="fas fa-envelope text-sm"></i>
                  </div>
                  <input {...register('email', { required: 'Required' })} type="email" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400" 
                    placeholder="you@example.com" />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Mobile Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                  <i className="fas fa-phone text-sm"></i>
                </div>
                <input {...register('mobile_number', { required: 'Required' })} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400" 
                  placeholder="9876543210" />
              </div>
              {errors.mobile_number && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.mobile_number.message}</p>}
            </div>

            {selectedRole === 'office' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up-fade">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Finance Company</label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                        <i className="fas fa-building text-sm"></i>
                      </div>
                    <input {...register('finance_name', { required: selectedRole === 'office' && 'Required' })} 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400" 
                      placeholder="Company name" />
                  </div>
                  {errors.finance_name && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.finance_name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Owner Name</label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                        <i className="fas fa-id-card text-sm"></i>
                      </div>
                    <input {...register('owner_name', { required: selectedRole === 'office' && 'Required' })} 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400" 
                      placeholder="Owner name" />
                  </div>
                  {errors.owner_name && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.owner_name.message}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4285F4] transition-colors">
                  <i className="fas fa-lock text-sm"></i>
                </div>
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]/15 focus:border-[#4285F4] hover:border-slate-300 transition-all placeholder:text-slate-400"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4285F4] transition-colors focus:outline-none">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>{errors.password.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input {...register('terms', { required: 'You must accept terms' })} type="checkbox" className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#4285F4] focus:ring-[#4285F4]/20 cursor-pointer" />
              <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                I agree to the <Link to="/privacy-policy" className="text-[#4285F4] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-[#4285F4] font-bold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 -mt-2 font-medium"><i className="fas fa-circle-exclamation mr-1"></i>Please accept the terms</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-rocket"></i> Create Account</>}
            </button>
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
