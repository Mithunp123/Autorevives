import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StatusBadge, Button, PageLoader, ConfirmDialog } from '@/components/ui';
import { vehicleService, approvalService } from '@/services';
import { formatCurrency, formatDate, formatDateTime, timeAgo } from '@/utils';
import toast from 'react-hot-toast';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await vehicleService.getById(id);
        setVehicle(data.vehicle || data);
        setBids(data.bids || []);
      } catch {
        console.error('Failed to load vehicle');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!vehicle) return null;

  const handleDelete = async () => { try { await vehicleService.delete(vehicle.id); toast.success('Vehicle deleted'); navigate('/vehicles'); } catch { toast.error('Failed'); } };
  const handleApprove = async () => { try { await approvalService.approveVehicle(vehicle.id); setVehicle({ ...vehicle, status: 'approved' }); toast.success('Vehicle approved'); } catch { toast.error('Failed'); } };
  const handleReject = async () => { try { await approvalService.rejectVehicle(vehicle.id); setVehicle({ ...vehicle, status: 'rejected' }); toast.success('Vehicle rejected'); } catch { toast.error('Failed'); } };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/vehicles')} className="btn-ghost text-sm -ml-2"><i className="fas fa-arrow-left text-sm"></i> Back to Vehicles</button>

      <div className="card overflow-hidden">
        <div className="aspect-video sm:aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-50 relative flex items-center justify-center">
          {vehicle.image_path ? (
            <img
              src={`/api/uploads/${vehicle.image_path.replace('uploads/', '')}`}
              alt={vehicle.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : null}
          {!vehicle.image_path && <i className="fas fa-car text-5xl text-slate-200"></i>}
          <div className="absolute top-4 left-4"><StatusBadge status={vehicle.status} className="text-sm px-3 py-1" /></div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">{vehicle.name}</h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">#{vehicle.id}  {vehicle.category}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicle.status === 'pending' && (<><Button variant="success" icon="fa-shield-halved" size="sm" onClick={handleApprove}>Approve</Button><Button variant="danger" icon="fa-circle-xmark" size="sm" onClick={handleReject}>Reject</Button></>)}
              <Button variant="secondary" icon="fa-pen-to-square" size="sm" onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}>Edit</Button>
              <Button variant="danger" icon="fa-trash" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard icon="fa-indian-rupee-sign" label="Starting Price" value={formatCurrency(vehicle.starting_price)} />
        <InfoCard icon="fa-gavel" label="Current Bid" value={vehicle.current_bid ? formatCurrency(vehicle.current_bid) : 'No bids'} highlight />
        {vehicle.quoted_price && Number(vehicle.quoted_price) > 0 && (
          <InfoCard icon="fa-file-invoice-dollar" label="Quoted Amount" value={formatCurrency(vehicle.quoted_price)} />
        )}
        <InfoCard icon="fa-building" label="Office" value={vehicle.office_name} />
        <InfoCard icon="fa-calendar" label="Listed" value={formatDate(vehicle.created_at)} />
      </div>

      {vehicle.description && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Description</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{vehicle.description}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="section-title">Bid History ({vehicle.bid_count || bids.length || 0})</h3>
        </div>
        {bids.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {bids.map((bid, idx) => (
              <div key={bid.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                    {idx === 0 ? '' : `#${idx + 1}`}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{bid.bidder_name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><i className="fas fa-clock text-xs"></i> {timeAgo(bid.bid_time)}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold font-display ${idx === 0 ? 'text-accent' : 'text-slate-700'}`}>{formatCurrency(bid.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 pb-5"><p className="text-sm text-slate-400 text-center py-6">No bids placed yet</p></div>
        )}
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Vehicle" message={`Permanently delete "${vehicle.name}"? This will remove all bids.`} confirmLabel="Delete" variant="danger" />
    </div>
  );
}

function InfoCard({ icon, label, value, highlight }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <i className={`fas ${icon} text-sm text-slate-400`}></i>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <p className={`text-lg font-extrabold font-display ${highlight ? 'text-accent' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
