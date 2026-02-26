import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auctionService, publicService } from '@/services';
import { getImageUrls } from '@/utils';

const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

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

const CATEGORY_TABS = [
  { k: 'all', label: 'All', icon: 'fa-layer-group' },
  { k: '2W', label: '2W', icon: 'fa-motorcycle' },
  { k: '3W', label: '3W', icon: 'fa-truck-pickup' },
  { k: '4W', label: '4W', icon: 'fa-car' },
  { k: 'CV', label: 'Commercial', icon: 'fa-truck' },
];

const STATUS_TABS = [
  { k: 'live', label: 'Live', icon: 'fa-bolt' },
  { k: 'closed', label: 'Closed', icon: 'fa-lock' },
];

export default function PublicAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({ live_auctions: 0, closed_auctions: 0, two_wheeler: 0, three_wheeler: 0, four_wheeler: 0, commercial: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('live');
  const [catTab, setCatTab] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    publicService.getHomeData()
      .then(({ data }) => { if (data.stats) setStats(data.stats); })
      .catch(() => { });
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

  /* Client-side category filter */
  const displayed = auctions.filter(a => {
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
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20 lg:pb-0">
      <Helmet>
        <title>Vehicle Auctions — AutoRevive</title>
        <meta name="description" content="Browse and bid on verified pre-owned vehicles from top finance companies across India on AutoRevive." />
      </Helmet>

      {/* ═══════ PAGE HEADER ═══════ */}
      <section className="bg-white border-b border-gray-200 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-[#0B1628] mb-1 sm:mb-2">Vehicle Auctions</h1>
              <p className="text-sm sm:text-base text-gray-500">Browse and bid on verified vehicles</p>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {[
                { label: 'Live', val: stats.live_auctions, color: 'bg-red-500' },
                { label: 'Closed', val: stats.closed_auctions, color: 'bg-gray-400' },
              ].map(st => (
                <div key={st.label} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
                  <span className={`w-2 h-2 ${st.color} rounded-full ${st.label === 'Live' ? 'animate-pulse' : ''}`}></span>
                  <span className="text-sm sm:text-lg font-bold text-[#0B1628]">{(st.val || 0).toLocaleString('en-IN')}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* ═══════ SEARCH + FILTERS ═══════ */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-magnifying-glass absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 sm:h-12 bg-white border border-gray-200 text-[#0B1628] text-sm rounded-lg focus:border-[#0B1628] focus:ring-1 focus:ring-[#0B1628]/10 pl-9 sm:pl-11 pr-4 outline-none transition-all"
            />
          </div>

          {/* Status Tabs + Category Tabs — single horizontal row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Status Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.k}
                  onClick={() => { setFilter(tab.k); setPage(1); }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${filter === tab.k
                      ? 'bg-[#0B1628] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <i className={`fas ${tab.icon} text-xs`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 overflow-x-auto flex-1">
              {CATEGORY_TABS.map(cat => (
                <button
                  key={cat.k}
                  onClick={() => setCatTab(cat.k)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${catTab === cat.k
                      ? 'bg-gold-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <i className={`fas ${cat.icon} text-xs`}></i>
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.k === 'CV' ? 'CV' : cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ RESULTS ═══════ */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing <span className="font-semibold text-[#0B1628]">{displayed.length}</span> vehicles
          </p>
          {catTab !== 'all' && (
            <button onClick={() => setCatTab('all')} className="text-xs sm:text-sm text-gold-600 hover:text-gold-700 font-medium">
              Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <i className="fas fa-car text-2xl sm:text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#0B1628] mb-2">No Vehicles Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 sm:mb-6">
              We couldn't find vehicles matching your criteria.
            </p>
            <button
              onClick={() => { setCatTab('all'); setFilter('live'); setSearch(''); }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#0B1628] hover:bg-[#222] text-white text-xs sm:text-sm font-semibold rounded-lg transition-all"
            >
              <i className="fas fa-rotate-left text-xs"></i> Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Vehicle Cards Grid — 2 cols mobile, 3 cols desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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

                const isLive = a.is_active;

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
                          <i className="fas fa-car text-3xl sm:text-4xl text-gray-300"></i>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center gap-1 sm:gap-1.5 ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}>
                          {isLive && <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></span>}
                          {isLive ? 'LIVE' : 'CLOSED'}
                        </span>
                      </div>

                      {/* Timer */}
                      {isLive && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0B1628]/80 backdrop-blur-sm text-white text-[10px] sm:text-xs rounded-full">
                            <i className="far fa-clock mr-0.5 sm:mr-1"></i>
                            <Countdown hours={2 + (idx % 5)} />
                          </span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm text-[#0B1628] text-[10px] sm:text-xs font-semibold rounded-full">
                          {catLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2.5 sm:p-5">
                      <h3 className="font-semibold text-[#0B1628] text-sm sm:text-lg mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-gold-600 transition-colors">
                        {a.name || 'Vehicle'}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-4 flex items-center gap-1 sm:gap-1.5">
                        <i className="fas fa-map-marker-alt text-[10px] sm:text-xs text-gray-400"></i>
                        <span className="truncate">{a.location || 'India'}{a.state ? `, ${a.state}` : ''}</span>
                      </p>

                      <div className="flex items-end justify-between pt-2 sm:pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-[9px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Current Bid</p>
                          <p className="text-sm sm:text-xl font-bold text-[#0B1628]">
                            {formatPrice((a.current_bid || 0) > 0 ? a.current_bid : a.starting_price)}
                          </p>
                        </div>
                        <span className="text-[10px] sm:text-sm font-medium text-gold-600 flex items-center gap-1 sm:gap-1.5 group-hover:gap-2 transition-all">
                          <span className="hidden sm:inline">Bid Now</span> <i className="fas fa-arrow-right text-[10px] sm:text-xs"></i>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-chevron-left text-[10px] sm:text-xs"></i> <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-500 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200">
                  <span className="font-bold text-[#0B1628]">{page}</span> / <span className="font-bold text-[#0B1628]">{Math.ceil(total / 20)}</span>
                </span>
                <button
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="hidden sm:inline">Next</span> <i className="fas fa-chevron-right text-[10px] sm:text-xs"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
