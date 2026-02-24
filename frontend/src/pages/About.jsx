import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — AutoRevive | India's Premium Vehicle Auction Platform</title>
        <meta name="description" content="Learn about AutoRevive's mission, vision, and values. India's most trusted online vehicle auction platform connecting buyers with quality pre-owned vehicles." />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-[#111111] text-white py-20 lg:py-28">
        <div className="absolute inset-0">
          <img src="/images/banner-car2.webp" alt="Premium vehicle" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/90 to-[#111111]/70"></div>
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium rounded-full mb-6">
              About AutoRevive
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Redefining Vehicle<br />
              <span className="text-orange-500">Auctions</span> in India
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              We connect buyers with quality pre-owned vehicles through transparent, 
              digital auctions. Trusted by thousands across the nation.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Vehicles Auctioned' },
              { value: '5,000+', label: 'Happy Customers' },
              { value: '28+', label: 'States Covered' },
              { value: '50+', label: 'Banking Partners' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold text-[#111111] mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR STORY ═══════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mt-3 mb-6">
                Building Trust in the Pre-Owned Vehicle Market
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  AutoRevive was founded with a simple yet powerful vision — to create a transparent, 
                  reliable, and convenient platform for buying and selling pre-owned vehicles through 
                  online auctions. What started as a small initiative has grown into one of India's 
                  leading digital auction platforms.
                </p>
                <p>
                  We partner with India's top banks, NBFCs, insurance companies, and fleet operators 
                  to bring a vast inventory of quality vehicles to our buyers. Every vehicle listed 
                  undergoes thorough verification to ensure quality and authenticity.
                </p>
                <p>
                  From 2-wheelers to heavy commercial vehicles, AutoRevive is your one-stop destination 
                  for pre-owned vehicle auctions.
                </p>
              </div>
            </div>
            <div className="relative lg:pl-8">
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/images/banner-car1.webp" 
                  alt="About AutoRevive" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="absolute -bottom-6 -left-0 lg:-left-6 bg-orange-500 text-white p-6 rounded-xl shadow-xl">
                <p className="text-4xl font-bold mb-1">15+</p>
                <p className="text-sm text-white/80">Years of Experience</p>
              </div>
              <div className="absolute -top-4 -right-4 hidden lg:block">
                <div className="w-24 h-24 border-4 border-orange-500/30 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION / VISION / VALUES ═══════ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-4">Our Core Principles</h2>
            <p className="text-gray-500 max-w-lg mx-auto">The foundation that guides everything we do</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { 
                icon: 'fa-bullseye', 
                title: 'Mission', 
                desc: 'Making the buying and selling of pre-owned vehicles seamless, transparent, and accessible to all across India.',
                color: 'bg-orange-500'
              },
              { 
                icon: 'fa-binoculars', 
                title: 'Vision', 
                desc: "Building India's most trusted digital marketplace for automotive transactions with cutting-edge technology.",
                color: 'bg-[#111111]'
              },
              { 
                icon: 'fa-heart', 
                title: 'Values', 
                desc: 'Trust, transparency, and customer focus are at the heart of everything we do at AutoRevive.',
                color: 'bg-orange-500'
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-all">
                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                  <i className={`fas ${item.icon} text-xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHY CHOOSE US ═══════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-4">What Sets Us Apart</h2>
            <p className="text-gray-500 max-w-lg mx-auto">The AutoRevive difference that makes us your trusted choice</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-shield-halved', title: 'Verified Vehicles', desc: 'Every vehicle undergoes 150-point inspection before listing' },
              { icon: 'fa-eye', title: 'Full Transparency', desc: 'Real-time bidding with no hidden charges or fees' },
              { icon: 'fa-bolt', title: 'Fast & Simple', desc: 'Register in minutes and bid from anywhere, anytime' },
              { icon: 'fa-headset', title: '24/7 Support', desc: 'Dedicated support team available round the clock' },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${feature.icon} text-2xl text-orange-500`}></i>
                </div>
                <h3 className="font-semibold text-[#111111] text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LEADERSHIP ═══════ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">Leadership</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mt-3 mb-6">
                Meet Our Founder
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                With 15+ years in the automobile industry, our founder is the driving force 
                behind AutoRevive. A passion for excellence and an entrepreneurial spirit has 
                helped build a capable team that delivers outstanding performance day after day.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Experience', value: '15+ Years' },
                  { label: 'Team Size', value: '100+' },
                  { label: 'Customer Rating', value: '4.8/5' },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-3 bg-white rounded-xl border border-gray-200">
                    <p className="text-lg font-bold text-[#111111]">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="aspect-square bg-[#111111] rounded-2xl flex items-center justify-center">
                <i className="fas fa-user text-8xl text-white/20"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img src="/images/banner-car1.webp" alt="Premium vehicle" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 to-[#111111]/70"></div>
            </div>
            <div className="relative z-10 py-16 px-8 lg:px-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Join AutoRevive?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                Join thousands of buyers who found amazing deals through our platform. 
                Start your journey today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                >
                  Get Started <i className="fas fa-arrow-right text-sm"></i>
                </Link>
                <Link 
                  to="/auctions" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all hover:-translate-y-0.5"
                >
                  Browse Auctions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
