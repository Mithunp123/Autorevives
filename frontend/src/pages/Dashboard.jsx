import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, StatusBadge, PageLoader } from '@/components/ui';
import { AreaChartCard } from '@/components/charts';
import { dashboardService } from '@/services';
import { formatCurrency, formatDateTime, timeAgo } from '@/utils';

// Static placeholder chart data (backend doesn't provide monthly breakdowns)
const placeholderChartData = [
  { name: 'Jan', auctions: 0 }, { name: 'Feb', auctions: 0 }, { name: 'Mar', auctions: 0 },
  { name: 'Apr', auctions: 0 }, { name: 'May', auctions: 0 }, { name: 'Jun', auctions: 0 },
  { name: 'Jul', auctions: 0 }, { name: 'Aug', auctions: 0 }, { name: 'Sep', auctions: 0 },
  { name: 'Oct', auctions: 0 }, { name: 'Nov', auctions: 0 }, { name: 'Dec', auctions: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVehicles: 0, activeAuctions: 0, totalUsers: 0,
    totalManagers: 0, pendingApprovals: 0, totalVolume: 0,
  });
  const [activity, setActivity] = useState([]);
  const [chartData] = useState(placeholderChartData);
  const [loading, setLoading] = useState(true);

  // State-based vehicle filter
  const [stateList, setStateList] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [stateVehicles, setStateVehicles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(),
        ]);

        // Parse stats: GET /api/dashboard/stats → { stats: { ... }, recent_activity: [...] }
        const raw = statsRes.data?.stats || statsRes.data || {};
        setStats({
          totalVehicles: raw.total_products ?? 0,
          activeAuctions: raw.live_auctions ?? 0,
          totalUsers: raw.total_users ?? 0,
          totalManagers: raw.total_offices ?? 0,
          pendingApprovals: (raw.pending_auctions ?? 0) + (raw.pending_offices ?? 0),
          totalVolume: raw.total_volume ?? 0,
        });

        // Parse activity: GET /api/dashboard/recent-activity → [{ name, amount, username, bid_time }, ...]
        // Fall back to recent_activity from the stats response if the dedicated endpoint returns nothing
        const act = Array.isArray(activityRes.data) && activityRes.data.length
          ? activityRes.data
          : Array.isArray(statsRes.data?.recent_activity) ? statsRes.data.recent_activity : [];

        if (act.length) {
          setActivity(act.map((a, i) => ({
            id: i + 1,
            type: 'bid',
            message: `New bid of ₹${Number(a.amount || 0).toLocaleString('en-IN')} on ${a.name || 'Unknown'}`,
            time: a.bid_time,
            user: a.username,
          })));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch state list on mount
  useEffect(() => {
    dashboardService.getVehiclesByState('')
      .then(({ data }) => { if (data?.states) setStateList(data.states); })
      .catch(() => {});
  }, []);

  // Fetch vehicles when state changes
  useEffect(() => {
    if (!selectedState) { setStateVehicles([]); return; }
    dashboardService.getVehiclesByState(selectedState)
      .then(({ data }) => { if (data?.vehicles) setStateVehicles(data.vehicles); })
      .catch(() => {});
  }, [selectedState]);

  if (loading) return <PageLoader />;

  const statCards = [
    { icon: 'fa-car', label: 'Total Vehicles', value: stats.totalVehicles?.toLocaleString('en-IN'), color: 'accent', change: 12, changeType: 'up' },
    { icon: 'fa-gavel', label: 'Active Auctions', value: stats.activeAuctions, color: 'success', change: 8, changeType: 'up' },
    { icon: 'fa-users', label: 'Total Users', value: stats.totalUsers?.toLocaleString('en-IN'), color: 'purple', change: 5, changeType: 'up' },
    { icon: 'fa-building', label: 'Office Partners', value: stats.totalManagers, color: 'warning' },
    { icon: 'fa-shield-halved', label: 'Pending Approvals', value: stats.pendingApprovals, color: 'danger' },
    { icon: 'fa-arrow-trend-up', label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'success', change: 15, changeType: 'up' },
  ];

  const activityIcons = {
    bid: { icon: 'fa-gavel', color: 'text-accent bg-primary-50' },
    approval: { icon: 'fa-shield-halved', color: 'text-success bg-emerald-50' },
    vehicle: { icon: 'fa-car', color: 'text-warning bg-amber-50' },
    user: { icon: 'fa-users', color: 'text-purple-600 bg-purple-50' },
    auction: { icon: 'fa-gavel', color: 'text-danger bg-red-50' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Welcome back! Here's your platform overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-[#4285F4] hover:border-[#4285F4] rounded-xl text-sm font-bold transition-all shadow-sm">
            <i className="fas fa-car"></i> Vehicles
          </Link>
          <Link to="/auctions" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20">
            <i className="fas fa-gavel"></i> Auctions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <AreaChartCard data={chartData} dataKey="auctions" title="Monthly Auction Growth" height={340} />
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <Link to="/auctions" className="text-xs font-bold text-[#4285F4] hover:text-[#3367D6] flex items-center gap-1">
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
            {activity.map((item) => {
              const iconConfig = activityIcons[item.type] || activityIcons.auction;
              return (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.color} bg-opacity-10`}>
                    <i className={`fas ${iconConfig.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed group-hover:text-slate-900 transition-colors">{item.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <i className="far fa-clock text-slate-400 text-[10px]"></i>
                      <span className="text-xs font-medium text-slate-400">{timeAgo(item.time)}</span>
                    </div>
                  </div>
                </div>

              );
            })}
          </div>
        </div>
      </div>

      {stats.pendingApprovals > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-blue-50/50 border-blue-200/50 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-shield-halved text-warning"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{stats.pendingApprovals} Pending Approvals</h3>
                <p className="text-sm text-slate-500">Review and approve pending requests</p>
              </div>
            </div>
            <Link to="/approvals" className="btn-primary text-sm"><i className="fas fa-eye text-sm"></i> Review Now</Link>
          </div>
        </div>
      )}

      {/* State-based Vehicle Filter */}
      {stateList.length > 0 && (
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <i className="fas fa-map-location-dot text-accent text-sm"></i> Vehicles by State
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">Filter and view vehicles from different states</p>
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="select-field max-w-xs"
            >
              <option value="">Select a state</option>
              {stateList.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.vehicle_count} vehicles)
                </option>
              ))}
            </select>
          </div>

          {/* State pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {stateList.slice(0, 10).map((s) => (
              <button
                key={s.state}
                onClick={() => setSelectedState(s.state === selectedState ? '' : s.state)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedState === s.state
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s.state} <span className="ml-1 opacity-70">{s.vehicle_count}</span>
              </button>
            ))}
          </div>

          {/* Filtered vehicles table */}
          {selectedState && stateVehicles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Office</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bids</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stateVehicles.slice(0, 10).map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-3">
                          {v.image_path ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${v.image_path}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><i className="fas fa-car text-slate-300 text-sm"></i></div>
                          )}
                          <span className="font-medium text-slate-800">{v.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{v.office_name || '—'}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">₹{Number(v.starting_price || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-accent font-semibold">{v.bid_count || 0}</span>
                        {v.current_bid && <span className="text-xs text-slate-400 ml-1">(₹{Number(v.current_bid).toLocaleString('en-IN')})</span>}
                      </td>
                      <td className="py-2.5 px-3"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stateVehicles.length > 10 && (
                <div className="text-center py-3 border-t border-slate-50">
                  <Link to="/vehicles" className="text-xs text-accent font-semibold hover:underline">
                    View all {stateVehicles.length} vehicles in {selectedState} →
                  </Link>
                </div>
              )}
            </div>
          )}

          {selectedState && stateVehicles.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <i className="fas fa-car text-2xl mb-2 block opacity-40"></i>
              <p className="text-sm">No vehicles found in {selectedState}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
