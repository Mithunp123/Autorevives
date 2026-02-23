import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { publicService } from '@/services';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/#auctions', label: 'Auctions', icon: 'fa-gavel', isHash: true },
  { to: '/about', label: 'About', icon: 'fa-info-circle' },
  { to: '/faq', label: 'FAQ', icon: 'fa-circle-question' },
  { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [footerForm, setFooterForm] = useState({ fullName: '', email: '', mobile: '', state: '', city: '', subject: '' });
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* Handle hash-link navigation (e.g. /#auctions) */
  const handleHashClick = (e, to) => {
    e.preventDefault();
    const [path, hash] = to.split('#');
    if (location.pathname === (path || '/')) {
      // Already on home page, just scroll
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Navigate to home, then scroll via Home's useEffect
      navigate(to);
    }
  };

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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[80px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <img src="/images/Logo.png" alt="AutoRevive" className="h-10 sm:h-[70px] w-auto object-contain" width="70" height="70" onError={(e) => { e.target.style.display='none'; }} />
            <span className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              Auto<span className="text-accent">Revive</span>
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2.5 text-slate-700 hover:text-accent rounded-xl hover:bg-accent/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
          </button>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0">
            {navLinks.map((l) => (
              <li key={l.to}>
                {l.isHash ? (
                  <a
                    href={l.to}
                    onClick={(e) => handleHashClick(e, l.to)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-slate-600 hover:text-accent hover:bg-accent/[0.04]"
                  >
                    <i className={`fas ${l.icon} text-[11px]`}></i>
                    {l.label}
                  </a>
                ) : (
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive
                          ? 'text-accent bg-accent/[0.06]'
                          : 'text-slate-600 hover:text-accent hover:bg-accent/[0.04]'
                      }`
                    }
                  >
                    <i className={`fas ${l.icon} text-[11px]`}></i>
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-surface-alt border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#202124] flex items-center justify-center text-white text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{user?.username || 'User'}</span>
                  <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-scale-in">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-accent/5 hover:text-accent transition-colors"
                    >
                      <i className="fas fa-gauge-high w-4 text-center text-slate-400"></i> Dashboard
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-accent/5 hover:text-accent transition-colors"
                    >
                      <i className="fas fa-circle-user w-4 text-center text-slate-400"></i> Profile
                    </button>
                    <hr className="my-1.5 border-slate-100" />
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-arrow-right-from-bracket w-4 text-center"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:border-[#4285F4]/40 hover:shadow-md transition-all shadow-sm"
              >
                <i className="fas fa-user text-[#4285F4] text-xs"></i>
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in">
            <ul className="list-none m-0 p-3 space-y-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  {l.isHash ? (
                    <a
                      href={l.to}
                      onClick={(e) => { setMobileOpen(false); handleHashClick(e, l.to); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-700 hover:bg-slate-50"
                    >
                      <i className={`fas ${l.icon} w-4 text-center text-xs`}></i>
                      {l.label}
                    </a>
                  ) : (
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'text-accent bg-accent/[0.06]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      <i className={`fas ${l.icon} w-4 text-center text-xs`}></i>
                      {l.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 p-4 pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-3 border-2 border-accent text-accent rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm font-bold hover:border-[#4285F4]/40 transition-all"
                >
                  <i className="fas fa-user text-[#4285F4] text-xs"></i>
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg-dark opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <img src="/images/Logo.png" alt="" width="40" height="40" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }} />
                </div>
                <span className="font-display text-xl font-extrabold tracking-tight">
                  Auto<span className="text-accent">Revive</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                India's most trusted platform for vehicle auctions. Connecting buyers and sellers
                with transparency, security, and unbeatable deals.
              </p>
              <div className="flex gap-2.5">
                {[{name:'facebook-f',label:'Facebook'},{name:'x-twitter',label:'Twitter'},{name:'instagram',label:'Instagram'},{name:'linkedin-in',label:'LinkedIn'},{name:'youtube',label:'YouTube'}].map((s) => (
                  <a
                    key={s.name}
                    href="#"
                    aria-label={s.label}
                    className="w-12 h-12 bg-white/[0.06] rounded-lg flex items-center justify-center text-white/60 hover:bg-accent hover:text-white hover:scale-110 transition-all duration-200 border border-white/[0.06]"
                  >
                    <i className={`fab fa-${s.name} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold font-display mb-5 flex items-center gap-2 tracking-wide">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" /> Quick Links
              </h4>
              <ul className="space-y-2.5 list-none m-0 p-0">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/#auctions', label: 'Auctions' },
                  { to: '/about', label: 'About Us' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/privacy-policy', label: 'Privacy Policy' },
                  { to: '/investors', label: 'Investors' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors group"
                    >
                      <i className="fas fa-chevron-right text-[8px] text-accent/60 group-hover:text-accent transition-colors"></i>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <h4 className="text-sm font-bold font-display mb-5 flex items-center gap-2 tracking-wide">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" /> Quick Contact
              </h4>
              <form onSubmit={handleFooterContact} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Full Name *"
                  aria-label="Full Name"
                  autoComplete="name"
                  value={footerForm.fullName}
                  onChange={(e) => setFooterForm({ ...footerForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  aria-label="Email Address"
                  autoComplete="email"
                  value={footerForm.email}
                  onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input type="tel" placeholder="Mobile" aria-label="Mobile Number" autoComplete="tel" value={footerForm.mobile} onChange={(e) => setFooterForm({ ...footerForm, mobile: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
                  <input type="text" placeholder="State" aria-label="State" value={footerForm.state} onChange={(e) => setFooterForm({ ...footerForm, state: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input type="text" placeholder="City" aria-label="City" value={footerForm.city} onChange={(e) => setFooterForm({ ...footerForm, city: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
                  <input type="text" placeholder="Subject" aria-label="Subject" value={footerForm.subject} onChange={(e) => setFooterForm({ ...footerForm, subject: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
                </div>
                <button type="submit" disabled={footerSubmitting} className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 shadow-button hover:shadow-glow">
                  <i className={`fas ${footerSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
                  {footerSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/[0.06] py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <p className="font-medium"><i className="far fa-copyright mr-1"></i>{new Date().getFullYear()} AutoRevive. All Rights Reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a
        href="https://wa.me/+918828820306"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:rounded-xl"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
      </a>
    </div>
  );
}
