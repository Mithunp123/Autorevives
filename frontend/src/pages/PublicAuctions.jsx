import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auctionService, publicService } from '@/services';
import { getImageUrl, getImageUrls } from '@/utils';

// Helper to get first image URL from image_path (supports both single and multi-image)
const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

const INDIAN_STATES = [
  'All States','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

const BRANDS = ['All Brands', 'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra', 'Tata', 'Hero', 'TVS', 'Bajaj', 'Royal Enfield', 'Kia', 'Ford', 'Volkswagen', 'Other'];
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Electric', 'CNG'];
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹50,000', min: 0, max: 50000 },
  { label: '₹50,000 - ₹1 Lakh', min: 50000, max: 100000 },
  { label: '₹1 - 3 Lakh', min: 100000, max: 300000 },
  { label: '₹3 - 5 Lakh', min: 300000, max: 500000 },
  { label: '₹5 - 10 Lakh', min: 500000, max: 1000000 },
  { label: 'Above ₹10 Lakh', min: 1000000, max: Infinity },
];

/* Countdown Timer Component */
function Countdown({ hours }) {
  const [secs, setSecs] = useState(hours * 3600);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <span className="font-mono text-xs font-semibold">{h}:{m}:{s}</span>;
}

export default function PublicAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({ live_auctions: 0, pending_auctions: 0, closed_auctions: 0, two_wheeler: 0, three_wheeler: 0, four_wheeler: 0, commercial: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('live');
  const [stateFilter, setStateFilter] = useState('All States');
  const [catTab, setCatTab] = useState('all');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    publicService.getHomeData()
      .then(({ data }) => { if (data.stats) setStats(data.stats); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await auctionService.getAll({ search, status: filter === 'all' ? '' : filter, page });
        setAuctions(data.auctions || []);
        setTotal(data.total || 0);
      } catch {
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, filter, page]);

  const formatPrice = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  /* Client-side category + state + brand + fuel + price filter */
  const displayed = auctions.filter(a => {
    // State filter
    if (stateFilter !== 'All States' && a.state && a.state !== stateFilter) return false;
    
    // Category filter
    if (catTab !== 'all') {
      const c = (a.category || '').toLowerCase();
      const n = (a.name || '').toLowerCase();
      switch (catTab) {
        case '2W': if (!(c === '2w' || /bike|motorcycle|scooter|bullet|activa|pulsar|splendor|hero|yamaha|tvs|bajaj|ktm/.test(n))) return false; break;
        case '3W': if (!(c === '3w' || /auto|rickshaw|three.?wheel|ape/.test(n))) return false; break;
        case '4W': if (!(c === '4w' || /car|suv|sedan|hatchback|jeep|swift|fortuner|creta|nexon|brezza|innova|alto|i20|ertiga/.test(n))) return false; break;
        case 'CV': if (!(c === 'commercial' || /truck|bus|tempo|van|lorry|tractor|tipper|bolero|pickup/.test(n))) return false; break;
      }
    }
    
    // Brand filter
    if (brandFilter !== 'All Brands') {
      const n = (a.name || '').toLowerCase();
      if (!n.includes(brandFilter.toLowerCase())) return false;
    }
    
    // Price filter
    const p = PRICE_RANGES[priceRange];
    const price = a.starting_price || 0;
    if (price < p.min || price >= p.max) return false;
    
    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setFilter('live');
    setStateFilter('All States');
    setCatTab('all');
    setBrandFilter('All Brands');
    setFuelFilter('All');
    setPriceRange(0);
  };

  const activeFilterCount = [
    stateFilter !== 'All States',
    catTab !== 'all',
    brandFilter !== 'All Brands',
    fuelFilter !== 'All',
    priceRange !== 0,
  ].filter(Boolean).length;

  /* Filter Sidebar Component */
  const FilterSidebar = ({ mobile }) => (
    <div className={mobile ? '' : 'sticky top-24'}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#111111]">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Clear all
            </button>
          )}
        </div>
        
        {/* Category */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-[#111111] mb-3">Vehicle Type</h4>
          <div className="space-y-2">
            {[
              { k: 'all', label: 'All Vehicles', icon: 'fa-layer-group' },
              { k: '2W', label: '2 Wheeler', icon: 'fa-motorcycle' },
              { k: '3W', label: '3 Wheeler', icon: 'fa-truck-pickup' },
              { k: '4W', label: '4 Wheeler', icon: 'fa-car' },
              { k: 'CV', label: 'Commercial', icon: 'fa-truck' },
            ].map(cat => (
              <button
                key={cat.k}
                onClick={() => setCatTab(cat.k)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  catTab === cat.k
                    ? 'bg-[#111111] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`fas ${cat.icon} w-4`}></i>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-[#111111] mb-3">Price Range</h4>
          <div className="space-y-2">
            {PRICE_RANGES.map((range, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === idx}
                  onChange={() => setPriceRange(idx)}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                />
                <span className={`text-sm ${priceRange === idx ? 'text-[#111111] font-medium' : 'text-gray-600'}`}>
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-[#111111] mb-3">Brand</h4>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 outline-none"
          >
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Location */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-[#111111] mb-3">Location</h4>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 outline-none"
          >
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Fuel Type */}
        <div className="p-5">
          <h4 className="text-sm font-semibold text-[#111111] mb-3">Fuel Type</h4>
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map(fuel => (
              <button
                key={fuel}
                onClick={() => setFuelFilter(fuel)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  fuelFilter === fuel
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Vehicle Auctions — AutoRevive</title>
        <meta name="description" content="Browse and bid on verified pre-owned vehicles from top finance companies across India on AutoRevive." />
      </Helmet>

      {/* ═══════ PAGE HEADER ═══════ */}
      <section className="bg-white border-b border-gray-200 py-8 lg:py-10">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-2">Vehicle Auctions</h1>
              <p className="text-gray-500">Browse and bid on verified vehicles from top finance companies</p>
            </div>
            
            {/* Stats Pills */}
            <div className="flex items-center gap-4">
              {[
                { label: 'Live', val: stats.live_auctions, color: 'bg-red-500' },
                { label: 'Upcoming', val: stats.pending_auctions, color: 'bg-orange-400' },
                { label: 'Closed', val: stats.closed_auctions, color: 'bg-gray-400' },
              ].map(st => (
                <div key={st.label} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <span className={`w-2 h-2 ${st.color} rounded-full ${st.label === 'Live' ? 'animate-pulse' : ''}`}></span>
                  <span className="text-lg font-bold text-[#111111]">{(st.val || 0).toLocaleString('en-IN')}</span>
                  <span className="text-sm text-gray-500">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        {/* ═══════ SEARCH & TABS BAR ═══════ */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text" 
              placeholder="Search by vehicle name, model, or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-white border border-gray-200 text-[#111111] text-sm rounded-lg focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 pl-11 pr-4 outline-none transition-all"
            />
          </div>
          
          {/* Status Tabs */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            {[
              { k: 'live', label: 'Live', icon: 'fa-bolt' },
              { k: 'upcoming', label: 'Upcoming', icon: 'fa-clock' },
              { k: 'all', label: 'All', icon: 'fa-layer-group' },
            ].map(tab => (
              <button
                key={tab.k}
                onClick={() => setFilter(tab.k)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  filter === tab.k
                    ? 'bg-[#111111] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`fas ${tab.icon} text-xs`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 h-12 px-5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700"
          >
            <i className="fas fa-sliders"></i>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <div className="flex gap-8">
          {/* ── SIDEBAR FILTERS (Desktop) ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar mobile={false} />
          </aside>

          {/* ── VEHICLE GRID ── */}
          <main className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-[#111111]">{displayed.length}</span> vehicles
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium lg:hidden">
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <i className="fas fa-car text-3xl text-gray-300"></i>
                </div>
                <h3 className="text-xl font-semibold text-[#111111] mb-2">No Vehicles Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  We couldn't find vehicles matching your filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#222] text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <i className="fas fa-rotate-left text-xs"></i> Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Vehicle Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayed.map((a, idx) => {
                    const cat = (a.category || '').toUpperCase();
                    const nm = (a.name || '').toLowerCase();
                    let catLabel = cat || '4W';
                    if (!cat) {
                      if (/bike|motorcycle|scooter|bullet|activa|pulsar|splendor|hero|yamaha|tvs|bajaj|ktm/.test(nm)) catLabel = '2W';
                      else if (/auto|rickshaw|three.?wheel|ape|tuk/.test(nm)) catLabel = '3W';
                      else if (/truck|bus|tempo|van|lorry|tractor|tipper|bolero|pickup|jcb|excavat/.test(nm)) catLabel = 'CV';
                      else catLabel = '4W';
                    }
                    
                    return (
                      <Link
                        key={a.id}
                        to={`/auctions/${a.id}`}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          {a.image_path ? (
                            <img
                              src={getFirstImage(a.image_path)}
                              alt={a.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading={idx < 6 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-car text-4xl text-gray-300"></i>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                              LIVE
                            </span>
                          </div>
                          
                          {/* Timer */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 bg-[#111111]/80 backdrop-blur-sm text-white text-xs rounded-full">
                              <i className="far fa-clock mr-1"></i>
                              <Countdown hours={2 + (idx % 5)} />
                            </span>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#111111] text-xs font-semibold rounded-full">
                              {catLabel}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-semibold text-[#111111] text-lg mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {a.name || 'Vehicle'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                            <i className="fas fa-map-marker-alt text-xs text-gray-400"></i>
                            {a.location || 'India'}{a.state ? `, ${a.state}` : ''}
                          </p>

                          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Current Bid</p>
                              <p className="text-xl font-bold text-[#111111]">
                                {formatPrice((a.current_bid || 0) > 0 ? a.current_bid : a.starting_price)}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-orange-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                              Bid Now <i className="fas fa-arrow-right text-xs"></i>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {total > 20 && (
                  <div className="flex justify-center items-center gap-3 mt-10">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <i className="fas fa-chevron-left text-xs"></i> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                      Page <span className="font-bold text-[#111111]">{page}</span> of{' '}
                      <span className="font-bold text-[#111111]">{Math.ceil(total / 20)}</span>
                    </span>
                    <button
                      disabled={page >= Math.ceil(total / 20)}
                      onClick={() => setPage(page + 1)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ═══════ MOBILE FILTER DRAWER ═══════ */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] bg-gray-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-[#111111]">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar mobile={true} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#111111] text-white font-semibold rounded-lg"
              >
                Show {displayed.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
