import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, PageLoader } from '@/components/ui';
import { settingsService } from '@/services';
import toast from 'react-hot-toast';

const defaultSettings = {
  platform_name: 'AutoRevive',
  logo_url: '',
  default_auction_duration: 7,
  minimum_bid_increment: 5000,
  email_notifications: true,
  new_user_notifications: true,
  auction_end_notifications: true,
  bid_notifications: false,
};

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: defaultSettings,
  });

  const emailNotif = watch('email_notifications');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await settingsService.get();
        if (data) {
          reset(data);
          if (data.logo_url) setLogoPreview(data.logo_url);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await settingsService.update(data);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save — API not connected');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    try {
      await settingsService.uploadLogo(file);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure platform preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Platform settings */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <i className="fas fa-globe text-sm text-accent"></i>
            <h2 className="text-base font-semibold text-slate-900">Platform</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Platform Name</label>
              <input {...register('platform_name')} className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <i className="fas fa-gear text-base text-slate-300"></i>
                  )}
                </div>
                <label className="btn-secondary cursor-pointer">
                  <i className="fas fa-upload text-sm"></i> Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Auction settings */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <i className="fas fa-clock text-sm text-warning"></i>
            <h2 className="text-base font-semibold text-slate-900">Auction Defaults</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Default Duration (days)</label>
              <input {...register('default_auction_duration', { valueAsNumber: true })} type="number" className="input-field" />
            </div>
            <div>
              <label className="label">Minimum Bid Increment (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm">₹</span>
                <input {...register('minimum_bid_increment', { valueAsNumber: true })} type="number" className="input-field pl-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification settings */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <i className="fas fa-bell text-sm text-purple-600"></i>
            <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <ToggleOption
              label="Email Notifications"
              description="Enable email notifications for platform events"
              checked={emailNotif}
              onChange={(val) => setValue('email_notifications', val)}
            />
            {emailNotif && (
              <div className="pl-6 space-y-4 border-l-2 border-slate-100 ml-3">
                <ToggleOption
                  label="New User Registrations"
                  description="Get notified when new users sign up"
                  checked={watch('new_user_notifications')}
                  onChange={(val) => setValue('new_user_notifications', val)}
                />
                <ToggleOption
                  label="Auction End Alerts"
                  description="Notifications when auctions close"
                  checked={watch('auction_end_notifications')}
                  onChange={(val) => setValue('auction_end_notifications', val)}
                />
                <ToggleOption
                  label="Bid Activity"
                  description="Real-time bid placement alerts"
                  checked={watch('bid_notifications')}
                  onChange={(val) => setValue('bid_notifications', val)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Role permissions info */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <i className="fas fa-shield-halved text-sm text-success"></i>
            <h2 className="text-base font-semibold text-slate-900">Role Permissions</h2>
          </div>

          <div className="space-y-3">
            <RoleRow role="Admin" permissions="Full access — Manage users, offices, managers, approvals, settings" />
            <RoleRow role="Manager" permissions="Office management — View assigned office, manage vehicles" />
            <RoleRow role="Office" permissions="Vehicle management — List vehicles, view bids, manage inventory" />
            <RoleRow role="User" permissions="Bidding — Browse auctions, place bids, view profile" />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon="fa-floppy-disk">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleOption({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-accent' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function RoleRow({ role, permissions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 px-3 rounded-xl bg-slate-50/50">
      <span className="text-sm font-medium text-slate-900 min-w-[80px]">{role}</span>
      <span className="text-xs text-slate-400">{permissions}</span>
    </div>
  );
}
