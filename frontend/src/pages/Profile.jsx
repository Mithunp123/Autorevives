import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authService.getProfile();
        reset(data.user || data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const { data } = await authService.updateProfile(values);
      setUser((prev) => ({ ...prev, ...data.user }));
      toast.success('Profile updated successfully', { id: 'profile-success' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile', { id: 'profile-error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-2xl text-accent"></i>
      </div>
    );
  }

  const Field = ({ label, name, icon, type = 'text', placeholder, rules, ...rest }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="relative">
        {icon && <i className={`fas ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-300`}></i>}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition ${errors[name] ? 'border-red-300' : 'border-slate-200'
            }`}
          {...register(name, rules)}
          {...rest}
        />
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-400">Manage your account details and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar + name strip */}
        <div className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-5">
          <div className="relative">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#0B1628] rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              type="button"
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50"
            >
              <i className="fas fa-camera text-xs text-slate-400"></i>
            </button>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{user?.name || 'User'}</h2>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'user'} account</p>
          </div>
        </div>

        {/* Basic Details */}
        <section className="card p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-user text-sm text-accent"></i> Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              name="name"
              icon="fa-user"
              placeholder="John Doe"
              rules={{ required: 'Name is required' }}
            />
            <Field
              label="Username"
              name="username"
              placeholder="johndoe"
              rules={{ required: 'Username is required' }}
            />
          </div>
        </section>

        {/* Contact Info */}
        <section className="card p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-envelope text-sm text-accent"></i> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Email Address"
              name="email"
              icon="fa-envelope"
              type="email"
              placeholder="john@example.com"
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              }}
            />
            <Field
              label="Phone Number"
              name="phone"
              icon="fa-phone"
              placeholder="+91 98765 43210"
            />
          </div>
        </section>

        {/* Legal Info (office / admin) */}
        {(user?.role === 'office' || user?.role === 'admin') && (
          <section className="card p-4 sm:p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-credit-card text-sm text-accent"></i> Legal & Business
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="PAN Number" name="pan_number" placeholder="ABCDE1234F" />
              <Field label="GST Number" name="gst_number" placeholder="22ABCDE1234F1Z5" />
              <Field label="Company Name" name="company_name" placeholder="ABC Motors Pvt Ltd" />
              <Field label="Dealer License" name="dealer_license" placeholder="DL-2025-12345" />
            </div>
          </section>
        )}

        {/* Address */}
        <section className="card p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-location-dot text-sm text-accent"></i> Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Street Address" name="address" icon="fa-location-dot" placeholder="123 Main Street" />
            </div>
            <Field label="City" name="city" placeholder="Mumbai" />
            <Field label="State" name="state" placeholder="Maharashtra" />
            <Field label="PIN Code" name="pincode" placeholder="400001" />
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl shadow-button hover:shadow-glow disabled:opacity-60 transition"
          >
            {saving ? <i className="fas fa-spinner fa-spin text-sm"></i> : <i className="fas fa-floppy-disk text-sm"></i>}
            {saving ? 'Saving' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
