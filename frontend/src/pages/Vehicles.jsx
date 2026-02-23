import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, SearchFilter, StatusBadge, Pagination, Button, ConfirmDialog, PageLoader } from '@/components/ui';
import { vehicleService } from '@/services';
import { formatCurrency, formatDate } from '@/utils';
import toast from 'react-hot-toast';

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const perPage = 15;

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const { data } = await vehicleService.getAll();
        setVehicles(data.vehicles || []);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = useMemo(() => vehicles.filter((v) => {
    const matchSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.office_name?.toLowerCase().includes(search.toLowerCase()) || String(v.id).includes(search);
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  }), [vehicles, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleDelete = async (vehicle) => {
    try { await vehicleService.delete(vehicle.id); setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id)); toast.success('Vehicle deleted'); } catch { toast.error('Failed to delete vehicle'); }
    setConfirmAction(null);
  };

  const columns = [
    {
      key: 'name', label: 'Vehicle',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.image_path ? <img src={`/api/uploads/${row.image_path.replace('uploads/', '')}`} alt={row.name} className="w-full h-full object-cover" /> : <i className="fas fa-car text-sm text-slate-300"></i>}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">#{row.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'office_name', label: 'Office', render: (val) => <span className="text-slate-500 font-medium">{val || '\u2014'}</span> },
    { key: 'starting_price', label: 'Starting Price', render: (val) => <span className="font-semibold font-display">{formatCurrency(val)}</span> },
    { key: 'current_bid', label: 'Current Bid', render: (val) => <span className={val ? 'font-bold text-accent font-display' : 'text-slate-300'}>{val ? formatCurrency(val) : 'No bids'}</span> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.id}`); }} className="btn-icon w-8 h-8" title="View"><i className="fas fa-eye text-sm"></i></button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.id}/edit`); }} className="btn-icon w-8 h-8" title="Edit"><i className="fas fa-pen-to-square text-sm"></i></button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmAction(row); }} className="btn-icon w-8 h-8 text-danger hover:bg-red-50" title="Delete"><i className="fas fa-trash text-sm"></i></button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">{filtered.length} vehicles in inventory</p>
        </div>
        <Button icon="fa-plus" onClick={() => navigate('/vehicles/add')} size="lg">Add Vehicle</Button>
      </div>
      <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, ID or office..." filters={[{ key: 'status', label: 'All Statuses', options: ['approved', 'pending', 'rejected'], value: statusFilter, onChange: setStatusFilter }]} />
      <DataTable columns={columns} data={paginated} onRowClick={(row) => navigate(`/vehicles/${row.id}`)} emptyMessage="No vehicles found" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <ConfirmDialog isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => handleDelete(confirmAction)} title="Delete Vehicle" message={`Delete "${confirmAction?.name}"? This will remove all related bids and auction data.`} confirmLabel="Delete" variant="danger" />
    </div>
  );
}
