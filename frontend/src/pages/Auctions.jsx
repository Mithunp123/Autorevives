import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, DataTable, SearchFilter, StatusBadge, Pagination, Button, PageLoader } from '@/components/ui';
import { auctionService } from '@/services';
import api from '@/services/api';
import { formatCurrency, formatDateTime, cn, getImageUrl, getImageUrls } from '@/utils';
import { useAuth } from '@/context';
import toast from 'react-hot-toast';

// Helper to get first image URL from image_path (supports both single and multi-image)
const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

export default function Auctions() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const { data } = await auctionService.getAll();
      setAuctions(data.auctions || []);
    } catch {
      console.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuctions(); }, []);

  const handleCloseAuction = async (e, vehicleId) => {
    e.stopPropagation();
    if (!window.confirm('Close this auction? The highest bidder will be declared the winner.')) return;
    try {
      const res = await api.patch(`/vehicles/${vehicleId}/close`);
      toast.success(res.data.message || 'Auction closed!');
      fetchAuctions(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close');
    }
  };

  const handleReopenAuction = async (e, vehicleId) => {
    e.stopPropagation();
    if (!window.confirm('Reopen this auction for bidding?')) return;
    try {
      const res = await api.patch(`/vehicles/${vehicleId}/reopen`);
      toast.success(res.data.message || 'Auction reopened!');
      fetchAuctions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reopen');
    }
  };

  const filtered = useMemo(() => auctions.filter((a) => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.office_name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  }), [auctions, search]);

  const totalBids = useMemo(() => auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0), [auctions]);
  const activeCount = useMemo(() => auctions.filter(a => a.is_active !== 0 && a.is_active !== false).length, [auctions]);
  const closedCount = useMemo(() => auctions.filter(a => a.is_active === 0 || a.is_active === false).length, [auctions]);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const columns = [
    { key: 'name', label: 'Vehicle', render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
          {row.image_path ? <img src={getFirstImage(row.image_path)} alt={row.name} className="w-full h-full object-cover rounded-xl" /> : <i className="fas fa-car text-sm text-slate-300"></i>}
        </div>
        <div><p className="font-semibold text-slate-900">{row.name}</p><p className="text-xs text-slate-400">{row.total_bids || 0} bids</p></div>
      </div>
    )},
    { key: 'office_name', label: 'Office', render: (val) => <span className="text-slate-500 font-medium">{val || '\u2014'}</span> },
    { key: 'is_active', label: 'Bidding', render: (val) => (
      val === 0 || val === false ? (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">
          <i className="fas fa-lock text-[10px]"></i> Closed
        </span>
      ) : (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600 flex items-center gap-1 w-fit">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
        </span>
      )
    )},
    { key: 'starting_price', label: 'Starting Price', render: (val) => <span className="text-slate-400 text-sm font-medium">{formatCurrency(val)}</span> },
    { key: 'current_bid', label: 'Current Bid', render: (val) => <span className={val ? 'font-bold font-display text-accent' : 'text-slate-300'}>{val ? formatCurrency(val) : '\u2014'}</span> },
    { key: 'created_at', label: 'Listed', render: (val) => <span className="text-slate-400 text-xs font-medium">{formatDateTime(val)}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => {
      const closed = row.is_active === 0 || row.is_active === false;
      return (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.id}`); }} className="btn-icon w-8 h-8" title="View details"><i className="fas fa-eye text-sm"></i></button>
          {closed ? (
            isAdmin && (
              <button onClick={(e) => handleReopenAuction(e, row.id)} className="btn-icon w-8 h-8 text-green-600 hover:bg-green-50" title="Reopen auction">
                <i className="fas fa-lock-open text-sm"></i>
              </button>
            )
          ) : (
            <button onClick={(e) => handleCloseAuction(e, row.id)} className="btn-icon w-8 h-8 text-red-500 hover:bg-red-50" title="Close auction">
              <i className="fas fa-ban text-sm"></i>
            </button>
          )}
        </div>
      );
    }},
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Auctions</h1>
          <p className="page-subtitle">Manage all vehicle auctions</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon="fa-gavel" label="Total Auctions" value={auctions.length} color="success" />
        <StatCard icon="fa-hand-holding-dollar" label="Total Bids" value={totalBids} color="accent" />
        <StatCard icon="fa-signal" label="Live" value={activeCount} color="warning" />
        <StatCard icon="fa-lock" label="Closed" value={closedCount} color="danger" />
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search auctions..." />
      <DataTable columns={columns} data={paginated} onRowClick={(row) => navigate(`/vehicles/${row.id}`)} emptyMessage="No auctions found" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
