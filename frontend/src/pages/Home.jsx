import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { publicService } from '@/services';

/* ── Indian states list (used for state display fallback) ── */
const HERO_STATE = 'Tamil Nadu';

/* ── Hero rotating vehicle types (with real images) ── */
const HERO_TYPES = [
  { image: '/images/hero-bike-transparent.png', label: 'Two Wheelers', category: '2W', location: 'Tamil Nadu', scale: '' },
  { image: '/images/banner-auto.png', label: 'Auto Rickshaws', category: '3W', location: 'Kerala', scale: '' },
  { image: '/images/banner-car1.png', label: 'Used Cars', category: '4W', location: 'Karnataka', scale: '' },
  { image: '/images/banner-eicher.png', label: 'Commercial Vehicles', category: 'CV', location: 'Andhra Pradesh', scale: 'scale-125' },
  { image: '/images/hero-jcb.png', label: 'Heavy Equipment', category: 'HE', location: 'Telangana', scale: '' },
];

export default function Home() {
  const [stats, setStats] = useState({
    total_users: 0, live_auctions: 0, pending_auctions: 0, closed_auctions: 0,
    two_wheeler: 0, three_wheeler: 0, four_wheeler: 0, commercial: 0,
    total_auction_value: 0,
  });
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [catTab, setCatTab] = useState('all');

  /* Hero rotating type */
  const [activeType, setActiveType] = useState(0);
  const timerRef = useRef(null);

  const location = useLocation();

  /* Scroll to hash section when navigating to /#auctions etc */
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location]);

  useEffect(() => {
    publicService.getHomeData()
      .then(({ data }) => {
        if (data.stats) setStats(data.stats);
        if (data.products) setProducts(data.products);
        if (data.plans) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  /* Auto-rotate hero vehicle type */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveType(prev => (prev + 1) % HERO_TYPES.length);
    }, 3000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  /* Helpers */
  const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
  const today = new Date();
  const dayNum = today.getDate();
  const monthName = today.toLocaleDateString('en-IN', { month: 'long' });

  /* Client-side category filter for the auction table */
  const filtered = catTab === 'all' ? products : products.filter(p => {
    const c = (p.category || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    switch (catTab) {
      case '2W': return c === '2w' || /bike|motorcycle|scooter|bullet|activa|pulsar|splendor|hero|yamaha|tvs|bajaj|ktm/.test(n);
      case '3W': return c === '3w' || /auto|rickshaw|three.?wheel|ape/.test(n);
      case '4W': return c === '4w' || /car|suv|sedan|hatchback|jeep|swift|fortuner|creta|nexon|brezza|innova|alto|i20|ertiga/.test(n);
      case 'CV': return c === 'commercial' || /truck|bus|tempo|van|lorry|tractor|tipper|bolero|pickup/.test(n);
      default: return true;
    }
  });

  return (
    <div className="bg-white">

      {/* ═══════════════════ HERO — Clean Professional Dark Theme ═══════════════════ */}
      <section className="relative overflow-hidden bg-[#111827] min-h-[480px] lg:min-h-[600px]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#4285F4]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-[#4285F4]/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left — Vehicle Image */}
            <div className="flex items-center justify-center relative min-h-[300px] lg:min-h-[400px] order-1">
              <div className="relative w-full h-full flex items-center justify-center">
                {HERO_TYPES.map((t, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                      i === activeType
                        ? 'opacity-100 scale-100 translate-x-0'
                        : 'opacity-0 scale-95 -translate-x-8'
                    }`}
                  >
                    <img
                      src={t.image}
                      alt={t.label}
                      className={`w-full max-w-[600px] object-contain drop-shadow-2xl ${t.scale || ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Content */}
            <div className="space-y-8 order-2">
              <div className="space-y-4">
                <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                  Get Best Deals <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#34A853]">On Wheels.</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                  India's trusted platform for vehicle auctions. Browse, bid, and win verified vehicles from top finance companies.
                </p>
              </div>

              {/* Date + Location bar */}
              <div className="flex items-stretch max-w-md bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                <div className="bg-[#4285F4] text-white px-6 py-3 text-center min-w-[80px] flex flex-col justify-center">
                  <p className="text-2xl font-extrabold leading-none">{dayNum}</p>
                  <p className="text-xs font-medium mt-1 uppercase tracking-wider">{monthName}</p>
                </div>
                <div className="flex items-center px-6 py-3 flex-1">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Location</span>
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      <i className="fas fa-location-dot text-[#4285F4]"></i>
                      {HERO_TYPES[activeType].location || 'Tamil Nadu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle type counters */}
              <div className="flex items-center gap-0 divide-x divide-white/10 max-w-md">
                {[
                  { label: '2 Wheeler', val: stats.two_wheeler },
                  { label: '3 Wheeler', val: stats.three_wheeler },
                  { label: '4 Wheeler', val: stats.four_wheeler },
                ].map(c => (
                  <div key={c.label} className="flex-1 text-center px-4 first:pl-0">
                    <p className="text-slate-400 text-xs font-medium">{c.label}</p>
                    <p className="text-white text-3xl font-extrabold mt-0.5">{c.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#auctions" className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-8 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[#4285F4]/25 flex items-center gap-2">
                  <i className="fas fa-gavel"></i>Browse Auctions
                </a>
                <Link to="/register" className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-base transition-colors backdrop-blur-sm">
                  Register Free
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ INVENTORY STATS CARDS ═══════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-signal', label: 'LIVE INVENTORY', val: stats.live_auctions, bg: 'bg-red-50', border: 'border-red-100', iconColor: 'text-red-500' },
              { icon: 'fa-clock', label: 'UPCOMING INVENTORY', val: stats.pending_auctions, bg: 'bg-blue-50', border: 'border-blue-100', iconColor: 'text-blue-500' },
              { icon: 'fa-circle-check', label: 'CLOSED INVENTORY', val: stats.closed_auctions, bg: 'bg-slate-50', border: 'border-slate-200', iconColor: 'text-slate-500' },
              { icon: 'fa-star', label: 'EXCLUSIVE INVENTORY', val: 0, bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-500' },
            ].map(s => (
              <div key={s.label} className={`bg-white ${s.border} border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`fas ${s.icon} ${s.iconColor} text-xl`}></i>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.val.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ LIVE AUCTIONS TABLE ═══════════════════ */}
      <section id="auctions" className="py-16 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Live Auctions</h2>
              <p className="text-slate-500">Bid on verified vehicles from top finance companies.</p>
            </div>
            
            {/* Tabs: Live / Upcoming */}
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                LIVE
                <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs font-semibold ml-1">{stats.live_auctions}</span>
              </div>
              <button className="flex items-center gap-2 px-5 py-2 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors">
                <i className="fas fa-clock text-slate-400"></i>
                Upcoming
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold ml-1">{stats.pending_auctions}</span>
              </button>
            </div>
          </div>

          {/* Vehicle category pills */}
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setCatTab('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                catTab === 'all' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>All Vehicles</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${catTab === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {products.length}
              </span>
            </button>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            {[
              { k: '2W', icon: 'fa-motorcycle', label: '2 Wheeler', c: stats.two_wheeler },
              { k: '3W', icon: 'fa-truck-pickup', label: '3 Wheeler', c: stats.three_wheeler },
              { k: '4W', icon: 'fa-car', label: '4 Wheeler', c: stats.four_wheeler },
              { k: 'CV', icon: 'fa-truck', label: 'Commercial', c: stats.commercial },
            ].map(t => (
              <button key={t.k} onClick={() => setCatTab(catTab === t.k ? 'all' : t.k)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  catTab === t.k 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <i className={`fas ${t.icon} ${catTab === t.k ? 'text-white/70' : 'text-slate-400'}`}></i>
                <span>{t.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${catTab === t.k ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {t.c}
                </span>
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="font-bold px-6 py-4">Vehicle Details</th>
                      <th className="font-bold px-6 py-4 text-center">Category</th>
                      <th className="font-bold px-6 py-4 hidden md:table-cell">Location</th>
                      <th className="font-bold px-6 py-4 text-right">Base Price</th>
                      <th className="font-bold px-6 py-4 text-right hidden sm:table-cell">Current Bid</th>
                      <th className="font-bold px-6 py-4 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.slice(0, 10).map(p => {
                      const cat = (p.category || '').toUpperCase();
                      const nm = (p.name || '').toLowerCase();
                      let catLabel = cat || '4W';
                      if (!cat) {
                        if (/bike|motorcycle|scooter|bullet|activa|pulsar|splendor|hero|yamaha|tvs|bajaj|ktm/.test(nm)) catLabel = '2W';
                        else if (/auto|rickshaw|three.?wheel|ape|tuk/.test(nm)) catLabel = '3W';
                        else if (/truck|bus|tempo|van|lorry|tractor|tipper|bolero|pickup|jcb|excavat/.test(nm)) catLabel = 'CV';
                        else catLabel = '4W';
                      }
                      const catColors = { 
                        '2W': 'bg-blue-50 text-blue-700 border-blue-100', 
                        '3W': 'bg-amber-50 text-amber-700 border-amber-100', 
                        '4W': 'bg-emerald-50 text-emerald-700 border-emerald-100', 
                        'CV': 'bg-purple-50 text-purple-700 border-purple-100', 
                        'COMMERCIAL': 'bg-purple-50 text-purple-700 border-purple-100' 
                      };
                      return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                              {p.image_path ? (
                                <img src={`/api/uploads/${p.image_path.replace('uploads/', '')}`} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-car text-lg"></i></div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-base group-hover:text-[#4285F4] transition-colors line-clamp-1">{p.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ID: #{p.id.toString().padStart(5, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${catColors[catLabel] || catColors['4W']}`}>
                            {catLabel === 'COMMERCIAL' ? 'CV' : catLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <i className="fas fa-map-marker-alt text-slate-400 text-xs"></i>
                            <span className="font-medium">{p.location || '—'}</span>
                            <span className="text-slate-400 text-xs">({p.state || HERO_STATE})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-500 font-medium">{fmt(p.starting_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-slate-900 font-bold text-base">{fmt(p.current_bid || p.starting_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/public/auctions/${p.id}`}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#4285F4] hover:text-white transition-colors">
                            <i className="fas fa-arrow-right"></i>
                          </Link>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* View All link */}
              {filtered.length > 10 && (
                <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
                  <Link to="/public/auctions" className="inline-flex items-center gap-2 text-[#4285F4] hover:text-[#3367D6] font-bold transition-colors">
                    View All {filtered.length} Auctions <i className="fas fa-arrow-right text-sm"></i>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-gavel text-2xl text-slate-400"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No active auctions found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any vehicles matching your current filter. Please try selecting a different category.</p>
              <button onClick={() => setCatTab('all')} className="mt-6 btn-primary">
                View All Vehicles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ WHY BUY ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[#4285F4] tracking-widest uppercase mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">The Autorevive Advantage</h3>
            <p className="text-slate-500 text-lg">We provide a transparent, efficient, and secure platform for buying verified vehicles from top finance companies.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'fa-shield-halved', title: 'Verified Inventory', desc: 'Every vehicle is thoroughly inspected and verified before being listed on our platform.' },
              { icon: 'fa-tags', title: 'Competitive Pricing', desc: 'Get access to wholesale prices directly from banks and financial institutions.' },
              { icon: 'fa-bolt', title: 'Fast Processing', desc: 'Streamlined documentation and quick delivery process for winning bids.' },
              { icon: 'fa-headset', title: 'Dedicated Support', desc: 'Our expert team is available to assist you throughout the buying journey.' },
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-[#4285F4]/30 hover:shadow-lg hover:shadow-[#4285F4]/5 transition-all group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-[#4285F4] group-hover:border-[#4285F4] transition-colors">
                  <i className={`fas ${f.icon} text-2xl text-slate-700 group-hover:text-white transition-colors`}></i>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4285F4] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#34A853] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[#4285F4] tracking-widest uppercase mb-3">Simple Process</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-6">How It Works</h3>
            <p className="text-slate-400 text-lg">Start bidding and winning in four simple steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

            {[
              { n: '01', icon: 'fa-user-plus', title: 'Register', desc: 'Create your account and complete the quick KYC verification process.' },
              { n: '02', icon: 'fa-magnifying-glass', title: 'Browse', desc: 'Explore our extensive inventory of verified vehicles across categories.' },
              { n: '03', icon: 'fa-gavel', title: 'Bid', desc: 'Place your bids in real-time during our live auction sessions.' },
              { n: '04', icon: 'fa-car', title: 'Win & Drive', desc: 'Complete the payment and paperwork to take delivery of your vehicle.' },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center relative z-10 mb-6 group hover:border-[#4285F4] transition-colors">
                  <i className={`fas ${s.icon} text-3xl text-slate-300 group-hover:text-[#4285F4] transition-colors`}></i>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#4285F4] rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                    {s.n}
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      {plans.length > 0 && (
      <section id="pricing" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[#4285F4] tracking-widest uppercase mb-3">Membership Plans</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Choose Your Plan</h3>
            <p className="text-slate-500 text-lg">Select a membership plan that best fits your bidding requirements.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => {
              const isPop = !!plan.popular;
              const features = plan.features
                ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features)
                : [];
              return (
                <div key={plan.id || plan.name} className={`bg-white rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-2 ${isPop ? 'border-2 border-[#4285F4] shadow-xl shadow-[#4285F4]/10' : 'border border-slate-200 shadow-sm hover:shadow-xl'}`}>
                  {isPop && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4285F4] to-[#3367D6] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4">{plan.name}</h4>
                    <div className="flex items-center justify-center items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-400">₹</span>
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{Number(plan.price).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-slate-500 mt-2 font-medium">Valid for {plan.duration} {plan.period || 'Days'}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-[#34A853] mt-1"></i>
                        <span className="text-slate-600">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/register"
                    className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${
                      isPop 
                        ? 'bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-lg shadow-[#4285F4]/25' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ═══════════════════ TRUSTED BY ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[#4285F4] tracking-widest uppercase mb-3">Testimonials</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Trusted by <span className="text-[#4285F4]">{stats.total_users || '2,500'}+</span> Dealers</h3>
            <p className="text-slate-500 text-lg">See what our community of verified dealers has to say about their experience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: 'AutoRevive made vehicle sourcing simple. The bidding process is fully transparent and I always know what I\'m paying for.', name: 'Murugan K.', city: 'Chennai' },
              { text: 'Great inventory from multiple finance companies. Saves me a lot of time and travel. The support team is very responsive.', name: 'Priya N.', city: 'Coimbatore' },
              { text: 'Purchased over 20 vehicles through this platform. Documentation and ownership transfer has been hassle-free every time.', name: 'Arjun M.', city: 'Madurai' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
                <i className="fas fa-quote-left text-4xl text-slate-200 absolute top-6 right-8"></i>
                <div className="flex gap-1 text-amber-400 text-sm mb-6">
                  {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                </div>
                <p className="text-slate-600 leading-relaxed mb-8 relative z-10">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4285F4] to-[#3367D6] text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">Dealer, {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4] rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34A853] rounded-full blur-[100px] opacity-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to Start Bidding?</h2>
              <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of dealers across India. Register for free and get instant access to verified vehicle auctions from top finance companies.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#4285F4]/25 hover:-translate-y-1 text-center">
                  Create Free Account
                </Link>
                <Link to="/about" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm text-center">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
