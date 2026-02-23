import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge, Button, PageLoader, ConfirmDialog } from '@/components/ui';
import { userService } from '@/services';
import { formatDate, formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await userService.getById(id);
        setUser(data.user || data);
        setBids(data.bids || []);
      } catch {
        console.error('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  const handleBlock = async () => {
    try {
      await userService.block(user.id);
      setUser({ ...user, status: 'blocked' });
      toast.success('User blocked');
    } catch {
      toast.error('Failed');
    }
  };

  const handleUnblock = async () => {
    try {
      await userService.unblock(user.id);
      setUser({ ...user, status: 'active' });
      toast.success('User unblocked');
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(user.id);
      toast.success('User deleted');
      navigate('/users');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => navigate('/users')} className="btn-ghost text-sm -ml-2">
        <i className="fas fa-arrow-left text-sm"></i> Back to Users
      </button>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#3367D6] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{user.username}</h1>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-sm text-slate-500 capitalize mt-1 font-medium">{user.role}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
            {user.status === 'active' ? (
              <Button variant="secondary" icon="fa-ban" onClick={handleBlock} size="sm">
                Block
              </Button>
            ) : user.status === 'blocked' ? (
              <Button variant="success" icon="fa-circle-check" onClick={handleUnblock} size="sm">
                Unblock
              </Button>
            ) : null}
            <Button variant="danger" icon="fa-trash-can" onClick={() => setShowDelete(true)} size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon="fa-envelope" label="Email" value={user.email} />
        <InfoCard icon="fa-phone" label="Phone" value={user.mobile_number} />
        <InfoCard icon="fa-calendar" label="Joined" value={formatDate(user.created_at)} />
        <InfoCard icon="fa-user" label="Total Bids" value={user.bid_count || bids.length || 0} />
      </div>

      {(user.total_bids > 0 || bids.length > 0) && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Bidding Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Total Bids</p>
              <p className="text-xl font-bold font-display">{user.bid_count || bids.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Volume</p>
              <p className="text-xl font-bold font-display">{formatCurrency(user.total_bids || 0)}</p>
            </div>
          </div>
          {bids.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-slate-500">Recent Bids</h4>
              {bids.slice(0, 10).map((bid) => (
                <div key={bid.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">{bid.product_name}</span>
                  <span className="text-sm font-semibold font-display">{formatCurrency(bid.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Permanently delete "${user.username}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        <i className={`fas ${icon} text-base text-slate-300`}></i>
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}
