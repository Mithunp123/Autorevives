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
import { officeService } from '@/services';
import { formatDate } from '@/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

export default function Offices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
        const { data } = await officeService.getAll();
        setOffices(data.offices || []);
      } catch {
        console.error('Failed to load offices');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return offices.filter((o) => {
      const matchSearch =
        !search ||
        o.finance_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.location?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [offices, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => { setEditing(null); reset({ finance_name: '', owner_name: '', username: '', email: '', mobile_number: '', password: '', location: '', state: '' }); setShowForm(true); };
  const openEdit = (office) => { setEditing(office); reset(office); setShowForm(true); };

  const onSubmit = async (formData) => {
    try {
      if (editing) {
        await officeService.update(editing.id, formData);
        setOffices((prev) => prev.map((o) => (o.id === editing.id ? { ...o, ...formData } : o)));
        toast.success('Office updated');
      } else {
        const { data } = await officeService.create(formData);
        setOffices((prev) => [...prev, { ...formData, id: data?.id || Date.now(), status: 'active', product_count: 0, created_at: new Date().toISOString() }]);
        toast.success('Office added');
      }
      setShowForm(false);
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (office) => {
    try {
      await officeService.delete(office.id);
      setOffices((prev) => prev.filter((o) => o.id !== office.id));
      toast.success('Office deleted');
    } catch {
      toast.error('Failed');
    }
    setConfirmAction(null);
  };

  const toggleStatus = async (office) => {
    const newStatus = office.status === 'active' ? 'inactive' : 'active';
    try {
      await officeService.update(office.id, { status: newStatus });
      setOffices((prev) => prev.map((o) => (o.id === office.id ? { ...o, status: newStatus } : o)));
      toast.success(`Office ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed');
    }
  };

  const columns = [
    {
      key: 'finance_name',
      label: 'Office',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4] flex-shrink-0 border border-[#4285F4]/20">
            <i className="fas fa-building text-sm"></i>
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.finance_name}</p>
            <p className="text-xs font-medium text-slate-500">{row.owner_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (val, row) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <i className="fas fa-location-dot text-slate-400"></i>
          {row.state ? `${row.state}${val ? `, ${val}` : ''}` : (val || '—')}
        </span>
      ),
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <i className="fas fa-user-gear text-slate-400"></i> {val || '—'}
        </span>
      ),
    },
    {
      key: 'product_count',
      label: 'Vehicles',
      render: (val) => <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#4285F4] hover:bg-blue-50 transition-colors" title="Edit">
            <i className="fas fa-pen-to-square text-sm"></i>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleStatus(row); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
            title={row.status === 'active' ? 'Disable' : 'Enable'}
          >
            {row.status === 'active'
              ? <i className="fas fa-toggle-on text-lg text-emerald-500"></i>
              : <i className="fas fa-toggle-off text-lg text-slate-300"></i>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmAction(row); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <i className="fas fa-trash text-sm"></i>
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
          <h1 className="text-2xl font-bold text-slate-900">Offices</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filtered.length} finance offices</p>
        </div>
        <Button icon="fa-plus" onClick={openAdd}>Add Office</Button>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search offices..."
        filters={[
          {
            key: 'status',
            label: 'All Statuses',
            options: ['active', 'pending', 'inactive'],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      <DataTable columns={columns} data={paginated} emptyMessage="No offices found" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Office' : 'Add Office'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Finance Name</label>
              <input {...register('finance_name', { required: 'Required' })} className="input-field" placeholder="Company name" />
              {errors.finance_name && <p className="text-xs text-danger mt-1">{errors.finance_name.message}</p>}
            </div>
            <div>
              <label className="label">Owner Name</label>
              <input {...register('owner_name', { required: 'Required' })} className="input-field" placeholder="Owner full name" />
              {errors.owner_name && <p className="text-xs text-danger mt-1">{errors.owner_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Username</label>
              <input {...register('username', { required: 'Required' })} className="input-field" placeholder="login_username" />
            </div>
            <div>
              <label className="label">State</label>
              <select {...register('state')} className="input-field">
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Location / City</label>
              <input {...register('location')} className="input-field" placeholder="City name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="email@company.com" />
            </div>
            <div>
              <label className="label">Mobile</label>
              <input {...register('mobile_number', { required: 'Required' })} className="input-field" placeholder="9876543210" />
            </div>
          </div>
          {!editing && (
            <div>
              <label className="label">Password</label>
              <input {...register('password', { required: !editing && 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="Minimum 6 characters" />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Add Office'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleDelete(confirmAction)}
        title="Delete Office"
        message={`Delete "${confirmAction?.finance_name}"? All associated data will be removed.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
