import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicService } from '@/services';
import { getImageUrl, getImageUrls } from '@/utils';

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

// Helper to get first image URL from image_path (supports both single and multi-image)
const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

const heroVehicles = [
  { image: '/images/banner-car1.webp', label: 'Premium Cars' },
  { image: '/images/banner-car2.webp', label: 'Luxury SUVs' },
  { image: '/images/banner-eicher.webp', label: 'Commercial Vehicles' },
  { image: '/images/hero-bike-transparent.webp', label: 'Two Wheelers' },
];

export default function Home() {
  const [data, setData] = useState({ products: [], stats: {}, plans: [] });
  const [loading, setLoading] = useState(true);
  const [activeHero, setActiveHero] = useState(0);
  const location = useLocation();

  useEffect(() => {
    publicService.getHomeData()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroVehicles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const s = data.stats || {};
  const products = data.products || [];

  return (
    <>
      <Helmet>
        <title>AutoRevive — Premium Vehicle Auctions in India</title>
        <meta name="description" content="India's trusted vehicle auction marketplace. Bid on verified cars, bikes and commercial vehicles." />
      </Helmet>

      {/* HERO - Clean, High-Contrast Design */}
      <section className="relative min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-center bg-[#04080F] overflow-hidden">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0">
          {heroVehicles.map((vehicle, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === activeHero ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={vehicle.image} 
                alt={vehicle.label}
                className="w-full h-full object-cover opacity-60 sm:opacity-80"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16 sm:pt-20 pb-12 sm:pb-20">
          <div className="max-w-2xl">
            
            {/* Top Left Progress Bars */}
            <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
              {heroVehicles.map((vehicle, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHero(idx)}
                  className="group relative h-1 sm:h-1.5 w-10 sm:w-16 rounded-full overflow-hidden bg-white/20 hover:bg-white/30 transition-all"
                  aria-label={vehicle.label}
                >
                  <span 
                    className={`absolute inset-0 bg-gold-500 transition-all duration-500 ${
                      idx === activeHero ? 'w-full' : 'w-0'
                    }`}
                  ></span>
                </button>
              ))}
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-3 sm:mb-6 tracking-tight drop-shadow-2xl">
              <span className="block text-lg sm:text-3xl md:text-4xl font-bold text-gold-500 mb-1 sm:mb-2">{heroVehicles[activeHero].label}</span>
              Premium Vehicle Auctions
            </h1>
            
            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-lg md:text-xl font-medium mb-6 sm:mb-10 leading-relaxed max-w-xl drop-shadow-md">
              Bank-verified repossessed vehicles. Transparent process.<br/>
              Save up to <span className="text-gold-400 font-bold">40%</span> below market value.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-16">
              <Link 
                to="/auctions"
                className="group px-5 sm:px-8 py-3 sm:py-4 bg-gold-600 hover:bg-gold-700 text-white text-sm sm:text-base font-bold rounded-full transition-all hover:shadow-xl hover:shadow-gold-600/20 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Browse Live Auctions</span>
                <i className="fas fa-arrow-right text-xs sm:text-sm group-hover:translate-x-1 transition-transform"></i>
              </Link>

              <Link 
                to="/register"
                className="px-5 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm sm:text-base font-bold rounded-full transition-all backdrop-blur-md"
              >
                Register Free
              </Link>
            </div>

            {/* Quick Stats - Minimalist */}
            <div className="flex items-center gap-6 sm:gap-12 border-t border-white/10 pt-5 sm:pt-8">
              <div>
                <div className="text-xl sm:text-3xl font-extrabold text-white">{s.total_users || '5000'}+</div>
                <div className="text-[10px] sm:text-sm text-gray-400 font-medium uppercase tracking-wide mt-0.5 sm:mt-1">Buyers</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-extrabold text-white">{s.live_auctions || '150'}+</div>
                <div className="text-[10px] sm:text-sm text-gray-400 font-medium uppercase tracking-wide mt-0.5 sm:mt-1">Auctions</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-extrabold text-white">100%</div>
                <div className="text-[10px] sm:text-sm text-gray-400 font-medium uppercase tracking-wide mt-0.5 sm:mt-1">Verified</div>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* VEHICLE CATEGORIES - Using Real Images */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
            <p className="text-gray-500">Find the right vehicle type for your needs</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <Link to="/auctions" className="group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img 
                  src="/images/hero-bike-transparent.webp" 
                  alt="Two Wheelers" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white/80 text-sm">{s.two_wheeler || 0} vehicles</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">2 Wheelers</h3>
            </Link>
            
            <Link to="/auctions" className="group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img 
                  src="/images/banner-auto.webp" 
                  alt="Three Wheelers" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white/80 text-sm">{s.three_wheeler || 0} vehicles</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">3 Wheelers</h3>
            </Link>
            
            <Link to="/auctions" className="group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img 
                  src="/images/banner-car2.webp" 
                  alt="Four Wheelers" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white/80 text-sm">{s.four_wheeler || 0} vehicles</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">4 Wheelers</h3>
            </Link>
            
            <Link to="/auctions" className="group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img 
                  src="/images/banner-eicher.webp" 
                  alt="Commercial Vehicles" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white/80 text-sm">{s.commercial || 0} vehicles</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">Commercial</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE AUCTIONS */}
      <section id="auctions" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Live Auctions</h2>
              <p className="text-gray-500">Bid on verified vehicles from trusted sources</p>
            </div>
            <Link to="/auctions" className="text-gold-600 font-medium hover:text-gold-700 hidden sm:flex items-center gap-2">
              View All <i className="fas fa-arrow-right text-sm"></i>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-gray-500">No active auctions. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((p) => (
                <Link 
                  key={p.id} 
                  to={`/auctions/${p.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {p.image_path ? (
                      <img 
                        src={getFirstImage(p.image_path)} 
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-vehicle.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      LIVE
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{p.location || 'India'}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Current Bid</p>
                        <p className="text-lg font-bold text-gray-900">
                          {fmt((p.current_bid || 0) > 0 ? p.current_bid : p.starting_price)}
                        </p>
                      </div>
                      <span className="text-gold-600 font-medium text-sm">Bid Now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="sm:hidden text-center mt-8">
            <Link to="/auctions" className="text-gold-600 font-medium">View All Auctions →</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Get started in 4 simple steps</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Register', desc: 'Create your free account with basic details' },
              { num: '2', title: 'Browse', desc: 'Explore verified vehicles with full details' },
              { num: '3', title: 'Bid', desc: 'Place your bid and track in real-time' },
              { num: '4', title: 'Win', desc: 'Complete payment and collect your vehicle' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gold-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: s.live_auctions || '0', label: 'Active Auctions' },
              { value: s.total_users || '0', label: 'Registered Users' },
              { value: '100+', label: 'Cities Covered' },
              { value: '50+', label: 'Bank Partners' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Choose AutoRevive</h2>
            <p className="text-gray-500">Your trusted partner for vehicle auctions</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'fa-shield-halved', title: 'Verified Vehicles', desc: 'Every vehicle undergoes thorough inspection before listing' },
              { icon: 'fa-hand-holding-dollar', title: 'Best Prices', desc: 'Save up to 40% compared to market prices' },
              { icon: 'fa-file-contract', title: 'Clear Documentation', desc: 'Complete RC transfer and NOC assistance included' },
              { icon: 'fa-clock', title: 'Quick Process', desc: 'Win today, collect within 7 days' },
              { icon: 'fa-headset', title: 'Dedicated Support', desc: '24/7 customer support for all queries' },
              { icon: 'fa-lock', title: 'Secure Payments', desc: 'End-to-end encrypted payment processing' },
            ].map((item) => (
              <div key={item.title} className="p-6 border border-gray-200 rounded-xl hover:border-gold-200 transition-colors">
                <i className={`fas ${item.icon} text-2xl text-gold-500 mb-4`}></i>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Vehicle?
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of buyers who found great deals on AutoRevive
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/auctions" 
              className="px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors"
            >
              Explore Auctions
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              Register Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
