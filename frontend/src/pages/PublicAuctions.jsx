import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auctionService, publicService } from '@/services';

const INDIAN_STATES = [
  'All States','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

export default function PublicAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({ live_auctions: 0, pending_auctions: 0, closed_auctions: 0, two_wheeler: 0, three_wheeler: 0, four_wheeler: 0, commercial: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('All States');
  const [catTab, setCatTab] = useState('all');
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

  /* Client-side category + state filter */
  const displayed = auctions.filter(a => {
    if (stateFilter !== 'All States' && a.state && a.state !== stateFilter) return false;
    if (catTab === 'all') return true;
    const c = (a.category || '').toLowerCase();
    const n = (a.name || '').toLowerCase();
    switch (catTab) {
      case '2W': return c === '2w' || /bike|motorcycle|scooter|bullet|activa|pulsar|splendor|hero|yamaha|tvs|bajaj|ktm/.test(n);
      case '3W': return c === '3w' || /auto|rickshaw|three.?wheel|ape/.test(n);
      case '4W': return c === '4w' || /car|suv|sedan|hatchback|jeep|swift|fortuner|creta|nexon|brezza|innova|alto|i20|ertiga/.test(n);
      case 'CV': return c === 'commercial' || /truck|bus|tempo|van|lorry|tractor|tipper|bolero|pickup/.test(n);
      default: return true;
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Helmet>
        <title>Vehicle Auctions - AutoRevive</title>
        <meta name="description" content="Browse and bid on verified pre-owned vehicles from top finance companies across India on AutoRevive." />
      </Helmet>

      {/* ═══ Page Header ═══ */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Vehicle Auctions</h1>
          <p className="text-slate-400 text-lg max-w-2xl">Browse and bid on verified vehicles from top finance companies across India.</p>
        </div>
      </div>

      {/* ═══ Inventory Stats Bar ═══ */}
      <section className="-mt-8 mb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { fa: 'fa-solid fa-signal', label: 'LIVE INVENTORY', val: stats.live_auctions, bg: 'bg-white', border: 'border-blue-100', ic: 'text-blue-500', shadow: 'shadow-lg shadow-blue-500/10' },
              { fa: 'fa-solid fa-clock', label: 'UPCOMING INVENTORY', val: stats.pending_auctions, bg: 'bg-white', border: 'border-slate-200', ic: 'text-slate-400', shadow: 'shadow-md' },
              { fa: 'fa-solid fa-circle-check', label: 'CLOSED INVENTORY', val: stats.closed_auctions, bg: 'bg-white', border: 'border-slate-200', ic: 'text-slate-400', shadow: 'shadow-md' },
              { fa: 'fa-solid fa-star', label: 'EXCLUSIVE INVENTORY', val: 0, bg: 'bg-white', border: 'border-amber-100', ic: 'text-amber-500', shadow: 'shadow-md' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-5 flex items-center gap-4 ${s.shadow} transition-transform hover:-translate-y-1`}>
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100`}><i className={`${s.fa} ${s.ic} text-xl`}></i></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{(s.val || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ═══ Tab bar: Live / Upcoming ═══ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === 'all' || filter === 'live' ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                {(filter === 'all' || filter === 'live') && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${filter === 'all' || filter === 'live' ? 'bg-red-500' : 'bg-slate-300'}`}></span>
              </span>
              LIVE
              <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${filter === 'all' || filter === 'live' ? 'bg-red-100' : 'bg-slate-100'}`}>{stats.live_auctions}</span>
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === 'upcoming' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="fas fa-clock text-slate-400"></i>
              Upcoming
              <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${filter === 'upcoming' ? 'bg-white/20' : 'bg-slate-100'}`}>{stats.pending_auctions}</span>
            </button>
          </div>
        </div>

        {/* ═══ Category pills ═══ */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          <button onClick={() => setCatTab('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              catTab === 'all' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}>
            <span>All Vehicles</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${catTab === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>{auctions.length}</span>
          </button>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          {[
            { k: '2W', fa: 'fa-motorcycle', label: '2 Wheeler', c: stats.two_wheeler },
            { k: '3W', fa: 'fa-truck-pickup', label: '3 Wheeler', c: stats.three_wheeler },
            { k: '4W', fa: 'fa-car', label: '4 Wheeler', c: stats.four_wheeler },
            { k: 'CV', fa: 'fa-truck', label: 'Commercial', c: stats.commercial },
          ].map(t => (
            <button key={t.k} onClick={() => setCatTab(catTab === t.k ? 'all' : t.k)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                catTab === t.k 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              <i className={`fas ${t.fa} ${catTab === t.k ? 'text-white/70' : 'text-slate-400'}`}></i>
              <span>{t.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${catTab === t.k ? 'bg-white/20' : 'bg-slate-100'}`}>{t.c}</span>
            </button>
          ))}
        </div>

        {/* ═══ Filters ═══ */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text" placeholder="Search by vehicle name, ID, or location..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search auctions"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] block pl-11 pr-4 py-3 transition-all"
            />
          </div>
          <div className="relative sm:w-64">
            <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
              aria-label="Filter by state"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] block pl-11 pr-10 py-3 transition-all appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ═══ Content ═══ */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 border-4 border-[#4285F4]/20 border-t-[#4285F4] rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4 font-medium">Loading auctions...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-gavel text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No auctions found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any vehicles matching your current filters. Please try adjusting your search criteria.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); setStateFilter('All States'); setCatTab('all'); }} className="mt-6 btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* ═══ Auction Table ═══ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="font-bold px-3 sm:px-6 py-4">Vehicle Details</th>
                      <th className="font-bold px-3 sm:px-6 py-4 text-center">Category</th>
                      <th className="font-bold px-3 sm:px-6 py-4 hidden md:table-cell">Location</th>
                      <th className="font-bold px-3 sm:px-6 py-4 text-right">Base Price</th>
                      <th className="font-bold px-3 sm:px-6 py-4 text-right hidden sm:table-cell">Current Bid</th>
                      <th className="font-bold px-3 sm:px-6 py-4 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayed.map((a) => {
                      const cat = (a.category || '').toUpperCase();
                      const nm = (a.name || '').toLowerCase();
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
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                              {a.image_path ? (
                                <img src={`/api/uploads/${a.image_path.replace('uploads/', '')}`} alt={a.name} width={64} height={48} loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                              ) : null}
                              <div className={`w-full h-full items-center justify-center ${a.image_path ? 'hidden' : 'flex'}`}>
                                <i className="fas fa-car text-lg text-slate-300"></i>
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#4285F4] transition-colors">{a.name || 'Vehicle'}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ID: {a.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${catColors[catLabel] || catColors['4W']}`}>
                            {catLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-slate-600">
                            <i className="fas fa-map-marker-alt text-slate-400"></i>
                            <span className="text-sm font-medium">{a.location || 'All'}, {a.display_state || a.state || 'Tamil Nadu'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-slate-900">{formatPrice(a.starting_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-sm font-bold text-[#3367D6]">{formatPrice(a.current_bid || a.starting_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/public/auctions/${a.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:border-[#4285F4] hover:bg-blue-50 text-[#4285F4] text-sm font-bold rounded-xl transition-all shadow-sm group-hover:shadow">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                  <i className="fas fa-chevron-left text-xs"></i> Previous
                </button>
                <span className="text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{Math.ceil(total / 20)}</span>
                </span>
                <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                  Next <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ Why Buy Section ═══ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Buy From Autorevive?</h2>
            <p className="text-lg text-slate-600">Experience a transparent, efficient, and secure vehicle auction platform designed for buyers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { fa: 'fa-solid fa-eye', title: 'View Before You Bid', desc: 'Browse through a wide range of vehicles with detailed inspection reports to make your right bid.' },
              { fa: 'fa-solid fa-warehouse', title: 'Large Inventory', desc: 'Look for a vehicle for your specific choice and budget from our extensive nationwide collection.' },
              { fa: 'fa-solid fa-bullseye', title: 'Great Deals', desc: 'Get the right vehicle for a fair price leaving you satisfied with transparent bidding.' },
              { fa: 'fa-solid fa-calendar-day', title: 'Daily Auctions', desc: 'Instant access in real time to all offers from sellers with new vehicles added daily.' },
            ].map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-[#4285F4]/30 hover:shadow-lg hover:shadow-[#4285F4]/5 transition-all group">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                  <i className={`${f.fa} text-[#4285F4] text-xl`}></i>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">{f.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
