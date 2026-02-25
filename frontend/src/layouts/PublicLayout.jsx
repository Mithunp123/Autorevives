import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { publicService } from '@/services';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/about', label: 'About', icon: 'fa-info-circle' },
  { to: '/faq', label: 'FAQ', icon: 'fa-circle-question' },
  { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [footerForm, setFooterForm] = useState({ fullName: '', email: '', mobile: '', state: '', city: '', subject: '' });
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* scroll-aware navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dropdownOpen]);

  const handleFooterContact = async (e) => {
    e.preventDefault();
    if (!footerForm.fullName || !footerForm.email) {
      toast.error('Name and email are required');
      return;
    }
    setFooterSubmitting(true);
    try {
      await publicService.submitContact(footerForm);
      toast.success('Thank you! We will get back to you soon.');
      setFooterForm({ fullName: '', email: '', mobile: '', state: '', city: '', subject: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setFooterSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200/60'}`}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center justify-between h-[72px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <img src="/images/Logo.webp" alt="AutoRevive" className="h-12 sm:h-14 w-auto object-contain" width="56" height="56" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#0B1628] tracking-tight">
              Auto<span className="text-gold-500">Revive</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-0.5 list-none m-0 p-0">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 ${isActive
                      ? 'text-gold-600 bg-gold-50'
                      : 'text-gray-600 hover:text-gold-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0B1628] flex items-center justify-center text-white text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.username || 'User'}</span>
                  <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                    <button onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gold-50 hover:text-gold-600 transition-colors">
                      <i className="fas fa-gauge-high w-4 text-center text-gray-400"></i> Dashboard
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gold-50 hover:text-gold-600 transition-colors">
                      <i className="fas fa-circle-user w-4 text-center text-gray-400"></i> Profile
                    </button>
                    <hr className="my-1.5 border-gray-100" />
                    <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      <i className="fas fa-arrow-right-from-bracket w-4 text-center"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gold-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-gold-500/20 hover:shadow-gold-500/30 hover:-translate-y-0.5">
                  Get Started <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2.5 text-gray-700 hover:text-gold-600 rounded-xl hover:bg-gray-50 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <ul className="list-none m-0 p-3 space-y-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-gold-600 bg-gold-50' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <i className={`fas ${l.icon} w-4 text-center text-xs`}></i>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 p-4 pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-600 transition-all">
                    Dashboard
                  </Link>
                  <button onClick={() => { setMobileOpen(false); logout(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-600 transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-[#0B1628] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-16 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
            {/* Brand — wider */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/images/Logo.webp" alt="" width="36" height="36" className="h-9 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="font-display text-xl font-extrabold tracking-tight">
                  Auto<span className="text-gold-400">Revive</span>
                </span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
                India's premium vehicle auction marketplace. Verified inventory, transparent bidding, unbeatable deals.
              </p>
              <div className="flex gap-2">
                {[{ name: 'facebook-f', l: 'Facebook' }, { name: 'x-twitter', l: 'Twitter' }, { name: 'instagram', l: 'Instagram' }, { name: 'linkedin-in', l: 'LinkedIn' }, { name: 'youtube', l: 'YouTube' }].map((soc) => (
                  <a key={soc.name} href="#" aria-label={soc.l} className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center text-white/40 hover:bg-gold-500 hover:text-white transition-all duration-200">
                    <i className={`fab fa-${soc.name} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold font-display mb-4 text-white/90 tracking-wide">Company</h3>
              <ul className="space-y-2 list-none m-0 p-0">
                {[
                  { to: '/about', label: 'About Us' },
                  { to: '/auctions', label: 'Auctions' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/investors', label: 'Investors' },
                  { to: '/contact', label: 'Contact' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-white/40 hover:text-gold-400 text-sm transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold font-display mb-4 text-white/90 tracking-wide">Legal</h3>
              <ul className="space-y-2 list-none m-0 p-0">
                {[
                  { to: '/privacy-policy', label: 'Privacy Policy' },
                  { to: '/privacy-policy', label: 'Terms of Service' },
                  { to: '/privacy-policy', label: 'Refund Policy' },
                ].map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} className="text-white/40 hover:text-gold-400 text-sm transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Quick form */}
            <div className="lg:col-span-4">
              <h3 className="text-sm font-bold font-display mb-4 text-white/90 tracking-wide">Get in Touch</h3>
              <div className="space-y-3 mb-5">
                <p className="text-white/40 text-sm flex items-center gap-2"><i className="fas fa-phone text-gold-400/60 text-xs"></i>+91 8828820306</p>
                <p className="text-white/40 text-sm flex items-center gap-2"><i className="fas fa-envelope text-gold-400/60 text-xs"></i>support@autorevive.com</p>
                <p className="text-white/40 text-sm flex items-center gap-2"><i className="fas fa-clock text-gold-400/60 text-xs"></i>Mon — Sat, 9 AM – 7 PM</p>
              </div>
              <form onSubmit={handleFooterContact} className="flex gap-2">
                <input type="email" placeholder="Your email" aria-label="Email" autoComplete="email" value={footerForm.email} onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold-400/40 transition-all" />
                <button type="submit" disabled={footerSubmitting} className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                  <i className={`fas ${footerSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <p>&copy; {new Date().getFullYear()} AutoRevive. All Rights Reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-white/60 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/+918828820306" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:rounded-xl"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
      </a>
    </div>
  );
}
