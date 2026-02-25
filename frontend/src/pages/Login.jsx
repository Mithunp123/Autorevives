import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context';
import { ROLES } from '@/utils';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <>
      <Helmet>
        <title>Login - AutoRevive</title>
        <meta name="description" content="Sign in to your AutoRevive account to bid on vehicles." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="py-16 md:py-24 bg-gray-50 min-h-[calc(100vh-200px)]">
        <div className="max-w-md mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img src="/images/Logo.webp" alt="AutoRevive" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="text-xl font-bold text-gray-900">Auto<span className="text-gold-500">Revive</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to continue to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username or Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username or Email</label>
                <input
                  {...register('username', { required: 'Username or email is required' })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-colors ${
                    errors.username
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-gold-500'
                  }`}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm outline-none transition-colors ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-gold-500'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="block w-full py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create New Account
            </Link>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By signing in, you agree to our{' '}
            <Link to="/privacy-policy" className="text-gold-600 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </section>
    </>
  );
}

