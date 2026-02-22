import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '@/services';

/* ── Fallback hero images when no product images exist ── */
const FALLBACK_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=80', label: '4 Wheeler Auctions' },
  { src: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=80', label: '2 Wheeler Collection' },
  { src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=80', label: 'Premium Vehicles' },
  { src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&q=80', label: 'Commercial Fleet' },
  { src: 'https://images.unsplash.com/photo-1606611013016-969c19ba27e5?w=1400&q=80', label: 'SUV Lineup' },
];

export default function Home() {
  const [stats, setStats] = useState({
    total_users: 0, live_auctions: 0, pending_auctions: 0, closed_auctions: 0,
    two_wheeler: 0, three_wheeler: 0, four_wheeler: 0, commercial: 0,
    total_auction_value: 0,
  });
  const [products, setProducts] = useState([]);
  const [slide, setSlide] = useState(0);
  const [catTab, setCatTab] = useState('all');
  const timerRef = useRef(null);

  useEffect(() => {
    publicService.getHomeData()
      .then(({ data }) => {
        if (data.stats) setStats(data.stats);
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  /* Build carousel from real product images or fallback stock */
  const withImages = products.filter(p => p.image_path);
  const slides = withImages.length >= 3
    ? withImages.slice(0, 5).map(p => ({
        src: `/api/uploads/${p.image_path.replace('uploads/', '')}`,
        label: p.name,
        price: p.current_bid || p.starting_price,
        bids: p.total_bids || 0,
        id: p.id,
      }))
    : FALLBACK_SLIDES;

  /* Carousel auto-play */
  const len = slides.length || 1;
  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % len), 5000);
    return () => clearInterval(timerRef.current);
  }, [len]);

  const go = (i) => {
    setSlide(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % len), 5000);
  };

  /* Helpers */
  const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

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

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="bg-[#0a1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center">

            {/* ── Left column ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 text-[13px] px-3 py-1 rounded">
                  <i className="fas fa-calendar-days text-[11px]"></i>{dateStr}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.06] text-slate-400 text-[13px] px-3 py-1 rounded">
                  <i className="fas fa-location-dot text-[11px]"></i>Tamil Nadu
                </span>
              </div>

              <h1 className="text-white text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-3">
                Get Best Deals on<br />Wheels. Bid Online.
              </h1>
              <p className="text-indigo-300/70 text-base mb-8">Gain Profits with AutoRevive Vehicle Auctions</p>

              {/* Vehicle category counters */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { k: 'two_wheeler', label: '2 Wheeler', icon: 'fa-motorcycle' },
                  { k: 'three_wheeler', label: '3 Wheeler', icon: 'fa-truck-pickup' },
                  { k: 'four_wheeler', label: '4 Wheeler', icon: 'fa-car-side' },
                  { k: 'commercial', label: 'Commercial', icon: 'fa-truck-moving' },
                ].map(c => (
                  <div key={c.k} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3.5 py-2.5">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${c.icon} text-indigo-400 text-xs`}></i>
                    </div>
                    <div>
                      <p className="text-white text-lg font-bold leading-none">{stats[c.k]}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{c.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/public/auctions" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  Browse Auctions
                </Link>
                <Link to="/register" className="border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  Register Free
                </Link>
              </div>
            </div>

            {/* ── Right column — Image Carousel ── */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-[16/10]">
              {slides.map((s, i) => (
                <img
                  key={i}
                  src={s.src}
                  alt={s.label || ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  onError={(e) => { e.target.src = FALLBACK_SLIDES[i % FALLBACK_SLIDES.length].src; }}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />

              {/* Slide caption */}
              <div className="absolute bottom-3 left-4 z-30">
                <p className="text-white font-semibold text-sm drop-shadow">{slides[slide]?.label}</p>
                {slides[slide]?.price != null && (
                  <p className="text-indigo-300 text-xs mt-0.5 drop-shadow">
                    {fmt(slides[slide].price)} &middot; {slides[slide].bids} bids
                  </p>
                )}
              </div>

              {/* Dots */}
              <div className="absolute bottom-3 right-4 z-30 flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => go(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === slide ? 'bg-indigo-500 w-5' : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Slide ${i + 1}`} />
                ))}
              </div>

              {/* Arrows */}
              <button onClick={() => go((slide - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center text-xs transition-colors">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={() => go((slide + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center text-xs transition-colors">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ INVENTORY STATS BAR ═══════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <strong className="text-slate-800">{stats.live_auctions}</strong>
                <span className="text-slate-500">Live</span>
              </span>
              <span className="text-slate-200">|</span>
              <span className="text-slate-500"><strong className="text-slate-800">{stats.pending_auctions}</strong> Upcoming</span>
              <span className="text-slate-200">|</span>
              <span className="text-slate-500"><strong className="text-slate-800">{stats.closed_auctions}</strong> Closed</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span><strong className="text-slate-800">{stats.total_users}</strong> Dealers</span>
              <span className="text-slate-200">|</span>
              <span>Volume: <strong className="text-slate-800">{fmt(stats.total_auction_value)}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ LIVE AUCTIONS TABLE ═══════════════════ */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live Auctions</h2>
              <p className="text-sm text-slate-500">Verified listings from finance companies across Tamil Nadu</p>
            </div>
            <Link to="/public/auctions" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
              View all <i className="fas fa-arrow-right text-[10px] ml-1"></i>
            </Link>
          </div>

          {/* Category sub-tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {[
              { k: 'all', l: 'ALL', c: products.length },
              { k: '2W', l: '2W', c: stats.two_wheeler },
              { k: '3W', l: '3W', c: stats.three_wheeler },
              { k: '4W', l: '4W', c: stats.four_wheeler },
              { k: 'CV', l: 'CV', c: stats.commercial },
            ].map(t => (
              <button key={t.k} onClick={() => setCatTab(t.k)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  catTab === t.k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {t.l} <span className="opacity-60 ml-0.5">{t.c}</span>
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left font-semibold px-4 py-3">Vehicle</th>
                    <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Category</th>
                    <th className="text-right font-semibold px-4 py-3">Base Price</th>
                    <th className="text-right font-semibold px-4 py-3">Current Bid</th>
                    <th className="text-center font-semibold px-4 py-3 hidden sm:table-cell">Bids</th>
                    <th className="text-center font-semibold px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.slice(0, 10).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                            {p.image_path ? (
                              <img
                                src={`/api/uploads/${p.image_path.replace('uploads/', '')}`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <i className="fas fa-car text-xs"></i>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[220px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.category || '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{fmt(p.starting_price)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(p.current_bid || p.starting_price)}</td>
                      <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{p.total_bids || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/public/auctions/${p.id}`}
                          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          Bid <i className="fas fa-arrow-right text-[9px]"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-14 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <i className="fas fa-gavel text-2xl text-slate-300 mb-2 block"></i>
              <p className="text-slate-500 font-medium text-sm">No active auctions right now</p>
              <p className="text-slate-400 text-xs mt-1">New listings are added daily</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ WHY BUY ═══════════════════ */}
      <section className="py-10 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-slate-900 text-center mb-8">Why Buy from AutoRevive</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-eye', title: 'View Before You Bid', desc: 'Full vehicle details, images and documentation available before placing your bid.' },
              { icon: 'fa-warehouse', title: 'Large Inventory', desc: 'Hundreds of vehicles from top finance companies updated daily across Tamil Nadu.' },
              { icon: 'fa-tags', title: 'Great Deals', desc: 'Competitive starting prices with transparent bidding. No hidden charges.' },
              { icon: 'fa-calendar-check', title: 'Daily Auctions', desc: 'New vehicles added every day. Live auctions running across multiple locations.' },
            ].map(f => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-slate-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: 1, icon: 'fa-user-plus', title: 'Register', desc: 'Create a free dealer account with basic KYC verification.' },
              { n: 2, icon: 'fa-magnifying-glass', title: 'Browse', desc: 'Explore verified vehicles from finance companies across India.' },
              { n: 3, icon: 'fa-gavel', title: 'Bid', desc: 'Place competitive bids with real-time status updates.' },
              { n: 4, icon: 'fa-handshake-simple', title: 'Win & Collect', desc: 'Complete paperwork and take delivery of your vehicle.' },
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {s.n}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section className="py-10 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-slate-900 text-center mb-1">Membership Plans</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Choose a plan that fits your business</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Basic', price: '499', period: '30 Days', feat: ['Access all auctions', 'Real-time bidding', 'Email notifications', 'Standard support'] },
              { name: 'Professional', price: '2,799', period: '180 Days', pop: true, feat: ['Everything in Basic', 'Priority bidding queue', 'SMS & WhatsApp alerts', 'Dedicated manager', 'Early access'] },
              { name: 'Enterprise', price: '4,999', period: '365 Days', feat: ['Everything in Pro', 'Unlimited bids', 'Analytics dashboard', '24/7 priority support', 'API access'] },
            ].map(plan => (
              <div key={plan.name} className={`bg-white rounded-lg border-2 p-6 relative ${plan.pop ? 'border-indigo-600' : 'border-slate-200'}`}>
                {plan.pop && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
                    Popular
                  </span>
                )}
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{plan.name}</p>
                <p className="mb-0.5">
                  <span className="text-xs text-slate-400">₹</span>
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                </p>
                <p className="text-xs text-slate-400 mb-5">{plan.period}</p>
                <ul className="space-y-2 mb-6">
                  {plan.feat.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <i className="fas fa-check text-green-500 text-[10px]"></i>{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-2 rounded-lg font-semibold text-sm transition-colors ${
                    plan.pop ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-slate-900 text-center mb-8">What Our Dealers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: 'AutoRevive made vehicle sourcing simple. The bidding process is fully transparent and I always know what I\'m paying for.', name: 'Murugan K.', city: 'Chennai' },
              { text: 'Great inventory from multiple finance companies. Saves me a lot of time and travel. The support team is very responsive.', name: 'Priya N.', city: 'Coimbatore' },
              { text: 'Purchased over 20 vehicles through this platform. Documentation and ownership transfer has been hassle-free every time.', name: 'Arjun M.', city: 'Madurai' },
            ].map(t => (
              <div key={t.name} className="border border-slate-200 rounded-lg p-5">
                <div className="flex gap-0.5 text-amber-400 text-xs mb-3">
                  {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">Dealer, {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0a1929] rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Start Bidding Today</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Register free and get instant access to verified vehicle auctions from finance companies across Tamil Nadu.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                Create Free Account
              </Link>
              <Link to="/about" className="text-slate-400 hover:text-white px-4 py-2.5 text-sm font-medium transition-colors">
                Learn More &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
