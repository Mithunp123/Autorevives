import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { publicService } from '@/services';

const STATES = [
  'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi', 'Gujarat',
  'Uttar Pradesh', 'West Bengal', 'Rajasthan',
];

const SUBJECTS = [
  'General Inquiry', 'Auction Support', 'Payment Issue',
  'Vehicle Inspection', 'Technical Support', 'Other',
];

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: result } = await publicService.submitContact(data);
      toast.success(result.message);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact Us - AutoRevive</title>
        <meta name="description" content="Get in touch with AutoRevive support. Find our office address, phone numbers, and email for assistance." />
      </Helmet>

      {/* Header */}
      <div className="text-center py-14">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mb-3">Contact Support</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Have a question or need assistance? Our team is here to help you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 pb-16">
        {/* Form */}
        <div className="card p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Send us a message</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
              <input
                {...register('fullName', { required: true })}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  placeholder="john@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone *</label>
                <input
                  type="tel"
                  {...register('mobile', { required: true })}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                <select {...register('state')} className="select-field">
                  <option value="">Select State</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
                <input {...register('city')} placeholder="Enter city" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject *</label>
              <select {...register('subject', { required: true })} className="select-field">
                <option value="">Select Subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
              <textarea
                {...register('message')}
                rows={5}
                placeholder="How can we help you today?"
                className="input-field resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-display font-semibold text-sm shadow-button hover:shadow-glow transition disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-4">
          {[
            {
              icon: 'fa-location-dot',
              title: 'Head Office',
              lines: ['123 Auto Marketplace Tower,', 'Business Bay, Mumbai,', 'Maharashtra, 400001'],
              color: 'text-slate-900',
              bg: 'bg-gradient-to-br from-primary-100 to-primary-50',
            },
            {
              icon: 'fa-phone',
              title: 'Phone Support',
              lines: ['+91 98765 43210 (Toll Free)', '+91 22 1234 5678 (Office)'],
              sub: 'Mon-Sat, 9:00 AM - 7:00 PM',
              color: 'text-accent',
              bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
            },
            {
              icon: 'fa-envelope',
              title: 'Email Us',
              lines: ['support@autorevive.com', 'sales@autorevive.com'],
              color: 'text-green-500',
              bg: 'bg-gradient-to-br from-green-100 to-green-50',
            },
          ].map((c) => (
            <div key={c.title} className="card p-6 flex items-start gap-4">
              <div className={`w-12 h-12 ${c.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${c.icon} text-lg ${c.color}`}></i>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{c.title}</h4>
                {c.lines.map((l, i) => (
                  <p key={i} className="text-sm text-slate-500">{l}</p>
                ))}
                {c.sub && <small className="text-xs text-slate-500 mt-1 block">{c.sub}</small>}
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="h-48 bg-slate-50 card flex items-center justify-center text-slate-500 text-sm">
            <i className="fas fa-map-location-dot mr-2"></i> Map Location
          </div>
        </div>
      </div>
    </div>
  );
}
