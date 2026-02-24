import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  SearchFilter,
  StatusBadge,
  Pagination,
  Button,
  PageLoader,
} from '@/components/ui';
import { officeService } from '@/services';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Finance() {
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Detail view
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officeDetail, setOfficeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await import('@/services/api').then(m => m.default.get('/offices/finance-summary'));
        setOffices(res.data.offices || []);
      } catch {
        toast.error('Failed to load finance data');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return offices.filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        o.finance_name?.toLowerCase().includes(s) ||
        o.owner_name?.toLowerCase().includes(s) ||
        o.state?.toLowerCase().includes(s)
      );
    });
  }, [offices, search]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const loadOfficeDetail = async (office) => {
    setSelectedOffice(office);
    setCategoryFilter('');
    setDetailLoading(true);
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.get(`/offices/finance-summary/${office.id}`);
      setOfficeDetail(res.data);
    } catch {
      toast.error('Failed to load office details');
    } finally { setDetailLoading(false); }
  };

  const loadFilteredProducts = async (category) => {
    setCategoryFilter(category);
    if (!selectedOffice) return;
    setDetailLoading(true);
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.get(`/offices/finance-summary/${selectedOffice.id}`, { params: { category } });
      setOfficeDetail(res.data);
    } catch {
      toast.error('Failed to filter products');
    } finally { setDetailLoading(false); }
  };

  const columns = [
    {
      key: 'finance_name',
      label: 'Finance Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 border border-orange-200">
            <i className="fas fa-building-columns text-sm"></i>
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.finance_name || row.username}</p>
            <p className="text-xs font-medium text-slate-500">{row.owner_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'total_products',
      label: 'Total Products',
      render: (val) => <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{val || 0}</span>,
    },
    {
      key: 'pending',
      label: 'Pending',
      render: (val) => <span className="font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{val || 0}</span>,
    },
    {
      key: 'live_auction',
      label: 'Approved / Live',
      render: (val) => <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{val || 0}</span>,
    },
    {
      key: 'completed',
      label: 'Completed',
      render: (val) => <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{val || 0}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); loadOfficeDetail(row); }}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          View <i className="fas fa-arrow-right text-xs"></i>
        </button>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  // Detail view
  if (selectedOffice) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => { setSelectedOffice(null); setOfficeDetail(null); }}
          className="btn-ghost text-sm -ml-2"
        >
          <i className="fas fa-arrow-left text-sm"></i> Back to Finance
        </button>

        {/* Office Header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                <i className="fas fa-building-columns text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{selectedOffice.finance_name || selectedOffice.username}</h1>
                <p className="text-sm text-slate-500">{selectedOffice.owner_name} &bull; {selectedOffice.state}</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold text-slate-700">
                Total: {selectedOffice.total_products || 0}
              </span>
              <span className="px-3 py-1.5 bg-amber-50 rounded-lg font-semibold text-amber-700">
                Pending: {selectedOffice.pending || 0}
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 rounded-lg font-semibold text-emerald-700">
                Live: {selectedOffice.live_auction || 0}
              </span>
            </div>
          </div>
        </div>

        {detailLoading ? (
          <PageLoader />
        ) : officeDetail ? (
          <>
            {/* Category Filter Pills */}
            {officeDetail.categories?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  <i className="fas fa-filter text-orange-500 mr-1.5"></i> Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadFilteredProducts('')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      !categoryFilter
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {officeDetail.categories.map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => loadFilteredProducts(cat.category)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        categoryFilter === cat.category
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.category} <span className="ml-1 text-xs opacity-70">({cat.total})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">
                  Products {categoryFilter && <span className="text-orange-500 font-semibold">— {categoryFilter}</span>}
                </h3>
              </div>
              {officeDetail.products?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bids</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {officeDetail.products.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/vehicles/${p.id}`)}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                              {p.category || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(p.starting_price)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-orange-600">{p.bid_count || 0}</span>
                            {p.current_bid > 0 && (
                              <span className="text-xs text-slate-400 ml-1">({formatCurrency(p.current_bid)})</span>
                            )}
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <i className="fas fa-box-open text-3xl mb-3 block opacity-40"></i>
                  <p className="text-sm">No products found{categoryFilter ? ` in ${categoryFilter}` : ''}</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Main Finance list view
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filtered.length} finance offices</p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by finance name, owner, state..."
      />

      <DataTable
        columns={columns}
        data={paginated}
        emptyMessage="No finance offices found"
        onRowClick={(row) => loadOfficeDetail(row)}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
