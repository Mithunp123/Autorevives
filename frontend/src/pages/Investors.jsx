export default function Investors() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal via-navy to-steel text-white py-14 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-3">Investor Relations</h1>
          <p className="text-white/80">Join us in revolutionizing India's automotive auction industry</p>
        </div>
      </section>

      {/* Growth Story */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mb-4">Our Growth Story</h2>
            <p className="text-slate-500 leading-relaxed mb-3">
              AutoRevive is India's fastest-growing automotive auction platform, connecting thousands of
              buyers with quality vehicles from reputed financial institutions and fleet owners.
            </p>
            <p className="text-slate-500 leading-relaxed mb-6">
              Since our inception, we have facilitated over ₹500 crores in transactions, served 50,000+
              customers, and expanded to 100+ cities across India.
            </p>
            <div className="flex gap-6">
              {[
                { value: '300%', label: 'YoY Growth' },
                { value: '₹500Cr+', label: 'Transaction Value' },
                { value: '100+', label: 'Cities' },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-display text-2xl font-bold text-gradient block">{s.value}</span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <img src="/images/icons/values.svg" alt="Growth" className="max-w-xs mx-auto" />
          </div>
        </div>
      </section>

      {/* Why Invest */}
      <section className="py-12 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-xl font-extrabold text-center text-slate-900 mb-2">Why Invest in AutoRevive?</h2>
          <p className="text-center text-slate-400 text-sm mb-8">Key factors that make us an attractive investment opportunity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'fa-arrow-trend-up', title: 'Market Leadership', desc: '#1 online automotive auction platform in Western India with rapidly expanding pan-India presence' },
              { icon: 'fa-database', title: 'Asset-Light Model', desc: 'Technology-driven marketplace model with minimal capital requirements and high scalability' },
              { icon: 'fa-handshake', title: 'Strong Partnerships', desc: 'Exclusive partnerships with 50+ NBFCs, banks, and fleet operators for steady inventory supply' },
              { icon: 'fa-users', title: 'Growing User Base', desc: '50,000+ registered bidders with 70% repeat purchase rate demonstrating strong customer loyalty' },
              { icon: 'fa-shield-halved', title: 'Regulatory Compliance', desc: 'Fully compliant with all regulatory requirements with robust KYC and AML processes' },
              { icon: 'fa-rocket', title: 'Expansion Ready', desc: 'Proven playbook ready for rapid expansion into new geographies and vehicle categories' },
            ].map((f) => (
              <div key={f.title} className="card rounded-2xl p-6 hover:shadow-elevated transition">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${f.icon} text-lg text-accent`}></i>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financials */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-xl font-extrabold text-center text-slate-900 mb-2">Financial Performance</h2>
          <p className="text-center text-slate-400 text-sm mb-8">Consistent growth across all key metrics</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'FY 2024-25 GMV', value: '₹180 Cr', growth: '85% YoY' },
              { label: 'Revenue', value: '₹18 Cr', growth: '120% YoY' },
              { label: 'Active Users', value: '25,000+', growth: '150% YoY' },
              { label: 'Vehicles Auctioned', value: '8,500+', growth: '95% YoY' },
            ].map((s) => (
              <div key={s.label} className="card text-center p-6 hover:shadow-elevated transition">
                <span className="text-xs text-slate-400 block mb-2">{s.label}</span>
                <span className="font-display text-2xl font-bold text-slate-900 block mb-1">{s.value}</span>
                <span className="text-xs text-green-500 font-medium flex items-center justify-center gap-1">
                  <i className="fas fa-arrow-up text-[10px]"></i> {s.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-xl font-extrabold text-center text-slate-900 mb-2">Leadership Team</h2>
          <p className="text-center text-slate-400 text-sm mb-8">Experienced team with deep domain expertise</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Rahul Sharma', role: 'Founder & CEO', desc: '15+ years in automotive finance. Previously led used car operations at HDFC Bank.' },
              { name: 'Priya Gupta', role: 'Co-Founder & COO', desc: '12+ years in operations. Built logistics network for CarDekho.' },
              { name: 'Amit Patel', role: 'CTO', desc: 'Ex-Amazon engineer. Built scalable platforms serving millions of users.' },
            ].map((t) => (
              <div key={t.name} className="card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-charcoal to-steel rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h4 className="font-semibold text-slate-900">{t.name}</h4>
                <span className="text-xs text-accent font-medium">{t.role}</span>
                <p className="text-sm text-slate-400 mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 mb-3">Interested in Investing?</h2>
          <p className="text-slate-400 mb-6">
            We're always looking for strategic partners who share our vision of transforming India's
            pre-owned vehicle market.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <a
              href="mailto:investors@autorevive.in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary-500 text-white rounded-xl font-semibold text-sm shadow-button hover:shadow-glow transition"
            >
              <i className="fas fa-envelope text-sm"></i> Contact Investor Relations
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-charcoal transition"
            >
              <i className="fas fa-download text-sm"></i> Download Pitch Deck
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2"><i className="fas fa-envelope text-sm text-accent"></i> investors@autorevive.in</span>
            <span className="flex items-center gap-2"><i className="fas fa-phone text-sm text-accent"></i> +91 8828820306</span>
          </div>
        </div>
      </section>
    </div>
  );
}
