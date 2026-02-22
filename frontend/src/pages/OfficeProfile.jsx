import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { officeDetailsService, authService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export default function OfficeProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [completionPercent, setCompletionPercent] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm();

  const watchedFields = watch();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fields = [
      'gst_number', 'pan_number', 'company_address', 'city', 'state', 'pincode',
      'bank_name', 'bank_account_number', 'bank_ifsc_code', 'authorized_person',
    ];
    const filled = fields.filter((f) => watchedFields[f]?.trim?.()).length;
    setCompletionPercent(Math.round((filled / fields.length) * 100));
  }, [watchedFields]);

  const loadData = async () => {
    try {
      const [detailsRes, profileRes] = await Promise.all([
        officeDetailsService.get(),
        authService.getProfile(),
      ]);
      const details = detailsRes.data?.details || {};
      const profile = profileRes.data?.user || profileRes.data || {};
      setUserInfo(profile);
      reset(details);
    } catch {
      toast.error('Failed to load office details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await officeDetailsService.update(values);
      toast.success('Office details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-accent mb-3 block"></i>
          <p className="text-sm text-slate-400 font-medium">Loading office details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Office Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your finance office details, GST information, and banking credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={completionPercent === 100 ? '#16a34a' : '#4F46E5'}
                  strokeWidth="3"
                  strokeDasharray={`${completionPercent} ${100 - completionPercent}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                {completionPercent}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Profile Complete</p>
              <p className="text-[10px] text-slate-400">
                {completionPercent === 100 ? 'All details filled' : 'Fill all required fields'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Overview Banner */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-charcoal via-navy to-steel p-6 sm:p-8 relative">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-primary-400/15 rounded-full blur-[60px]" />
          </div>
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-building text-2xl text-white"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-white font-display tracking-tight truncate">
                {userInfo?.finance_name || 'Finance Company'}
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                <i className="fas fa-user-tie mr-1.5 text-xs"></i>
                {userInfo?.owner_name || 'Owner Name'}
                <span className="mx-2 text-white/20">|</span>
                <i className="fas fa-envelope mr-1.5 text-xs"></i>
                {userInfo?.email || 'email@example.com'}
              </p>
            </div>
            <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
              userInfo?.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
            }`}>
              <i className={`fas ${userInfo?.status === 'active' ? 'fa-circle-check' : 'fa-clock'} mr-1.5 text-[10px]`}></i>
              {userInfo?.status === 'active' ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* GST & Tax Information */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
              <i className="fas fa-file-invoice text-accent text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display">GST & Tax Information</h3>
              <p className="text-xs text-slate-400">Government tax identifiers and registration numbers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              label="GST Number"
              name="gst_number"
              icon="fa-hashtag"
              placeholder="22ABCDE1234F1Z5"
              register={register}
              errors={errors}
              rules={{
                pattern: {
                  value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
                  message: 'Invalid GST format',
                },
              }}
              hint="15-character alphanumeric"
            />
            <FormField
              label="PAN Number"
              name="pan_number"
              icon="fa-id-card"
              placeholder="ABCDE1234F"
              register={register}
              errors={errors}
              rules={{
                pattern: {
                  value: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
                  message: 'Invalid PAN format',
                },
              }}
              hint="10-character alphanumeric"
            />
            <FormField
              label="CIN Number"
              name="cin_number"
              icon="fa-landmark"
              placeholder="U74110MH2021PTC366826"
              register={register}
              errors={errors}
              hint="Corporate Identity Number"
            />
          </div>
        </section>

        {/* Business Address */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center">
              <i className="fas fa-location-dot text-emerald-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display">Business Address</h3>
              <p className="text-xs text-slate-400">Registered office location</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="label">Company Address</label>
              <textarea
                {...register('company_address')}
                className="input-field min-h-[80px] resize-none"
                placeholder="Full registered office address..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <FormField
                label="City"
                name="city"
                icon="fa-city"
                placeholder="Mumbai"
                register={register}
                errors={errors}
              />
              <div>
                <label className="label">State</label>
                <select {...register('state')} className="select-field">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <FormField
                label="PIN Code"
                name="pincode"
                icon="fa-map-pin"
                placeholder="400001"
                register={register}
                errors={errors}
                rules={{
                  pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
                }}
              />
            </div>
          </div>
        </section>

        {/* Banking Details */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <i className="fas fa-building-columns text-amber-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display">Banking Details</h3>
              <p className="text-xs text-slate-400">Bank account for auction settlements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Bank Name"
              name="bank_name"
              icon="fa-building-columns"
              placeholder="State Bank of India"
              register={register}
              errors={errors}
            />
            <FormField
              label="Account Number"
              name="bank_account_number"
              icon="fa-credit-card"
              placeholder="1234567890123456"
              register={register}
              errors={errors}
            />
            <FormField
              label="IFSC Code"
              name="bank_ifsc_code"
              icon="fa-barcode"
              placeholder="SBIN0001234"
              register={register}
              errors={errors}
              rules={{
                pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' },
              }}
            />
            <FormField
              label="Branch"
              name="bank_branch"
              icon="fa-map-location-dot"
              placeholder="Andheri West"
              register={register}
              errors={errors}
            />
          </div>
        </section>

        {/* Authorized Person & Other */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-shield text-purple-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display">Authorized Representative</h3>
              <p className="text-xs text-slate-400">Contact person for official communication</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              label="Authorized Person"
              name="authorized_person"
              icon="fa-user-tie"
              placeholder="Full Name"
              register={register}
              errors={errors}
            />
            <FormField
              label="Designation"
              name="designation"
              icon="fa-briefcase"
              placeholder="Managing Director"
              register={register}
              errors={errors}
            />
            <FormField
              label="Website"
              name="website"
              icon="fa-globe"
              placeholder="https://www.example.com"
              register={register}
              errors={errors}
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-slate-400">
            <i className="fas fa-shield-halved mr-1.5 text-slate-300"></i>
            Your data is encrypted and stored securely
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-secondary"
              disabled={!isDirty}
            >
              <i className="fas fa-rotate-left text-xs"></i>
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <i className="fas fa-spinner fa-spin text-sm"></i>
              ) : (
                <i className="fas fa-floppy-disk text-sm"></i>
              )}
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, name, icon, placeholder, register, errors, rules, hint }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center pointer-events-none">
            <i className={`fas ${icon} text-slate-400 text-xs`}></i>
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`input-field ${icon ? 'pl-13' : ''} ${errors[name] ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
          style={icon ? { paddingLeft: '3.25rem' } : undefined}
          {...register(name, rules)}
        />
      </div>
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <i className="fas fa-circle-exclamation text-[10px]"></i>
          {errors[name].message}
        </p>
      )}
      {hint && !errors[name] && (
        <p className="text-[11px] text-slate-300 mt-1">{hint}</p>
      )}
    </div>
  );
}
