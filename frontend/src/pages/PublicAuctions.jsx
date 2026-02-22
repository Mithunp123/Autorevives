import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionService } from '@/services';

export default function PublicAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-charcoal via-navy to-steel text-white py-12 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-2">Live Auctions</h1>
        <p className="text-white/80 max-w-xl mx-auto">
          Browse and bid on premium vehicles from our verified sellers. Start bidding now!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-300"></i>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            />
          </div>
          <div className="relative sm:w-48">
            <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-300"></i>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none appearance-none"
            >
              <option value="all">All Auctions</option>
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <i className="fas fa-gavel text-4xl text-slate-200 mb-3"></i>
            <p className="text-slate-400">No auctions found</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((a) => (
                <div key={a.id} className="card rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-slate-100">
                    {a.image_path ? (
                      <img
                        src={`/api/uploads/${a.image_path.replace('uploads/', '')}`}
                        alt={a.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center absolute inset-0 bg-slate-100 ${a.image_path ? 'hidden' : 'flex'}`}>
                      <i className="fas fa-car text-4xl text-slate-200"></i>
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-900">
                      {a.status || 'Live'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-1 truncate">{a.name || 'Vehicle Name'}</h3>
                    <p className="text-xs text-slate-300 mb-4 line-clamp-2">{a.description || 'No description'}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Base Price:</span>
                        <span className="font-semibold text-slate-900">{formatPrice(a.starting_price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Current Bid:</span>
                        <span className="font-bold text-accent">{formatPrice(a.current_bid || a.starting_price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-gavel text-[10px]"></i>
                          {a.total_bids || 0} bids
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-building text-[10px]"></i>
                          {a.office_name || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/public/auctions/${a.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-primary-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-button hover:shadow-glow transition"
                    >
                      <i className="fas fa-eye text-xs"></i>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
