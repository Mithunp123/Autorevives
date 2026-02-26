import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, StatusBadge, PageLoader } from '@/components/ui';
import { AreaChartCard } from '@/components/charts';
import { dashboardService } from '@/services';
import { useAuth } from '@/context';
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
  const { isAdmin, isOffice } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0, activeAuctions: 0, totalUsers: 0,
    totalManagers: 0, pendingApprovals: 0, totalVolume: 0,
    pendingPayments: 0,
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
        if (isOffice) {
          // Office users get their own stats
          const officeRes = await dashboardService.getOfficeStats();
          const raw = officeRes.data?.stats || officeRes.data || {};
          setStats({
            totalVehicles: raw.total_products ?? 0,
            activeAuctions: raw.approved_products ?? 0,
            totalUsers: 0,
            totalManagers: 0,
            pendingApprovals: raw.pending_products ?? 0,
            totalVolume: raw.total_volume ?? 0,
          });
        } else if (isAdmin) {
          // Admin gets full platform stats
          const [statsRes, activityRes] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getRecentActivity(),
          ]);

          const raw = statsRes.data?.stats || statsRes.data || {};
          setStats({
            totalVehicles: raw.total_products ?? 0,
            activeAuctions: raw.live_auctions ?? 0,
            totalUsers: raw.total_users ?? 0,
            totalManagers: raw.total_offices ?? 0,
            pendingApprovals: (raw.pending_auctions ?? 0) + (raw.pending_offices ?? 0),
            pendingPayments: raw.pending_payments ?? 0,
            totalVolume: raw.total_volume ?? 0,
          });

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
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isOffice]);

  // Fetch state list on mount — admin only
  useEffect(() => {
    if (!isAdmin) return;
    dashboardService.getVehiclesByState('')
      .then(({ data }) => { if (data?.states) setStateList(data.states); })
      .catch(() => { });
  }, [isAdmin]);

  // Fetch vehicles when state changes — admin only
  useEffect(() => {
    if (!isAdmin || !selectedState) { setStateVehicles([]); return; }
    dashboardService.getVehiclesByState(selectedState)
      .then(({ data }) => { if (data?.vehicles) setStateVehicles(data.vehicles); })
      .catch(() => { });
  }, [isAdmin, selectedState]);

  if (loading) return <PageLoader />;

  const statCards = isOffice ? [
    { icon: 'fa-car', label: 'My Vehicles', value: stats.totalVehicles?.toLocaleString('en-IN') || '0', color: 'accent' },
    { icon: 'fa-gavel', label: 'Approved', value: stats.activeAuctions || '0', color: 'success' },
    { icon: 'fa-clock', label: 'Pending', value: stats.pendingApprovals || '0', color: 'warning' },
    { icon: 'fa-indian-rupee-sign', label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'navy' },
  ] : [
    { icon: 'fa-car', label: 'Total Vehicles', value: stats.totalVehicles?.toLocaleString('en-IN') || '0', color: 'accent' },
    { icon: 'fa-gavel', label: 'Active Auctions', value: stats.activeAuctions || '0', color: 'success' },
    { icon: 'fa-users', label: 'Total Users', value: stats.totalUsers?.toLocaleString('en-IN') || '0', color: 'purple' },
    { icon: 'fa-building', label: 'Office Partners', value: stats.totalManagers || '0', color: 'warning' },
    { icon: 'fa-money-bill-transfer', label: 'Pending Payments', value: stats.pendingPayments || '0', color: 'danger' },
    { icon: 'fa-indian-rupee-sign', label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'navy' },
  ];

  const activityIcons = {
    bid: { icon: 'fa-gavel', color: 'text-gold-500' },
    approval: { icon: 'fa-check-circle', color: 'text-emerald-500' },
    vehicle: { icon: 'fa-car', color: 'text-amber-500' },
    user: { icon: 'fa-user', color: 'text-violet-500' },
    auction: { icon: 'fa-gavel', color: 'text-red-500' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Helmet>
        <title>Dashboard - AutoRevive</title>
        <meta name="description" content="AutoRevive admin dashboard. Monitor vehicles, auctions, users, and platform activity." />
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1628]">Dashboard</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Welcome back! Here's your platform overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-gold-600 hover:border-gold-500 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <i className="fas fa-car"></i> Vehicles
          </Link>
          <Link to="/manage/auctions" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-gold-500/20">
            <i className="fas fa-gavel"></i> Auctions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <AreaChartCard data={chartData} dataKey="auctions" title="Monthly Auction Growth" height={340} />
        </div>
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="font-bold text-[#0B1628]">Recent Activity</h3>
            <Link to="/manage/auctions" className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1">
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
            {activity.map((item) => {
              const iconConfig = activityIcons[item.type] || activityIcons.auction;
              return (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <i className={`fas ${iconConfig.icon} text-lg ${iconConfig.color} flex-shrink-0`}></i>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed group-hover:text-[#0B1628] transition-colors">{item.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <i className="far fa-clock text-gray-400 text-[10px]"></i>
                      <span className="text-xs font-medium text-gray-400">{timeAgo(item.time)}</span>
                    </div>
                  </div>
                </div>

              );
            })}
          </div>
        </div>
      </div>

      {/* Officer cannot approve anything, so do not show Pending Approvals card */}

      {/* State-based Vehicle Filter */}
      {stateList.length > 0 && (
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <i className="fas fa-map-location-dot text-gold-500 text-sm"></i> Vehicles by State
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">Filter and view vehicles from different states</p>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedState === s.state
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Office</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bids</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stateVehicles.slice(0, 10).map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-3">
                          {v.image_path ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${v.image_path}`} alt="" width={40} height={40} loading="lazy" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fas fa-car text-gray-300 text-sm"></i></div>
                          )}
                          <span className="font-medium text-[#0B1628]">{v.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{v.office_name || '—'}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0B1628]">₹{Number(v.starting_price || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-gold-600 font-semibold">{v.bid_count || 0}</span>
                        {v.current_bid && <span className="text-xs text-gray-400 ml-1">(₹{Number(v.current_bid).toLocaleString('en-IN')})</span>}
                      </td>
                      <td className="py-2.5 px-3"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stateVehicles.length > 10 && (
                <div className="text-center py-3 border-t border-gray-100">
                  <Link to="/vehicles" className="text-xs text-gold-600 font-semibold hover:underline">
                    View all {stateVehicles.length} vehicles in {selectedState} →
                  </Link>
                </div>
              )}
            </div>
          )}

          {selectedState && stateVehicles.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-car text-2xl mb-2 block opacity-40"></i>
              <p className="text-sm">No vehicles found in {selectedState}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
