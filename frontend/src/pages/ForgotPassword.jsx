import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '@/services/api';

/**
 * Forgot Password — 3-step OTP flow:
 *  Step 1: Enter email  → POST /api/auth/password/forgot
 *  Step 2: Enter OTP    → POST /api/auth/password/verify-otp
 *  Step 3: New password → POST /api/auth/password/reset
 */
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);           // 1 | 2 | 3
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    /* ── STEP 1: Request OTP ── */
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/password/forgot', { email });
            setStep(2);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── OTP input handling ── */
    const handleOtpChange = (idx, val) => {
        const next = [...otp];
        next[idx] = val.replace(/\D/, '').slice(-1);
        setOtp(next);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            otpRefs.current[5]?.focus();
        }
        e.preventDefault();
    };

    /* ── STEP 2: Verify OTP ── */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/password/verify-otp', { email, otp: otpStr });
            setResetToken(data.reset_token);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── STEP 3: Reset Password ── */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/password/reset', { token: resetToken, new_password: newPassword });
            navigate('/login', { state: { message: 'Password reset successfully. Please login.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Resend OTP ── */
    const handleResend = async () => {
        if (countdown > 0) return;
        setError('');
        setOtp(['', '', '', '', '', '']);
        setLoading(true);
        try {
            await api.post('/auth/password/forgot', { email });
            setCountdown(60);
        } catch {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

    return (
        <>
            <Helmet>
                <title>Forgot Password - AutoRevive</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <section className="py-16 md:py-24 bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center">
                <div className="max-w-md w-full mx-auto px-6">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <img src="/images/Logo.webp" alt="AutoRevive" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
                            <span className="text-xl font-bold text-gray-900">Auto<span className="text-gold-500">Revive</span></span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-500 text-sm">
                            {step === 1 && 'Enter your registered email to receive a one-time password.'}
                            {step === 2 && `We sent a 6-digit OTP to ${email}`}
                            {step === 3 && 'Enter your new password to complete the reset.'}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {stepLabels.map((label, i) => {
                            const active = i + 1 === step;
                            const done = i + 1 < step;
                            return (
                                <div key={i} className="flex items-center flex-1 last:flex-none">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                                    >
                                        {done ? <i className="fas fa-check text-[10px]"></i> : i + 1}
                                    </div>
                                    <span className={`ml-1.5 text-xs font-medium hidden sm:block ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                                    {i < 2 && <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        {error && (
                            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                <i className="fas fa-circle-exclamation text-red-500 mt-0.5 flex-shrink-0"></i>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <form onSubmit={handleRequestOtp} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors"
                                    />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
                                    {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Sending OTP…</> : 'Send OTP'}
                                </button>
                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-gray-400 hover:text-gold-600 transition-colors">
                                        <i className="fas fa-arrow-left mr-1 text-xs"></i> Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-Digit OTP</label>
                                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => (otpRefs.current[i] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gold-500 transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-3">Check your inbox (and spam folder).</p>
                                </div>

                                <button type="submit" disabled={loading || otp.join('').length < 6}
                                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
                                    {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying…</> : 'Verify OTP'}
                                </button>

                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-gray-400">Resend OTP in <span className="font-semibold text-gray-700">{countdown}s</span></p>
                                    ) : (
                                        <button type="button" onClick={handleResend} className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                <div className="text-center">
                                    <button type="button" onClick={() => { setStep(1); setError(''); setOtp(['', '', '', '', '', '']); }}
                                        className="text-xs text-gray-400 hover:text-gray-600">
                                        <i className="fas fa-arrow-left mr-1"></i> Change email
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── STEP 3 ── */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input type={showNew ? 'text' : 'password'} required value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)} minLength={6} placeholder="Min 6 characters"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                                        <button type="button" onClick={() => setShowNew((s) => !s)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                                        <button type="button" onClick={() => setShowConfirm((s) => !s)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
                                    {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Resetting…</> : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
