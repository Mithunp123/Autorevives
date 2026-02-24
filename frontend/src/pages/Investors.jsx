import { Helmet } from 'react-helmet-async';

export default function Investors() {
  return (
    <div>
      <Helmet>
        <title>Investors - AutoRevive</title>
        <meta name="description" content="Explore investment opportunities with AutoRevive, India's fastest-growing automotive auction platform." />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f1b3d] to-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight mb-2">Investor Relations</h1>
          <p className="text-sm text-white/50 max-w-xl">Join us in revolutionizing India's automotive auction industry.</p>
        </div>
      </section>

      {/* ═══════ GROWTH STORY ═══════ */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight mb-4">Our Growth Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="space-y-3 text-sm text-slate-500 leading-relaxed">
                <p>AutoRevive is India's fastest-growing automotive auction platform, connecting thousands of buyers with quality vehicles from reputed financial institutions and fleet owners.</p>
                <p>Since our inception, we have facilitated over ₹500 crores in transactions, served 50,000+ customers, and expanded to 100+ cities across India.</p>
              </div>
              {/* Inline stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-200">
                {[
                  { value: '300%', label: 'YoY Growth' },
                  { value: '₹500Cr+', label: 'Transaction Value' },
                  { value: '100+', label: 'Cities' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Compact bar chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-end justify-center gap-3 h-36">
                {[
                  { h: 'h-10', label: 'FY22', bg: 'bg-blue-100' },
                  { h: 'h-16', label: 'FY23', bg: 'bg-blue-200' },
                  { h: 'h-24', label: 'FY24', bg: 'bg-blue-300' },
                  { h: 'h-36', label: 'FY25', bg: 'bg-blue-600' },
                ].map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center gap-2">
                    <div className={`w-12 ${bar.h} ${bar.bg} rounded-t-lg`}></div>
                    <span className={`text-[10px] font-medium ${bar.bg === 'bg-blue-600' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY INVEST ═══════ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight mb-6">Why Invest in AutoRevive?</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: 'fa-arrow-trend-up', title: 'Market Leadership', desc: '#1 online automotive auction platform in Western India.', color: 'text-blue-500 bg-blue-50' },
              { icon: 'fa-database', title: 'Asset-Light Model', desc: 'Technology-driven marketplace with high scalability.', color: 'text-purple-500 bg-purple-50' },
              { icon: 'fa-handshake', title: 'Strong Partnerships', desc: '50+ NBFCs, banks, and fleet operators.', color: 'text-emerald-500 bg-emerald-50' },
              { icon: 'fa-users', title: 'Growing User Base', desc: '50,000+ bidders with 70% repeat rate.', color: 'text-amber-500 bg-amber-50' },
              { icon: 'fa-shield-halved', title: 'Fully Compliant', desc: 'Robust KYC and AML processes.', color: 'text-cyan-500 bg-cyan-50' },
              { icon: 'fa-rocket', title: 'Expansion Ready', desc: 'Proven playbook for rapid geography expansion.', color: 'text-rose-500 bg-rose-50' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${f.color}`}>
                  <i className={`fas ${f.icon} text-sm`}></i>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINANCIAL PERFORMANCE ═══════ */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight mb-6">Financial Highlights</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'FY 2024-25 GMV', value: '₹180 Cr', growth: '85% YoY' },
              { label: 'Revenue', value: '₹18 Cr', growth: '120% YoY' },
              { label: 'Active Users', value: '25,000+', growth: '150% YoY' },
              { label: 'Vehicles Auctioned', value: '8,500+', growth: '95% YoY' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{s.label}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">{s.value}</p>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <i className="fas fa-arrow-up text-[9px]"></i> {s.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LEADERSHIP TEAM ═══════ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight mb-6">Leadership Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl">
            {[
              { name: 'Rahul Sharma', role: 'Founder & CEO', desc: '15+ years in automotive finance.', color: 'bg-blue-600' },
              { name: 'Priya Gupta', role: 'Co-Founder & COO', desc: '12+ years in operations.', color: 'bg-purple-600' },
              { name: 'Amit Patel', role: 'CTO', desc: 'Ex-Amazon, scalable platforms.', color: 'bg-emerald-600' },
            ].map((t) => (
              <div key={t.name} className="flex gap-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className={`w-10 h-10 ${t.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className="fas fa-user text-sm text-white/70"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-blue-600 font-semibold">{t.role}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-slate-900 via-[#0f1b3d] to-slate-900 rounded-2xl overflow-hidden px-6 sm:px-10 py-10 text-center">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 right-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px]" /></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mb-3">Interested in Investing?</h2>
              <p className="text-white/50 text-sm max-w-lg mx-auto mb-6">We're looking for strategic partners who share our vision of transforming India's pre-owned vehicle market.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <a href="mailto:investors@autorevive.in" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all"><i className="fas fa-envelope text-xs"></i> Contact Investor Relations</a>
                <a href="#" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.1] text-white font-bold text-sm rounded-xl border border-white/[0.15] hover:bg-white/[0.18] transition-all"><i className="fas fa-download text-xs"></i> Download Pitch Deck</a>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><i className="fas fa-envelope text-blue-400 text-[10px]"></i> investors@autorevive.in</span>
                <span className="flex items-center gap-1.5"><i className="fas fa-phone text-blue-400 text-[10px]"></i> +91 8828820306</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
