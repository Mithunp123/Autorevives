import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context';

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
    <>
      <Helmet>
        <title>Register - AutoRevive</title>
        <meta name="description" content="Create your AutoRevive account to bid on vehicles." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-lg mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img src="/images/Logo.webp" alt="AutoRevive" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="text-xl font-bold text-gray-900">Auto<span className="text-orange-500">Revive</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">Join AutoRevive to start bidding on vehicles</p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-4">
                <label className={`block relative p-4 cursor-pointer rounded-lg border-2 transition-all text-center ${
                  selectedRole === 'user'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" value="user" {...register('role')} className="hidden" />
                  <i className={`fas fa-user text-xl mb-2 ${selectedRole === 'user' ? 'text-orange-500' : 'text-gray-400'}`}></i>
                  <p className={`text-sm font-medium ${selectedRole === 'user' ? 'text-gray-900' : 'text-gray-600'}`}>Customer</p>
                  <p className="text-xs text-gray-500">Buy vehicles</p>
                </label>

                <label className={`block relative p-4 cursor-pointer rounded-lg border-2 transition-all text-center ${
                  selectedRole === 'office'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" value="office" {...register('role')} className="hidden" />
                  <i className={`fas fa-building text-xl mb-2 ${selectedRole === 'office' ? 'text-orange-500' : 'text-gray-400'}`}></i>
                  <p className={`text-sm font-medium ${selectedRole === 'office' ? 'text-gray-900' : 'text-gray-600'}`}>Finance Office</p>
                  <p className="text-xs text-gray-500">List vehicles</p>
                </label>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input
                  {...register('username', { required: 'Username is required' })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                    errors.username ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <input
                  {...register('mobile_number', { required: 'Mobile number is required' })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                    errors.mobile_number ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                  }`}
                  placeholder="9876543210"
                />
                {errors.mobile_number && <p className="text-xs text-red-500 mt-1">{errors.mobile_number.message}</p>}
              </div>

              {/* Office fields */}
              {selectedRole === 'office' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Finance Company Name</label>
                    <input
                      {...register('finance_name', { required: selectedRole === 'office' && 'Required' })}
                      className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                        errors.finance_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                      placeholder="Your company name"
                    />
                    {errors.finance_name && <p className="text-xs text-red-500 mt-1">{errors.finance_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name</label>
                    <input
                      {...register('owner_name', { required: selectedRole === 'office' && 'Required' })}
                      className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                        errors.owner_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                      placeholder="Full name"
                    />
                    {errors.owner_name && <p className="text-xs text-red-500 mt-1">{errors.owner_name.message}</p>}
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm outline-none transition-colors ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                    }`}
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    {...register('terms', { required: true })} 
                    type="checkbox" 
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the <Link to="/privacy-policy" className="text-orange-600 hover:underline">Terms of Service</Link>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 mt-1">Please accept the terms</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </section>
    </>
  );
}
