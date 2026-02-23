import { useState, useEffect } from 'react';
import { StatCard, Button, PageLoader } from '@/components/ui';
import { AreaChartCard, BarChartCard } from '@/components/charts';
import { reportService } from '@/services';
import { formatCurrency, cn } from '@/utils';
import toast from 'react-hot-toast';

const auctionChartData = [
  { name: 'Jan', total: 12, completed: 10 },
  { name: 'Feb', total: 19, completed: 16 },
  { name: 'Mar', total: 25, completed: 22 },
  { name: 'Apr', total: 22, completed: 20 },
  { name: 'May', total: 30, completed: 27 },
  { name: 'Jun', total: 28, completed: 24 },
  { name: 'Jul', total: 35, completed: 31 },
  { name: 'Aug', total: 40, completed: 36 },
  { name: 'Sep', total: 38, completed: 35 },
  { name: 'Oct', total: 45, completed: 40 },
  { name: 'Nov', total: 50, completed: 46 },
  { name: 'Dec', total: 55, completed: 50 },
];

const vehicleSalesData = [
  { name: '2W', sales: 0 },
  { name: '3W', sales: 0 },
  { name: '4W', sales: 0 },
];

const userGrowthData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 185 },
  { name: 'Mar', users: 250 },
  { name: 'Apr', users: 310 },
  { name: 'May', users: 450 },
  { name: 'Jun', users: 520 },
  { name: 'Jul', users: 680 },
  { name: 'Aug', users: 790 },
  { name: 'Sep', users: 920 },
  { name: 'Oct', users: 1050 },
  { name: 'Nov', users: 1200 },
  { name: 'Dec', users: 1456 },
];

const tabs = [
  { key: 'auctions', label: 'Auctions', icon: 'fa-gavel' },
  { key: 'vehicles', label: 'Vehicles', icon: 'fa-car' },
  { key: 'users', label: 'Users', icon: 'fa-users' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('auctions');
  const [dateRange, setDateRange] = useState('12m');
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    total_products: 0,
    total_users: 0,
    live_auctions: 0,
    total_volume: 0,
    total_auction_value: 0,
    two_wheeler: 0,
    three_wheeler: 0,
    four_wheeler: 0,
    total_offices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await reportService.getStats();
        if (data.stats) setStats(data.stats);
      } catch {
        console.error('Failed to load report stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = async (format) => {
    toast.error('Export feature coming soon');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Analytics and insights for your platform</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="fa-file-excel" onClick={() => handleExport('excel')} loading={exporting} size="sm" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            Export Excel
          </Button>
          <Button icon="fa-file-pdf" onClick={() => handleExport('pdf')} loading={exporting} size="sm" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            Export PDF

          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="fa-gavel" 
          title="Total Auctions" 
          value={stats.live_auctions || 0} 
          trend="+12% from last month"
          color="bg-[#4285F4]"
          iconColor="text-white"
        />
        <StatCard 
          icon="fa-car" 
          title="Total Vehicles" 
          value={stats.total_products || 0} 
          trend="+8% from last month"
          color="bg-emerald-500"
          iconColor="text-white"
        />
        <StatCard 
          icon="fa-users" 
          title="Active Users" 
          value={stats.total_users || 0} 
          trend="+24% from last month"
          color="bg-purple-500"
          iconColor="text-white"
        />
        <StatCard 
          icon="fa-indian-rupee-sign" 
          title="Total Volume" 
          value={formatCurrency(stats.total_volume || 0)} 
          trend="+15% from last month"
          color="bg-amber-500"
          iconColor="text-white"
        />
      </div>

      {/* Tabs + Date range */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          {['3m', '6m', '12m'].map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                dateRange === r
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {activeTab === 'auctions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChartCard
            data={auctionChartData}
            dataKey="total"
            title="Monthly Auctions"
            height={320}
          />
          <AreaChartCard
            data={auctionChartData}
            dataKey="completed"
            title="Completed Auctions"
            color="#16A34A"
            height={320}
          />
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCard
            data={[
              { name: '2W', sales: stats.two_wheeler || 0 },
              { name: '3W', sales: stats.three_wheeler || 0 },
              { name: '4W', sales: stats.four_wheeler || 0 },
            ]}
            dataKey="sales"
            title="Vehicles by Type"
            height={320}
          />
          <AreaChartCard
            data={auctionChartData}
            dataKey="completed"
            title="Monthly Vehicle Sales Trend"
            color="#F59E0B"
            height={320}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChartCard
            data={userGrowthData}
            dataKey="users"
            title="User Growth"
            color="#7c3aed"
            height={320}
          />
          <BarChartCard
            data={[
              { name: 'Users', count: stats.total_users || 0 },
              { name: 'Offices', count: stats.total_offices || 0 },
            ]}
            dataKey="count"
            title="Users by Role"
            color="#2563EB"
            height={320}
          />
        </div>
      )}
    </div>
  );
}
