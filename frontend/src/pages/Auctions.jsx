import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, DataTable, SearchFilter, StatusBadge, Pagination, Button, PageLoader } from '@/components/ui';
import { auctionService } from '@/services';
import { formatCurrency, formatDateTime, cn } from '@/utils';

export default function Auctions() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, []);

  const filtered = useMemo(() => auctions.filter((a) => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.office_name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  }), [auctions, search]);

  const totalBids = useMemo(() => auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0), [auctions]);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const columns = [
    { key: 'name', label: 'Vehicle', render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
          {row.image_path ? <img src={`/api/uploads/${row.image_path.replace('uploads/', '')}`} alt={row.name} className="w-full h-full object-cover rounded-xl" /> : <i className="fas fa-car text-sm text-slate-300"></i>}
        </div>
        <div><p className="font-semibold text-slate-900">{row.name}</p><p className="text-xs text-slate-400">{row.total_bids || 0} bids</p></div>
      </div>
    )},
    { key: 'office_name', label: 'Office', render: (val) => <span className="text-slate-500 font-medium">{val || '\u2014'}</span> },
    { key: 'status', label: 'Status', render: (val) => (<div className="flex items-center gap-1.5">{val === 'approved' && <span className="w-2 h-2 bg-success rounded-full animate-pulse-soft" />}<StatusBadge status={val} /></div>) },
    { key: 'starting_price', label: 'Starting Price', render: (val) => <span className="text-slate-400 text-sm font-medium">{formatCurrency(val)}</span> },
    { key: 'current_bid', label: 'Current Bid', render: (val) => <span className={val ? 'font-bold font-display text-accent' : 'text-slate-300'}>{val ? formatCurrency(val) : '\u2014'}</span> },
    { key: 'created_at', label: 'Listed', render: (val) => <span className="text-slate-400 text-xs font-medium">{formatDateTime(val)}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.id}`); }} className="btn-icon w-8 h-8" title="View details"><i className="fas fa-eye text-sm"></i></button>
      </div>
    )},
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header"><div><h1 className="page-title">Auctions</h1><p className="page-subtitle">Manage all vehicle auctions</p></div></div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="fa-gavel" label="Total Auctions" value={auctions.length} color="success" />
        <StatCard icon="fa-hand-holding-dollar" label="Total Bids" value={totalBids} color="accent" />
        <StatCard icon="fa-car" label="Listed Vehicles" value={filtered.length} color="warning" />
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search auctions..." />
      <DataTable columns={columns} data={paginated} onRowClick={(row) => navigate(`/vehicles/${row.id}`)} emptyMessage="No auctions found" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
