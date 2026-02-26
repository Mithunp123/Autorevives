import { useState, useEffect, useMemo } from 'react';
import { StatCard, DataTable, SearchFilter, StatusBadge, Pagination, PageLoader } from '@/components/ui';
import { featureService } from '@/services';
import { formatCurrency, formatDateTime, getImageUrls } from '@/utils';
import { useAuth } from '@/context';

const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  verifying: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  invalid: 'bg-red-100 text-red-700',
};

export default function Winnings() {
  const { isAdmin } = useAuth();
  const [winnings, setWinnings] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const fetchWinnings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (officeFilter) params.office_id = officeFilter;
      const { data } = await featureService.getWinnings(params);
      setWinnings(data.winnings || []);
      if (data.offices) setOffices(data.offices);
    } catch {
      console.error('Failed to load winnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWinnings(); }, [officeFilter]);

  const filtered = useMemo(() => winnings.filter((w) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return w.product_name?.toLowerCase().includes(s) ||
           w.winner_name?.toLowerCase().includes(s) ||
           w.office_name?.toLowerCase().includes(s);
  }), [winnings, search]);

  const totalAmount = useMemo(() => winnings.reduce((sum, w) => sum + Number(w.amount || 0), 0), [winnings]);
  const verifiedCount = useMemo(() => winnings.filter(w => w.payment_status === 'verified').length, [winnings]);
  const pendingCount = useMemo(() => winnings.filter(w => w.payment_status === 'pending' || w.payment_status === 'verifying').length, [winnings]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const columns = [
    { key: 'product_name', label: 'Vehicle', render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {row.product_image ? <img src={getFirstImage(row.product_image)} alt={row.product_name} className="w-full h-full object-cover" /> : <i className="fas fa-car text-sm text-slate-300"></i>}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{row.product_name}</p>
          <p className="text-xs text-slate-400">ID: #{row.product_id}</p>
        </div>
      </div>
    )},
    { key: 'winner_name', label: 'Winner', render: (_, row) => (
      <div>
        <p className="font-medium text-slate-800">{row.winner_name}</p>
        <p className="text-xs text-slate-400">{row.winner_email}</p>
        {row.winner_mobile && <p className="text-xs text-slate-400">{row.winner_mobile}</p>}
      </div>
    )},
    ...(isAdmin ? [{ key: 'office_name', label: 'Office', render: (val) => <span className="text-slate-500 font-medium">{val || '\u2014'}</span> }] : []),
    { key: 'amount', label: 'Winning Bid', render: (val) => <span className="font-bold text-accent">{formatCurrency(val)}</span> },
    { key: 'payment_status', label: 'Payment', render: (val) => (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${paymentStatusColors[val] || 'bg-gray-100 text-gray-500'}`}>
        {val || 'pending'}
      </span>
    )},
    { key: 'transaction_date', label: 'Won On', render: (val) => <span className="text-slate-400 text-xs font-medium">{formatDateTime(val)}</span> },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Auction Winners</h1>
          <p className="page-subtitle">{isAdmin ? 'All auction winners across offices' : 'Winners of your vehicle auctions'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon="fa-trophy" label="Total Winners" value={winnings.length} color="warning" />
        <StatCard icon="fa-indian-rupee-sign" label="Total Value" value={formatCurrency(totalAmount)} color="accent" />
        <StatCard icon="fa-circle-check" label="Payments Verified" value={verifiedCount} color="success" />
        <StatCard icon="fa-clock" label="Payments Pending" value={pendingCount} color="danger" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search winners..." />
        </div>
        {isAdmin && offices.length > 0 && (
          <select
            value={officeFilter}
            onChange={(e) => { setOfficeFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">All Offices</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.username} {o.finance_name ? `(${o.finance_name})` : ''}</option>
            ))}
          </select>
        )}
      </div>

      <DataTable columns={columns} data={paginated} emptyMessage="No winners yet" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
