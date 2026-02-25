import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  SearchFilter,
  StatusBadge,
  Pagination,
  ConfirmDialog,
  Button,
  PageLoader,
} from '@/components/ui';
import { userService } from '@/services';
import { formatDate } from '@/utils';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const perPage = 15;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await userService.getAll();
        setUsers(data.users || []);
      } catch {
        console.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile_number?.includes(search);
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleBlock = async (user) => {
    try {
      await userService.block(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'blocked' } : u)));
      toast.success(`${user.username} has been blocked`);
    } catch {
      toast.error('Failed to block user');
    }
  };

  const handleUnblock = async (user) => {
    try {
      await userService.unblock(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)));
      toast.success(`${user.username} has been unblocked`);
    } catch {
      toast.error('Failed to unblock user');
    }
  };

  const handleDelete = async (user) => {
    try {
      await userService.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.username} has been deleted`);
    } catch {
      toast.error('Failed to delete user');
    }
    setConfirmAction(null);
  };

  const columns = [
    {
      key: 'username',
      label: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
            {row.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.username}</p>
            <p className="text-xs font-medium text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'mobile_number',
      label: 'Phone',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-500">
          <i className="fas fa-phone text-sm text-slate-300"></i> {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (val) => <span className="text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/users/${row.id}`); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#D4A017] hover:bg-gold-50 transition-colors"
            title="View details"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>
          {row.status === 'active' ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleBlock(row); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Block user"
            >
              <i className="fas fa-ban text-sm"></i>
            </button>
          ) : row.status === 'blocked' ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleUnblock(row); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Unblock user"
            >
              <i className="fas fa-circle-check text-sm"></i>
            </button>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'delete', user: row }); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete user"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filtered.length} total users</p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email or phone..."
        filters={[
          {
            key: 'status',
            label: 'All Statuses',
            options: ['active', 'pending', 'blocked'],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={paginated}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        emptyMessage="No users found matching your criteria"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction?.type === 'delete' && handleDelete(confirmAction.user)}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmAction?.user?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
