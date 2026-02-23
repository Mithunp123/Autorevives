import { useState, useEffect, useMemo } from 'react';
import {
  DataTable,
  SearchFilter,
  StatusBadge,
  Pagination,
  Modal,
  Button,
  PageLoader,
} from '@/components/ui';
import { approvalService } from '@/services';
import { formatDate, cn } from '@/utils';
import toast from 'react-hot-toast';

const typeConfig = {
  vehicle: { icon: 'fa-car', color: 'bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20', label: 'Vehicle Upload' },
  office: { icon: 'fa-building', color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Office Request' },
};

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'vehicle', label: 'Vehicles' },
  { key: 'office', label: 'Offices' },
];

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const perPage = 15;

  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const [vehiclesRes, officesRes] = await Promise.all([
          approvalService.getPendingVehicles(),
          approvalService.getPendingOffices(),
        ]);

        const pendingVehicles = (vehiclesRes.data.vehicles || []).map((v) => ({
          id: v.id,
          type: 'vehicle',
          name: v.name,
          email: v.office_name || '',
          details: `Vehicle listing — ${v.starting_price ? '₹' + Number(v.starting_price).toLocaleString('en-IN') : 'N/A'}`,
          created_at: v.created_at,
          status: v.status,
        }));

        const pendingOffices = (officesRes.data.offices || []).map((o) => ({
          id: o.id,
          type: 'office',
          name: o.finance_name || o.username,
          email: o.email || '',
          details: `Finance office registration — ${o.owner_name || ''}`,
          created_at: o.created_at,
          status: o.status,
        }));

        setApprovals([...pendingVehicles, ...pendingOffices]);
      } catch {
        console.error('Failed to load approvals');
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const matchTab = tab === 'all' || a.type === tab;
      const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch && a.status === 'pending';
    });
  }, [approvals, tab, search]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleApprove = async (item) => {
    try {
      if (item.type === 'vehicle') {
        await approvalService.approveVehicle(item.id);
      } else {
        await approvalService.approveOffice(item.id);
      }
      setApprovals((prev) => prev.map((a) => (a.id === item.id && a.type === item.type ? { ...a, status: 'approved' } : a)));
      toast.success(`${item.name} approved`);
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      if (rejectModal.type === 'vehicle') {
        await approvalService.rejectVehicle(rejectModal.id);
      }
      setApprovals((prev) => prev.map((a) => (a.id === rejectModal.id && a.type === rejectModal.type ? { ...a, status: 'rejected' } : a)));
      toast.success(`${rejectModal.name} rejected`);
    } catch {
      toast.error('Failed to reject');
    }
    setRejectModal(null);
    setRejectReason('');
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (val) => {
        const cfg = typeConfig[val] || typeConfig.user;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.color}`}>
              <i className={`fas ${cfg.icon} text-sm`}></i>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{cfg.label}</span>
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-xs font-medium text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (val) => <span className="text-sm font-medium text-slate-600">{val}</span>,
    },
    {
      key: 'created_at',
      label: 'Requested',
      render: (val) => <span className="text-sm font-medium text-slate-500">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
          >
            <i className="fas fa-check"></i> Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRejectModal(row); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors"
          >
            <i className="fas fa-xmark"></i> Reject
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filtered.length} items pending review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl overflow-x-auto border border-slate-200 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setCurrentPage(1); }}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search approvals..."
      />

      <DataTable columns={columns} data={paginated} emptyMessage="No pending approvals " />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Reject with reason modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Request" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Rejecting <span className="font-medium text-slate-900">{rejectModal?.name}</span>
          </p>
          <div>
            <label className="label">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} icon="fa-xmark">Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
