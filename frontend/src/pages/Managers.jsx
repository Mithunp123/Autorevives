import { useState, useEffect, useMemo } from 'react';
import {
  DataTable,
  SearchFilter,
  StatusBadge,
  Pagination,
  Modal,
  Button,
  ConfirmDialog,
  PageLoader,
} from '@/components/ui';
import { managerService } from '@/services';
import { formatDate } from '@/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const perPage = 15;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await managerService.getAll();
        setManagers(data.offices || []);
      } catch {
        console.error('Failed to load managers');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return managers.filter((m) =>
      !search ||
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.office_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [managers, search]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => { setEditing(null); reset({ username: '', email: '', mobile_number: '', password: '', office_name: '' }); setShowForm(true); };
  const openEdit = (mgr) => { setEditing(mgr); reset(mgr); setShowForm(true); };

  const onSubmit = async (formData) => {
    try {
      if (editing) {
        await managerService.update(editing.id, formData);
        setManagers((prev) => prev.map((m) => (m.id === editing.id ? { ...m, ...formData } : m)));
        toast.success('Manager updated');
      } else {
        const { data } = await managerService.create(formData);
        setManagers((prev) => [...prev, { ...formData, id: data?.id || Date.now(), status: 'active', created_at: new Date().toISOString() }]);
        toast.success('Manager added');
      }
      setShowForm(false);
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (mgr) => {
    try {
      await managerService.delete(mgr.id);
      setManagers((prev) => prev.filter((m) => m.id !== mgr.id));
      toast.success('Manager deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setConfirmAction(null);
  };

  const handleResetPw = async (mgr) => {
    toast.error('Password reset is not available');
  };

  const columns = [
    {
      key: 'username',
      label: 'Manager',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold flex-shrink-0">
            {row.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.username}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'office_name',
      label: 'Office',
      render: (val) => (
        <span className="flex items-center gap-1.5">
          <i className="fas fa-building text-sm text-slate-300"></i> {val || '—'}
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
      label: 'Added',
      render: (val) => <span className="text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="btn-icon w-8 h-8" title="Edit">
            <i className="fas fa-pen-to-square text-sm"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleResetPw(row); }} className="btn-icon w-8 h-8 text-warning" title="Reset password">
            <i className="fas fa-key text-sm"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmAction(row); }} className="btn-icon w-8 h-8 text-danger hover:bg-red-50" title="Delete">
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Managers</h1>
          <p className="page-subtitle">{filtered.length} managers registered</p>
        </div>
        <Button icon="fa-plus" onClick={openAdd}>Add Manager</Button>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search managers..."
      />

      <DataTable columns={columns} data={paginated} emptyMessage="No managers found" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Manager' : 'Add Manager'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('username', { required: 'Name is required' })} className="input-field" placeholder="John Doe" />
            {errors.username && <p className="text-xs text-danger mt-1">{errors.username.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email', { required: 'Email is required' })} type="email" className="input-field" placeholder="email@company.com" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('mobile_number', { required: 'Phone is required' })} className="input-field" placeholder="9876543210" />
              {errors.mobile_number && <p className="text-xs text-danger mt-1">{errors.mobile_number.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Assigned Office</label>
            <input {...register('office_name')} className="input-field" placeholder="Office name" />
          </div>
          {!editing && (
            <div>
              <label className="label">Password</label>
              <input {...register('password', { required: !editing && 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" className="input-field" placeholder="Minimum 6 characters" />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Add Manager'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleDelete(confirmAction)}
        title="Delete Manager"
        message={`Delete "${confirmAction?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
