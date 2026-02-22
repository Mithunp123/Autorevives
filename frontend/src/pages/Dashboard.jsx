import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [stats, setStats] = useState({
    totalVehicles: 0, activeAuctions: 0, totalUsers: 0,
    totalManagers: 0, pendingApprovals: 0, totalVolume: 0,
  });
  const [activity, setActivity] = useState([]);
  const [chartData] = useState(placeholderChartData);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your platform overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/vehicles" className="btn-secondary text-xs sm:text-sm"><i className="fas fa-car text-sm"></i> Vehicles</Link>
          <Link to="/auctions" className="btn-primary text-xs sm:text-sm"><i className="fas fa-gavel text-sm"></i> Auctions</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <AreaChartCard data={chartData} dataKey="auctions" title="Monthly Auction Growth" height={340} />
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="section-title">Recent Activity</h3>
            <Link to="/auctions" className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">View all <i className="fas fa-arrow-right text-[10px]"></i></Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {activity.map((item) => {
              const iconConfig = activityIcons[item.type] || activityIcons.auction;
              return (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-accent/[0.02] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconConfig.color}`}>
                    <i className={`fas ${iconConfig.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug font-medium">{item.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <i className="fas fa-clock text-slate-300 text-[10px]"></i>
                      <span className="text-xs text-slate-400">{timeAgo(item.time)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats.pendingApprovals > 0 && (
        <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
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
    </div>
  );
}
