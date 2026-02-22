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
  vehicle: { icon: 'fa-car', color: 'bg-accent/10 text-accent', label: 'Vehicle Upload' },
  office: { icon: 'fa-building', color: 'bg-purple-50 text-purple-600', label: 'Office Request' },
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
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
              <i className={`fas ${cfg.icon} text-sm`}></i>
            </div>
            <span className="text-xs font-medium text-slate-400">{cfg.label}</span>
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-900">{val}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (val) => <span className="text-sm text-slate-500">{val}</span>,
    },
    {
      key: 'created_at',
      label: 'Requested',
      render: (val) => <span className="text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            icon="fa-check"
            onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="fa-xmark"
            onClick={(e) => { e.stopPropagation(); setRejectModal(row); }}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">{filtered.length} items pending review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setCurrentPage(1); }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
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
