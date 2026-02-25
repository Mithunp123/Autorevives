import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, PageLoader, Modal } from '@/components/ui';
import { settingsService, planService } from '@/services';
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

  // Plan management state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const planForm = useForm({
    defaultValues: { name: '', price: '', duration: '', period: 'Days', features: [], popular: false, sort_order: 0, is_active: true },
  });

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
    fetchPlans();
  }, [reset]);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const { data } = await planService.getAll();
      setPlans(data?.plans || []);
    } catch {
      // ignore — plans table may not exist yet
    } finally {
      setPlansLoading(false);
    }
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    planForm.reset({ name: '', price: '', duration: '', period: 'Days', features: [], popular: false, sort_order: plans.length, is_active: true });
    setFeatureInput('');
    setPlanModal(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    try {
      planForm.reset({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || '',
        period: plan.period || 'Days',
        features: plan.features || [],
        popular: !!plan.popular,
        sort_order: plan.sort_order || 0,
        is_active: plan.is_active !== false,
      });
      setFeatureInput('');
      setPlanModal(true);
    } catch (e) {
      console.error(e);
      toast.error('Error opening plan');
    }
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    const cur = planForm.getValues('features') || [];
    planForm.setValue('features', [...cur, val]);
    setFeatureInput('');
  };

  const removeFeature = (idx) => {
    const cur = planForm.getValues('features') || [];
    planForm.setValue('features', cur.filter((_, i) => i !== idx));
  };

  const savePlan = async (formData) => {
    setPlanSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price), // Parse as float to handle decimals
        sort_order: Number(formData.sort_order),
      };
      if (editingPlan) {
        await planService.update(editingPlan.id, payload);
        toast.success('Plan updated');
      } else {
        await planService.create(payload);
        toast.success('Plan created');
      }
      setPlanModal(false);
      fetchPlans();
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setPlanSaving(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await planService.delete(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const togglePlanActive = async (plan) => {
    try {
      await planService.update(plan.id, { is_active: !plan.is_active });
      toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated');
      fetchPlans();
    } catch {
      toast.error('Failed to update');
    }
  };

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
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure platform preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Platform settings */}
        <div className="card p-4 sm:p-6 space-y-5">
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
        <div className="card p-4 sm:p-6 space-y-5">
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
        <div className="card p-4 sm:p-6 space-y-5">
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
        <div className="card p-4 sm:p-6 space-y-5">
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

      {/* -- Plan Management Section -- */}
      <div className="card p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <i className="fas fa-tags text-sm text-gold-500"></i>
            <h2 className="text-base font-semibold text-slate-900">Subscription Plans</h2>
          </div>
          <Button size="sm" onClick={openAddPlan} icon="fa-plus">
            Add Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No plans found. Add your first plan above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-4 sm:p-5 transition-all ${
                  plan.popular ? 'border-gold-400 bg-gold-50/30 shadow-md' : 'border-slate-200 bg-white'
                } ${!plan.is_active ? 'opacity-50' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-xs font-bold uppercase px-3 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{Number(plan.price).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {plan.duration} {plan.period}
                  </p>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <i className="fas fa-check text-green-500 text-[10px] mt-0.5"></i>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditPlan(plan)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <i className="fas fa-pen text-[10px] mr-1"></i> Edit
                  </button>
                  <button
                    onClick={() => togglePlanActive(plan)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                      plan.is_active
                        ? 'border-yellow-300 hover:bg-yellow-50 text-yellow-600'
                        : 'border-green-300 hover:bg-green-50 text-green-600'
                    }`}
                  >
                    <i className={`fas ${plan.is_active ? 'fa-eye-slash' : 'fa-eye'} text-[10px] mr-1`}></i>
                    {plan.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-xs py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Modal */}
      {planModal && (
        <Modal title={editingPlan ? 'Edit Plan' : 'Add Plan'} onClose={() => setPlanModal(false)} size="md">
          <form onSubmit={planForm.handleSubmit(savePlan)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Plan Name</label>
                <input {...planForm.register('name', { required: true })} className="input-field" placeholder="e.g. Professional" />
              </div>
              <div>
                <label className="label">Price (₹)</label>
                <input
                  {...planForm.register('price', { required: true, valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="2799"
                />
              </div>
              <div>
                <label className="label">Duration</label>
                <input {...planForm.register('duration', { required: true })} className="input-field" placeholder="e.g. 180" />
              </div>
              <div>
                <label className="label">Period</label>
                <select {...planForm.register('period')} className="input-field">
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                  <option value="Year">Year</option>
                </select>
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input {...planForm.register('sort_order')} type="number" className="input-field" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...planForm.register('popular')} className="rounded text-gold-500 focus:ring-gold-500" />
                <span className="text-slate-700">Mark as Popular</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...planForm.register('is_active')} className="rounded text-green-500 focus:ring-green-500" />
                <span className="text-slate-700">Active</span>
              </label>
            </div>

            {/* Features */}
            <div>
              <label className="label">Features</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); }}}
                  className="input-field flex-1"
                  placeholder="Type a feature and press Enter or Add"
                />
                <button type="button" onClick={addFeature} className="btn-secondary text-xs px-3">
                  Add
                </button>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(planForm.watch('features') || []).map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg text-sm">
                    <span className="text-slate-700">{f}</span>
                    <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                      <i className="fas fa-xmark text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPlanModal(false)} className="btn-secondary text-sm px-4 py-2">
                Cancel
              </button>
              <Button type="submit" loading={planSaving} icon={editingPlan ? 'fa-floppy-disk' : 'fa-plus'}>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
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
